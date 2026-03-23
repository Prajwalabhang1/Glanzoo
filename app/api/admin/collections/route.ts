import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { collections, products } from '@/lib/schema';
import { eq, asc, count } from 'drizzle-orm';

function cuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

async function checkAdmin() {
    const session = await auth();
    return session?.user?.role === 'ADMIN';
}

export async function GET() {
    if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const rows = await db.select().from(collections).orderBy(asc(collections.sortOrder));
        const withCount = await Promise.all(rows.map(async (col) => {
            const [{ productCount }] = await db.select({ productCount: count() }).from(products).where(eq(products.collectionId, col.id));
            return { ...col, _count: { products: productCount } };
        }));
        return NextResponse.json({ collections: withCount });
    } catch { return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 }); }
}

export async function POST(req: Request) {
    if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { name, slug, description, image, banner, featured, type, sortOrder, active } = await req.json();
        const id = cuid();
        await db.insert(collections).values({ id, name, slug, description, image, banner, featured: featured ?? false, type, sortOrder: sortOrder ?? 0, active: active ?? true });
        const [collection] = await db.select().from(collections).where(eq(collections.id, id)).limit(1);
        return NextResponse.json({ collection });
    } catch { return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 }); }
}
