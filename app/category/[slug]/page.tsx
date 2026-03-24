import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { categories, products, productVariants } from '@/lib/schema';
import { eq, and, asc, desc, inArray } from 'drizzle-orm';
import { ProductCard } from '@/components/products/ProductCard';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { CategorySortBar } from './CategorySortBar';
export const dynamic = 'force-dynamic';
interface CategoryPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [category] = await db.select({ name: categories.name, description: categories.description }).from(categories).where(eq(categories.slug, slug)).limit(1);
    if (!category) return {};
    const title = `${category.name} | Glanzoo`;
    const description = category.description || `Shop ${category.name} at Glanzoo — premium ethnic wear, accessories & more.`;
    return { title, description, openGraph: { title, description, type: 'website' as const }, twitter: { card: 'summary_large_image' as const, title, description } };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { slug } = await params;
    const { sort } = await searchParams;

    const [category] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    if (!category || !category.active) notFound();

    const [parentCategory, childCategories] = await Promise.all([
        category.parentId ? db.select().from(categories).where(eq(categories.id, category.parentId)).limit(1) : Promise.resolve([]),
        db.select().from(categories).where(and(eq(categories.parentId, category.id), eq(categories.active, true))).orderBy(asc(categories.sortOrder)),
    ]);

    const categoryIds = [category.id, ...childCategories.map(c => c.id)];

    const orderBy = sort === 'price_asc' ? asc(products.price) : sort === 'price_desc' ? desc(products.price) : sort === 'oldest' ? asc(products.createdAt) : sort === 'name_asc' ? asc(products.name) : desc(products.createdAt);
    const productRows = await db.select().from(products).where(and(eq(products.active, true), inArray(products.categoryId, categoryIds))).orderBy(orderBy);
    const productIds = productRows.map(p => p.id);
    const variantRows = productIds.length > 0 ? await db.select().from(productVariants).where(inArray(productVariants.productId, productIds)) : [];
    const variantMap = variantRows.reduce((acc, v) => { if (!acc[v.productId]) acc[v.productId] = []; acc[v.productId].push(v); return acc; }, {} as Record<string, typeof productVariants.$inferSelect[]>);
    const catMap = Object.fromEntries([category, ...childCategories].map(c => [c.id, c]));

    const enriched = productRows.map(p => ({ ...p, images: JSON.parse(p.images), category: catMap[p.categoryId] ?? null, variants: variantMap[p.id] ?? [] }));

    const breadcrumbLd = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_APP_URL }, ...(parentCategory[0] ? [{ '@type': 'ListItem', position: 2, name: parentCategory[0].name, item: `${process.env.NEXT_PUBLIC_APP_URL}/category/${parentCategory[0].slug}` }] : []), { '@type': 'ListItem', position: parentCategory[0] ? 3 : 2, name: category.name, item: `${process.env.NEXT_PUBLIC_APP_URL}/category/${category.slug}` }] };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b border-gray-100">
                    <div className="container mx-auto px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Link href="/" className="hover:text-coral transition-colors flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Home</Link>
                            <ChevronRight className="w-3.5 h-3.5" />
                            {parentCategory[0] && (<><Link href={`/category/${parentCategory[0].slug}`} className="hover:text-coral transition-colors">{parentCategory[0].name}</Link><ChevronRight className="w-3.5 h-3.5" /></>)}
                            <span className="text-gray-900 font-medium">{category.name}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white border-b border-gray-100">
                    <div className="container mx-auto px-4 py-4 md:py-8">
                        <div className="flex items-center gap-4 mb-4">
                            {category.icon && (<div className="w-10 h-10 md:w-14 md:h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-sm border border-rose-100">{category.icon}</div>)}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                                {category.description && <p className="text-gray-500 text-sm mt-0.5">{category.description}</p>}
                                <p className="text-xs text-coral font-semibold mt-1">{enriched.length} {enriched.length === 1 ? 'product' : 'products'}</p>
                            </div>
                        </div>
                        {childCategories.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto md:flex-wrap pb-1 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                                {childCategories.map(sub => (
                                    <Link key={sub.id} href={`/category/${sub.slug}`} className="flex-shrink-0 px-4 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:border-coral hover:text-coral transition-colors whitespace-nowrap">
                                        {sub.icon && <span className="mr-1">{sub.icon}</span>}{sub.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="container mx-auto px-3 sm:px-4 py-6 md:py-8">
                    {enriched.length > 0 ? (
                        <>
                            <CategorySortBar currentSort={sort || 'newest'} total={enriched.length} />
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 mt-4">
                                {enriched.map(product => <ProductCard key={product.id} product={product as any} />)}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-24">
                            <div className="text-5xl mb-4">🛍️</div>
                            <h2 className="text-lg font-semibold text-gray-700 mb-2">No products yet</h2>
                            <p className="text-gray-400 mb-6">Products in this category will appear here once added.</p>
                            <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-coral text-white rounded-full font-medium hover:bg-rose transition-colors">Browse All Products</Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
