export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { vendorProductSchema } from "@/lib/validations/vendor";
import { canVendorManageProducts } from "@/lib/vendor-utils";

/**
 * Middleware to check vendor access and approval
 */
async function checkVendorProductAccess() {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Unauthorized", status: 401 };
    }

    if (session.user.role !== "VENDOR") {
        return { error: "Forbidden: Vendor access required", status: 403 };
    }

    // Get vendor with status check
    const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
    });

    if (!vendor) {
        return { error: "Vendor profile not found", status: 404 };
    }

    if (!canVendorManageProducts(vendor.status)) {
        return { error: "Vendor not approved. Cannot manage products.", status: 403 };
    }

    return { session, vendor };
}

/**
 * GET /api/vendor/products
 * Get all products for the authenticated vendor
 */
export async function GET() {
    try {
        const accessCheck = await checkVendorProductAccess();
        if ("error" in accessCheck) {
            return NextResponse.json(
                { error: accessCheck.error },
                { status: accessCheck.status }
            );
        }

        const { vendor } = accessCheck;

        const products = await prisma.product.findMany({
            where: { vendorId: vendor.id },
            include: {
                variants: true,
                category: true,
                _count: {
                    select: {
                        reviews: true,
                        wishlist: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Parse images and tags
        const productsWithParsedData = products.map((product) => ({
            ...product,
            images: JSON.parse(product.images),
            tags: product.tags ? JSON.parse(product.tags) : [],
        }));

        return NextResponse.json({
            products: productsWithParsedData,
            total: products.length,
        });
    } catch (error) {
        console.error("Error fetching vendor products:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/vendor/products
 * Create a new product as vendor
 */
export async function POST(request: Request) {
    try {
        const accessCheck = await checkVendorProductAccess();
        if ("error" in accessCheck) {
            return NextResponse.json(
                { error: accessCheck.error },
                { status: accessCheck.status }
            );
        }

        const { vendor } = accessCheck;
        const body = await request.json();

        // Validate product data
        const validatedData = vendorProductSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validatedData.error.errors,
                },
                { status: 400 }
            );
        }

        const {
            name,
            slug,
            description,
            shortDescription,
            price,
            salePrice,
            categoryId,
            images,
            variants,
            material,
            fabricType,
            fabric,
            topLength,
            bottomLength,
            careInstructions,
            shippingDays,
            tags,
            freeShipping,
            returnEligible,
        } = validatedData.data;

        // Check if slug already exists
        const existingProduct = await prisma.product.findUnique({
            where: { slug },
        });

        if (existingProduct) {
            return NextResponse.json(
                { error: "Product slug already exists" },
                { status: 409 }
            );
        }

        // Create product with vendor ownership
        const product = await prisma.product.create({
            data: {
                vendorId: vendor.id,
                slug,
                name,
                description: description || null,
                shortDescription: shortDescription || null,
                price,
                salePrice: salePrice || null,
                images: JSON.stringify(images),
                categoryId,
                material: material || null,
                fabricType: fabricType || null,
                fabric: fabric || null,
                topLength: topLength || null,
                bottomLength: bottomLength || null,
                careInstructions: careInstructions || null,
                shippingDays: shippingDays || "5-7 days",
                tags: tags ? JSON.stringify(tags) : null,
                freeShipping: freeShipping ?? true,
                returnEligible: returnEligible ?? true,
                approvalStatus: "PENDING", // Requires admin approval
                active: false, // Not active until approved
                variants: {
                    create: variants.map((v) => ({
                        size: v.size,
                        stock: v.stock || 0,
                        sku: v.sku || `${vendor.id.slice(0, 6)}-${slug.slice(0, 4)}-${v.size}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase(),
                    })),
                },
            },
            include: {
                variants: true,
                category: true,
            },
        });

        return NextResponse.json(
            {
                message: "Product created successfully. Pending admin approval.",
                product: {
                    ...product,
                    images: JSON.parse(product.images),
                    tags: product.tags ? JSON.parse(product.tags) : [],
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating vendor product:", error);
        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 }
        );
    }
}
