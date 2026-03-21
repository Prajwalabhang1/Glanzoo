export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Tag, Edit, Trash2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AdminCouponsPage() {
    const coupons = await prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
                    <p className="text-gray-600 mt-1">Create and manage discount coupons</p>
                </div>
                <Link href="/admin/coupons/new">
                    <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Coupon
                    </Button>
                </Link>
            </div>

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((coupon) => {
                    const isActive = coupon.active && new Date(coupon.validUntil) > new Date()
                    const usagePercent = coupon.usageLimit ? (coupon.usageCount / coupon.usageLimit) * 100 : 0

                    return (
                        <div
                            key={coupon.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
                                        <Tag className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            {coupon.code}
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </h3>
                                        <p className="text-xs text-gray-500">Coupon Code</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* Discount Info */}
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 mb-4">
                                <p className="text-3xl font-bold text-orange-600">
                                    {coupon.type === 'PERCENTAGE'
                                        ? `${coupon.value}%`
                                        : `₹${coupon.value}`
                                    }
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    {coupon.type === 'PERCENTAGE' ? 'Percentage Off' : 'Flat Discount'}
                                </p>
                                {coupon.minOrder && (
                                    <p className="text-xs text-gray-600 mt-2">
                                        Min. order: ₹{coupon.minOrder.toLocaleString()}
                                    </p>
                                )}
                            </div>

                            {/* Usage Stats */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Usage</span>
                                    <span className="font-medium text-gray-900">
                                        {coupon.usageCount} / {coupon.usageLimit || '∞'}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all"
                                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Expiry Date */}
                            <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-gray-100">
                                <span className="text-gray-600">Expires</span>
                                <span className="font-medium text-gray-900">
                                    {new Date(coupon.validUntil).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Link href={`/admin/coupons/${coupon.id}/edit`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                </Link>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {coupons.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Tag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No coupons yet</h3>
                    <p className="text-gray-600 mb-4">Create your first coupon to start offering discounts</p>
                    <Link href="/admin/coupons/new">
                        <Button className="bg-gradient-to-r from-orange-500 to-amber-500">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Coupon
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
