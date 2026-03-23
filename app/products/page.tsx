import { db } from '@/lib/db';
import { products, categories, productVariants, reviews, vendors } from '@/lib/schema';
import { ProductsWithFilters } from './ProductsWithFilters';
import { parseFilterParams, buildProductConditions } from '@/lib/buildProductQuery';
import { eq, and, isNotNull, asc, desc, inArray, count } from 'drizzle-orm';
export const dynamic = 'force-dynamic';

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const urlParams = new URLSearchParams(Object.entries(params).reduce((acc, [key, value]) => { if (value) acc[key] = Array.isArray(value) ? value.join(',') : value; return acc; }, {} as Record<string, string>));
    const filters = parseFilterParams(urlParams);
    const conditions = buildProductConditions(filters);

    const productRows = await db.select().from(products).where(conditions).orderBy(desc(products.createdAt));
    const productIds = productRows.map(p => p.id);

    const [variantRows, reviewRows, categoryRows] = productIds.length > 0 ? await Promise.all([
        db.select().from(productVariants).where(inArray(productVariants.productId, productIds)),
        db.select({ productId: reviews.productId, rating: reviews.rating }).from(reviews).where(and(inArray(reviews.productId, productIds), eq(reviews.approved, true))),
        db.select().from(categories),
    ]) : [[], [], await db.select().from(categories)];

    const catMap = Object.fromEntries(categoryRows.map(c => [c.id, c]));
    const variantMap = variantRows.reduce((acc, v) => { if (!acc[v.productId]) acc[v.productId] = []; acc[v.productId].push(v); return acc; }, {} as Record<string, typeof productVariants.$inferSelect[]>);
    const reviewMap = reviewRows.reduce((acc, r) => { if (!acc[r.productId]) acc[r.productId] = []; acc[r.productId].push(r.rating); return acc; }, {} as Record<string, number[]>);

    const productsWithRating = productRows.map(p => {
        const ratings = reviewMap[p.id] ?? [];
        const avg = ratings.length > 0 ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10 : 0;
        return { ...p, images: (() => { try { return JSON.parse(p.images); } catch { return []; } })(), category: catMap[p.categoryId] ?? null, variants: variantMap[p.id] ?? [], rating: { avg, count: ratings.length } };
    });

    // Filter options
    const filterProducts = await db.select({ material: products.material, price: products.price }).from(products).where(and(eq(products.active, true), isNotNull(products.material)));
    const allCategories = await db.select().from(categories).where(eq(categories.active, true)).orderBy(asc(categories.sortOrder), asc(categories.name));

    const materialCounts: Record<string, number> = {};
    let minPrice = Infinity, maxPrice = 0;
    for (const p of filterProducts) { if (p.material) materialCounts[p.material] = (materialCounts[p.material] || 0) + 1; if (p.price < minPrice) minPrice = p.price; if (p.price > maxPrice) maxPrice = p.price; }

    const subcategories = allCategories.filter(c => c.parentId !== null && !c.name.startsWith('All '));
    const rootCategories = allCategories.filter(c => c.parentId === null && !c.name.startsWith('All ') && c.name !== 'All Products');
    const displayCategories = subcategories.length > 0 ? subcategories : rootCategories;
    const seenSlugs = new Set<string>();
    const deduped = displayCategories.filter(c => { if (seenSlugs.has(c.slug)) return false; seenSlugs.add(c.slug); return true; });

    const categoryProductCounts = await Promise.all(deduped.map(async cat => {
        const [{ total }] = await db.select({ total: count() }).from(products).where(and(eq(products.active, true), eq(products.categoryId, cat.id)));
        return { ...cat, count: total };
    }));

    const filterOptions = {
        materials: Object.entries(materialCounts).map(([name, count]) => ({ name, count })),
        categories: categoryProductCounts.map(c => ({ id: c.id, name: c.name, slug: c.slug, count: c.count, group: c.parentId ? (catMap[c.parentId]?.name ?? null) : null })),
        priceRange: { min: minPrice === Infinity ? 0 : Math.floor(minPrice), max: maxPrice === 0 || maxPrice === minPrice ? (minPrice === Infinity ? 10000 : Math.ceil(minPrice) + 10000) : Math.ceil(maxPrice) },
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-4xl font-bold font-heading mb-2">All <span className="text-gradient-vibrant">Products</span></h1>
                    <p className="text-gray-600">Discover our collection of premium ethnic wear</p>
                </div>
            </div>
            <ProductsWithFilters initialProducts={productsWithRating as any} materials={filterOptions.materials} categories={filterOptions.categories} priceRange={filterOptions.priceRange} />
        </div>
    );
}
