/**
 * app/api/wishlist/route.ts — Wishlist management
 *
 * Fixes:
 *  - N+1 BUG: GET was fetching variants only for productIds[0].
 *    Now fetches ALL variants in a single inArray query.
 *  - Safe JSON.parse: images field wrapped in try/catch.
 *  - POST: removed redundant product re-select after insert.
 */
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { wishlistItems, products, productVariants } from '@/lib/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { z } from 'zod';

function cuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function parseImages(raw: string): string[] {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// ─── GET /api/wishlist ────────────────────────────────────────────────────────
export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = await db
      .select({ wishlistItem: wishlistItems, product: products })
      .from(wishlistItems)
      .innerJoin(products, eq(wishlistItems.productId, products.id))
      .where(eq(wishlistItems.userId, session.user.id));

    if (rows.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // FIX: Batch-fetch variants for ALL products in one query
    const productIds = rows.map((r) => r.product.id);
    const allVariants = await db
      .select()
      .from(productVariants)
      .where(inArray(productVariants.productId, productIds));

    const items = rows.map((row) => ({
      ...row.wishlistItem,
      product: {
        ...row.product,
        images: parseImages(row.product.images),
        variants: allVariants.filter((v) => v.productId === row.product.id),
      },
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('[Wishlist GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// ─── POST /api/wishlist ───────────────────────────────────────────────────────
const addSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = addSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { productId } = parsed.data;

    // Verify product exists and is active
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product || !product.active) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Idempotent: return existing item without error
    const [existing] = await db
      .select()
      .from(wishlistItems)
      .where(
        and(
          eq(wishlistItems.userId, session.user.id),
          eq(wishlistItems.productId, productId)
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        {
          message: 'Product already in wishlist',
          item: { ...existing, product: { ...product, images: parseImages(product.images) } },
        },
        { status: 200 }
      );
    }

    const newId = cuid();
    await db.insert(wishlistItems).values({
      id: newId,
      userId: session.user.id,
      productId,
    });

    const [item] = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.id, newId))
      .limit(1);

    return NextResponse.json(
      {
        message: 'Product added to wishlist',
        item: { ...item, product: { ...product, images: parseImages(product.images) } },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Wishlist POST] Error:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

// ─── DELETE /api/wishlist?productId=xxx ───────────────────────────────────────
export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await db
      .delete(wishlistItems)
      .where(
        and(
          eq(wishlistItems.userId, session.user.id),
          eq(wishlistItems.productId, productId)
        )
      );

    return NextResponse.json({ message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('[Wishlist DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
