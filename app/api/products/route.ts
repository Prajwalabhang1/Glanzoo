export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, categories, productVariants, reviews, vendors } from '@/lib/schema';
import { eq, and, gte, lte, inArray, desc, asc, count, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { createId } from '@paralleldrive/cuid2';

function cuid() {
    // Simple cuid-compatible ID generator
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// GET /api/products - List all products with optional filters
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const categoryParam = searchParams.get('category');
        const materialParam = searchParams.get('material');
        const featured = searchParams.get('featured');
        const minPrice = searchParams.get('minPrice') || searchParams.get('priceMin');
        const maxPrice = searchParams.get('maxPrice') || searchParams.get('priceMax');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
        const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);
        const offset = Math.max(parseInt(searchParams.get('skip') || '0'), 0);

        const conditions = [eq(products.active, true)];

        if (featured === 'true') conditions.push(eq(products.featured, true));
        if (minPrice) conditions.push(gte(products.price, parseFloat(minPrice)));
        if (maxPrice) conditions.push(lte(products.price, parseFloat(maxPrice)));
        if (materialParam) {
            const materials = materialParam.split(',').map(s => s.trim()).filter(Boolean);
            if (materials.length === 1) conditions.push(eq(products.material, materials[0]));
            else if (materials.length > 1) conditions.push(inArray(products.material, materials));
        }

        const orderCol = sortBy === 'price' ? products.price
            : sortBy === 'name' ? products.name
            : sortBy === 'views' ? products.views
            : sortBy === 'sales' ? products.sales
            : products.createdAt;
        const orderFn = sortOrder === 'asc' ? asc(orderCol) : desc(orderCol);

        // If category filter, get categoryId first
        let categoryIds: string[] = [];
        if (categoryParam) {
            const slugs = categoryParam.split(',').map(s => s.trim()).filter(Boolean);
            const cats = await db.select({ id: categories.id })
                .from(categories)
                .where(inArray(categories.slug, slugs));
            categoryIds = cats.map(c => c.id);
            if (categoryIds.length > 0) conditions.push(inArray(products.categoryId, categoryIds));
        }

        const where = and(...conditions);

        const [productRows, [{ total }]] = await Promise.all([
            db.select({
                id: products.id, slug: products.slug, name: products.name,
                description: products.description, price: products.price,
                salePrice: products.salePrice, mrp: products.mrp,
                images: products.images, featured: products.featured,
                active: products.active, material: products.material,
                displaySku: products.displaySku, tags: products.tags,
                freeShipping: products.freeShipping, shippingDays: products.shippingDays,
                categoryId: products.categoryId, vendorId: products.vendorId,
                views: products.views, sales: products.sales,
                approvalStatus: products.approvalStatus, createdAt: products.createdAt,
                categoryName: categories.name, categorySlug: categories.slug,
                vendorBusinessName: vendors.businessName,
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .leftJoin(vendors, eq(products.vendorId, vendors.id))
            .where(where)
            .orderBy(orderFn)
            .limit(limit)
            .offset(offset),
            db.select({ total: count() }).from(products).where(where),
        ]);

        const productIds = productRows.map(p => p.id);
        let variantsMap: Record<string, typeof productVariants.$inferSelect[]> = {};
        let reviewsMap: Record<string, { avg: number; count: number }> = {};

        if (productIds.length > 0) {
            const variantRows = await db.select().from(productVariants).where(inArray(productVariants.productId, productIds));
            variantsMap = variantRows.reduce((acc, v) => {
                if (!acc[v.productId]) acc[v.productId] = [];
                acc[v.productId].push(v);
                return acc;
            }, {} as Record<string, typeof productVariants.$inferSelect[]>);

            const reviewRows = await db.select({
                productId: reviews.productId,
                avg: sql<number>`AVG(${reviews.rating})`,
                cnt: count(),
            }).from(reviews)
                .where(and(inArray(reviews.productId, productIds), eq(reviews.approved, true)))
                .groupBy(reviews.productId);
            reviewsMap = reviewRows.reduce((acc, r) => {
                acc[r.productId] = { avg: Math.round((r.avg ?? 0) * 10) / 10, count: r.cnt };
                return acc;
            }, {} as Record<string, { avg: number; count: number }>);
        }

        const productsForClient = productRows.map(p => ({
            ...p,
            category: { id: p.categoryId, name: p.categoryName, slug: p.categorySlug },
            variants: variantsMap[p.id] ?? [],
            vendorName: p.vendorBusinessName ?? null,
            rating: reviewsMap[p.id] ?? { avg: 0, count: 0 },
        }));

        return NextResponse.json(
            { products: productsForClient, count: productRows.length, total },
            { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=120' } }
        );
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// POST /api/products - Create a new product (Admin only)
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { slug, name, description, price, salePrice, images, categoryId,
            variants: variantData, freeShipping, featured, fabric, topLength,
            bottomLength, shippingDays, metaTitle, metaDesc } = body;

        if (!slug || !name || !price || !categoryId) {
            return NextResponse.json({ error: 'Missing required fields: slug, name, price, categoryId' }, { status: 400 });
        }
        if (typeof price !== 'number' || price <= 0) {
            return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
        }

        const productId = cuid();
        await db.insert(products).values({
            id: productId, slug, name, description,
            price, salePrice: salePrice || null,
            images: JSON.stringify(images || []),
            categoryId, freeShipping: freeShipping ?? true,
            featured: featured ?? false, fabric, topLength, bottomLength,
            shippingDays: shippingDays || '3-10 days',
            metaTitle: metaTitle || null, metaDesc: metaDesc || null,
            approvalStatus: 'APPROVED', active: true,
        });

        if (variantData && variantData.length > 0) {
            await db.insert(productVariants).values(
                variantData.map((v: { size: string; color?: string; price?: number; sku: string; stock?: number }) => ({
                    id: cuid(), productId, ...v,
                }))
            );
        }

        const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
        const variants = await db.select().from(productVariants).where(eq(productVariants.productId, productId));

        return NextResponse.json({ product: { ...product, images: JSON.parse(product.images), variants } }, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
