'use client'

import { useState, useMemo } from 'react'
import { X, SlidersHorizontal, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface Material {
    name: string
    count: number
}

interface Category {
    id: string
    name: string
    slug: string
    count: number
    group?: string | null
}

import { SelectedFilters } from './FilterSidebar'

interface FilterDrawerProps {
    materials: Material[]
    categories: Category[]
    priceRange: { min: number; max: number }
    selectedFilters: SelectedFilters
    onFilterChange: (filters: SelectedFilters) => void
}

const SHOW_MORE_THRESHOLD = 6

function FilterCheckbox({
    checked,
    onChange,
    label,
    count,
    dimmed = false,
}: {
    checked: boolean
    onChange: () => void
    label: string
    count?: number
    dimmed?: boolean
}) {
    return (
        <label
            className={`flex items-center gap-3 cursor-pointer group py-2 px-1 rounded-lg transition-colors ${checked ? 'bg-rose-50' : 'hover:bg-gray-50'}`}
        >
            <span
                onClick={onChange}
                className={`w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all duration-150 ${checked
                    ? 'bg-gradient-to-br from-rose to-coral border-coral'
                    : 'border-gray-300 group-hover:border-coral bg-white'
                    }`}
            >
                {checked && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </span>
            <span
                onClick={onChange}
                className={`text-sm flex-1 transition-colors ${checked ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}
            >
                {label}
            </span>
            {count !== undefined && (
                <span className={`text-sm tabular-nums ml-auto ${checked ? 'text-coral font-semibold' : 'text-gray-400'}`}>
                    {count}
                </span>
            )}
        </label>
    )
}

function SectionHeader({
    title,
    expanded,
    onToggle,
    activeCount = 0,
}: {
    title: string
    expanded: boolean
    onToggle: () => void
    activeCount?: number
}) {
    return (
        <button onClick={onToggle} className="w-full flex items-center justify-between py-3 group">
            <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{title}</span>
                {activeCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-coral text-white text-[10px] font-bold">
                        {activeCount}
                    </span>
                )}
            </div>
            <span className="text-gray-400 group-hover:text-gray-700 transition-colors">
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
        </button>
    )
}

function PriceRangeSlider({
    min, max, valueMin, valueMax, onChange,
}: {
    min: number; max: number; valueMin: number; valueMax: number
    onChange: (min: number, max: number) => void
}) {
    const pct = (v: number) => ((v - min) / (max - min)) * 100
    return (
        <div className="px-1 pt-2 pb-1">
            <div className="relative h-8 flex items-center">
                <div className="absolute inset-x-0 h-2 bg-gray-200 rounded-full" />
                <div
                    className="absolute h-2 bg-gradient-to-r from-rose to-coral rounded-full"
                    style={{ left: `${pct(valueMin)}%`, right: `${100 - pct(valueMax)}%` }}
                />
                <input type="range" min={min} max={max} value={valueMin}
                    onChange={(e) => onChange(Math.min(Number(e.target.value), valueMax - 1), valueMax)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <input type="range" min={min} max={max} value={valueMax}
                    onChange={(e) => onChange(valueMin, Math.max(Number(e.target.value), valueMin + 1))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                <div className="absolute w-6 h-6 bg-white border-2 border-coral rounded-full shadow-md z-30 pointer-events-none transform -translate-x-1/2"
                    style={{ left: `${pct(valueMin)}%` }} />
                <div className="absolute w-6 h-6 bg-white border-2 border-coral rounded-full shadow-md z-30 pointer-events-none transform -translate-x-1/2"
                    style={{ left: `${pct(valueMax)}%` }} />
            </div>
            <div className="flex justify-between mt-4 gap-3">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Min</p>
                    <p className="text-sm font-bold text-gray-900">₹{valueMin.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Max</p>
                    <p className="text-sm font-bold text-gray-900">₹{valueMax.toLocaleString('en-IN')}</p>
                </div>
            </div>
        </div>
    )
}

export function FilterDrawer({
    materials, categories, priceRange, selectedFilters, onFilterChange,
}: FilterDrawerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [expandedSections, setExpandedSections] = useState({ category: true, material: true, price: true })
    const [showMoreCategory, setShowMoreCategory] = useState(false)
    const [showMoreMaterial, setShowMoreMaterial] = useState(false)
    const [categorySearch, setCategorySearch] = useState('')

    const toggleSection = (section: keyof typeof expandedSections) =>
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))

    const handleMaterialToggle = (material: string) => {
        const newMaterials = selectedFilters.material.includes(material)
            ? selectedFilters.material.filter((m) => m !== material)
            : [...selectedFilters.material, material]
        onFilterChange({ ...selectedFilters, material: newMaterials })
    }

    const handleCategoryToggle = (slug: string) => {
        const newCategories = selectedFilters.category.includes(slug)
            ? selectedFilters.category.filter((c) => c !== slug)
            : [...selectedFilters.category, slug]
        onFilterChange({ ...selectedFilters, category: newCategories })
    }

    const clearAll = () =>
        onFilterChange({ material: [], category: [], priceMin: undefined, priceMax: undefined })

    const totalFilters =
        selectedFilters.material.length +
        selectedFilters.category.length +
        (selectedFilters.priceMin !== undefined || selectedFilters.priceMax !== undefined ? 1 : 0)

    const currentPriceMin = selectedFilters.priceMin ?? priceRange.min
    const currentPriceMax = selectedFilters.priceMax ?? priceRange.max

    const categoryGroups = useMemo(() => {
        const filtered = categorySearch.trim()
            ? categories.filter((c) =>
                c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
                (c.group ?? '').toLowerCase().includes(categorySearch.toLowerCase())
            )
            : categories
        const groups: Record<string, typeof categories> = {}
        filtered.forEach((cat) => {
            const key = cat.group ?? ''
            if (!groups[key]) groups[key] = []
            groups[key].push(cat)
        })
        return groups
    }, [categories, categorySearch])

    const allCategoryItems = Object.values(categoryGroups).flat()
    const displayedMaterials = showMoreMaterial ? materials : materials.slice(0, SHOW_MORE_THRESHOLD)

    return (
        <>
            {/* Floating trigger button - mobile only */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-[calc(env(safe-area-inset-bottom)+5rem)] right-4 z-40 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-rose via-coral to-gold text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 md:hidden"
            >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="font-semibold text-sm">
                    Filters {totalFilters > 0 && `(${totalFilters})`}
                </span>
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-full h-[90vh] p-0 gap-0 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                            {totalFilters > 0 && (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-coral text-white text-xs font-bold">
                                    {totalFilters}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {totalFilters > 0 && (
                                <button onClick={clearAll} className="text-sm font-semibold text-coral hover:text-rose transition-colors">
                                    Clear All
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto px-5 divide-y divide-gray-100">

                        {/* ── CATEGORY ── */}
                        <div className="py-4">
                            <SectionHeader title="Category" expanded={expandedSections.category}
                                onToggle={() => toggleSection('category')} activeCount={selectedFilters.category.length} />
                            <AnimatePresence initial={false}>
                                {expandedSections.category && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        {categories.length > 8 && (
                                            <div className="relative mt-1 mb-3">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input type="text" placeholder="Search categories..."
                                                    value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)}
                                                    className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral bg-gray-50" />
                                                {categorySearch && (
                                                    <button onClick={() => setCategorySearch('')}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        <div className="space-y-0.5">
                                            {allCategoryItems.length === 0 ? (
                                                <p className="text-sm text-gray-400 py-3 text-center">No categories found</p>
                                            ) : (
                                                <>
                                                    {(showMoreCategory ? allCategoryItems : allCategoryItems.slice(0, SHOW_MORE_THRESHOLD)).map((cat) => (
                                                        <FilterCheckbox key={cat.id}
                                                            checked={selectedFilters.category.includes(cat.slug)}
                                                            onChange={() => handleCategoryToggle(cat.slug)}
                                                            label={cat.name} count={cat.count} dimmed={cat.count === 0} />
                                                    ))}
                                                    {allCategoryItems.length > SHOW_MORE_THRESHOLD && (
                                                        <button onClick={() => setShowMoreCategory((v) => !v)}
                                                            className="mt-2 text-sm font-semibold text-coral hover:text-rose transition-colors w-full text-left px-1">
                                                            {showMoreCategory ? '↑ Show less' : `+ ${allCategoryItems.length - SHOW_MORE_THRESHOLD} more`}
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ── MATERIAL ── */}
                        {materials.length > 0 && (
                            <div className="py-4">
                                <SectionHeader title="Material" expanded={expandedSections.material}
                                    onToggle={() => toggleSection('material')} activeCount={selectedFilters.material.length} />
                                <AnimatePresence initial={false}>
                                    {expandedSections.material && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-0.5 mt-1">
                                            {displayedMaterials.map((m) => (
                                                <FilterCheckbox key={m.name}
                                                    checked={selectedFilters.material.includes(m.name)}
                                                    onChange={() => handleMaterialToggle(m.name)}
                                                    label={m.name} count={m.count} />
                                            ))}
                                            {materials.length > SHOW_MORE_THRESHOLD && (
                                                <button onClick={() => setShowMoreMaterial((v) => !v)}
                                                    className="mt-2 text-sm font-semibold text-coral hover:text-rose transition-colors w-full text-left px-1">
                                                    {showMoreMaterial ? '↑ Show less' : `+ ${materials.length - SHOW_MORE_THRESHOLD} more`}
                                                </button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* ── PRICE ── */}
                        {priceRange.max > priceRange.min && (
                            <div className="py-4">
                                <SectionHeader title="Price Range" expanded={expandedSections.price}
                                    onToggle={() => toggleSection('price')}
                                    activeCount={selectedFilters.priceMin !== undefined || selectedFilters.priceMax !== undefined ? 1 : 0} />
                                <AnimatePresence initial={false}>
                                    {expandedSections.price && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="mt-2">
                                            <PriceRangeSlider min={priceRange.min} max={priceRange.max}
                                                valueMin={currentPriceMin} valueMax={currentPriceMax}
                                                onChange={(mn, mx) => onFilterChange({ ...selectedFilters, priceMin: mn, priceMax: mx })} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-4 border-t bg-gray-50 shrink-0">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full py-3 bg-gradient-to-r from-rose via-coral to-gold text-white font-semibold rounded-xl shadow hover:shadow-lg transition-all duration-300"
                        >
                            View Results
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
