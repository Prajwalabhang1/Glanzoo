import prisma from '@/lib/prisma'
import { ProductCard } from '@/components/products/ProductCard'
import { Prisma } from '@prisma/client'

interface ProductGridProps {
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function ProductGrid({ searchParams }: ProductGridProps) {
    // Parse filter params
    const category = searchParams.category as string | undefined
    const priceRange = searchParams.price as string | undefined
    const sizes = searchParams.sizes as string | undefined
    const sort = (searchParams.sort as string) || 'newest'

    // Build where clause
    const where: Prisma.ProductWhereInput = {
        active: true,
    }

    // Category filter
    if (category) {
        where.category = {
            slug: category,
        }
    }

    // Price filter
    if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number)
        where.OR = [
            {
                AND: [
                    { salePrice: { gte: min } },
                    { salePrice: { lte: max } },
                ],
            },
            {
                AND: [
                    { salePrice: null },
                    { price: { gte: min } },
                    { price: { lte: max } },
                ],
            },
        ]
    }

    // Size filter (check if product has variants with selected sizes in stock)
    if (sizes) {
        const sizeArray = sizes.split(',').filter(Boolean)
        if (sizeArray.length > 0) {
            where.variants = {
                some: {
                    size: { in: sizeArray },
                    stock: { gt: 0 },
                },
            }
        }
    }

    // Build orderBy
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }
    switch (sort) {
        case 'price-low':
            orderBy = { price: 'asc' }
            break
        case 'price-high':
            orderBy = { price: 'desc' }
            break
        case 'popular':
            orderBy = { sales: 'desc' }
            break
        case 'newest':
        default:
            orderBy = { createdAt: 'desc' }
            break
    }

    // Fetch products
    const products = await prisma.product.findMany({
        where,
        include: {
            category: true,
            variants: {
                where: { stock: { gt: 0 } },
                orderBy: { size: 'asc' },
            },
        },
        orderBy,
        take: 24,
    })

    if (products.length === 0) {
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
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                    Showing <span className="font-semibold">{products.length}</span> products
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}
