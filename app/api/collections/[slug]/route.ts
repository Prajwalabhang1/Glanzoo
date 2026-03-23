import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collections, products, productVariants, categories } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const [collection] = await db.select().from(collections).where(eq(collections.slug, slug)).limit(1);
        if (!collection) return NextResponse.json({ error: 'Collection not found' }, { status: 404 });

        const productRows = await db.select().from(products)
            .where(and(eq(products.collectionId, collection.id), eq(products.active, true)))
            .orderBy(desc(products.createdAt));

        const productIds = productRows.map(p => p.id);
        const [variantRows, categoryRows] = productIds.length > 0 ? await Promise.all([
            db.select().from(productVariants).where(eq(productVariants.productId, productIds[0])),
            db.select().from(categories),
        ]) : [[], []];

        const catMap = Object.fromEntries(categoryRows.map((c: typeof categories.$inferSelect) => [c.id, c]));
        const varMap = variantRows.reduce((acc: Record<string, typeof productVariants.$inferSelect[]>, v: typeof productVariants.$inferSelect) => { if (!acc[v.productId]) acc[v.productId] = []; acc[v.productId].push(v); return acc; }, {});

        const productsForClient = productRows.map(p => ({
            ...p, images: (() => { try { return JSON.parse(p.images); } catch { return []; } })(),
            category: catMap[p.categoryId] ?? null, variants: varMap[p.id] ?? [],
        }));

        return NextResponse.json({ collection: { id: collection.id, name: collection.name, slug: collection.slug, description: collection.description, image: collection.banner ?? null }, products: productsForClient });
    } catch (error) { console.error('Error fetching collection:', error); return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 }); }
}
