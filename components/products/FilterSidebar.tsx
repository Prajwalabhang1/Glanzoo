'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

export interface SelectedFilters {
    material: string[]
    category: string[]
    priceMin?: number
    priceMax?: number
}

interface FilterSidebarProps {
    materials: Material[]
    categories: Category[]
    priceRange: { min: number; max: number }
    selectedFilters: SelectedFilters
    onFilterChange: (filters: SelectedFilters) => void
}

const SHOW_MORE_THRESHOLD = 6

// Custom styled checkbox
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
            className={`flex items-center gap-2.5 cursor-pointer group py-1.5 px-1 rounded-lg transition-colors ${checked ? 'bg-rose-50' : 'hover:bg-gray-50'} ${dimmed ? 'opacity-40' : ''}`}
        >
            {/* Custom checkbox */}
            <span
                onClick={onChange}
                className={`w-4 h-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all duration-150 ${checked
                    ? 'bg-gradient-to-br from-rose to-coral border-coral'
                    : 'border-gray-300 group-hover:border-coral bg-white'
                    }`}
            >
                {checked && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </span>
            <span
                onClick={onChange}
                className={`text-sm flex-1 transition-colors ${checked ? 'text-gray-900 font-semibold' : 'text-gray-900'}`}
            >
                {label}
            </span>
            {count !== undefined && (
                <span className={`text-xs tabular-nums ml-auto transition-colors ${checked ? 'text-coral font-semibold' : 'text-gray-400'}`}>
                    {count}
                </span>
            )}
        </label>
    )
}

// Section header with collapse toggle + active count badge
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
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between py-2 group"
        >
            <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 text-sm tracking-wide">{title}</span>
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

