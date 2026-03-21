'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Loader2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface AutocompleteProduct {
    id: string
    name: string
    slug: string
    price: number
    salePrice: number | null
    image: string
}

interface AutocompleteCategory {
    id: string
    name: string
    slug: string
    productCount: number
}

interface AutocompleteResults {
    products: AutocompleteProduct[]
    categories: AutocompleteCategory[]
}

export function SearchBar() {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [results, setResults] = useState<AutocompleteResults>({ products: [], categories: [] })
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults({ products: [], categories: [] })
            setIsOpen(false)
            return
        }

        setIsLoading(true)
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}`)
                const data = await res.json()
                setResults(data)
                setIsOpen(true)
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setIsLoading(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = useCallback((index: number) => {
        const productCount = results.products.length

        if (index < productCount) {
            const product = results.products[index]
            router.push(`/products/${product.slug}`)
        } else {
            const category = results.categories[index - productCount]
            router.push(`/products?category=${category.slug}`)
        }

        setIsOpen(false)
        setQuery('')
        inputRef.current?.blur()
    }, [results, router])

    // Keyboard shortcuts
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            // Cmd/Ctrl + K to focus search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                inputRef.current?.focus()
            }

            if (!isOpen) return

            const totalItems = results.products.length + results.categories.length

            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev))
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
            } else if (e.key === 'Enter') {
                e.preventDefault()
                if (selectedIndex >= 0) {
                    handleSelect(selectedIndex)
                } else if (query.trim()) {
                    router.push(`/search?q=${encodeURIComponent(query)}`)
                    setIsOpen(false)
                    inputRef.current?.blur()
                }
            } else if (e.key === 'Escape') {
                setIsOpen(false)
                inputRef.current?.blur()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, results, selectedIndex, query, router, handleSelect])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`)
            setIsOpen(false)
            inputRef.current?.blur()
        }
    }

    const handleClear = () => {
        setQuery('')
        setResults({ products: [], categories: [] })
        setIsOpen(false)
        inputRef.current?.focus()
    }

    const hasResults = results.products.length > 0 || results.categories.length > 0

    return (
        <div className="relative w-full max-w-md">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full h-10 pl-10 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent transition-all"
                />

                {/* Search Icon */}
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-coral pointer-events-none" />

                {/* Loading Spinner or Clear Button */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 text-coral animate-spin" />
                    ) : query ? (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    ) : null}
                </div>
            </form>

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
                {isOpen && hasResults && (
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto"
                    >
                        {/* Products */}
                        {results.products.length > 0 && (
                            <div className="p-2">
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Products ({results.products.length})
                                </div>
                                {results.products.map((product, index) => {
                                    const displayPrice = product.salePrice || product.price
                                    const isSelected = selectedIndex === index

                                    return (
                                        <Link
                                            key={product.id}
                                            href={`/products/${product.slug}`}
                                            onClick={() => {
                                                setIsOpen(false)
                                                setQuery('')
                                            }}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isSelected
                                                ? 'bg-coral/10'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                                <Image
                                                    src={product.image}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {product.name}
                                                </p>
                                                <p className="text-sm text-coral font-semibold">
                                                    ₹{displayPrice.toLocaleString()}
                                                </p>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}

                        {/* Categories */}
                        {results.categories.length > 0 && (
                            <div className="p-2 border-t border-gray-100">
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Categories ({results.categories.length})
                                </div>
                                {results.categories.map((category, index) => {
                                    const adjustedIndex = results.products.length + index
                                    const isSelected = selectedIndex === adjustedIndex

                                    return (
                                        <Link
                                            key={category.id}
                                            href={`/products?category=${category.slug}`}
                                            onClick={() => {
                                                setIsOpen(false)
                                                setQuery('')
                                            }}
                                            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${isSelected
                                                ? 'bg-coral/10'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="text-sm font-medium text-gray-900">
                                                {category.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {category.productCount} items
                                            </span>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}

                        {/* Press Enter hint */}
                        {query && (
                            <div className="p-3 border-t border-gray-100 bg-gray-50">
                                <p className="text-xs text-gray-600 text-center">
                                    Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">Enter</kbd> to see all results for &quot;{query}&quot;
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
