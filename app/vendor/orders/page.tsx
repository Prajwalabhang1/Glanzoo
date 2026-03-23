export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { vendors, vendorSales, orders, orderItems } from "@/lib/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, Truck, ShoppingBag } from "lucide-react";

export default async function VendorOrdersPage() {
    const session = await auth();
    if (!session || session.user.role !== "VENDOR") redirect("/");

    const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, session.user.id)).limit(1);
    if (!vendor) redirect("/vendor/register");

    const salesRows = await db.select().from(vendorSales).where(eq(vendorSales.vendorId, vendor.id)).orderBy(desc(vendorSales.createdAt));
    const orderIds = [...new Set(salesRows.map(s => s.orderId))];
    const [orderRows, itemRows] = orderIds.length > 0 ? await Promise.all([
        db.select({ id: orders.id, status: orders.status, paymentStatus: orders.paymentStatus, paymentMethod: orders.paymentMethod, shippingAddress: orders.shippingAddress, trackingNumber: orders.trackingNumber, createdAt: orders.createdAt }).from(orders).where(inArray(orders.id, orderIds)),
        db.select({ orderId: orderItems.orderId, id: orderItems.id, name: orderItems.name, size: orderItems.size, quantity: orderItems.quantity, price: orderItems.price }).from(orderItems).where(inArray(orderItems.orderId, orderIds)),
    ]) : [[], []];

    const orderMap = Object.fromEntries(orderRows.map(o => [o.id, o]));
    const itemMap = itemRows.reduce((acc, item) => { if (!acc[item.orderId]) acc[item.orderId] = []; acc[item.orderId].push(item); return acc; }, {} as Record<string, any[]>);

    const getStatusColor = (s: string) => ({ PENDING: "bg-yellow-100 text-yellow-800", CONFIRMED: "bg-blue-100 text-blue-800", PROCESSING: "bg-indigo-100 text-indigo-800", SHIPPED: "bg-purple-100 text-purple-800", DELIVERED: "bg-green-100 text-green-800", CANCELLED: "bg-red-100 text-red-800" }[s] || "bg-gray-100 text-gray-800");
    const getPaymentColor = (s: string) => ({ SUCCESS: "bg-green-100 text-green-800", PAID: "bg-green-100 text-green-800", PENDING: "bg-yellow-100 text-yellow-800", FAILED: "bg-red-100 text-red-800" }[s] || "bg-gray-100 text-gray-800");

    const totalOrders = salesRows.length;
    const pendingOrders = salesRows.filter(s => { const o = orderMap[s.orderId]; return o?.status === "PENDING" || o?.status === "CONFIRMED"; }).length;
    const shippedOrders = salesRows.filter(s => orderMap[s.orderId]?.status === "SHIPPED").length;
    const deliveredOrders = salesRows.filter(s => orderMap[s.orderId]?.status === "DELIVERED").length;

    return (
        <div className="space-y-6">
            <div><h1 className="text-3xl font-bold text-gray-900">Orders</h1><p className="text-gray-600 mt-1">Track and manage your customer orders</p></div>
            <div className="grid gap-4 md:grid-cols-4">
                {[{ label: 'Total Orders', value: totalOrders, icon: ShoppingBag, bg: 'bg-blue-50', ic: 'text-blue-600' }, { label: 'Pending', value: pendingOrders, icon: Clock, bg: 'bg-yellow-50', ic: 'text-yellow-600' }, { label: 'Shipped', value: shippedOrders, icon: Truck, bg: 'bg-purple-50', ic: 'text-purple-600' }, { label: 'Delivered', value: deliveredOrders, icon: CheckCircle, bg: 'bg-green-50', ic: 'text-green-600' }].map(s => (
                    <Card key={s.label}><CardContent className="pt-6"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${s.bg}`}><s.icon className={`w-5 h-5 ${s.ic}`} /></div><div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div></div></CardContent></Card>
                ))}
            </div>
            <Card>
                <CardHeader><CardTitle>All Orders</CardTitle></CardHeader>
                <CardContent>
                    {salesRows.length > 0 ? (
                        <div className="space-y-4">
                            {salesRows.map(sale => {
                                const order = orderMap[sale.orderId];
                                if (!order) return null;
                                const items = itemMap[sale.orderId] ?? [];
                                let address: { name: string; city: string } = { name: "N/A", city: "N/A" };
                                try { address = JSON.parse(order.shippingAddress); } catch { /* ignore */ }
                                return (
                                    <div key={sale.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                                        <div className="flex items-start justify-between mb-3">
                                            <div><p className="font-semibold text-sm text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</p><p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p></div>
                                            <div className="flex items-center gap-2"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{order.status}</span><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentColor(order.paymentStatus)}`}>{order.paymentStatus}</span></div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                            {items.map(item => (
                                                <div key={item.id} className="flex items-center justify-between py-1.5 text-sm">
                                                    <div><span className="font-medium text-gray-900">{item.name}</span><span className="text-gray-500 ml-2">Size: {item.size} × {item.quantity}</span></div>
                                                    <span className="font-medium">₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="text-gray-500"><span>Ship to: {address.name}, {address.city}</span>{order.trackingNumber && <span className="ml-3 text-purple-600">Tracking: {order.trackingNumber}</span>}</div>
                                            <div className="text-right"><p className="font-semibold text-gray-900">Your Payout: ₹{Number(sale.vendorPayout).toLocaleString("en-IN")}</p><p className="text-xs text-gray-500">Commission: ₹{Number(sale.commissionAmount).toLocaleString("en-IN")} ({sale.commissionRate}%)</p></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12"><ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 font-medium">No orders yet</p><p className="text-gray-400 text-sm mt-1">Orders will appear here when customers buy your products</p></div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
