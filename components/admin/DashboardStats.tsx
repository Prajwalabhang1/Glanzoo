import { db } from '@/lib/db';
import { orders, products, users } from '@/lib/schema';
import { eq, gte, and, lt, sum, count } from 'drizzle-orm';
import { DollarSign, ShoppingBag, Package, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export async function DashboardStats() {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
        totalRevResult, thisMonthRevResult, lastMonthRevResult,
        [{ totalOrders }], [{ thisMonthOrders }], [{ lastMonthOrders }],
        [{ totalProducts }], [{ lastMonthProducts }],
        [{ totalCustomers }], [{ thisMonthCustomers }], [{ lastMonthCustomers }],
    ] = await Promise.all([
        db.select({ total: sum(orders.total) }).from(orders).where(eq(orders.paymentStatus, 'PAID')),
        db.select({ total: sum(orders.total) }).from(orders).where(and(eq(orders.paymentStatus, 'PAID'), gte(orders.createdAt, startOfThisMonth))),
        db.select({ total: sum(orders.total) }).from(orders).where(and(eq(orders.paymentStatus, 'PAID'), gte(orders.createdAt, startOfLastMonth), lt(orders.createdAt, startOfThisMonth))),
        db.select({ totalOrders: count() }).from(orders),
        db.select({ thisMonthOrders: count() }).from(orders).where(gte(orders.createdAt, startOfThisMonth)),
        db.select({ lastMonthOrders: count() }).from(orders).where(and(gte(orders.createdAt, startOfLastMonth), lt(orders.createdAt, startOfThisMonth))),
        db.select({ totalProducts: count() }).from(products).where(eq(products.active, true)),
        db.select({ lastMonthProducts: count() }).from(products).where(and(eq(products.active, true), lt(products.createdAt, startOfThisMonth))),
        db.select({ totalCustomers: count() }).from(users).where(eq(users.role, 'CUSTOMER')),
        db.select({ thisMonthCustomers: count() }).from(users).where(and(eq(users.role, 'CUSTOMER'), gte(users.createdAt, startOfThisMonth))),
        db.select({ lastMonthCustomers: count() }).from(users).where(and(eq(users.role, 'CUSTOMER'), gte(users.createdAt, startOfLastMonth), lt(users.createdAt, startOfThisMonth))),
    ]);

    const totalRevenue = Number(totalRevResult[0]?.total ?? 0);
    const thisRevenue = Number(thisMonthRevResult[0]?.total ?? 0);
    const lastRevenue = Number(lastMonthRevResult[0]?.total ?? 0);
    const newProducts = totalProducts - lastMonthProducts;

    const calcPct = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? '+100%' : '0%';
        const pct = ((current - previous) / previous * 100);
        return (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
    };
    const calcType = (current: number, previous: number) => current >= previous ? 'increase' : 'decrease';

    const stats = [
        { name: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, change: calcPct(thisRevenue, lastRevenue), changeType: calcType(thisRevenue, lastRevenue), icon: DollarSign, iconBg: 'bg-amber-50 text-amber-600' },
        { name: 'Total Orders', value: totalOrders.toString(), change: calcPct(thisMonthOrders, lastMonthOrders), changeType: calcType(thisMonthOrders, lastMonthOrders), icon: ShoppingBag, iconBg: 'bg-blue-50 text-blue-600' },
        { name: 'Active Products', value: totalProducts.toString(), change: newProducts >= 0 ? `+${newProducts}` : `${newProducts}`, changeType: newProducts >= 0 ? 'increase' : 'decrease', icon: Package, iconBg: 'bg-orange-50 text-orange-600' },
        { name: 'Total Customers', value: totalCustomers.toString(), change: calcPct(thisMonthCustomers, lastMonthCustomers), changeType: calcType(thisMonthCustomers, lastMonthCustomers), icon: Users, iconBg: 'bg-purple-50 text-purple-600' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
                <div key={stat.name} className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-white shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                            <h3 className="text-3xl font-bold mt-2 tracking-tight text-gray-900">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.iconBg}`}><stat.icon className="w-5 h-5" /></div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${stat.changeType === 'increase' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                            {stat.changeType === 'increase' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                            {stat.change}
                        </span>
                        <span className="text-xs text-gray-400">vs last month</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
