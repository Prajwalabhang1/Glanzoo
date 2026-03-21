export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductsTable } from '@/components/admin/ProductsTable'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminProductsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-600 mt-1">Manage your product inventory</p>
                </div>
                <Link href="/admin/products/new">
                    <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                </Link>
            </div>

            {/* Products Table */}
            <Suspense fallback={<TableLoadingSkeleton />}>
                <ProductsTable />
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
