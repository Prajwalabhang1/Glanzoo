import prisma from '@/lib/prisma'

/**
 * Get Today's Collection - rotates daily based on the day of year
 * Returns 8 products from featured products with daily rotation
 */
export async function getTodaysCollection() {
    const today = new Date()
    const startOfYear = new Date(today.getFullYear(), 0, 0)
    const diff = today.getTime() - startOfYear.getTime()
    const dayOfYear = Math.floor(diff / 86400000)

    // Get all featured products
    const allFeaturedProducts = await prisma.product.findMany({
        where: {
            active: true,
            featured: true,
        },
        select: {
            id: true,
            slug: true,
            name: true,
            price: true,
            salePrice: true,
            images: true,
            categoryId: true,
            variants: {
                select: {
                    id: true,
                    size: true,
                    stock: true,
                },
            },
        },
    })

    console.log(`[TodaysCollection] Found ${allFeaturedProducts.length} featured products`)

    if (allFeaturedProducts.length === 0) {
        return []
    }

    // Calculate offset to rotate through products daily
    const offset = (dayOfYear % Math.max(1, allFeaturedProducts.length - 7)) || 0

    // Get the rotated products
    const rotatedProducts = allFeaturedProducts.slice(offset, offset + 8)

    // Now fetch category data separately for each product
    const productsWithRelations = await Promise.all(
        rotatedProducts.map(async (product) => {
            const category = product.categoryId
                ? await prisma.category.findUnique({
                    where: { id: product.categoryId },
                    select: { name: true, slug: true },
                })
                : null

            return {
                ...product,
                category,
                collection: null,
                material: null,
                displaySku: null,
                tags: null,
            }
        })
    )

    console.log(`[TodaysCollection] Returning ${productsWithRelations.length} products`)
    return productsWithRelations
}
