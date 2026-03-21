export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, TrendingUp, ArrowDownRight, Calendar } from "lucide-react";

export default async function VendorSalesPage() {
    const session = await auth();

    if (!session || session.user.role !== "VENDOR") {
        redirect("/");
    }

    const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
    });

    if (!vendor) {
        redirect("/vendor/register");
    }

    // Get all vendor sales
    const sales = await prisma.vendorSale.findMany({
        where: { vendorId: vendor.id },
        include: {
            order: {
                select: {
                    id: true,
                    status: true,
                    createdAt: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    // Calculate metrics
    const totalRevenue = sales.reduce((sum, s) => sum + s.productTotal, 0);
    const totalPayout = sales.reduce((sum, s) => sum + s.vendorPayout, 0);
    const totalCommission = sales.reduce((sum, s) => sum + s.commissionAmount, 0);
    const pendingPayout = sales
        .filter((s) => s.payoutStatus === "PENDING" || s.payoutStatus === "PROCESSING")
        .reduce((sum, s) => sum + s.vendorPayout, 0);

    // Monthly breakdown (last 6 months)
    const now = new Date();
    const monthlyData: { month: string; revenue: number; payout: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const monthSales = sales.filter(
            (s) => new Date(s.createdAt) >= d && new Date(s.createdAt) < nextMonth
        );
        monthlyData.push({
            month: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
            revenue: monthSales.reduce((sum, s) => sum + s.productTotal, 0),
            payout: monthSales.reduce((sum, s) => sum + s.vendorPayout, 0),
            orders: monthSales.length,
        });
    }

    const getPayoutStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED": return "bg-green-100 text-green-800";
            case "PROCESSING": return "bg-blue-100 text-blue-800";
            case "PENDING": return "bg-yellow-100 text-yellow-800";
            case "FAILED": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Sales & Payouts</h1>
                <p className="text-gray-600 mt-1">Track your revenue, commissions, and payouts</p>
            </div>

            {/* Financial Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-50">
                                <IndianRupee className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                                <p className="text-xs text-gray-500">Total Revenue</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-50">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">₹{totalPayout.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                                <p className="text-xs text-gray-500">Total Earnings</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-50">
                                <Calendar className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">₹{pendingPayout.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                                <p className="text-xs text-gray-500">Pending Payout</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-50">
                                <ArrowDownRight className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">₹{totalCommission.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                                <p className="text-xs text-gray-500">Commission Paid</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    {monthlyData.some((m) => m.orders > 0) ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-3 px-4 font-medium text-gray-500">Month</th>
                                        <th className="text-right py-3 px-4 font-medium text-gray-500">Orders</th>
                                        <th className="text-right py-3 px-4 font-medium text-gray-500">Revenue</th>
                                        <th className="text-right py-3 px-4 font-medium text-gray-500">Your Payout</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyData.map((m) => (
                                        <tr key={m.month} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 font-medium">{m.month}</td>
                                            <td className="py-3 px-4 text-right">{m.orders}</td>
                                            <td className="py-3 px-4 text-right">₹{m.revenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                                            <td className="py-3 px-4 text-right font-medium text-green-700">₹{m.payout.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-8">No sales data yet</p>
                    )}
                </CardContent>
            </Card>

            {/* Individual Sales */}
            <Card>
                <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    {sales.length > 0 ? (
                        <div className="space-y-3">
                            {sales.map((sale) => (
                                <div key={sale.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                                    <div>
                                        <p className="font-medium text-sm">
                                            Order #{sale.order.id.slice(-8).toUpperCase()}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(sale.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric", month: "short", year: "numeric"
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-semibold text-sm">₹{sale.vendorPayout.toLocaleString("en-IN")}</p>
                                            <p className="text-xs text-gray-500">of ₹{sale.productTotal.toLocaleString("en-IN")}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPayoutStatusColor(sale.payoutStatus)}`}>
                                            {sale.payoutStatus}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No sales yet</p>
                            <p className="text-gray-400 text-sm mt-1">Sales will appear here as customers purchase your products</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
