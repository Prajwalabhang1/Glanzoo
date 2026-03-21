import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products/[slug] - Get a single product by slug
export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const product = await prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                variants: true,
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            product: {
                ...product,
                images: JSON.parse(product.images),
            },
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

// PUT /api/products/[slug] - Update a product (Admin only)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body = await request.json();

        const {
            name,
            description,
            price,
            salePrice,
            images,
            categoryId,
            freeShipping,
            featured,
            fabric,
            topLength,
            bottomLength,
            shippingDays,
        } = body;

        const product = await prisma.product.update({
            where: { slug },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(price && { price }),
                ...(salePrice !== undefined && { salePrice }),
                ...(images && { images: JSON.stringify(images) }),
                ...(categoryId && { categoryId }),
                ...(freeShipping !== undefined && { freeShipping }),
                ...(featured !== undefined && { featured }),
                ...(fabric !== undefined && { fabric }),
                ...(topLength !== undefined && { topLength }),
                ...(bottomLength !== undefined && { bottomLength }),
                ...(shippingDays && { shippingDays }),
            },
            include: {
                category: true,
                variants: true,
            },
        });

        return NextResponse.json({
            product: {
                ...product,
                images: JSON.parse(product.images),
            },
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

// DELETE /api/products/[slug] - Delete a product (Admin only)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        await prisma.product.delete({
            where: { slug },
        });

        return NextResponse.json(
            { message: 'Product deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}
