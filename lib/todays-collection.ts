import { db } from '@/lib/db';
import { products, categories, productVariants } from '@/lib/schema';
import { eq, and, inArray } from 'drizzle-orm';

/**
 * Get Today's Collection - rotates daily based on the day of year
 * Returns 8 products from featured products with daily rotation
 */
export async function getTodaysCollection() {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / 86400000);

    const allFeaturedProducts = await db.select({
        id: products.id, slug: products.slug, name: products.name,
        price: products.price, salePrice: products.salePrice, images: products.images,
        categoryId: products.categoryId,
    }).from(products).where(and(eq(products.active, true), eq(products.featured, true)));

    console.log(`[TodaysCollection] Found ${allFeaturedProducts.length} featured products`);
    if (allFeaturedProducts.length === 0) return [];

    const offset = (dayOfYear % Math.max(1, allFeaturedProducts.length - 7)) || 0;
    const rotatedProducts = allFeaturedProducts.slice(offset, offset + 8);
    const productIds = rotatedProducts.map(p => p.id);
    const categoryIds = [...new Set(rotatedProducts.map(p => p.categoryId).filter(Boolean))];

    const [variantRows, categoryRows] = await Promise.all([
        productIds.length > 0 ? db.select({ id: productVariants.id, size: productVariants.size, stock: productVariants.stock, productId: productVariants.productId }).from(productVariants).where(inArray(productVariants.productId, productIds)) : [],
        categoryIds.length > 0 ? db.select({ id: categories.id, name: categories.name, slug: categories.slug }).from(categories).where(inArray(categories.id, categoryIds)) : [],
    ]);

    const catMap = Object.fromEntries(categoryRows.map(c => [c.id, c]));
    const varMap = variantRows.reduce((acc, v) => { if (!acc[v.productId]) acc[v.productId] = []; acc[v.productId].push(v); return acc; }, {} as Record<string, typeof variantRows>);

    const result = rotatedProducts.map(product => ({
        ...product, category: catMap[product.categoryId] ?? null,
        variants: varMap[product.id] ?? [], collection: null, material: null, displaySku: null, tags: null,
    }));

    console.log(`[TodaysCollection] Returning ${result.length} products`);
    return result;
}
