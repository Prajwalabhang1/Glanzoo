'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FilterSidebar } from '@/components/products/FilterSidebar'
import { FilterDrawer } from '@/components/products/FilterDrawer'
import { ActiveFilters } from '@/components/products/FilterChip'
import { ProductCard } from '@/components/products/ProductCard'
import { parseFilterParams, filtersToSearchString } from '@/lib/buildProductQuery'
import { SelectedFilters } from '@/components/products/FilterSidebar'

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

interface Product {
    id: string
    slug: string
    name: string
    price: number
    salePrice: number | null
    images: string
    category?: { name: string; slug: string } | null
    material?: string | null
    displaySku?: string | null
    tags?: string | null
    collection?: { name: string; slug: string } | null
    freeShipping?: boolean
    sales?: number
    shortDescription?: string | null
    vendorName?: string | null
    vendor?: { businessName: string } | null
    rating?: { avg: number; count: number }
    variants?: Array<{
        id: string
        size: string
        stock: number
    }>
}

interface ProductsWithFiltersProps {
    initialProducts: Product[]
    materials: Material[]
    categories: Category[]
    priceRange: { min: number; max: number }
}

export function ProductsWithFilters({
    initialProducts,
    materials,
    categories,
    priceRange,
}: ProductsWithFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [products, setProducts] = useState(initialProducts)
    const [isLoading, setIsLoading] = useState(false)

    // Parse filters from URL
    const filters = parseFilterParams(searchParams)
    const selectedFilters: SelectedFilters = {
        material: filters.material || [],
        category: filters.category || [],
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
    }

    const handleFilterChange = (newFilters: SelectedFilters) => {
        const searchString = filtersToSearchString(newFilters)
        router.push(`/products${searchString ? `?${searchString}` : ''}`)
    }

    const handleRemoveFilter = (type: 'material' | 'category' | 'price', value?: string) => {
        const newFilters = { ...selectedFilters }

        if (type === 'material' && value) {
            newFilters.material = newFilters.material.filter((m) => m !== value)
        } else if (type === 'category' && value) {
            newFilters.category = newFilters.category.filter((c) => c !== value)
        } else if (type === 'price') {
            newFilters.priceMin = undefined
            newFilters.priceMax = undefined
        }

        handleFilterChange(newFilters)
    }

    const handleClearAll = () => {
        router.push('/products')
    }

    // Fetch filtered products when URL changes
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true)
            try {
                const response = await fetch(`/api/products?${searchParams.toString()}`)
                const data = await response.json()
                setProducts(data.products || [])
            } catch (error) {
                console.error('Error fetching products:', error)
            } finally {
                setIsLoading(false)
            }
        }

        // Only fetch if there are filters
        if (searchParams.toString()) {
            fetchProducts()
        } else {
            setProducts(initialProducts)
            setIsLoading(false)
        }
    }, [searchParams, initialProducts])

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex gap-8">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-64 flex-shrink-0">
                    <FilterSidebar
                        materials={materials}
                        categories={categories}
                        priceRange={priceRange}
                        selectedFilters={selectedFilters}
                        onFilterChange={handleFilterChange}
                    />
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Active Filters */}
                    <ActiveFilters
                        filters={selectedFilters}
                        categories={categories}
                        onRemoveFilter={handleRemoveFilter}
                        onClearAll={handleClearAll}
                    />

                    {/* Product Count */}
                    <div className="mb-6">
                        <p className="text-gray-600">
                            {isLoading ? 'Loading...' : `${products.length} products found`}
                        </p>
                    </div>

                    {/* Products Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-gray-200 animate-pulse rounded-2xl"
                                    style={{ aspectRatio: '3/4' }}
                                />
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No products found</p>
                            <button
                                onClick={handleClearAll}
                                className="mt-4 text-coral hover:text-rose font-semibold"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            <FilterDrawer
                materials={materials}
                categories={categories}
                priceRange={priceRange}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
            />
        </div>
    )
}
