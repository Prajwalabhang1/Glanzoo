'use client'

import React, { useState, useEffect } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface RecentProduct {
    id: string
    slug: string
    name: string
    price: number
    images: string
    category: string
}

export function RecentlyViewedSection() {
    const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([])

    useEffect(() => {
        const stored = localStorage.getItem('recentlyViewed')
        if (stored) {
            try {
                setRecentProducts(JSON.parse(stored))
            } catch (error) {
                console.error('Error parsing recently viewed:', error)
            }
        }
    }, [])

    const scroll = (direction: 'left' | 'right') => {
        const container = document.getElementById('recently-viewed-scroll')
        if (container) {
            const scrollAmount = 300
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    if (recentProducts.length === 0) return null

    return (
        <section className="py-20 bg-gray-50/50">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex justify-between items-center mb-12"
                >
                    <div>
                        <span className="text-gold font-medium tracking-[0.2em] uppercase text-sm block mb-2">
                            Your Picks
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-luxury-black font-heading">
                            Recently Viewed
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-gold hover:bg-gold/5 flex items-center justify-center transition-all"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-gold hover:bg-gold/5 flex items-center justify-center transition-all"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </motion.div>

                <div id="recently-viewed-scroll" className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                    <div className="flex gap-6 pb-4">
                        {recentProducts.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex-shrink-0 w-[280px]"
                            >
                                <ProductCard
                                    product={{
                                        id: product.id,
                                        slug: product.slug,
                                        name: product.name,
                                        price: product.price,
                                        images: JSON.stringify([product.images]),
                                        category: { name: product.category, slug: product.category.toLowerCase().replace(/\s+/g, '-') }
                                    }}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export function addToRecentlyViewed(product: RecentProduct) {
    try {
        const stored = localStorage.getItem('recentlyViewed')
        let recent: RecentProduct[] = stored ? JSON.parse(stored) : []

        recent = recent.filter(p => p.id !== product.id)
        recent.unshift(product)
        recent = recent.slice(0, 10)

        localStorage.setItem('recentlyViewed', JSON.stringify(recent))
    } catch (error) {
        console.error('Error saving recently viewed:', error)
    }
}
