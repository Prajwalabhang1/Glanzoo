export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, categories, productVariants } from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';

export async function GET() {
    const productRows = await db.select().from(products).where(eq(products.active, true));
    const productIds = productRows.map(p => p.id);
    const [variantRows, categoryRows] = await Promise.all([
        productIds.length > 0 ? db.select().from(productVariants).where(inArray(productVariants.productId, productIds)) : [],
        db.select().from(categories),
    ]);
    const catMap = Object.fromEntries(categoryRows.map(c => [c.id, c.name]));
    return NextResponse.json({
        count: productRows.length,
        products: productRows.map(p => ({ name: p.name, active: p.active, category: catMap[p.categoryId] ?? 'Unknown' })),
    });
}
