import { db } from '@/lib/db';
import { products, categories, productVariants } from '@/lib/schema';
import { eq, and, gte, lte, asc, desc, inArray } from 'drizzle-orm';
import { ProductCard } from '@/components/products/ProductCard';

interface ProductGridProps { searchParams: { [key: string]: string | string[] | undefined } }

export async function ProductGrid({ searchParams }: ProductGridProps) {
    const category = searchParams.category as string | undefined;
    const priceRange = searchParams.price as string | undefined;
    const sort = (searchParams.sort as string) || 'newest';
    const saleFilter = searchParams.sale === 'true';

    // Resolve category ID if slug given
    let categoryId: string | undefined;
    if (category) {
        const [cat] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, category)).limit(1);
        categoryId = cat?.id;
    }

    // Build conditions (removed any[] — using explicit Drizzle SQL conditions)
    type SQLCondition = Parameters<typeof and>[0];
    const conditions: SQLCondition[] = [eq(products.active, true)];
    if (categoryId) conditions.push(eq(products.categoryId, categoryId));
    if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        if (!isNaN(min)) conditions.push(gte(products.price, min));
        if (!isNaN(max)) conditions.push(lte(products.price, max));
    }
    if (saleFilter) {
        // TODO when salePrice column is confirmed added: conditions.push(isNotNull(products.salePrice))
    }

    const orderBy =
        sort === 'price-low' ? asc(products.price) :
        sort === 'price-high' ? desc(products.price) :
        sort === 'popular' ? desc(products.sales) :
        desc(products.createdAt);

    const productRows = await db.select().from(products).where(and(...conditions)).orderBy(orderBy).limit(24);
    const productIds = productRows.map(p => p.id);
    const categoryIds = [...new Set(productRows.map(p => p.categoryId))];

    const [variantRows, categoryRows] = productIds.length > 0 ? await Promise.all([
        db.select().from(productVariants).where(inArray(productVariants.productId, productIds)),
        db.select().from(categories).where(inArray(categories.id, categoryIds)),
    ]) : [[], []];

    const catMap = Object.fromEntries(categoryRows.map(c => [c.id, c]));
    const varMap = variantRows.reduce(
        (acc, v) => {
            if (!acc[v.productId]) acc[v.productId] = [];
            acc[v.productId].push(v);
            return acc;
        },
        {} as Record<string, typeof productVariants.$inferSelect[]>
    );
    const enriched = productRows.map(p => ({
        ...p,
        images: p.images,
        category: catMap[p.categoryId] ?? null,
        variants: (varMap[p.id] ?? []).filter(v => v.stock > 0).sort((a, b) => a.size.localeCompare(b.size)),
    }));

    if (enriched.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters to see more products</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{enriched.length}</span> products
                </p>
            </div>
            {/*
              Mobile-first grid:
              - 375px: 2 columns (small phone)
              - sm (640px): 2 columns
              - md (768px): 2 columns
              - lg (1024px): 3 columns
              gap-3 on mobile saves horizontal space; gap-6 on desktop
            */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {enriched.map(product => <ProductCard key={product.id} product={product as Parameters<typeof ProductCard>[0]['product']} />)}
            </div>
        </div>
    );
}
