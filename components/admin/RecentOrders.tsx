import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Eye, ArrowRight, ShoppingBag, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'

export async function RecentOrders() {
    const orders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            items: {
                take: 1,
                select: { name: true },
            },
            user: {
                select: { name: true, email: true }
            }
        },
    })

    const statusStyles: Record<string, string> = {
        PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
        PROCESSING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
        DELIVERED: 'bg-green-50 text-green-700 border-green-200',
        CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                    <p className="text-sm text-gray-500 mt-1">Latest transactions</p>
                </div>
                <Link href="/admin/orders">
                    <Button variant="outline" size="sm" className="rounded-xl hover:bg-gray-50 hover:text-gray-900 border-gray-200">
                        View All
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3">
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <div
                            key={order.id}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 rounded-2xl transition-all duration-200 hover:shadow-lg hover:shadow-gray-100/50"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-amber-500 group-hover:border-amber-100 transition-colors">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-semibold text-gray-900">#{order.id.slice(-6).toUpperCase()}</p>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-bold border ${statusStyles[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {order.items[0]?.name || 'No items'}
                                        {order.items.length > 1 && <span className="text-gray-400"> +{order.items.length - 1} more</span>}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 mt-4 sm:mt-0 pl-16 sm:pl-0">
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">₹{order.total.toLocaleString()}</p>
                                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <Link href={`/admin/orders/${order.id}`}>
                                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Package className="w-8 h-8 opacity-50" />
                        </div>
                        <p>No orders yet</p>
                    </div>
                )}
            </div>
        </div>
    )
}
