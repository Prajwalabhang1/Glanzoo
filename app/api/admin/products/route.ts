export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
interface ProductVariantInput {
    size: string;
    sku?: string;
    stock?: number;
}
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Middleware to check admin access
async function checkAdminAccess() {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: 'Unauthorized', status: 401 };
    }

    if (session.user.role !== 'ADMIN') {
        return { error: 'Forbidden: Admin access required', status: 403 };
    }

    return null;
}

// GET /api/admin/products - Get all products (admin view with stats)
export async function GET() {
    try {
        const accessError = await checkAdminAccess();
        if (accessError) {
            return NextResponse.json(
                { error: accessError.error },
                { status: accessError.status }
            );
        }

        const products = await prisma.product.findMany({
            include: {
                variants: true,
                category: true,
                _count: {
                    select: {
                        reviews: true,
                        wishlist: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Parse images
        const productsWithParsedImages = products.map(product => ({
            ...product,
            images: JSON.parse(product.images),
            tags: product.tags ? JSON.parse(product.tags) : [],
        }));

        return NextResponse.json({ products: productsWithParsedImages });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

// POST /api/admin/products - Create new product
export async function POST(request: Request) {
    try {
        const accessError = await checkAdminAccess();
        if (accessError) {
            return NextResponse.json(
                { error: accessError.error },
                { status: accessError.status }
            );
        }

        const body = await request.json();

        const {
            slug,
            name,
            description,
            price,
            salePrice,
            images,
            categoryId,
            variants,
            freeShipping,
            featured,
            fabric,
            topLength,
            bottomLength,
            shippingDays,
            tags,
            metaTitle,
            metaDesc,
            sku,
            weight,
        } = body;

        // Validate required fields
        if (!slug || !name || !price || !images || !categoryId || !variants) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if slug already exists
        const existingProduct = await prisma.product.findUnique({
            where: { slug },
        });

        if (existingProduct) {
            return NextResponse.json(
                { error: 'Product with this slug already exists' },
                { status: 409 }
            );
        }

        // Create product with variants
        const product = await prisma.product.create({
            data: {
                slug,
                name,
                description: description || null,
                price,
                salePrice: salePrice || null,
                images: Array.isArray(images) ? JSON.stringify(images) : images,
                categoryId,
                freeShipping: freeShipping ?? true,
                featured: featured ?? false,
                fabric: fabric || null,
                topLength: topLength || null,
                bottomLength: bottomLength || null,
                shippingDays: shippingDays || '3-10 days',
                tags: tags ? JSON.stringify(tags) : null,
                metaTitle: metaTitle || null,
                metaDesc: metaDesc || null,
                sku: sku || null,
                weight: weight || null,
                active: true,
                variants: {
                    create: variants.map((v: ProductVariantInput) => ({
                        size: v.size,
                        sku: v.sku || `${sku || slug}-${v.size}-${Math.random().toString(36).substring(7)}`.toUpperCase(),
                        stock: v.stock || 0,
                    })),
                },
            },
            include: {
                variants: true,
                category: true,
            },
        });

        return NextResponse.json(
            {
                message: 'Product created successfully',
                product: {
                    ...product,
                    images: JSON.parse(product.images),
                    tags: product.tags ? JSON.parse(product.tags) : [],
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}
