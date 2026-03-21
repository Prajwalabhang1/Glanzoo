'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ArrowUpDown } from 'lucide-react'

interface CategorySortBarProps {
    currentSort: string
    total: number
}

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name A–Z' },
]

export function CategorySortBar({ currentSort, total }: CategorySortBarProps) {
    const router = useRouter()
    const pathname = usePathname()

    const handleSort = (value: string) => {
        const params = new URLSearchParams()
        if (value !== 'newest') params.set('sort', value)
        const qs = params.toString()
        router.push(`${pathname}${qs ? `?${qs}` : ''}`)
    }

    return (
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-800">{total}</span> products
            </p>
            <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <select
                    value={currentSort}
                    onChange={(e) => handleSort(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral text-gray-700 cursor-pointer"
                    aria-label="Sort products"
                >
                    {SORT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}
