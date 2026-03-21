export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
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

// GET /api/admin/dashboard/stats - Get dashboard statistics
export async function GET() {
    try {
        const accessError = await checkAdminAccess();
        if (accessError) {
            return NextResponse.json(
                { error: accessError.error },
                { status: accessError.status }
            );
        }

        // Get counts and stats
        const [
            totalOrders,
            pendingOrders,
            confirmedOrders,
            shippedOrders,
            deliveredOrders,
            totalProducts,
            activeProducts,
            totalCustomers,
            recentOrders,
        ] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: 'PENDING' } }),
            prisma.order.count({ where: { status: 'CONFIRMED' } }),
            prisma.order.count({ where: { status: 'SHIPPED' } }),
            prisma.order.count({ where: { status: 'DELIVERED' } }),
            prisma.product.count(),
            prisma.product.count({ where: { active: true } }),
            prisma.user.count({ where: { role: 'CUSTOMER' } }),
            prisma.order.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: true,
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
        ]);

        // Calculate revenue
        const allOrders = await prisma.order.findMany({
            where: {
                paymentStatus: { in: ['SUCCESS', 'PENDING'] },
            },
            select: {
                total: true,
                createdAt: true,
            },
        });

        // Calculate total revenue and monthly revenue
        const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const revenueThisMonth = allOrders
            .filter(order => order.createdAt >= firstDayOfMonth)
            .reduce((sum, order) => sum + order.total, 0);

        // Calculate 30-day revenue chart data
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const last30DaysOrders = allOrders.filter(o => o.createdAt >= thirtyDaysAgo);

        const dailyRevenueMap: Record<string, number> = {};
        // Initialize map with 0s for last 30 days
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            dailyRevenueMap[d.toISOString().split('T')[0]] = 0;
        }

        last30DaysOrders.forEach(order => {
            const dateStr = order.createdAt.toISOString().split('T')[0];
            if (dailyRevenueMap[dateStr] !== undefined) {
                dailyRevenueMap[dateStr] += order.total;
            }
        });

        const thirtyDayRevenue = Object.entries(dailyRevenueMap)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Parse shipping addresses for recent orders
        const recentOrdersWithParsedData = recentOrders.map(order => ({
            ...order,
            shippingAddress: JSON.parse(order.shippingAddress),
        }));

        return NextResponse.json({
            stats: {
                orders: {
                    total: totalOrders,
                    pending: pendingOrders,
                    confirmed: confirmedOrders,
                    shipped: shippedOrders,
                    delivered: deliveredOrders,
                },
                products: {
                    total: totalProducts,
                    active: activeProducts,
                },
                customers: {
                    total: totalCustomers,
                },
                revenue: {
                    total: totalRevenue,
                    thisMonth: revenueThisMonth,
                    thirtyDayChart: thirtyDayRevenue,
                },
            },
            recentOrders: recentOrdersWithParsedData,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard statistics' },
            { status: 500 }
        );
    }
}
