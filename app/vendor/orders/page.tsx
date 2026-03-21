export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, Truck, ShoppingBag } from "lucide-react";

export default async function VendorOrdersPage() {
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

    // Get vendor sales with order details
    const vendorSales = await prisma.vendorSale.findMany({
        where: { vendorId: vendor.id },
        include: {
            order: {
                select: {
                    id: true,
                    status: true,
                    paymentStatus: true,
                    paymentMethod: true,
                    shippingAddress: true,
                    trackingNumber: true,
                    createdAt: true,
                    items: {
                        select: {
                            id: true,
                            name: true,
                            size: true,
                            quantity: true,
                            price: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    // Stats
    const totalOrders = vendorSales.length;
    const pendingOrders = vendorSales.filter((s) => s.order.status === "PENDING" || s.order.status === "CONFIRMED").length;
    const shippedOrders = vendorSales.filter((s) => s.order.status === "SHIPPED").length;
    const deliveredOrders = vendorSales.filter((s) => s.order.status === "DELIVERED").length;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-yellow-100 text-yellow-800";
            case "CONFIRMED": return "bg-blue-100 text-blue-800";
            case "PROCESSING": return "bg-indigo-100 text-indigo-800";
            case "SHIPPED": return "bg-purple-100 text-purple-800";
            case "DELIVERED": return "bg-green-100 text-green-800";
            case "CANCELLED": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getPaymentColor = (status: string) => {
        switch (status) {
            case "SUCCESS": return "bg-green-100 text-green-800";
            case "PENDING": return "bg-yellow-100 text-yellow-800";
            case "FAILED": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-600 mt-1">Track and manage your customer orders</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-50">
                                <ShoppingBag className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalOrders}</p>
                                <p className="text-xs text-gray-500">Total Orders</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-50">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{pendingOrders}</p>
                                <p className="text-xs text-gray-500">Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-50">
                                <Truck className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{shippedOrders}</p>
                                <p className="text-xs text-gray-500">Shipped</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-50">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{deliveredOrders}</p>
                                <p className="text-xs text-gray-500">Delivered</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Orders List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {vendorSales.length > 0 ? (
                        <div className="space-y-4">
                            {vendorSales.map((sale) => {
                                interface ShippingAddress {
                                    name: string;
                                    city: string;
                                }
                                let address: ShippingAddress = { name: "N/A", city: "N/A" };
                                try {
                                    address = JSON.parse(sale.order.shippingAddress) as ShippingAddress;
                                } catch { /* ignore */ }

                                return (
                                    <div key={sale.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900">
                                                    Order #{sale.order.id.slice(-8).toUpperCase()}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {new Date(sale.order.createdAt).toLocaleDateString("en-IN", {
                                                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.order.status)}`}>
                                                    {sale.order.status}
                                                </span>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentColor(sale.order.paymentStatus)}`}>
                                                    {sale.order.paymentStatus}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                            {sale.order.items.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between py-1.5 text-sm">
                                                    <div>
                                                        <span className="font-medium text-gray-900">{item.name}</span>
                                                        <span className="text-gray-500 ml-2">Size: {item.size} × {item.quantity}</span>
                                                    </div>
                                                    <span className="font-medium">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="text-gray-500">
                                                <span>Ship to: {address.name || "N/A"}, {address.city || "N/A"}</span>
                                                {sale.order.trackingNumber && (
                                                    <span className="ml-3 text-purple-600">Tracking: {sale.order.trackingNumber}</span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">Your Payout: ₹{sale.vendorPayout.toLocaleString("en-IN")}</p>
                                                <p className="text-xs text-gray-500">Commission: ₹{sale.commissionAmount.toLocaleString("en-IN")} ({sale.commissionRate}%)</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No orders yet</p>
                            <p className="text-gray-400 text-sm mt-1">Orders will appear here when customers buy your products</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
