import { db } from '@/lib/db';
import { products, categories, productVariants } from '@/lib/schema';
import { eq, and, like, asc, desc, or } from 'drizzle-orm';
import { ProductCard } from '@/components/products/ProductCard';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
export const dynamic = 'force-dynamic';

export async function generateMetadata(props: { params: Promise<{ [key: string]: string | string[] | undefined }>; searchParams: Promise<{ q?: string }> }) {
    const searchParams = await props.searchParams;
    const query = searchParams.q;
    return { title: query ? `Search Results for "${query}" | Glanzoo` : 'Search | Glanzoo', description: `Search results for ${query} on Glanzoo fashion store.` };
}

export default async function SearchPage(props: { params: Promise<{ [key: string]: string | string[] | undefined }>; searchParams: Promise<{ q?: string; category?: string }> }) {
    const searchParams = await props.searchParams;
    const query = searchParams.q;
    const categoryFilter = searchParams.category;

    const categoryRows = await db.select({ id: categories.id, name: categories.name, slug: categories.slug }).from(categories).orderBy(asc(categories.name));
    let productList: any[] = [];

    if (query) {
        const lowerQuery = query.toLowerCase();
        let categoryId: string | undefined;
        if (categoryFilter) {
            const [cat] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, categoryFilter)).limit(1);
            categoryId = cat?.id;
        }

        const rawProducts = await db.select().from(products)
            .where(and(eq(products.active, true), categoryId ? eq(products.categoryId, categoryId) : undefined))
            .orderBy(desc(products.createdAt)).limit(200);

        const productIds = rawProducts.map(p => p.id);
        const [variantRows, categoryMap] = await Promise.all([
            productIds.length > 0 ? db.select().from(productVariants).where(eq(productVariants.productId, productIds[0])) : [],
            db.select().from(categories),
        ]);
        const catMap = Object.fromEntries(categoryMap.map(c => [c.id, c]));
        const variantMap = variantRows.reduce((acc, v) => { if (!acc[v.productId]) acc[v.productId] = []; acc[v.productId].push(v); return acc; }, {} as Record<string, any[]>);

        productList = rawProducts.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            (p.description?.toLowerCase().includes(lowerQuery) ?? false) ||
            (catMap[p.categoryId]?.name?.toLowerCase().includes(lowerQuery) ?? false) ||
            (p.tags?.toLowerCase().includes(lowerQuery) ?? false)
        ).slice(0, 50).map(p => ({
            ...p, images: p.images, category: catMap[p.categoryId] ?? null, variants: (variantMap[p.id] ?? []).filter((v: any) => v.stock > 0),
        }));
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <h1 className="text-3xl font-bold mb-2">Search Results</h1>
                    {query ? (<p className="text-gray-600">Found <span className="font-semibold text-orange-600">{productList.length}</span> products for <span className="font-semibold">&quot;{query}&quot;</span></p>) : (<p className="text-gray-600">Enter a search term to find products</p>)}
                </div>
                {query ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <aside className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                                <h3 className="font-bold mb-4">Filter by Category</h3>
                                <div className="space-y-2">
                                    <Link href={`/search?q=${query}`} className={`block px-3 py-2 rounded-lg transition-colors ${!categoryFilter ? 'bg-orange-50 text-orange-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>All Categories</Link>
                                    {categoryRows.map(cat => (<Link key={cat.id} href={`/search?q=${query}&category=${cat.slug}`} className={`block px-3 py-2 rounded-lg transition-colors ${categoryFilter === cat.slug ? 'bg-orange-50 text-orange-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>{cat.name}</Link>))}
                                </div>
                            </div>
                        </aside>
                        <div className="lg:col-span-3">
                            {productList.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {productList.map(product => (<ProductCard key={product.id} product={product} />))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-12 h-12 text-gray-400" /></div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                                    <p className="text-gray-500 mb-6">We couldn&apos;t find any products matching &quot;{query}&quot;.<br />Try checking your spelling or using different keywords.</p>
                                    <Link href="/products"><Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">Browse All Products</Button></Link>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center max-w-2xl mx-auto">
                        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-12 h-12 text-orange-500" /></div>
                        <h3 className="text-xl font-semibold mb-2">Start searching</h3>
                        <p className="text-gray-600 mb-6">Use the search bar above to find products</p>
                        <Link href="/products"><Button variant="outline" className="border-2 border-orange-500 text-orange-600">Browse All Products</Button></Link>
                    </div>
                )}
            </div>
        </div>
    );
}
