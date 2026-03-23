export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { wishlistItems, products, productVariants, categories } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

function cuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const rows = await db.select({ wishlistItem: wishlistItems, product: products })
            .from(wishlistItems)
            .innerJoin(products, eq(wishlistItems.productId, products.id))
            .where(eq(wishlistItems.userId, session.user.id));

        const productIds = rows.map(r => r.product.id);
        const variantRows = productIds.length > 0
            ? await db.select().from(productVariants).where(eq(productVariants.productId, productIds[0]))
            : [];

        const items = rows.map(row => ({
            ...row.wishlistItem,
            product: {
                ...row.product,
                images: JSON.parse(row.product.images),
                variants: variantRows.filter(v => v.productId === row.product.id),
            },
        }));

        return NextResponse.json({ items });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { productId } = await request.json();
        if (!productId) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

        const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        const [existing] = await db.select().from(wishlistItems)
            .where(and(eq(wishlistItems.userId, session.user.id), eq(wishlistItems.productId, productId))).limit(1);
        if (existing) return NextResponse.json({ message: 'Product already in wishlist', item: existing }, { status: 200 });

        await db.insert(wishlistItems).values({ id: cuid(), userId: session.user.id, productId });
        const [item] = await db.select().from(wishlistItems)
            .where(and(eq(wishlistItems.userId, session.user.id), eq(wishlistItems.productId, productId))).limit(1);

        return NextResponse.json({ message: 'Product added to wishlist', item: { ...item, product: { ...product, images: JSON.parse(product.images) } } }, { status: 201 });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        if (!productId) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

        await db.delete(wishlistItems).where(and(eq(wishlistItems.userId, session.user.id), eq(wishlistItems.productId, productId)));
        return NextResponse.json({ message: 'Product removed from wishlist' }, { status: 200 });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
    }
}
