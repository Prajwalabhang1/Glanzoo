export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import { OrdersTable } from '@/components/admin/OrdersTable'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminOrdersPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-600 mt-1">Manage customer orders and track shipments</p>
            </div>

            {/* Orders Table */}
            <Suspense fallback={<TableLoadingSkeleton />}>
                <OrdersTable />
            </Suspense>
        </div>
    )
}

function TableLoadingSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        </div>
    )
}
