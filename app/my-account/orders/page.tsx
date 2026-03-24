'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Package, Truck, CheckCircle2, Loader2, CreditCard } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface OrderItem {
    id: string
    name: string
    size: string
    quantity: number
    price: number
}

interface Order {
    id: string
    createdAt: string
    status: string
    total: number
    paymentMethod: string
    paymentStatus: string
    items: OrderItem[]
    trackingNumber?: string
    courierName?: string
}

const statusSteps = [
    { key: 'PENDING', label: 'Ordered', icon: ShoppingBag },
    { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'PROCESSING', label: 'Processing', icon: Package },
    { key: 'SHIPPED', label: 'Shipped', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
]

export default function OrdersPage() {
    const { data: session } = useSession()
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/user/orders')
                const data = await res.json()
                setOrders(data.orders || [])
            } catch { /* silent */ }
            finally { setIsLoading(false) }
        }
        if (session) fetchOrders()
    }, [session])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'text-green-600 bg-green-50 border-green-100'
            case 'CANCELLED': return 'text-red-600 bg-red-50 border-red-100'
            case 'SHIPPED': return 'text-blue-600 bg-blue-50 border-blue-100'
            default: return 'text-orange-600 bg-orange-50 border-orange-100'
        }
    }

    if (!session) return <div className="p-8 text-center text-gray-500">Please sign in to view your orders</div>

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-sm text-gray-500 mb-8">Track and manage your recent purchases</p>

            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-orange-400" /></div>
            ) : orders.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">You haven&apos;t placed any orders yet</p>
                    <Link href="/products" className="text-orange-500 text-sm font-bold mt-2 inline-block hover:underline">Start Shopping</Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            {/* Order Header */}
                            <div className="bg-gray-50/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100">
                                <div className="flex items-center gap-6">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                                        <p className="text-sm font-bold text-gray-900">#{order.id.slice(-8).toUpperCase()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Placed On</p>
                                        <p className="text-sm font-medium text-gray-700">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</p>
                                        <p className="text-sm font-bold text-orange-600">₹{order.total.toLocaleString()}</p>
                                    </div>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Order Content */}
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Items Preview */}
                                    <div className="flex-1 space-y-4">
                                        {order.items.map(item => (
                                            <div key={item.id} className="flex gap-4">
                                                <div className="w-16 h-20 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-gray-300" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                                    <p className="text-xs text-gray-500">Size: {item.size} | Qty: {item.quantity}</p>
                                                    <p className="text-sm font-semibold text-gray-900 mt-1">₹{item.price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tracking / Info */}
                                    <div className="md:w-64 bg-gray-50 rounded-xl p-4 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white rounded-lg"><Truck className="w-3.5 h-3.5 text-orange-500" /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shipped Via</p>
                                                <p className="text-xs font-semibold text-gray-700">{order.courierName || 'Pending'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white rounded-lg"><CreditCard className="w-3.5 h-3.5 text-orange-500" /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment</p>
                                                <p className="text-xs font-semibold text-gray-700">{order.paymentMethod} ({order.paymentStatus})</p>
                                            </div>
                                        </div>
                                        {order.trackingNumber && (
                                            <div className="pt-2">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tracking ID</p>
                                                <p className="text-xs font-mono font-bold text-orange-600">{order.trackingNumber}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Timeline (Mobile Optimized) */}
                                <div className="mt-8 pt-8 border-t border-gray-100">
                                    <div className="flex justify-between items-center relative">
                                        {/* Progress Line */}
                                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0" />

                                        {statusSteps.map((step, idx) => {
                                            const currentIdx = statusSteps.findIndex(s => s.key === order.status)
                                            const isPast = idx < currentIdx
                                            const isCurrent = idx === currentIdx

                                            return (
                                                <div key={step.key} className="relative z-10 flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isPast ? 'bg-green-500 text-white' :
                                                        isCurrent ? 'bg-orange-500 text-white ring-4 ring-orange-100' :
                                                            'bg-white border-2 border-gray-200 text-gray-300'
                                                        }`}>
                                                        <step.icon className="w-4 h-4" />
                                                    </div>
                                                    <span className={`text-[9px] font-bold uppercase mt-2 hidden sm:block ${isCurrent ? 'text-orange-600' : 'text-gray-400'
                                                        }`}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
