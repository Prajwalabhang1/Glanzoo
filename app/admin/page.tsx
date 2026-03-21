export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import { DashboardStats } from '@/components/admin/DashboardStats'
import { RecentOrders } from '@/components/admin/RecentOrders'
import { RevenueChart } from '@/components/admin/RevenueChart'
import { LowStockAlerts } from '@/components/admin/LowStockAlerts'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> System Live
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <Suspense fallback={<StatsLoadingSkeleton />}>
                <DashboardStats />
            </Suspense>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Charts area */}
                <div className="xl:col-span-2 space-y-8">
                    <Suspense fallback={<ChartLoadingSkeleton />}>
                        <RevenueChart />
                    </Suspense>

                    <Suspense fallback={<ChartLoadingSkeleton />}>
                        <RecentOrders />
                    </Suspense>
                </div>

                {/* Sidebar Alerts area */}
                <div className="space-y-8">
                    <Suspense fallback={<ChartLoadingSkeleton />}>
                        <LowStockAlerts />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}

function StatsLoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
        </div>
    )
}

function ChartLoadingSkeleton() {
    return <Skeleton className="h-96 rounded-xl" />
}
