import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reviews, users, orders, orderItems } from '@/lib/schema';
import { eq, and, desc, count, avg, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';
export const dynamic = 'force-dynamic';

function cuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = 10;
        if (!productId) return NextResponse.json({ error: 'productId is required' }, { status: 400 });

        const offset = (page - 1) * limit;
        const [reviewRows, [{ total }], [{ avgRating }]] = await Promise.all([
            db.select({ id: reviews.id, rating: reviews.rating, title: reviews.title, comment: reviews.comment, verified: reviews.verified, createdAt: reviews.createdAt, userId: reviews.userId })
                .from(reviews).where(and(eq(reviews.productId, productId), eq(reviews.approved, true)))
                .orderBy(desc(reviews.createdAt)).limit(limit).offset(offset),
            db.select({ total: count() }).from(reviews).where(and(eq(reviews.productId, productId), eq(reviews.approved, true))),
            db.select({ avgRating: avg(reviews.rating) }).from(reviews).where(and(eq(reviews.productId, productId), eq(reviews.approved, true))),
        ]);

        const userIds = [...new Set(reviewRows.map(r => r.userId))];
        const userRows = userIds.length > 0 ? await db.select({ id: users.id, name: users.name, image: users.image }).from(users).where(inArray(users.id, userIds)) : [];
        const userMap = Object.fromEntries(userRows.map(u => [u.id, u]));

        const reviewsWithUser = reviewRows.map(r => ({ ...r, user: userMap[r.userId] ?? { name: 'Anonymous', image: null } }));
        const pages = Math.ceil(total / limit);
        const avgNum = avgRating ? Math.round(Number(avgRating) * 10) / 10 : 0;

        return NextResponse.json({ reviews: reviewsWithUser, total, page, pages, avgRating: avgNum, totalRatings: total });
    } catch (error) {
        console.error('Reviews GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: 'You must be logged in to leave a review' }, { status: 401 });

        const { productId, rating, title, comment } = await request.json();
        if (!productId || !rating || rating < 1 || rating > 5) return NextResponse.json({ error: 'productId and rating (1-5) are required' }, { status: 400 });

        // Check if user has purchased the product
        const purchasedOrders = await db.select({ id: orders.id }).from(orders)
            .where(and(eq(orders.userId, session.user.id), inArray(orders.status, ['DELIVERED', 'SHIPPED', 'CONFIRMED'])));
        const purchasedOrderIds = purchasedOrders.map(o => o.id);
        const hasPurchased = purchasedOrderIds.length > 0
            ? await db.select({ id: orderItems.id }).from(orderItems)
                .where(and(eq(orderItems.productId, productId), inArray(orderItems.orderId, purchasedOrderIds))).limit(1)
            : [];

        if (!hasPurchased.length) return NextResponse.json({ error: 'You can only review products you have purchased' }, { status: 403 });

        const [existing] = await db.select({ id: reviews.id }).from(reviews)
            .where(and(eq(reviews.productId, productId), eq(reviews.userId, session.user.id))).limit(1);

        if (existing) {
            await db.update(reviews).set({ rating, title: title || null, comment: comment || null }).where(eq(reviews.id, existing.id));
            const [updated] = await db.select().from(reviews).where(eq(reviews.id, existing.id)).limit(1);
            return NextResponse.json({ review: updated });
        }

        const reviewId = cuid();
        await db.insert(reviews).values({ id: reviewId, productId, userId: session.user.id, rating, title: title || null, comment: comment || null, approved: true });
        const [review] = await db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1);
        return NextResponse.json({ review }, { status: 201 });
    } catch (error) {
        console.error('Reviews POST error:', error);
        return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }
}