// Dual-handle price range slider with debounced onChange
function PriceRangeSlider({
    min,
    max,
    valueMin,
    valueMax,
    onChange,
}: {
    min: number
    max: number
    valueMin: number
    valueMax: number
    onChange: (min: number, max: number) => void
}) {
    const rangeRef = useRef<HTMLDivElement>(null)
    // Local state for immediate visual feedback
    const [localMin, setLocalMin] = useState(valueMin)
    const [localMax, setLocalMax] = useState(valueMax)

    // Sync local state when parent values change (e.g. filter reset)
    useEffect(() => { setLocalMin(valueMin) }, [valueMin])
    useEffect(() => { setLocalMax(valueMax) }, [valueMax])

    // Debounce: only call parent onChange 500ms after user stops dragging
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localMin !== valueMin || localMax !== valueMax) {
                onChange(localMin, localMax)
            }
        }, 500)
        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localMin, localMax])

    const pct = (v: number) => ((v - min) / (max - min)) * 100

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.min(Number(e.target.value), localMax - 1)
        setLocalMin(val)
    }
    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.max(Number(e.target.value), localMin + 1)
        setLocalMax(val)
    }

    return (
        <div className="px-1 pt-2 pb-1">
            {/* Track */}
            <div className="relative h-6 flex items-center" ref={rangeRef}>
                {/* Background track */}
                <div className="absolute inset-x-0 h-1.5 bg-gray-200 rounded-full" />
                {/* Active track */}
                <div
                    className="absolute h-1.5 bg-gradient-to-r from-rose to-coral rounded-full"
                    style={{ left: `${pct(localMin)}%`, right: `${100 - pct(localMax)}%` }}
                />
                {/* Min thumb */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={localMin}
                    onChange={handleMinChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {/* Max thumb */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={localMax}
                    onChange={handleMaxChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                {/* Visual thumbs */}
                <div
                    className="absolute w-5 h-5 bg-white border-2 border-coral rounded-full shadow-md z-30 pointer-events-none transform -translate-x-1/2"
                    style={{ left: `${pct(localMin)}%` }}
                />
                <div
                    className="absolute w-5 h-5 bg-white border-2 border-coral rounded-full shadow-md z-30 pointer-events-none transform -translate-x-1/2"
                    style={{ left: `${pct(localMax)}%` }}
                />
            </div>

            {/* Value display */}
            <div className="flex justify-between mt-3 gap-2">
                <div className="flex-1 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Min</p>
                    <p className="text-sm font-semibold text-gray-900">₹{localMin.toLocaleString('en-IN')}</p>
                </div>
                <div className="w-px bg-gray-200 self-stretch" />
                <div className="flex-1 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Max</p>
                    <p className="text-sm font-semibold text-gray-900">₹{localMax.toLocaleString('en-IN')}</p>
                </div>
            </div>
        </div>
    )
}

export function FilterSidebar({
    materials,
    categories,
    priceRange,
    selectedFilters,
    onFilterChange,
}: FilterSidebarProps) {
    const [expandedSections, setExpandedSections] = useState({
        category: true,
        material: true,
        price: true,
    })
    const [showMoreMaterial, setShowMoreMaterial] = useState(false)
    const [showMoreCategory, setShowMoreCategory] = useState(false)
    const [categorySearch, setCategorySearch] = useState('')

    const toggleSection = (section: keyof typeof expandedSections) =>
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))

    const handleMaterialToggle = (material: string) => {
        const newMaterials = selectedFilters.material.includes(material)
            ? selectedFilters.material.filter((m) => m !== material)
            : [...selectedFilters.material, material]
        onFilterChange({ ...selectedFilters, material: newMaterials })
    }

    const handleCategoryToggle = (categorySlug: string) => {
        const newCategories = selectedFilters.category.includes(categorySlug)
            ? selectedFilters.category.filter((c) => c !== categorySlug)
            : [...selectedFilters.category, categorySlug]
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

    // Group categories by parent
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
        <div className="w-full bg-white rounded-xl border border-gray-100 shadow-sm sticky top-24 overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 7rem)' }}>
            {/* Scrollable inner content */}
            <div className="overflow-y-auto h-full" style={{ maxHeight: 'calc(100vh - 7rem)' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900">Filters</h3>
                        {totalFilters > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-gradient-to-r from-rose to-coral text-white text-[10px] font-bold">
                                {totalFilters}
                            </span>
                        )}
                    </div>
                    {totalFilters > 0 && (
                        <button
                            onClick={clearAll}
                            className="text-xs font-semibold text-coral hover:text-rose transition-colors flex items-center gap-1"
                        >
                            <X className="w-3 h-3" />
                            Clear all
                        </button>
                    )}
                </div>

                <div className="px-4 py-2 divide-y divide-gray-100">
                    {/* ── CATEGORY SECTION ── */}
                    <div className="py-4">
                        <SectionHeader
                            title="Category"
                            expanded={expandedSections.category}
                            onToggle={() => toggleSection('category')}
                            activeCount={selectedFilters.category.length}
                        />
                        <AnimatePresence initial={false}>
                            {expandedSections.category && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Search */}
                                    {categories.length > 8 && (
                                        <div className="relative mt-2 mb-3">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search categories..."
                                                value={categorySearch}
                                                onChange={(e) => setCategorySearch(e.target.value)}
                                                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral bg-gray-50"
                                            />
                                            {categorySearch && (
                                                <button
                                                    onClick={() => setCategorySearch('')}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Category list */}
                                    <div className="space-y-0.5 mt-1">
                                        {allCategoryItems.length === 0 ? (
                                            <p className="text-xs text-gray-400 py-2 text-center">No categories found</p>
                                        ) : (
                                            <>
                                                {/* Render grouped */}
                                                {showMoreCategory
                                                    ? Object.entries(categoryGroups).map(([groupName, cats]) => (
                                                        <div key={groupName || 'ungrouped'} className="mb-1">
                                                            {groupName && (
                                                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 px-1 pt-2 pb-1">
                                                                    {groupName}
                                                                </p>
                                                            )}
                                                            {cats.map((cat) => (
                                                                <FilterCheckbox
                                                                    key={cat.id}
                                                                    checked={selectedFilters.category.includes(cat.slug)}
                                                                    onChange={() => handleCategoryToggle(cat.slug)}
                                                                    label={cat.name}
                                                                    count={cat.count}
                                                                    dimmed={cat.count === 0}
                                                                />
                                                            ))}
                                                        </div>
                                                    ))
                                                    : allCategoryItems.slice(0, SHOW_MORE_THRESHOLD).map((cat) => (
                                                        <FilterCheckbox
                                                            key={cat.id}
                                                            checked={selectedFilters.category.includes(cat.slug)}
                                                            onChange={() => handleCategoryToggle(cat.slug)}
                                                            label={cat.name}
                                                            count={cat.count}
                                                            dimmed={cat.count === 0}
                                                        />
                                                    ))}
                                            </>
                                        )}
                                    </div>

                                    {/* Show more/less */}
                                    {allCategoryItems.length > SHOW_MORE_THRESHOLD && (
                                        <button
                                            onClick={() => setShowMoreCategory((v) => !v)}
                                            className="mt-2 text-xs font-semibold text-coral hover:text-rose transition-colors w-full text-left px-1"
                                        >
                                            {showMoreCategory
                                                ? '↑ Show less'
                                                : `+ ${allCategoryItems.length - SHOW_MORE_THRESHOLD} more`}
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── MATERIAL SECTION ── */}
                    {materials.length > 0 && (
                        <div className="py-4">
                            <SectionHeader
                                title="Material"
                                expanded={expandedSections.material}
                                onToggle={() => toggleSection('material')}
                                activeCount={selectedFilters.material.length}
                            />
                            <AnimatePresence initial={false}>
                                {expandedSections.material && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-0.5 mt-2"
                                    >
                                        {displayedMaterials.map((material) => (
                                            <FilterCheckbox
                                                key={material.name}
                                                checked={selectedFilters.material.includes(material.name)}
                                                onChange={() => handleMaterialToggle(material.name)}
                                                label={material.name}
                                                count={material.count}
                                            />
                                        ))}
                                        {materials.length > SHOW_MORE_THRESHOLD && (
                                            <button
                                                onClick={() => setShowMoreMaterial((v) => !v)}
                                                className="mt-2 text-xs font-semibold text-coral hover:text-rose transition-colors w-full text-left px-1"
                                            >
                                                {showMoreMaterial
                                                    ? '↑ Show less'
                                                    : `+ ${materials.length - SHOW_MORE_THRESHOLD} more`}
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* ── PRICE RANGE SECTION ── */}
                    <div className="py-4">
                        <SectionHeader
                            title="Price Range"
                            expanded={expandedSections.price}
                            onToggle={() => toggleSection('price')}
                            activeCount={
                                selectedFilters.priceMin !== undefined || selectedFilters.priceMax !== undefined ? 1 : 0
                            }
                        />
                        <AnimatePresence initial={false}>
                            {expandedSections.price && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-2"
                                >
                                    <PriceRangeSlider
                                        min={priceRange.min}
                                        max={priceRange.max}
                                        valueMin={currentPriceMin}
                                        valueMax={currentPriceMax}
                                        onChange={(mn, mx) =>
                                            onFilterChange({ ...selectedFilters, priceMin: mn, priceMax: mx })
                                        }
                                    />
                                    {(selectedFilters.priceMin !== undefined ||
                                        selectedFilters.priceMax !== undefined) && (
                                            <button
                                                onClick={() =>
                                                    onFilterChange({
                                                        ...selectedFilters,
                                                        priceMin: undefined,
                                                        priceMax: undefined,
                                                    })
                                                }
                                                className="mt-2 text-xs font-semibold text-coral hover:text-rose transition-colors px-1"
                                            >
                                                Reset price
                                            </button>
                                        )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
