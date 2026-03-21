import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Eye, Package, Truck, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export async function OrdersTable() {
    const orders = await prisma.order.findMany({
        include: {
            items: true,
            user: {
                select: { name: true, email: true },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
    })

    const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
        PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Package },
        CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
        PROCESSING: { label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: Package },
        SHIPPED: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
        DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
        CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-gray-100 flex gap-4">
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>Confirmed</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                </select>
                <input
                    type="search"
                    placeholder="Search orders..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Items
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Payment
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Date
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => {
                            const status = statusConfig[order.status]
                            const StatusIcon = status.icon

                            return (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-mono font-semibold text-gray-900">
                                            #{order.id.slice(0, 8)}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {order.user?.name || 'Guest'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {order.user?.email || 'N/A'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-900">
                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-900">
                                            ₹{order.total.toLocaleString()}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-medium text-gray-600">
                                                {order.paymentMethod}
                                            </span>
                                            <span className={`text-xs font-medium ${order.paymentStatus === 'PAID'
                                                ? 'text-green-600'
                                                : 'text-yellow-600'
                                                }`}>
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(order.createdAt).toLocaleTimeString()}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/orders/${order.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{orders.length}</span> orders
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                        Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
