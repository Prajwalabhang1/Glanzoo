export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { vendors, products, productVariants, categories } from "@/lib/schema";
import { eq, inArray } from "drizzle-orm";
import { vendorProductSchema } from "@/lib/validations/vendor";
import { canVendorManageProducts } from "@/lib/vendor-utils";
import { desc } from "drizzle-orm";

function cuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

async function checkVendorProductAccess() {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized", status: 401 };
    if (session.user.role !== "VENDOR") return { error: "Forbidden: Vendor access required", status: 403 };
    const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, session.user.id)).limit(1);
    if (!vendor) return { error: "Vendor profile not found", status: 404 };
    if (!canVendorManageProducts(vendor.status)) return { error: "Vendor not approved. Cannot manage products.", status: 403 };
    return { session, vendor };
}

export async function GET() {
    try {
        const accessCheck = await checkVendorProductAccess();
        if ("error" in accessCheck) return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });
        const { vendor } = accessCheck;

        const productRows = await db.select().from(products).where(eq(products.vendorId, vendor.id)).orderBy(desc(products.createdAt));
        const productIds = productRows.map(p => p.id);
        const [variantRows, categoryRows] = productIds.length > 0 ? await Promise.all([
            db.select().from(productVariants).where(inArray(productVariants.productId, productIds)),
            db.select().from(categories),
        ]) : [[], []];
        const catMap = Object.fromEntries(categoryRows.map(c => [c.id, c]));
        const varMap = variantRows.reduce((acc, v) => { if (!acc[v.productId]) acc[v.productId] = []; acc[v.productId].push(v); return acc; }, {} as Record<string, any[]>);

        const enriched = productRows.map(p => ({
            ...p, images: (() => { try { return JSON.parse(p.images); } catch { return []; } })(),
            tags: p.tags ? (() => { try { return JSON.parse(p.tags!); } catch { return []; } })() : [],
            category: catMap[p.categoryId] ?? null, variants: varMap[p.id] ?? [],
        }));

        return NextResponse.json({ products: enriched, total: enriched.length });
    } catch (error) { console.error("Error fetching vendor products:", error); return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 }); }
}

export async function POST(request: Request) {
    try {
        const accessCheck = await checkVendorProductAccess();
        if ("error" in accessCheck) return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });
        const { vendor } = accessCheck;
        const body = await request.json();
        const validatedData = vendorProductSchema.safeParse(body);
        if (!validatedData.success) return NextResponse.json({ error: "Validation failed", details: validatedData.error.errors }, { status: 400 });

        const { name, slug, description, shortDescription, price, salePrice, categoryId, images, variants, material, fabricType, topLength, bottomLength, careInstructions, shippingDays, tags, freeShipping, returnEligible } = validatedData.data;

        const [existing] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
        if (existing) return NextResponse.json({ error: "Product slug already exists" }, { status: 409 });

        const productId = cuid();
        await db.insert(products).values({
            id: productId, vendorId: vendor.id, slug, name, description: description || null, shortDescription: shortDescription || null,
            price, salePrice: salePrice || null, images: JSON.stringify(images), categoryId,
            material: material || null, fabricType: fabricType || null, topLength: topLength || null, bottomLength: bottomLength || null,
            careInstructions: careInstructions || null, shippingDays: shippingDays || "5-7 days",
            tags: tags ? JSON.stringify(tags) : null, freeShipping: freeShipping ?? true, returnEligible: returnEligible ?? true,
            approvalStatus: "PENDING", active: false,
        });

        if (variants && variants.length > 0) {
            await db.insert(productVariants).values(variants.map((v: any) => ({
                id: cuid(), productId, size: v.size, stock: v.stock || 0,
                sku: v.sku || `${vendor.id.slice(0, 6)}-${slug.slice(0, 4)}-${v.size}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase(),
            })));
        }

        const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
        return NextResponse.json({ message: "Product created successfully. Pending admin approval.", product: { ...product, images: JSON.parse(product.images), tags: product.tags ? JSON.parse(product.tags) : [] } }, { status: 201 });
    } catch (error) { console.error("Error creating vendor product:", error); return NextResponse.json({ error: "Failed to create product" }, { status: 500 }); }
}
