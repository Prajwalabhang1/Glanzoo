export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { products, productVariants, categories, reviews, wishlistItems } from '@/lib/schema';
import { eq, desc, count, inArray } from 'drizzle-orm';

interface ProductVariantInput { size: string; sku?: string; stock?: number; }

async function checkAdminAccess() {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized', status: 401 };
    if (session.user.role !== 'ADMIN') return { error: 'Forbidden: Admin access required', status: 403 };
    return null;
}

function cuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export async function GET() {
    try {
        const accessError = await checkAdminAccess();
        if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status });

        const productRows = await db.select().from(products).orderBy(desc(products.createdAt));
        const productIds = productRows.map(p => p.id);

        const [variantRows, reviewCounts, wishlistCounts, categoryRows] = await Promise.all([
            productIds.length > 0 ? db.select().from(productVariants).where(inArray(productVariants.productId, productIds)) : [],
            productIds.length > 0 ? db.select({ productId: reviews.productId, cnt: count() }).from(reviews).where(inArray(reviews.productId, productIds)).groupBy(reviews.productId) : [],
            productIds.length > 0 ? db.select({ productId: wishlistItems.productId, cnt: count() }).from(wishlistItems).where(inArray(wishlistItems.productId, productIds)).groupBy(wishlistItems.productId) : [],
            db.select().from(categories),
        ]);

        const categoryMap = Object.fromEntries(categoryRows.map(c => [c.id, c]));
        const reviewMap = Object.fromEntries(reviewCounts.map(r => [r.productId, r.cnt]));
        const wishlistMap = Object.fromEntries(wishlistCounts.map(w => [w.productId, w.cnt]));
        const variantMap = variantRows.reduce((acc, v) => { if (!acc[v.productId]) acc[v.productId] = []; acc[v.productId].push(v); return acc; }, {} as Record<string, typeof productVariants.$inferSelect[]>);

        const productsForClient = productRows.map(p => ({
            ...p,
            images: (() => { try { return JSON.parse(p.images); } catch { return []; } })(),
            tags: (() => { try { return p.tags ? JSON.parse(p.tags) : []; } catch { return []; } })(),
            variants: variantMap[p.id] ?? [],
            category: categoryMap[p.categoryId] ?? null,
            _count: { reviews: reviewMap[p.id] ?? 0, wishlist: wishlistMap[p.id] ?? 0 },
        }));

        return NextResponse.json({ products: productsForClient });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const accessError = await checkAdminAccess();
        if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status });

        const body = await request.json();
        const { slug, name, description, price, salePrice, images, categoryId, variants, freeShipping, featured, fabric, topLength, bottomLength, shippingDays, tags, metaTitle, metaDesc, sku, weight } = body;

        if (!slug || !name || !price || !images || !categoryId || !variants) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        const [existingProduct] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
        if (existingProduct) return NextResponse.json({ error: 'Product with this slug already exists' }, { status: 409 });

        const productId = cuid();
        await db.insert(products).values({
            id: productId, slug, name, description: description || null, price,
            salePrice: salePrice || null, images: Array.isArray(images) ? JSON.stringify(images) : images,
            categoryId, freeShipping: freeShipping ?? true, featured: featured ?? false,
            fabric: fabric || null, topLength: topLength || null, bottomLength: bottomLength || null,
            shippingDays: shippingDays || '3-10 days', tags: tags ? JSON.stringify(tags) : null,
            metaTitle: metaTitle || null, metaDesc: metaDesc || null, sku: sku || null, weight: weight || null, active: true,
        });

        if (variants && variants.length > 0) {
            await db.insert(productVariants).values(
                variants.map((v: ProductVariantInput) => ({
                    id: cuid(), productId, size: v.size,
                    sku: v.sku || `${sku || slug}-${v.size}-${Math.random().toString(36).substring(7)}`.toUpperCase(),
                    stock: v.stock || 0,
                }))
            );
        }

        const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
        const productVariantRows = await db.select().from(productVariants).where(eq(productVariants.productId, productId));
        const [category] = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);

        return NextResponse.json({ message: 'Product created successfully', product: { ...product, images: JSON.parse(product.images), tags: product.tags ? JSON.parse(product.tags) : [], variants: productVariantRows, category } }, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
