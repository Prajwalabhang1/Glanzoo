export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, IndianRupee, Clock } from "lucide-react";

export default async function VendorDashboard() {
    const session = await auth();

    if (!session || session.user.role !== "VENDOR") {
        redirect("/");
    }

    // Get vendor with stats
    const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
        include: {
            products: {
                where: { active: true },
                select: {
                    id: true,
                    name: true,
                    approvalStatus: true,
                    sales: true,
                    views: true,
                },
            },
            sales: {
                select: {
                    productTotal: true,
                    vendorPayout: true,
                    payoutStatus: true,
                    createdAt: true,
                },
            },
        },
    });

    if (!vendor) {
        redirect("/vendor/register");
    }

    // Calculate metrics
    const totalRevenue = vendor.sales.reduce((sum, sale) => sum + sale.productTotal, 0);
    const pendingPayout = vendor.sales
        .filter((s) => s.payoutStatus === "PENDING" || s.payoutStatus === "PROCESSING")
        .reduce((sum, sale) => sum + sale.vendorPayout, 0);

    const approvedProducts = vendor.products.filter((p) => p.approvalStatus === "APPROVED").length;
    const pendingProducts = vendor.products.filter((p) => p.approvalStatus === "PENDING").length;

    // Last 7 days sales
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSales = vendor.sales.filter((s) => new Date(s.createdAt) >= sevenDaysAgo);
    const recentRevenue = recentSales.reduce((sum, sale) => sum + sale.productTotal, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, {session.user.name}!</p>
            </div>

            {/* Status Alert */}
            {vendor.status !== "APPROVED" && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-900 font-medium">
                        {vendor.status === "PENDING"
                            ? "📋 Your vendor application is under review. You'll be notified once approved."
                            : vendor.status === "SUSPENDED"
                                ? "⚠️ Your vendor account is currently suspended."
                                : "❌ Your vendor application was not approved."}
                    </p>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                        <IndianRupee className="w-4 h-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                        <p className="text-xs text-gray-500 mt-1">All-time earnings</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Pending Payout</CardTitle>
                        <Clock className="w-4 h-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{pendingPayout.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                        <p className="text-xs text-gray-500 mt-1">Awaiting settlement</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Products</CardTitle>
                        <Package className="w-4 h-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{approvedProducts}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            {pendingProducts > 0 && `${pendingProducts} pending approval`}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Last 7 Days</CardTitle>
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{recentRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                        <p className="text-xs text-gray-500 mt-1">{recentSales.length} orders</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Products */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {vendor.products.length > 0 ? (
                            <div className="space-y-3">
                                {vendor.products
                                    .sort((a, b) => b.sales - a.sales)
                                    .slice(0, 5)
                                    .map((product) => (
                                        <div key={product.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-sm">{product.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {product.sales} sales • {product.views} views
                                                </p>
                                            </div>
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${product.approvalStatus === "APPROVED"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                            >
                                                {product.approvalStatus}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-8">
                                No products yet. Start by adding your first product!
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Sales */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {vendor.sales.length > 0 ? (
                            <div className="space-y-3">
                                {vendor.sales
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .slice(0, 5)
                                    .map((sale, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-sm">
                                                    ₹{sale.productTotal.toLocaleString("en-IN")}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(sale.createdAt).toLocaleDateString("en-IN")}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${sale.payoutStatus === "COMPLETED"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                            >
                                                {sale.payoutStatus}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No sales yet</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
