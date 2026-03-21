'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Category {
    id: string
    name: string
    slug: string
    icon?: string | null
    image?: string | null
    description?: string | null
    children?: Category[]
}

interface CategorySectionProps {
    categories: Category[]
}

// Fallback images per category slug/name
const categoryImages: Record<string, string> = {
    'women-wear': 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=800&auto=format&fit=crop',
    'womens-wear': 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=800&auto=format&fit=crop',
    'women-accessories': 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=800&auto=format&fit=crop',
    'mens-wear': 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=800&auto=format&fit=crop',
    "men's-wear": 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=800&auto=format&fit=crop',
    'mens-accessories': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
    "men's-accessories": 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
    'electronics': 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=800&auto=format&fit=crop',
    'kids': 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?q=80&w=800&auto=format&fit=crop',
    'footwear': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
    'perfume': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=800&auto=format&fit=crop',
    'perfume-fragrance': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=800&auto=format&fit=crop',
    'default': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'
}


const getCategoryImage = (category: Category) => {
    if (category.image) return category.image
    const bySlug = categoryImages[category.slug.toLowerCase()]
    if (bySlug) return bySlug
    const byName = categoryImages[category.name.toLowerCase().replace(/\s+/g, '-')]
    return byName || categoryImages['default']
}

export function CategorySection({ categories }: CategorySectionProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    const checkScrollButtons = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
        }
    }

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 320
            scrollContainerRef.current.scrollTo({
                left: scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount),
                behavior: 'smooth'
            })
        }
    }

    if (!categories || categories.length === 0) return null

    return (
        <section className="py-12 md:py-16 bg-gradient-to-br from-orange-50/50 via-white to-rose-50/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-orange-100/20 via-transparent to-rose-100/10 pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8 md:mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                        Shop by Category
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">
                        Explore our complete range — fashion, accessories, electronics & more
                    </p>
                </motion.div>

                <div className="relative">
                    {canScrollLeft && (
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg border border-gray-100 hover:border-orange-200 hover:bg-orange-50 flex items-center justify-center transition-all duration-300 hidden md:flex"
                        >
                            <ChevronLeft className="w-5 h-5 text-orange-500" />
                        </button>
                    )}

                    <div
                        ref={scrollContainerRef}
                        onScroll={checkScrollButtons}
                        className="flex gap-4 md:gap-6 overflow-x-auto pb-4 px-2 scrollbar-hide scroll-smooth snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {categories.map((category, index) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, scale: 0.85 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.07 }}
                                className="flex-shrink-0 snap-center"
                            >
                                <Link
                                    href={`/category/${category.slug}`}
                                    className="group flex flex-col items-center gap-3"
                                >
                                    {/* Circle image */}
                                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 via-rose-400 to-amber-400 p-[3px] group-hover:scale-105 transition-transform duration-300">
                                            <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                                <div className="relative w-full h-full">
                                                    <Image
                                                        src={getCategoryImage(category)}
                                                        alt={category.name}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                        sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 144px"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                    {/* Icon overlay — supports both image URLs and emoji */}
                                                    {category.icon && (
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            {category.icon.startsWith('/') || category.icon.startsWith('http') ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img
                                                                    src={category.icon}
                                                                    alt={category.name}
                                                                    className="w-full h-full object-cover rounded-full"
                                                                />
                                                            ) : (
                                                                <span className="text-3xl drop-shadow-lg">{category.icon}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Glow */}
                                        <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-orange-300 via-rose-300 to-amber-300 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10" />
                                    </div>

                                    {/* Label */}
                                    <div className="text-center max-w-[120px] md:max-w-[150px]">
                                        <h3 className="text-sm md:text-[15px] font-semibold text-gray-800 group-hover:text-orange-600 transition-colors duration-300 leading-tight">
                                            {category.name}
                                        </h3>
                                        {category.description && (
                                            <p className="text-xs text-gray-400 mt-0.5 leading-tight">{category.description}</p>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {canScrollRight && (
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg border border-gray-100 hover:border-orange-200 hover:bg-orange-50 flex items-center justify-center transition-all duration-300 hidden md:flex"
                        >
                            <ChevronRight className="w-5 h-5 text-orange-500" />
                        </button>
                    )}
                </div>

                <div className="text-center mt-4 md:hidden">
                    <p className="text-xs text-gray-400">← Swipe to explore →</p>
                </div>

                {/* Browse All */}
                <div className="text-center mt-8">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-orange-200 text-orange-600 rounded-full font-medium text-sm hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300"
                    >
                        Browse All Products
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>
        </section>
    )
}
