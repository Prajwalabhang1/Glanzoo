export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { vendors, products, vendorSales } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, IndianRupee, Clock } from "lucide-react";

export default async function VendorDashboard() {
    const session = await auth();
    if (!session || session.user.role !== "VENDOR") redirect("/");

    const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, session.user.id)).limit(1);
    if (!vendor) redirect("/vendor/register");

    const [productRows, salesRows] = await Promise.all([
        db.select({ id: products.id, name: products.name, approvalStatus: products.approvalStatus, sales: products.sales, views: products.views }).from(products).where(eq(products.vendorId, vendor.id)),
        db.select({ productTotal: vendorSales.productTotal, vendorPayout: vendorSales.vendorPayout, payoutStatus: vendorSales.payoutStatus, createdAt: vendorSales.createdAt }).from(vendorSales).where(eq(vendorSales.vendorId, vendor.id)),
    ]);

    const totalRevenue = salesRows.reduce((s, r) => s + Number(r.productTotal || 0), 0);
    const pendingPayout = salesRows.filter(s => s.payoutStatus === "PENDING" || s.payoutStatus === "PROCESSING").reduce((s, r) => s + Number(r.vendorPayout || 0), 0);
    const approvedProducts = productRows.filter(p => p.approvalStatus === "APPROVED").length;
    const pendingProducts = productRows.filter(p => p.approvalStatus === "PENDING").length;
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSales = salesRows.filter(s => new Date(s.createdAt) >= sevenDaysAgo);
    const recentRevenue = recentSales.reduce((s, r) => s + Number(r.productTotal || 0), 0);

    return (
        <div className="space-y-6">
            <div><h1 className="text-3xl font-bold text-gray-900">Dashboard</h1><p className="text-gray-600 mt-1">Welcome back, {session.user.name}!</p></div>
            {vendor.status !== "APPROVED" && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-900 font-medium">{vendor.status === "PENDING" ? "📋 Your vendor application is under review. You'll be notified once approved." : vendor.status === "SUSPENDED" ? "⚠️ Your vendor account is currently suspended." : "❌ Your vendor application was not approved."}</p>
                </div>
            )}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: 'Total Revenue', value: `₹${totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, subtitle: 'All-time earnings', icon: IndianRupee, color: 'text-green-600' },
                    { title: 'Pending Payout', value: `₹${pendingPayout.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, subtitle: 'Awaiting settlement', icon: Clock, color: 'text-amber-600' },
                    { title: 'Products', value: String(approvedProducts), subtitle: pendingProducts > 0 ? `${pendingProducts} pending approval` : 'All approved', icon: Package, color: 'text-blue-600' },
                    { title: 'Last 7 Days', value: `₹${recentRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, subtitle: `${recentSales.length} orders`, icon: TrendingUp, color: 'text-purple-600' },
                ].map(s => (
                    <Card key={s.title}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-gray-600">{s.title}</CardTitle><s.icon className={`w-4 h-4 ${s.color}`} /></CardHeader><CardContent><div className="text-2xl font-bold">{s.value}</div><p className="text-xs text-gray-500 mt-1">{s.subtitle}</p></CardContent></Card>
                ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <Card><CardHeader><CardTitle>Top Products</CardTitle></CardHeader><CardContent>
                    {productRows.length > 0 ? (
                        <div className="space-y-3">{productRows.sort((a, b) => (b.sales ?? 0) - (a.sales ?? 0)).slice(0, 5).map(p => (
                            <div key={p.id} className="flex items-center justify-between"><div><p className="font-medium text-sm">{p.name}</p><p className="text-xs text-gray-500">{p.sales} sales • {p.views} views</p></div><span className={`px-2 py-1 rounded text-xs ${p.approvalStatus === "APPROVED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{p.approvalStatus}</span></div>
                        ))}</div>
                    ) : <p className="text-sm text-gray-500 text-center py-8">No products yet.</p>}
                </CardContent></Card>
                <Card><CardHeader><CardTitle>Recent Sales</CardTitle></CardHeader><CardContent>
                    {salesRows.length > 0 ? (
                        <div className="space-y-3">{[...salesRows].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map((sale, idx) => (
                            <div key={idx} className="flex items-center justify-between"><div><p className="font-medium text-sm">₹{Number(sale.productTotal).toLocaleString("en-IN")}</p><p className="text-xs text-gray-500">{new Date(sale.createdAt).toLocaleDateString("en-IN")}</p></div><span className={`px-2 py-1 rounded text-xs ${sale.payoutStatus === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{sale.payoutStatus}</span></div>
                        ))}</div>
                    ) : <p className="text-sm text-gray-500 text-center py-8">No sales yet</p>}
                </CardContent></Card>
            </div>
        </div>
    );
}
