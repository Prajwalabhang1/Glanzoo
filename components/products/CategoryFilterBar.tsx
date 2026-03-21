'use client'

import { useState, useMemo } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { SlidersHorizontal, ArrowUpDown, X } from 'lucide-react'

interface Product {
    id: string
    slug: string
    name: string
    price: number
    salePrice?: number | null
    images: string
    material?: string | null
    displaySku?: string | null
    tags?: string | null
    category?: { name: string; slug: string } | null
    collection?: { name: string; slug: string } | null
    variants?: Array<{ id: string; size: string; stock: number }>
}

interface CategoryFilterBarProps {
    products: Product[]
}

const PRICE_PRESETS = [
    { label: 'Under ₹500', min: 0, max: 500 },
    { label: '₹500 – ₹1000', min: 500, max: 1000 },
    { label: '₹1000 – ₹2000', min: 1000, max: 2000 },
    { label: '₹2000 – ₹5000', min: 2000, max: 5000 },
    { label: 'Above ₹5000', min: 5000, max: Infinity },
]

const SORT_OPTIONS = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Discount', value: 'discount' },
]

export function CategoryFilterBar({ products }: CategoryFilterBarProps) {
    const [selectedPreset, setSelectedPreset] = useState<number | null>(null)
    const [sortBy, setSortBy] = useState('newest')

    const filtered = useMemo(() => {
        let result = [...products]

        // Price filter
        if (selectedPreset !== null) {
            const { min, max } = PRICE_PRESETS[selectedPreset]
            result = result.filter((p) => {
                const price = p.salePrice ?? p.price
                return price >= min && price <= max
            })
        }

        // Sort
        switch (sortBy) {
            case 'price_asc':
                result.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price))
                break
            case 'price_desc':
                result.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price))
                break
            case 'discount':
                result.sort((a, b) => {
                    const discA = a.salePrice ? ((a.price - a.salePrice) / a.price) : 0
                    const discB = b.salePrice ? ((b.price - b.salePrice) / b.price) : 0
                    return discB - discA
                })
                break
            default:
                // newest — keep original server order
                break
        }

        return result
    }, [products, selectedPreset, sortBy])

    return (
        <>
            {/* Filter / Sort Bar */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
                <div className="container mx-auto px-4 py-3 flex flex-wrap items-center gap-2">
                    {/* Price preset chips */}
                    <div className="flex items-center gap-1.5 flex-wrap flex-1">
                        <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 mr-1">
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            Price:
                        </span>
                        {PRICE_PRESETS.map((preset, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedPreset(selectedPreset === i ? null : i)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150
                                    ${selectedPreset === i
                                        ? 'bg-coral text-white border-coral shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-coral hover:text-coral'
                                    }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                        {selectedPreset !== null && (
                            <button
                                onClick={() => setSelectedPreset(null)}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-coral ml-1"
                            >
                                <X className="w-3 h-3" /> Clear
                            </button>
                        )}
                    </div>

                    {/* Sort dropdown */}
                    <div className="flex items-center gap-1.5">
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral cursor-pointer"
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Result count */}
                {selectedPreset !== null && (
                    <div className="container mx-auto px-4 pb-2">
                        <p className="text-xs text-gray-500">
                            <span className="font-semibold text-coral">{filtered.length}</span> of {products.length} products
                        </p>
                    </div>
                )}
            </div>

            {/* Product Grid */}
            <div className="container mx-auto px-4 py-10">
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                        {filtered.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24">
                        <div className="text-5xl mb-4">🔍</div>
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">No products in this price range</h2>
                        <button
                            onClick={() => setSelectedPreset(null)}
                            className="mt-2 px-5 py-2 bg-coral text-white rounded-full text-sm font-medium hover:bg-rose transition-colors"
                        >
                            Clear filter
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}
