export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { vendors, users, products, vendorSales } from "@/lib/schema";
import { eq, like, count, or, desc } from "drizzle-orm";

async function checkAdminAccess() {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized", status: 401 };
    if (session.user.role !== "ADMIN") return { error: "Forbidden: Admin access required", status: 403 };
    return { session };
}

export async function GET(request: Request) {
    try {
        const accessCheck = await checkAdminAccess();
        if ("error" in accessCheck) return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const search = searchParams.get("search");

        let vendorRows = await db.select().from(vendors)
            .where(status ? eq(vendors.status, status) : undefined)
            .orderBy(desc(vendors.createdAt));

        if (search) {
            vendorRows = vendorRows.filter(v =>
                v.businessName?.toLowerCase().includes(search.toLowerCase()) ||
                v.contactEmail?.toLowerCase().includes(search.toLowerCase())
            );
        }

        const vendorsWithStats = await Promise.all(vendorRows.map(async vendor => {
            const [productCountRow] = await db.select({ cnt: count() }).from(products).where(eq(products.vendorId, vendor.id));
            const salesRows = await db.select({ productTotal: vendorSales.productTotal, vendorPayout: vendorSales.vendorPayout })
                .from(vendorSales).where(eq(vendorSales.vendorId, vendor.id));
            const [userRow] = vendor.userId ? await db.select({ id: users.id, email: users.email, name: users.name, createdAt: users.createdAt }).from(users).where(eq(users.id, vendor.userId)).limit(1) : [null];
            const totalRevenue = salesRows.reduce((sum, s) => sum + (s.productTotal ?? 0), 0);
            const totalPayout = salesRows.reduce((sum, s) => sum + (s.vendorPayout ?? 0), 0);
            let parsedAddress;
            try { parsedAddress = JSON.parse(vendor.businessAddress ?? '{}'); } catch { parsedAddress = { street: "N/A", city: "N/A", state: "N/A", pincode: "N/A" }; }
            return { ...vendor, businessAddress: parsedAddress, user: userRow ?? null, stats: { totalRevenue: Number(totalRevenue.toFixed(2)), totalPayout: Number(totalPayout.toFixed(2)), productCount: productCountRow.cnt, salesCount: salesRows.length } };
        }));

        return NextResponse.json({ vendors: vendorsWithStats, total: vendorsWithStats.length });
    } catch (error) {
        console.error("Error fetching vendors:", error);
        return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
    }
}
