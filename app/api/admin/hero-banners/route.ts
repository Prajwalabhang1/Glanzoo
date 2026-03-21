export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - List all hero banners
export async function GET() {
    try {
        const banners = await prisma.heroBanner.findMany({
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' }
            ]
        })

        return NextResponse.json({
            success: true,
            banners,
            total: banners.length
        })
    } catch (error) {
        console.error('Error fetching hero banners:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch banners' },
            { status: 500 }
        )
    }
}

// POST - Create new hero banner
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate required fields
        if (!body.image || !body.title || !body.titleAccent || !body.description) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const banner = await prisma.heroBanner.create({
            data: {
                order: body.order ?? 0,
                active: body.active ?? true,
                image: body.image,
                imagePosition: body.imagePosition ?? 'center center',
                badge: body.badge,
                title: body.title,
                titleAccent: body.titleAccent,
                description: body.description,
                primaryCtaText: body.primaryCtaText ?? 'Shop Now',
                primaryCtaLink: body.primaryCtaLink ?? '/products',
                secondaryCtaText: body.secondaryCtaText,
                secondaryCtaLink: body.secondaryCtaLink,
            }
        })

        return NextResponse.json({
            success: true,
            banner
        })
    } catch (error) {
        console.error('Error creating hero banner:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create banner' },
            { status: 500 }
        )
    }
}
