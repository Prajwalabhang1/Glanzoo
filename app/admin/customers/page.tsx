export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma'
import { Users, ShoppingBag, Mail } from 'lucide-react'

export default async function AdminCustomersPage() {
    const customers = await prisma.user.findMany({
        include: {
            orders: {
                select: {
                    id: true,
                    total: true,
                    status: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                <p className="text-gray-600 mt-1">Manage customer accounts and view their activity</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                            <p className="text-sm text-gray-600">Total Customers</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {customers.reduce((sum, c) => sum + c.orders.length, 0)}
                            </p>
                            <p className="text-sm text-gray-600">Total Orders</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                            <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {customers.filter(c => c.email).length}
                            </p>
                            <p className="text-sm text-gray-600">Verified Emails</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <input
                        type="search"
                        placeholder="Search customers..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Orders
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Total Spent
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Joined
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {customers.map((customer) => {
                                const totalSpent = customer.orders.reduce(
                                    (sum, order) => sum + Number(order.total),
                                    0
                                )

                                return (
                                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {customer.name?.charAt(0) || customer.email?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {customer.name || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        ID: {customer.id.slice(0, 8)}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-900">{customer.email || 'N/A'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">
                                                {customer.orders.length}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">
                                                ₹{totalSpent.toLocaleString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">
                                                {new Date(customer.createdAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{customers.length}</span> customers
                    </p>
                </div>
            </div>
        </div>
    )
}
