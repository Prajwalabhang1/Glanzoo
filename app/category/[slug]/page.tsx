import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { ProductCard } from '@/components/products/ProductCard'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { CategorySortBar } from './CategorySortBar'

export const revalidate = 3600 // Revalidate every hour (ISR)

interface CategoryPageProps {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ sort?: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const category = await prisma.category.findUnique({
        where: { slug },
        select: { name: true, description: true },
    })
    if (!category) return {}
    const title = `${category.name} | Glanzoo`
    const description = category.description || `Shop ${category.name} at Glanzoo — premium ethnic wear, accessories & more.`
    return {
        title,
        description,
        openGraph: { title, description, type: 'website' as const },
        twitter: { card: 'summary_large_image' as const, title, description },
    }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { slug } = await params
    const { sort } = await searchParams

    const category = await prisma.category.findUnique({
        where: { slug },
        include: {
            parent: true,
            children: { where: { active: true }, orderBy: { sortOrder: 'asc' } },
        },
    })

    if (!category || !category.active) notFound()

    const categoryIds = [category.id, ...category.children.map((c) => c.id)]

    // Build orderBy based on sort param
    const orderByMap: Record<string, object> = {
        price_asc: { price: 'asc' },
        price_desc: { price: 'desc' },
        newest: { createdAt: 'desc' },
        oldest: { createdAt: 'asc' },
        name_asc: { name: 'asc' },
    }
    const orderBy = orderByMap[sort || 'newest'] || { createdAt: 'desc' }

    const products = await prisma.product.findMany({
        where: { active: true, categoryId: { in: categoryIds } },
        include: { category: true, variants: true },
        orderBy,
    })

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'itemListElement': products.map((p, i) => ({
            '@type': 'ListItem',
            'position': i + 1,
            'url': `${process.env.NEXT_PUBLIC_APP_URL}/products/${p.slug}`
        }))
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': process.env.NEXT_PUBLIC_APP_URL },
            ...(category.parent ? [{ '@type': 'ListItem', 'position': 2, 'name': category.parent.name, 'item': `${process.env.NEXT_PUBLIC_APP_URL}/category/${category.parent.slug}` }] : []),
            { '@type': 'ListItem', 'position': category.parent ? 3 : 2, 'name': category.name, 'item': `${process.env.NEXT_PUBLIC_APP_URL}/category/${category.slug}` }
        ]
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
            <div className="min-h-screen bg-gray-50">
                {/* Breadcrumb */}
                <div className="bg-white border-b border-gray-100">
                    <div className="container mx-auto px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Link href="/" className="hover:text-coral transition-colors flex items-center gap-1">
                                <Home className="w-3.5 h-3.5" /> Home
                            </Link>
                            <ChevronRight className="w-3.5 h-3.5" />
                            {category.parent && (
                                <>
                                    <Link href={`/category/${category.parent.slug}`} className="hover:text-coral transition-colors">
                                        {category.parent.name}
                                    </Link>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </>
                            )}
                            <span className="text-gray-900 font-medium">{category.name}</span>
                        </div>
                    </div>
                </div>

                {/* Category Header */}
                <div className="bg-white border-b border-gray-100">
                    <div className="container mx-auto px-4 py-4 md:py-8">
                        <div className="flex items-center gap-4 mb-4">
                            {category.icon && (
                                <div className="w-10 h-10 md:w-14 md:h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-sm border border-rose-100">
                                    {category.icon}
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                                {category.description && (
                                    <p className="text-gray-500 text-sm mt-0.5">{category.description}</p>
                                )}
                                <p className="text-xs text-coral font-semibold mt-1">
                                    {products.length} {products.length === 1 ? 'product' : 'products'}
                                </p>
                            </div>
                        </div>

                        {/* Subcategory Pills — show all active subcategories */}
                        {category.children.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto md:flex-wrap pb-1 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                                {category.children.map((sub) => (
                                    <Link
                                        key={sub.id}
                                        href={`/category/${sub.slug}`}
                                        className="flex-shrink-0 px-4 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:border-coral hover:text-coral transition-colors whitespace-nowrap"
                                    >
                                        {sub.icon && <span className="mr-1">{sub.icon}</span>}
                                        {sub.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Products Grid */}
                <div className="container mx-auto px-3 sm:px-4 py-6 md:py-8">
                    {products.length > 0 ? (
                        <>
                            {/* Sort bar */}
                            <CategorySortBar currentSort={sort || 'newest'} total={products.length} />

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 mt-4">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-24">
                            <div className="text-5xl mb-4">🛍️</div>
                            <h2 className="text-lg font-semibold text-gray-700 mb-2">No products yet</h2>
                            <p className="text-gray-400 mb-6">Products in this category will appear here once added.</p>
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-coral text-white rounded-full font-medium hover:bg-rose transition-colors"
                            >
                                Browse All Products
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
