import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Get specific hero banner
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const banner = await prisma.heroBanner.findUnique({
            where: { id }
        })

        if (!banner) {
            return NextResponse.json(
                { success: false, error: 'Banner not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            banner
        })
    } catch (error) {
        console.error('Error fetching hero banner:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch banner' },
            { status: 500 }
        )
    }
}

// PUT - Update hero banner
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json()

        const banner = await prisma.heroBanner.update({
            where: { id },
            data: {
                order: body.order,
                active: body.active,
                image: body.image,
                imagePosition: body.imagePosition,
                badge: body.badge,
                title: body.title,
                titleAccent: body.titleAccent,
                description: body.description,
                primaryCtaText: body.primaryCtaText,
                primaryCtaLink: body.primaryCtaLink,
                secondaryCtaText: body.secondaryCtaText,
                secondaryCtaLink: body.secondaryCtaLink,
            }
        })

        return NextResponse.json({
            success: true,
            banner
        })
    } catch (error) {
        console.error('Error updating hero banner:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update banner' },
            { status: 500 }
        )
    }
}

// DELETE - Delete hero banner
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.heroBanner.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'Banner deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting hero banner:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete banner' },
            { status: 500 }
        )
    }
}

// PATCH - Toggle active status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json()

        const banner = await prisma.heroBanner.update({
            where: { id },
            data: {
                active: body.active
            }
        })

        return NextResponse.json({
            success: true,
            banner
        })
    } catch (error) {
        console.error('Error updating banner status:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update banner status' },
            { status: 500 }
        )
    }
}
