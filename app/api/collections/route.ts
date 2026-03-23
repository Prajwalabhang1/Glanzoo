import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collections, products } from '@/lib/schema';
import { eq, count, asc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const rows = await db.select({
            id: collections.id, name: collections.name, slug: collections.slug,
            description: collections.description, banner: collections.banner,
        }).from(collections).where(eq(collections.active, true)).orderBy(asc(collections.name));

        const collectionsWithCount = await Promise.all(rows.map(async (col) => {
            const [{ total }] = await db.select({ total: count() }).from(products).where(eq(products.collectionId, col.id));
            return { id: col.id, name: col.name, slug: col.slug, description: col.description, image: col.banner ?? null, productCount: total };
        }));

        return NextResponse.json({ collections: collectionsWithCount });
    } catch (error) {
        console.error('Error fetching collections:', error);
        return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
    }
}
