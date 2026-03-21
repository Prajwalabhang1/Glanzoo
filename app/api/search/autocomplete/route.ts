export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get('q')

        if (!query || query.trim().length < 2) {
            return NextResponse.json({
                products: [],
                categories: [],
            })
        }

        const searchQuery = query.trim()

        // Search products (using only fields that exist in the schema)
        const products = await prisma.product.findMany({
            where: {
                active: true,
                OR: [
                    // Note: add mode: 'insensitive' after connecting real PostgreSQL DB and running npx prisma generate
                    { name: { contains: searchQuery } },
                    { description: { contains: searchQuery } },
                    { tags: { contains: searchQuery } },
                ],
            },
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                salePrice: true,
                images: true,
            },
            take: 5,
            orderBy: {
                createdAt: 'desc',
            },
        })

        // Parse images and format products
        const formattedProducts = products.map((product) => {
            let imageUrls: string[] = []
            try {
                const parsed = JSON.parse(product.images)
                imageUrls = Array.isArray(parsed) ? parsed : [parsed]
            } catch {
                imageUrls = [product.images]
            }
            imageUrls = imageUrls.filter(url => typeof url === 'string' && url.trim() !== '')

            return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                salePrice: product.salePrice,
                image: imageUrls[0] || 'https://placehold.co/400x600?text=No+Image',
            }
        })

        // Search categories
        const categories = await prisma.category.findMany({
            where: {
                name: { contains: searchQuery }, // Note: add mode: 'insensitive' after real PostgreSQL connect + prisma generate
            },
            select: {
                id: true,
                name: true,
                slug: true,
            },
            take: 3,
            orderBy: {
                name: 'asc',
            },
        })

        // Get product counts for categories
        const categoriesWithCounts = await Promise.all(
            categories.map(async (category) => {
                const count = await prisma.product.count({
                    where: {
                        active: true,
                        categoryId: category.id,
                    },
                })
                return {
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    productCount: count,
                }
            })
        )

        return NextResponse.json({
            products: formattedProducts,
            categories: categoriesWithCounts,
        })
    } catch (error: unknown) {
        console.error('Autocomplete search error:', error)
        return NextResponse.json(
            { error: 'Failed to search' },
            { status: 500 }
        )
    }
}
