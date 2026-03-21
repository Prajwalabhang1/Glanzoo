export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/products - List all products with optional filters
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Standard params
        const categoryParam = searchParams.get('category');
        const materialParam = searchParams.get('material');
        const featured = searchParams.get('featured');
        const minPrice = searchParams.get('minPrice') || searchParams.get('priceMin');
        const maxPrice = searchParams.get('maxPrice') || searchParams.get('priceMax');
        const size = searchParams.get('size');
        const inStock = searchParams.get('inStock');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = (searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
        const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);
        const skip = Math.max(parseInt(searchParams.get('skip') || '0'), 0);

        const where: Record<string, unknown> = { active: true };

        // Category filter – support comma-separated slugs
        if (categoryParam) {
            const slugs = categoryParam.split(',').map(s => s.trim()).filter(Boolean);
            if (slugs.length === 1) {
                where.category = { slug: slugs[0] };
            } else if (slugs.length > 1) {
                where.category = { slug: { in: slugs } };
            }
        }

        // Material filter – support comma-separated values
        if (materialParam) {
            const materials = materialParam.split(',').map(s => s.trim()).filter(Boolean);
            if (materials.length === 1) {
                where.material = materials[0];
            } else {
                where.material = { in: materials };
            }
        }

        if (featured === 'true') {
            where.featured = true;
        }

        if (minPrice || maxPrice) {
            const priceFilter: Record<string, number> = {};
            if (minPrice) priceFilter.gte = parseFloat(minPrice);
            if (maxPrice) priceFilter.lte = parseFloat(maxPrice);
            where.price = priceFilter;
        }

        if (size || inStock === 'true') {
            where.variants = {
                some: {
                    ...(size && { size }),
                    ...(inStock === 'true' && { stock: { gt: 0 } }),
                },
            };
        }

        const allowedSortFields: Record<string, object> = {
            price: { price: sortOrder },
            name: { name: sortOrder },
            createdAt: { createdAt: sortOrder },
            views: { views: sortOrder },
            sales: { sales: sortOrder },
        };
        const orderBy = allowedSortFields[sortBy] || { createdAt: 'desc' };

        const [products, totalCount] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: { select: { id: true, name: true, slug: true } },
                    Collection: { select: { name: true, slug: true } },
                    variants: true,
                    reviews: {
                        where: { approved: true },
                        select: { rating: true },
                    },
                    vendor: { select: { businessName: true } },
                },
                orderBy,
                take: limit,
                skip,
            }),
            prisma.product.count({ where }),
        ]);

        // Return images as raw JSON string so ProductCard can parse it
        const productsForClient = products.map(product => {
            const approvedReviews = product.reviews ?? []
            const count = approvedReviews.length
            const avg = count > 0
                ? Math.round((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
                : 0
            return {
                ...product,
                images: product.images,
                material: product.material ?? null,
                displaySku: product.displaySku ?? null,
                tags: product.tags ?? null,
                vendorName: product.vendor?.businessName ?? null,
                rating: { avg, count },
            }
        });

        return NextResponse.json(
            { products: productsForClient, count: products.length, total: totalCount },
            { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=120' } }
        );
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

// POST /api/products - Create a new product (Admin only)
export async function POST(request: Request) {
    try {
        // FIX-4: Require ADMIN authentication before creating products
        const session = await auth();
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
            metaTitle,
            metaDesc,
        } = body;

        // Validate required fields
        if (!slug || !name || !price || !categoryId) {
            return NextResponse.json(
                { error: 'Missing required fields: slug, name, price, categoryId' },
                { status: 400 }
            );
        }

        if (typeof price !== 'number' || price <= 0) {
            return NextResponse.json(
                { error: 'Price must be a positive number' },
                { status: 400 }
            );
        }

        // Create product with variants
        const product = await prisma.product.create({
            data: {
                slug,
                name,
                description,
                price,
                salePrice: salePrice || null,
                images: JSON.stringify(images || []),
                categoryId,
                freeShipping: freeShipping ?? true,
                featured: featured ?? false,
                fabric,
                topLength,
                bottomLength,
                shippingDays: shippingDays || '3-10 days',
                metaTitle: metaTitle || null,
                metaDesc: metaDesc || null,
                approvalStatus: 'APPROVED', // Admin-created products are auto-approved
                active: true,
                variants: {
                    create: variants || [],
                },
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
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}
