import prisma from '@/lib/prisma'
import { ProductsWithFilters } from './ProductsWithFilters'
import { parseFilterParams, buildProductQuery } from '@/lib/buildProductQuery'

export const dynamic = 'force-dynamic'

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const urlParams = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
            if (value) {
                acc[key] = Array.isArray(value) ? value.join(',') : value
            }
            return acc
        }, {} as Record<string, string>)
    )

    // Parse filters from URL
    const filters = parseFilterParams(urlParams)

    // Build query with filters
    const where = buildProductQuery(filters)

    // Fetch filtered products
    const products = await prisma.product.findMany({
        where,
        include: {
            category: {
                select: {
                    name: true,
                    slug: true,
                },
            },
            variants: true,
            reviews: {
                where: { approved: true },
                select: { rating: true },
            },
            vendor: {
                select: { businessName: true },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    })

    // Compute avg rating per product
    const productsWithRating = products.map((p) => {
        const approvedReviews = p.reviews ?? []
        const count = approvedReviews.length
        const avg = count > 0
            ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count
            : 0
        return {
            ...p,
            rating: { avg: Math.round(avg * 10) / 10, count },
        }
    })

    // Fetch filter options directly from DB
    const [filterProducts, allCategories] = await Promise.all([
        prisma.product.findMany({
            where: { active: true, material: { not: null } },
            select: { material: true, price: true },
        }),
        // Fetch ALL active categories (with and without products)
        // so the sidebar always shows category options for browsing
        prisma.category.findMany({
            where: {
                active: true,
            },
            select: {
                id: true,
                name: true,
                slug: true,
                parentId: true,
                parent: { select: { name: true, slug: true } },
                _count: { select: { products: { where: { active: true } } } },
            },
            orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
        }),
    ])

    const materialCounts: Record<string, number> = {}
    let minPrice = Infinity
    let maxPrice = 0
    filterProducts.forEach((p) => {
        if (p.material) materialCounts[p.material] = (materialCounts[p.material] || 0) + 1
        if (p.price < minPrice) minPrice = p.price
        if (p.price > maxPrice) maxPrice = p.price
    })

    // Build category list:
    // - Prefer subcategories (parentId not null) grouped under their parent
    // - If no subcategories exist, fall back to showing all root categories
    // - Exclude generic "All ..." placeholder entries
    const subcategories = allCategories.filter(
        (c) => c.parentId !== null && !c.name.startsWith('All ')
    )
    const rootCategories = allCategories.filter(
        (c) => c.parentId === null && !c.name.startsWith('All ') && c.name !== 'All Products'
    )
    // Use subcategories if available, otherwise show root ones
    const displayCategories = subcategories.length > 0 ? subcategories : rootCategories

    // Deduplicate by slug
    const seenSlugs = new Set<string>()
    const deduped = displayCategories.filter((c) => {
        if (seenSlugs.has(c.slug)) return false
        seenSlugs.add(c.slug)
        return true
    })

    const filterOptions = {
        materials: Object.entries(materialCounts).map(([name, count]) => ({ name, count })),
        categories: deduped.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            count: c._count.products,
            group: c.parent?.name ?? null,
        })),
        priceRange: {
            min: minPrice === Infinity ? 0 : Math.floor(minPrice),
            max: maxPrice === 0 || maxPrice === minPrice ? (minPrice === Infinity ? 10000 : Math.ceil(minPrice) + 10000) : Math.ceil(maxPrice),
        },
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-4xl font-bold font-heading mb-2">
                        All <span className="text-gradient-vibrant">Products</span>
                    </h1>
                    <p className="text-gray-600">Discover our collection of premium ethnic wear</p>
                </div>
            </div>

            {/* Products with Filters */}
            <ProductsWithFilters
                initialProducts={productsWithRating}
                materials={filterOptions.materials}
                categories={filterOptions.categories}
                priceRange={filterOptions.priceRange}
            />
        </div>
    )
}
