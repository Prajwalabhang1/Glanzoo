import { db } from '@/lib/db';
import { products, categories, productVariants } from '@/lib/schema';
import { desc, inArray } from 'drizzle-orm';
import { ProductsTableClient } from './ProductsTableClient';

export async function ProductsTable() {
    const productRows = await db.select().from(products).orderBy(desc(products.createdAt));
    const productIds = productRows.map(p => p.id);

    const [variantRows, categoryRows] = productIds.length > 0 ? await Promise.all([
        db.select().from(productVariants).where(inArray(productVariants.productId, productIds)),
        db.select().from(categories),
    ]) : [[], await db.select().from(categories)];

    const catMap = Object.fromEntries(categoryRows.map(c => [c.id, c]));
    const varMap = variantRows.reduce((acc, v) => { if (!acc[v.productId]) acc[v.productId] = []; acc[v.productId].push(v); return acc; }, {} as Record<string, any[]>);

    const serializedProducts = productRows.map(p => ({
        ...p, createdAt: p.createdAt, updatedAt: p.updatedAt,
        category: catMap[p.categoryId] ?? null, variants: varMap[p.id] ?? [],
    }));

    return <ProductsTableClient products={serializedProducts as any} />;
}
