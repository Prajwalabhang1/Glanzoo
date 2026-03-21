import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/collections/:slug
 * Returns collection details with products
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params

        // Fetch collection with products
        const collection = await prisma.collection.findUnique({
            where: { slug },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                banner: true,  // FIX: schema has `banner` not `image`
                products: {
                    where: {
                        active: true,
                    },
                    include: {
                        category: {
                            select: {
                                name: true,
                                slug: true,
                            },
                        },
                        variants: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        })

        if (!collection) {
            return NextResponse.json(
                { error: 'Collection not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            collection: {
                id: collection.id,
                name: collection.name,
                slug: collection.slug,
                description: collection.description,
                image: collection.banner ?? null,  // map banner → image for frontend compat
            },
            products: collection.products,
        })
    } catch (error) {
        console.error('Error fetching collection:', error)
        return NextResponse.json(
            { error: 'Failed to fetch collection' },
            { status: 500 }
        )
    }
}
