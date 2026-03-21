import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/reviews?productId=xxx&page=1
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = 10;

        if (!productId) {
            return NextResponse.json({ error: 'productId is required' }, { status: 400 });
        }

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: { productId, approved: true },
                include: { user: { select: { name: true, image: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.review.count({ where: { productId, approved: true } }),
        ]);

        // Aggregate rating
        const ratingAgg = await prisma.review.aggregate({
            where: { productId, approved: true },
            _avg: { rating: true },
            _count: { _all: true },
        });

        return NextResponse.json({
            reviews,
            total,
            page,
            pages: Math.ceil(total / limit),
            avgRating: ratingAgg._avg?.rating ?? 0,
            totalRatings: ratingAgg._count?._all ?? 0,
        });
    } catch (error) {
        console.error('Reviews GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

// POST /api/reviews — create a review (must be logged in)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'You must be logged in to leave a review' }, { status: 401 });
        }

        const { productId, rating, title, comment } = await request.json();

        if (!productId || !rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'productId and rating (1-5) are required' }, { status: 400 });
        }

        // Check if user has purchased the product
        const hasPurchased = await prisma.orderItem.findFirst({
            where: {
                productId,
                order: {
                    userId: session.user.id,
                    status: { in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] },
                },
            },
        });

        if (!hasPurchased) {
            return NextResponse.json(
                { error: 'You can only review products you have purchased' },
                { status: 403 }
            );
        }

        // Check if already reviewed
        const existing = await prisma.review.findFirst({
            where: { productId, userId: session.user.id },
        });

        if (existing) {
            // Update existing review
            const updated = await prisma.review.update({
                where: { id: existing.id },
                data: { rating, title: title || null, comment: comment || null, updatedAt: new Date() },
            });
            return NextResponse.json({ review: updated });
        }

        // Create new review (auto-approve for now)
        const review = await prisma.review.create({
            data: {
                productId,
                userId: session.user.id,
                rating,
                title: title || null,
                comment: comment || null,
                approved: true,
            },
        });

        return NextResponse.json({ review }, { status: 201 });
    } catch (error) {
        console.error('Reviews POST error:', error);
        return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }
}
