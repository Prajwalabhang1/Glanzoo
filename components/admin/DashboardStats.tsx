import prisma from '@/lib/prisma'
import { DollarSign, ShoppingBag, Package, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export async function DashboardStats() {
    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Fetch all stats in parallel
    const [
        totalRevenueAgg,
        thisMonthRevenueAgg,
        lastMonthRevenueAgg,
        totalOrders,
        thisMonthOrders,
        lastMonthOrders,
        totalProducts,
        lastMonthProducts,
        totalCustomers,
        thisMonthCustomers,
        lastMonthCustomers,
    ] = await Promise.all([
        prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { total: true } }),
        prisma.order.aggregate({ where: { paymentStatus: 'PAID', createdAt: { gte: startOfThisMonth } }, _sum: { total: true } }),
        prisma.order.aggregate({ where: { paymentStatus: 'PAID', createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } }, _sum: { total: true } }),
        prisma.order.count(),
        prisma.order.count({ where: { createdAt: { gte: startOfThisMonth } } }),
        prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
        prisma.product.count({ where: { active: true } }),
        prisma.product.count({ where: { active: true, createdAt: { lt: startOfThisMonth } } }),
        prisma.user.count({ where: { role: 'CUSTOMER' } }),
        prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: startOfThisMonth } } }),
        prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
    ])

    const calcPct = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? '+100%' : '0%'
        const pct = ((current - previous) / previous * 100)
        return (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%'
    }
    const calcType = (current: number, previous: number) =>
        current >= previous ? 'increase' : 'decrease'

    const thisRevenue = thisMonthRevenueAgg._sum.total ?? 0
    const lastRevenue = lastMonthRevenueAgg._sum.total ?? 0
    const newProducts = totalProducts - lastMonthProducts

    const stats = [
        {
            name: 'Total Revenue',
            value: `₹${(totalRevenueAgg._sum.total || 0).toLocaleString()}`,
            change: calcPct(thisRevenue, lastRevenue),
            changeType: calcType(thisRevenue, lastRevenue),
            icon: DollarSign,
            bg: 'bg-white',
            text: 'text-gray-900',
            iconBg: 'bg-amber-50 text-amber-600',
        },
        {
            name: 'Total Orders',
            value: totalOrders.toString(),
            change: calcPct(thisMonthOrders, lastMonthOrders),
            changeType: calcType(thisMonthOrders, lastMonthOrders),
            icon: ShoppingBag,
            bg: 'bg-white',
            text: 'text-gray-900',
            iconBg: 'bg-blue-50 text-blue-600',
        },
        {
            name: 'Active Products',
            value: totalProducts.toString(),
            change: newProducts >= 0 ? `+${newProducts}` : `${newProducts}`,
            changeType: newProducts >= 0 ? 'increase' : 'decrease',
            icon: Package,
            bg: 'bg-white',
            text: 'text-gray-900',
            iconBg: 'bg-orange-50 text-orange-600',
        },
        {
            name: 'Total Customers',
            value: totalCustomers.toString(),
            change: calcPct(thisMonthCustomers, lastMonthCustomers),
            changeType: calcType(thisMonthCustomers, lastMonthCustomers),
            icon: Users,
            bg: 'bg-white',
            text: 'text-gray-900',
            iconBg: 'bg-purple-50 text-purple-600',
        },
    ]


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
                <div
                    key={stat.name}
                    className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-white shadow-sm border border-gray-100"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                {stat.name}
                            </p>
                            <h3 className={`text-3xl font-bold mt-2 tracking-tight ${stat.text}`}>
                                {stat.value}
                            </h3>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                        <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${stat.changeType === 'increase'
                            ? 'bg-green-500/10 text-green-600'
                            : stat.changeType === 'decrease'
                                ? 'bg-red-500/10 text-red-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                            {stat.changeType === 'increase' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                            {stat.change}
                        </span>
                        <span className="text-xs text-gray-400">
                            vs last month
                        </span>
                    </div>


                </div>
            ))}
        </div>
    )
}
