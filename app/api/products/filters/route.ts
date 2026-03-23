import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, categories } from '@/lib/schema';
import { eq, and, isNotNull, count, min, max, asc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const productRows = await db.select({ material: products.material, price: products.price })
            .from(products).where(and(eq(products.active, true), isNotNull(products.material)));

        const materialCounts: Record<string, number> = {};
        let minPrice = Infinity, maxPrice = 0;
        for (const p of productRows) {
            if (p.material) materialCounts[p.material] = (materialCounts[p.material] || 0) + 1;
            if (p.price < minPrice) minPrice = p.price;
            if (p.price > maxPrice) maxPrice = p.price;
        }
        const materials = Object.entries(materialCounts).map(([name, count]) => ({ name, count }));

        const categoryRows = await db.select({ id: categories.id, name: categories.name, slug: categories.slug })
            .from(categories).orderBy(asc(categories.name));

        const categoriesWithCount = await Promise.all(categoryRows.map(async cat => {
            const [{ total }] = await db.select({ total: count() }).from(products).where(and(eq(products.active, true), eq(products.categoryId, cat.id)));
            return { id: cat.id, name: cat.name, slug: cat.slug, count: total };
        }));

        return NextResponse.json({ materials, categories: categoriesWithCount, priceRange: { min: minPrice === Infinity ? 0 : Math.floor(minPrice), max: Math.ceil(maxPrice) } });
    } catch (error) {
        console.error('Error fetching filter options:', error);
        return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 });
    }
}
