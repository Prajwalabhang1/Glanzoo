export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { vendors, vendorSales, orders } from "@/lib/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, TrendingUp, ArrowDownRight, Calendar } from "lucide-react";

export default async function VendorSalesPage() {
    const session = await auth();
    if (!session || session.user.role !== "VENDOR") redirect("/");

    const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, session.user.id)).limit(1);
    if (!vendor) redirect("/vendor/register");

    const salesRows = await db.select().from(vendorSales).where(eq(vendorSales.vendorId, vendor.id)).orderBy(desc(vendorSales.createdAt));
    const orderIds = [...new Set(salesRows.map(s => s.orderId))];
    const orderRows = orderIds.length > 0 ? await db.select({ id: orders.id, status: orders.status, createdAt: orders.createdAt }).from(orders).where(inArray(orders.id, orderIds)) : [];
    const orderMap = Object.fromEntries(orderRows.map(o => [o.id, o]));

    const enriched = salesRows.map(s => ({ ...s, order: orderMap[s.orderId] ?? { id: s.orderId, status: 'UNKNOWN', createdAt: s.createdAt } }));

    const totalRevenue = enriched.reduce((sum, s) => sum + Number(s.productTotal || 0), 0);
    const totalPayout = enriched.reduce((sum, s) => sum + Number(s.vendorPayout || 0), 0);
    const totalCommission = enriched.reduce((sum, s) => sum + Number(s.commissionAmount || 0), 0);
    const pendingPayout = enriched.filter(s => s.payoutStatus === "PENDING" || s.payoutStatus === "PROCESSING").reduce((sum, s) => sum + Number(s.vendorPayout || 0), 0);

    const now = new Date();
    const monthlyData: { month: string; revenue: number; payout: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const monthSales = enriched.filter(s => new Date(s.createdAt) >= d && new Date(s.createdAt) < nextMonth);
        monthlyData.push({ month: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }), revenue: monthSales.reduce((sum, s) => sum + Number(s.productTotal || 0), 0), payout: monthSales.reduce((sum, s) => sum + Number(s.vendorPayout || 0), 0), orders: monthSales.length });
    }

    const getPayoutStatusColor = (s: string) => ({ COMPLETED: "bg-green-100 text-green-800", PROCESSING: "bg-blue-100 text-blue-800", PENDING: "bg-yellow-100 text-yellow-800", FAILED: "bg-red-100 text-red-800" }[s] || "bg-gray-100 text-gray-800");

    return (
        <div className="space-y-6">
            <div><h1 className="text-3xl font-bold text-gray-900">Sales & Payouts</h1><p className="text-gray-600 mt-1">Track your revenue, commissions, and payouts</p></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[{ label: 'Total Revenue', value: totalRevenue, icon: IndianRupee, bg: 'bg-green-50', ic: 'text-green-600' }, { label: 'Total Earnings', value: totalPayout, icon: TrendingUp, bg: 'bg-blue-50', ic: 'text-blue-600' }, { label: 'Pending Payout', value: pendingPayout, icon: Calendar, bg: 'bg-yellow-50', ic: 'text-yellow-600' }, { label: 'Commission Paid', value: totalCommission, icon: ArrowDownRight, bg: 'bg-red-50', ic: 'text-red-500' }].map(s => (
                    <Card key={s.label}><CardContent className="pt-6"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${s.bg}`}><s.icon className={`w-5 h-5 ${s.ic}`} /></div><div><p className="text-2xl font-bold">₹{s.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p><p className="text-xs text-gray-500">{s.label}</p></div></div></CardContent></Card>
                ))}
            </div>
            <Card>
                <CardHeader><CardTitle>Monthly Breakdown</CardTitle></CardHeader>
                <CardContent>
                    {monthlyData.some(m => m.orders > 0) ? (
                        <div className="overflow-x-auto"><table className="w-full text-sm">
                            <thead><tr className="border-b border-gray-100">{['Month', 'Orders', 'Revenue', 'Your Payout'].map((h, i) => <th key={h} className={`py-3 px-4 font-medium text-gray-500 ${i > 0 ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
                            <tbody>{monthlyData.map(m => <tr key={m.month} className="border-b border-gray-50 hover:bg-gray-50 transition-colors"><td className="py-3 px-4 font-medium">{m.month}</td><td className="py-3 px-4 text-right">{m.orders}</td><td className="py-3 px-4 text-right">₹{m.revenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td><td className="py-3 px-4 text-right font-medium text-green-700">₹{m.payout.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td></tr>)}</tbody>
                        </table></div>
                    ) : <p className="text-sm text-gray-500 text-center py-8">No sales data yet</p>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>All Transactions</CardTitle></CardHeader>
                <CardContent>
                    {enriched.length > 0 ? (
                        <div className="space-y-3">
                            {enriched.map(sale => (
                                <div key={sale.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                                    <div><p className="font-medium text-sm">Order #{sale.order.id.slice(-8).toUpperCase()}</p><p className="text-xs text-gray-500 mt-0.5">{new Date(sale.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right"><p className="font-semibold text-sm">₹{Number(sale.vendorPayout).toLocaleString("en-IN")}</p><p className="text-xs text-gray-500">of ₹{Number(sale.productTotal).toLocaleString("en-IN")}</p></div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPayoutStatusColor(sale.payoutStatus)}`}>{sale.payoutStatus}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12"><TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 font-medium">No sales yet</p><p className="text-gray-400 text-sm mt-1">Sales will appear here as customers purchase your products</p></div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
