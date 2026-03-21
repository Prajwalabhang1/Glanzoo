import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/collections
 * Returns list of all collections with product counts
 * FIX: Use `banner` field (actual schema field) mapped to `image` for frontend compatibility
 */
export async function GET() {
    try {
        // First get collections
        const collections = await prisma.collection.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                banner: true,  // actual schema field (image alias)
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        })

        const collectionsWithCount = collections.map((collection) => ({
            id: collection.id,
            name: collection.name,
            slug: collection.slug,
            description: collection.description,
            image: collection.banner ?? null,  // map banner → image for frontend compat
            productCount: collection._count.products,
        }))

        return NextResponse.json({
            collections: collectionsWithCount,
        })
    } catch (error) {
        console.error('Error fetching collections:', error)
        return NextResponse.json(
            { error: 'Failed to fetch collections' },
            { status: 500 }
        )
    }
}
