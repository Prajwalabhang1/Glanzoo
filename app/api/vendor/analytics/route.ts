export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateVendorMetrics } from "@/lib/vendor-utils";

/**
 * GET /api/vendor/analytics
 * Get vendor analytics and sales metrics
 */
export async function GET(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "VENDOR") {
            return NextResponse.json(
                { error: "Forbidden: Vendor access required" },
                { status: 403 }
            );
        }

        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id },
            include: {
                sales: {
                    include: {
                        order: {
                            select: {
                                createdAt: true,
                                status: true,
                            },
                        },
                    },
                },
                products: {
                    select: {
                        id: true,
                        name: true,
                        views: true,
                        sales: true,
                        approvalStatus: true,
                        active: true,
                    },
                },
            },
        });

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor profile not found" },
                { status: 404 }
            );
        }

        // Parse URL for date filtering
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        // Filter sales by date if provided
        let filteredSales = vendor.sales;
        if (startDate || endDate) {
            filteredSales = vendor.sales.filter((sale) => {
                const saleDate = new Date(sale.createdAt);
                if (startDate && saleDate < new Date(startDate)) return false;
                if (endDate && saleDate > new Date(endDate)) return false;
                return true;
            });
        }

        // Calculate metrics
        const metrics = calculateVendorMetrics(filteredSales);

        // Product statistics
        const totalProducts = vendor.products.length;
        const approvedProducts = vendor.products.filter(
            (p) => p.approvalStatus === "APPROVED"
        ).length;
        const pendingProducts = vendor.products.filter(
            (p) => p.approvalStatus === "PENDING"
        ).length;

        // Top performing products
        const topProducts = vendor.products
            .filter((p) => p.active && p.approvalStatus === "APPROVED")
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5)
            .map((p) => ({
                id: p.id,
                name: p.name,
                views: p.views,
                sales: p.sales,
            }));

        // Sales trend (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentSales = vendor.sales.filter(
            (sale) => new Date(sale.createdAt) >= thirtyDaysAgo
        );

        // Group by day
        const salesByDay: Record<string, number> = {};
        recentSales.forEach((sale) => {
            const day = new Date(sale.createdAt).toISOString().split("T")[0];
            salesByDay[day] = (salesByDay[day] || 0) + sale.productTotal;
        });

        return NextResponse.json({
            metrics,
            productStats: {
                total: totalProducts,
                approved: approvedProducts,
                pending: pendingProducts,
            },
            topProducts,
            salesTrend: Object.entries(salesByDay).map(([date, amount]) => ({
                date,
                amount,
            })),
        });
    } catch (error) {
        console.error("Error fetching vendor analytics:", error);
        return NextResponse.json(
            { error: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}
