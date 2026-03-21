import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { vendorProductSchema } from "@/lib/validations/vendor";

/**
 * GET /api/vendor/products/[id]
 * Get single product (vendor can only access their own)
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "VENDOR") {
            return NextResponse.json(
                { error: "Forbidden: Vendor access required" },
                { status: 403 }
            );
        }

        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id },
        });

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor profile not found" },
                { status: 404 }
            );
        }

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                variants: true,
                category: true,
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Verify ownership
        if (product.vendorId !== vendor.id) {
            return NextResponse.json(
                { error: "Forbidden: You can only access your own products" },
                { status: 403 }
            );
        }

        return NextResponse.json({
            product: {
                ...product,
                images: JSON.parse(product.images),
                tags: product.tags ? JSON.parse(product.tags) : [],
            },
        });
    } catch (error: unknown) {
        console.error("Error fetching product:", error);
        return NextResponse.json(
            { error: "Failed to fetch product" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/vendor/products/[id]
 * Update product (vendor can only update their own)
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "VENDOR") {
            return NextResponse.json(
                { error: "Forbidden: Vendor access required" },
                { status: 403 }
            );
        }

        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id },
        });

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor profile not found" },
                { status: 404 }
            );
        }

        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Verify ownership
        if (product.vendorId !== vendor.id) {
            return NextResponse.json(
                { error: "Forbidden: You can only update your own products" },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Validate update data (partial schema)
        const validatedData = vendorProductSchema.partial().safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validatedData.error.errors,
                },
                { status: 400 }
            );
        }

        const updateData: Record<string, string | number | boolean | null | undefined> = {};

        // Map validated fields
        if (validatedData.data.name) updateData.name = validatedData.data.name;
        if (validatedData.data.description !== undefined)
            updateData.description = validatedData.data.description;
        if (validatedData.data.shortDescription !== undefined)
            updateData.shortDescription = validatedData.data.shortDescription;
        if (validatedData.data.price) updateData.price = validatedData.data.price;
        if (validatedData.data.salePrice !== undefined)
            updateData.salePrice = validatedData.data.salePrice;
        if (validatedData.data.images)
            updateData.images = JSON.stringify(validatedData.data.images);
        if (validatedData.data.categoryId)
            updateData.categoryId = validatedData.data.categoryId;
        if (validatedData.data.material !== undefined)
            updateData.material = validatedData.data.material;
        if (validatedData.data.fabricType !== undefined)
            updateData.fabricType = validatedData.data.fabricType;
        if (validatedData.data.fabric !== undefined)
            updateData.fabric = validatedData.data.fabric;
        if (validatedData.data.topLength !== undefined)
            updateData.topLength = validatedData.data.topLength;
        if (validatedData.data.bottomLength !== undefined)
            updateData.bottomLength = validatedData.data.bottomLength;
        if (validatedData.data.careInstructions !== undefined)
            updateData.careInstructions = validatedData.data.careInstructions;
        if (validatedData.data.shippingDays)
            updateData.shippingDays = validatedData.data.shippingDays;
        if (validatedData.data.tags !== undefined)
            updateData.tags = validatedData.data.tags
                ? JSON.stringify(validatedData.data.tags)
                : null;
        if (validatedData.data.freeShipping !== undefined)
            updateData.freeShipping = validatedData.data.freeShipping;
        if (validatedData.data.returnEligible !== undefined)
            updateData.returnEligible = validatedData.data.returnEligible;

        // If major fields changed, reset approval status
        const requiresReapproval =
            validatedData.data.name ||
            validatedData.data.price ||
            validatedData.data.images;

        if (requiresReapproval && product.approvalStatus === "APPROVED") {
            updateData.approvalStatus = "PENDING";
            updateData.approvedAt = null;
            updateData.approvedBy = null;
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: updateData,
            include: {
                variants: true,
                category: true,
            },
        });

        return NextResponse.json({
            message: requiresReapproval
                ? "Product updated. Pending re-approval."
                : "Product updated successfully.",
            product: {
                ...updatedProduct,
                images: JSON.parse(updatedProduct.images),
                tags: updatedProduct.tags ? JSON.parse(updatedProduct.tags) : [],
            },
        });
    } catch (error: unknown) {
        console.error("Error updating product:", error);
        return NextResponse.json(
            { error: "Failed to update product" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/vendor/products/[id]
 * Delete/deactivate product (soft delete)
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "VENDOR") {
            return NextResponse.json(
                { error: "Forbidden: Vendor access required" },
                { status: 403 }
            );
        }

        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id },
        });

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor profile not found" },
                { status: 404 }
            );
        }

        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Verify ownership
        if (product.vendorId !== vendor.id) {
            return NextResponse.json(
                { error: "Forbidden: You can only delete your own products" },
                { status: 403 }
            );
        }

        // Soft delete by setting active to false
        await prisma.product.update({
            where: { id },
            data: { active: false },
        });

        return NextResponse.json({
            message: "Product deleted successfully",
        });
    } catch (error: unknown) {
        console.error("Error deleting product:", error);
        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
        );
    }
}
