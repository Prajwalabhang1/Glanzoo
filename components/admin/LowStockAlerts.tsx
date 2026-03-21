'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Package, ExternalLink, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface LowStockItem {
    id: string
    productId: string
    productName: string
    slug: string
    size: string
    stock: number
    image: string
    vendor: string
}

export function LowStockAlerts() {
    const [items, setItems] = useState<LowStockItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchLowStock = async () => {
            try {
                const res = await fetch('/api/admin/inventory/low-stock')
                const data = await res.json()
                setItems(data.lowStock || [])
            } catch { /* silent */ }
            finally { setIsLoading(false) }
        }
        fetchLowStock()
    }, [])

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>

    if (items.length === 0) return (
        <div className="p-8 text-center bg-green-50 rounded-2xl border border-green-100">
            <Package className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <p className="text-green-800 font-bold">Inventory Healthy</p>
            <p className="text-sm text-green-600">All product variants have sufficient stock levels.</p>
        </div>
    )

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <h3 className="font-bold text-orange-900">Low Stock Alerts</h3>
                </div>
                <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{items.length} Variants</span>
            </div>
            <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                {items.map(item => (
                    <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                        <div className="relative w-12 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                                src={item.image}
                                alt={item.productName}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{item.productName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">Size {item.size}</span>
                                <span className="text-[10px] text-gray-400 italic">By {item.vendor}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`text-sm font-bold ${item.stock <= 2 ? 'text-red-600' : 'text-orange-600'}`}>{item.stock} left</p>
                            <Link
                                href={`/admin/products/${item.productId}`}
                                className="text-[10px] font-bold text-gray-400 hover:text-orange-500 uppercase flex items-center gap-0.5 mt-1"
                            >
                                Restock <ArrowRight className="w-2.5 h-2.5" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
                <Link href="/admin/products" className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center justify-center gap-1.5">
                    View Full Inventory <ExternalLink className="w-3 h-3" />
                </Link>
            </div>
        </div>
    )
}
