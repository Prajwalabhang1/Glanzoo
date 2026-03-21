import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/products/filters
 * Returns available filter options (materials, categories, price range)
 */
export async function GET() {
    try {
        // Get all unique materials (non-null)
        const products = await prisma.product.findMany({
            where: {
                active: true,
                material: {
                    not: null,
                },
            },
            select: {
                material: true,
                price: true,
            },
        })

        // Extract unique materials and count
        const materialCounts: Record<string, number> = {}
        let minPrice = Infinity
        let maxPrice = 0

        products.forEach((product) => {
            if (product.material) {
                materialCounts[product.material] = (materialCounts[product.material] || 0) + 1
            }
            if (product.price < minPrice) minPrice = product.price
            if (product.price > maxPrice) maxPrice = product.price
        })

        const materials = Object.entries(materialCounts).map(([name, count]) => ({
            name,
            count,
        }))

        // Get all categories with product counts
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                _count: {
                    select: {
                        products: {
                            where: {
                                active: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        })

        const categoriesWithCount = categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            count: cat._count.products,
        }))

        return NextResponse.json({
            materials,
            categories: categoriesWithCount,
            priceRange: {
                min: minPrice === Infinity ? 0 : Math.floor(minPrice),
                max: Math.ceil(maxPrice),
            },
        })
    } catch (error) {
        console.error('Error fetching filter options:', error)
        return NextResponse.json(
            { error: 'Failed to fetch filter options' },
            { status: 500 }
        )
    }
}
