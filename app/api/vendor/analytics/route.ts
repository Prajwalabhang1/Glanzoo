export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { vendors, vendorSales, products, orders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { calculateVendorMetrics } from "@/lib/vendor-utils";

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (session.user.role !== "VENDOR") return NextResponse.json({ error: "Forbidden: Vendor access required" }, { status: 403 });

        const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, session.user.id)).limit(1);
        if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });

        const [salesRows, productRows] = await Promise.all([
            db.select().from(vendorSales).where(eq(vendorSales.vendorId, vendor.id)),
            db.select({ id: products.id, name: products.name, views: products.views, sales: products.sales, approvalStatus: products.approvalStatus, active: products.active }).from(products).where(eq(products.vendorId, vendor.id)),
        ]);

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        let filteredSales = salesRows;
        if (startDate || endDate) {
            filteredSales = salesRows.filter(sale => {
                const d = new Date(sale.createdAt);
                if (startDate && d < new Date(startDate)) return false;
                if (endDate && d > new Date(endDate)) return false;
                return true;
            });
        }

        const metrics = calculateVendorMetrics(filteredSales);
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentSales = salesRows.filter(s => new Date(s.createdAt) >= thirtyDaysAgo);
        const salesByDay: Record<string, number> = {};
        recentSales.forEach(s => { const day = new Date(s.createdAt).toISOString().split("T")[0]; salesByDay[day] = (salesByDay[day] || 0) + Number(s.productTotal); });

        return NextResponse.json({
            metrics,
            productStats: { total: productRows.length, approved: productRows.filter(p => p.approvalStatus === "APPROVED").length, pending: productRows.filter(p => p.approvalStatus === "PENDING").length },
            topProducts: productRows.filter(p => p.active && p.approvalStatus === "APPROVED").sort((a, b) => (b.sales ?? 0) - (a.sales ?? 0)).slice(0, 5).map(p => ({ id: p.id, name: p.name, views: p.views, sales: p.sales })),
            salesTrend: Object.entries(salesByDay).map(([date, amount]) => ({ date, amount })),
        });
    } catch (error) { console.error("Error fetching vendor analytics:", error); return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 }); }
}
