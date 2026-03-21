'use client'

import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FilterChipProps {
    label: string
    onRemove: () => void
}

export function FilterChip({ label, onRemove }: FilterChipProps) {
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15 }}
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-coral/60 rounded-full text-xs font-semibold text-gray-800 hover:bg-coral hover:text-white hover:border-coral transition-all duration-200 group shadow-sm"
        >
            <span>{label}</span>
            <X className="w-3 h-3 text-coral group-hover:text-white transition-colors flex-shrink-0" />
        </motion.button>
    )
}

interface ActiveFiltersProps {
    filters: {
        material?: string[]
        category?: string[]
        priceMin?: number
        priceMax?: number
    }
    // Pass all categories so we can resolve slugs → human-readable names
    categories?: Array<{ name: string; slug: string }>
    onRemoveFilter: (type: 'material' | 'category' | 'price', value?: string) => void
    onClearAll: () => void
}

export function ActiveFilters({ filters, categories = [], onRemoveFilter, onClearAll }: ActiveFiltersProps) {
    const hasFilters =
        (filters.material && filters.material.length > 0) ||
        (filters.category && filters.category.length > 0) ||
        filters.priceMin !== undefined ||
        filters.priceMax !== undefined

    if (!hasFilters) return null

    // Build slug → name map for human-readable chips
    const slugToName = Object.fromEntries(categories.map((c) => [c.slug, c.name]))

    const filterCount =
        (filters.material?.length || 0) +
        (filters.category?.length || 0) +
        (filters.priceMin !== undefined || filters.priceMax !== undefined ? 1 : 0)

    return (
        <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {filterCount} filter{filterCount > 1 ? 's' : ''}:
            </span>

            <AnimatePresence mode="popLayout">
                {filters.material?.map((material) => (
                    <FilterChip
                        key={`material-${material}`}
                        label={material}
                        onRemove={() => onRemoveFilter('material', material)}
                    />
                ))}

                {filters.category?.map((slug) => (
                    <FilterChip
                        key={`category-${slug}`}
                        label={slugToName[slug] ?? slug}
                        onRemove={() => onRemoveFilter('category', slug)}
                    />
                ))}

                {(filters.priceMin !== undefined || filters.priceMax !== undefined) && (
                    <FilterChip
                        key="price-range"
                        label={`₹${(filters.priceMin ?? 0).toLocaleString('en-IN')} – ₹${(filters.priceMax ?? 0).toLocaleString('en-IN')}`}
                        onRemove={() => onRemoveFilter('price')}
                    />
                )}
            </AnimatePresence>

            <button
                onClick={onClearAll}
                className="text-xs font-semibold text-coral hover:text-rose transition-colors underline underline-offset-2"
            >
                Clear all
            </button>
        </div>
    )
}
