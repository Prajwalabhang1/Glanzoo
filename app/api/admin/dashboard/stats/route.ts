export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, products, users, orderItems } from '@/lib/schema';
import { eq, count, desc, gte, inArray } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

        const [
            [{ totalOrders }],
            [{ pendingOrders }],
            [{ confirmedOrders }],
            [{ shippedOrders }],
            [{ deliveredOrders }],
            [{ totalProducts }],
            [{ activeProducts }],
            [{ totalCustomers }],
            recentOrders,
            allOrderRevenue,
        ] = await Promise.all([
            db.select({ totalOrders: count() }).from(orders),
            db.select({ pendingOrders: count() }).from(orders).where(eq(orders.status, 'PENDING')),
            db.select({ confirmedOrders: count() }).from(orders).where(eq(orders.status, 'CONFIRMED')),
            db.select({ shippedOrders: count() }).from(orders).where(eq(orders.status, 'SHIPPED')),
            db.select({ deliveredOrders: count() }).from(orders).where(eq(orders.status, 'DELIVERED')),
            db.select({ totalProducts: count() }).from(products),
            db.select({ activeProducts: count() }).from(products).where(eq(products.active, true)),
            db.select({ totalCustomers: count() }).from(users).where(eq(users.role, 'CUSTOMER')),
            db.select().from(orders).orderBy(desc(orders.createdAt)).limit(10),
            db.select({ total: orders.total, createdAt: orders.createdAt })
                .from(orders).where(inArray(orders.paymentStatus, ['SUCCESS', 'PENDING'])),
        ]);

        const totalRevenue = allOrderRevenue.reduce((sum, o) => sum + o.total, 0);
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const revenueThisMonth = allOrderRevenue
            .filter(o => new Date(o.createdAt) >= firstDayOfMonth)
            .reduce((sum, o) => sum + o.total, 0);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        const dailyRevenueMap: Record<string, number> = {};
        for (let i = 0; i < 30; i++) {
            const d = new Date(); d.setDate(now.getDate() - i);
            dailyRevenueMap[d.toISOString().split('T')[0]] = 0;
        }
        allOrderRevenue.filter(o => new Date(o.createdAt) >= thirtyDaysAgo).forEach(o => {
            const dateStr = new Date(o.createdAt).toISOString().split('T')[0];
            if (dailyRevenueMap[dateStr] !== undefined) dailyRevenueMap[dateStr] += o.total;
        });
        const thirtyDayRevenue = Object.entries(dailyRevenueMap).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date));

        // Fetch items and augment recent orders
        const recentOrderIds = recentOrders.map(o => o.id);
        const recentItems = recentOrderIds.length > 0
            ? await db.select().from(orderItems).where(inArray(orderItems.orderId, recentOrderIds))
            : [];

        const recentWithData = recentOrders.map(order => ({
            ...order,
            shippingAddress: JSON.parse(order.shippingAddress),
            items: recentItems.filter(i => i.orderId === order.id),
        }));

        return NextResponse.json({
            stats: {
                orders: { total: totalOrders, pending: pendingOrders, confirmed: confirmedOrders, shipped: shippedOrders, delivered: deliveredOrders },
                products: { total: totalProducts, active: activeProducts },
                customers: { total: totalCustomers },
                revenue: { total: totalRevenue, thisMonth: revenueThisMonth, thirtyDayChart: thirtyDayRevenue },
            },
            recentOrders: recentWithData,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 });
    }
}
