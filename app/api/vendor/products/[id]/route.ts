import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { vendors, products, productVariants, categories } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { vendorProductSchema } from "@/lib/validations/vendor";

async function getVendorForUser(userId: string) {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, userId)).limit(1);
    return vendor;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (session.user.role !== "VENDOR") return NextResponse.json({ error: "Forbidden: Vendor access required" }, { status: 403 });
        const vendor = await getVendorForUser(session.user.id);
        if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
        const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
        if (product.vendorId !== vendor.id) return NextResponse.json({ error: "Forbidden: You can only access your own products" }, { status: 403 });
        const variantRows = await db.select().from(productVariants).where(eq(productVariants.productId, id));
        const [cat] = await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1);
        return NextResponse.json({ product: { ...product, images: JSON.parse(product.images), tags: product.tags ? JSON.parse(product.tags) : [], variants: variantRows, category: cat ?? null } });
    } catch (error) { return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 }); }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (session.user.role !== "VENDOR") return NextResponse.json({ error: "Forbidden: Vendor access required" }, { status: 403 });
        const vendor = await getVendorForUser(session.user.id);
        if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
        const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
        if (product.vendorId !== vendor.id) return NextResponse.json({ error: "Forbidden: You can only update your own products" }, { status: 403 });

        const body = await request.json();
        const validatedData = vendorProductSchema.partial().safeParse(body);
        if (!validatedData.success) return NextResponse.json({ error: "Validation failed", details: validatedData.error.errors }, { status: 400 });

        const d = validatedData.data;
        type ProductUpdate = {
          name?: string;
          description?: string | null;
          shortDescription?: string | null;
          price?: number;
          salePrice?: number | null;
          images?: string;
          categoryId?: string;
          material?: string | null;
          fabricType?: string | null;
          topLength?: string | null;
          bottomLength?: string | null;
          careInstructions?: string | null;
          shippingDays?: string;
          tags?: string | null;
          freeShipping?: boolean;
          returnEligible?: boolean;
          approvalStatus?: string;
          approvedAt?: null;
          approvedBy?: null;
        };
        const updateData: ProductUpdate = {};
        if (d.name) updateData.name = d.name;
        if (d.description !== undefined) updateData.description = d.description;
        if (d.shortDescription !== undefined) updateData.shortDescription = d.shortDescription;
        if (d.price) updateData.price = d.price;
        if (d.salePrice !== undefined) updateData.salePrice = d.salePrice;
        if (d.images) updateData.images = JSON.stringify(d.images);
        if (d.categoryId) updateData.categoryId = d.categoryId;
        if (d.material !== undefined) updateData.material = d.material;
        if (d.fabricType !== undefined) updateData.fabricType = d.fabricType;
        if (d.topLength !== undefined) updateData.topLength = d.topLength;
        if (d.bottomLength !== undefined) updateData.bottomLength = d.bottomLength;
        if (d.careInstructions !== undefined) updateData.careInstructions = d.careInstructions;
        if (d.shippingDays) updateData.shippingDays = d.shippingDays;
        if (d.tags !== undefined) updateData.tags = d.tags ? JSON.stringify(d.tags) : null;
        if (d.freeShipping !== undefined) updateData.freeShipping = d.freeShipping;
        if (d.returnEligible !== undefined) updateData.returnEligible = d.returnEligible;

        const requiresReapproval = d.name || d.price || d.images;
        if (requiresReapproval && product.approvalStatus === "APPROVED") {
            updateData.approvalStatus = "PENDING"; updateData.approvedAt = null; updateData.approvedBy = null;
        }

        await db.update(products).set(updateData).where(eq(products.id, id));
        const [updated] = await db.select().from(products).where(eq(products.id, id)).limit(1);
        return NextResponse.json({ message: requiresReapproval ? "Product updated. Pending re-approval." : "Product updated successfully.", product: { ...updated, images: JSON.parse(updated.images), tags: updated.tags ? JSON.parse(updated.tags) : [] } });
    } catch (error) { return NextResponse.json({ error: "Failed to update product" }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (session.user.role !== "VENDOR") return NextResponse.json({ error: "Forbidden: Vendor access required" }, { status: 403 });
        const vendor = await getVendorForUser(session.user.id);
        if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
        const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
        if (product.vendorId !== vendor.id) return NextResponse.json({ error: "Forbidden: You can only delete your own products" }, { status: 403 });
        await db.update(products).set({ active: false }).where(eq(products.id, id));
        return NextResponse.json({ message: "Product deleted successfully" });
    } catch (error) { return NextResponse.json({ error: "Failed to delete product" }, { status: 500 }); }
}
