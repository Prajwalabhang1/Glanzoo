import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Middleware to check admin access
async function checkAdminAccess() {
    const session = await auth()

    if (!session?.user?.id) {
        return { error: 'Unauthorized', status: 401 }
    }

    if (session.user.role !== 'ADMIN') {
        return { error: 'Forbidden: Admin access required', status: 403 }
    }

    return null
}

// GET /api/admin/products/[id] - Get single product
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const accessError = await checkAdminAccess()
        if (accessError) {
            return NextResponse.json(
                { error: accessError.error },
                { status: accessError.status }
            )
        }

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                variants: true,
                category: true,
            },
        })

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            ...product,
            images: JSON.parse(product.images),
            tags: product.tags ? JSON.parse(product.tags) : [],
        })
    } catch (error) {
        console.error('Error fetching product:', error)
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        )
    }
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const accessError = await checkAdminAccess()
        if (accessError) {
            return NextResponse.json(
                { error: accessError.error },
                { status: accessError.status }
            )
        }

        const body = await request.json()

        const {
            name,
            description,
            price,
            salePrice,
            active,
            fabric,
            topLength,
            bottomLength,
            shippingDays,
            categoryId,
            images,
            tags,
        } = body

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price,
                salePrice,
                active,
                fabric,
                topLength,
                bottomLength,
                shippingDays,
                categoryId,
                images: Array.isArray(images) ? JSON.stringify(images) : images,
                tags: tags ? (Array.isArray(tags) ? JSON.stringify(tags) : tags) : null,
            },
            include: {
                variants: true,
                category: true,
            },
        })

        return NextResponse.json({
            message: 'Product updated successfully',
            product: {
                ...product,
                images: JSON.parse(product.images),
                tags: product.tags ? JSON.parse(product.tags) : [],
            },
        })
    } catch (error) {
        console.error('Error updating product:', error)
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        )
    }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const accessError = await checkAdminAccess()
        if (accessError) {
            return NextResponse.json(
                { error: accessError.error },
                { status: accessError.status }
            )
        }

        // Delete product (variants will be cascade deleted)
        await prisma.product.delete({
            where: { id },
        })

        return NextResponse.json({
            message: 'Product deleted successfully',
        })
    } catch (error) {
        console.error('Error deleting product:', error)
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        )
    }
}
