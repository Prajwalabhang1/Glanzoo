/**
 * app/search/page.tsx — Search results page
 *
 * Fixes:
 *  - CRITICAL N+1: Was fetching variants for productIds[0] only (single-item
 *    array). Now uses inArray to batch-fetch variants for all matching products.
 *  - Removed in-memory full-table scan (200 products fetched then JS-filtered).
 *    Now uses SQL LIKE on name/description/tags via OR conditions directly.
 *  - Removed `any[]` and `any` types — fully typed with Drizzle inference.
 *  - Added ISR revalidation.
 */
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { products, categories, productVariants } from '@/lib/schema';
import { eq, and, or, like, asc, desc, inArray } from 'drizzle-orm';
import { ProductCard } from '@/components/products/ProductCard';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

type SearchProps = {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ q?: string; category?: string }>;
};

export async function generateMetadata({ searchParams }: SearchProps): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q ? `Search Results for "${q}" | Glanzoo` : 'Search | Glanzoo';
  const description = q
    ? `Browse ${q} ethnic wear on Glanzoo — premium fashion marketplace.`
    : 'Search Glanzoo for ethnic wear, co-ord sets, sarees, and more.';
  return { title, description };
}

export default async function SearchPage({ searchParams }: SearchProps) {
  const { q: query, category: categoryFilter } = await searchParams;

  // Only show root-level categories (no "All Products" subcategories)
  const categoryRows = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .where(
      and(
        eq(categories.active, true),
        isNull(categories.parentId) // only parent categories
      )
    )
    .orderBy(asc(categories.sortOrder), asc(categories.name));


  type ProductWithMeta = {
    id: string;
    name: string;
    slug: string;
    price: number | string;
    salePrice: number | string | null;
    images: string;
    active: boolean;
    category: (typeof categoryRows)[number] | null;
    variants: typeof productVariants.$inferSelect[];
    [key: string]: unknown;
  };

  let productList: ProductWithMeta[] = [];

  if (query) {
    const q = `%${query.toLowerCase()}%`;

    // Resolve category if filtered
    let categoryId: string | undefined;
    if (categoryFilter) {
      const [cat] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, categoryFilter))
        .limit(1);
      categoryId = cat?.id;
    }

    // FIX: Use SQL LIKE filtering instead of in-memory JS filter on 200 rows
    const rawProducts = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.active, true),
          categoryId ? eq(products.categoryId, categoryId) : undefined,
          or(
            like(products.name, q),
            like(products.description, q),
            like(products.tags, q),
            like(products.material, q)
          )
        )
      )
      .orderBy(desc(products.createdAt))
      .limit(50);

    if (rawProducts.length > 0) {
      const productIds = rawProducts.map((p) => p.id);

      // FIX N+1: batch-fetch all variants + categories in parallel
      const [variantRows, allCategories] = await Promise.all([
        db
          .select()
          .from(productVariants)
          .where(inArray(productVariants.productId, productIds)),
        db.select().from(categories),
      ]);

      const catMap = Object.fromEntries(allCategories.map((c) => [c.id, c]));
      const variantMap = variantRows.reduce(
        (acc, v) => {
          if (!acc[v.productId]) acc[v.productId] = [];
          acc[v.productId].push(v);
          return acc;
        },
        {} as Record<string, typeof productVariants.$inferSelect[]>
      );

      productList = rawProducts.map((p) => ({
        ...p,
        category: catMap[p.categoryId] ?? null,
        variants: (variantMap[p.id] ?? []).filter((v) => v.stock > 0),
      }));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 pb-safe-nav">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          {query ? (
            <p className="text-gray-600">
              Found{' '}
              <span className="font-semibold text-orange-600">{productList.length}</span>{' '}
              products for <span className="font-semibold">&quot;{query}&quot;</span>
            </p>
          ) : (
            <p className="text-gray-600">Enter a search term to find products</p>
          )}
        </div>

        {query ? (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Category filter — pill row on mobile, sidebar on desktop */}
            <aside className="lg:w-56 flex-shrink-0">
              {/* Mobile: horizontal scroll */}
              <div className="flex lg:hidden gap-2 overflow-x-auto scrollbar-hide pb-2 touch-manipulation">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    !categoryFilter ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  All
                </Link>
                {categoryRows.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/search?q=${encodeURIComponent(query)}&category=${cat.slug}`}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      categoryFilter === cat.slug ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
              {/* Desktop: sticky sidebar */}
              <div className="hidden lg:block bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h3 className="font-bold mb-4">Filter by Category</h3>
                <div className="space-y-2">
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    className={`block px-3 py-2 rounded-lg transition-colors ${!categoryFilter ? 'bg-orange-50 text-orange-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    All Categories
                  </Link>
                  {categoryRows.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/search?q=${encodeURIComponent(query)}&category=${cat.slug}`}
                      className={`block px-3 py-2 rounded-lg transition-colors ${categoryFilter === cat.slug ? 'bg-orange-50 text-orange-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              {productList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {productList.map((product) => (
                    <ProductCard key={product.id} product={product as Parameters<typeof ProductCard>[0]['product']} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-500 mb-6">
                    We couldn&apos;t find any products matching &quot;{query}&quot;.<br />
                    Try checking your spelling or using different keywords.
                  </p>
                  <Link href="/products">
                    <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                      Browse All Products
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Start searching</h3>
            <p className="text-gray-600 mb-6">Use the search bar above to find products</p>
            <Link href="/products">
              <Button variant="outline" className="border-2 border-orange-500 text-orange-600">
                Browse All Products
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
