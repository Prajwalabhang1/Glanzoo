'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/products/ProductCard'
import { motion } from 'framer-motion'
import { Zap, ChevronRight, Clock } from 'lucide-react'

interface Product {
    id: string
    slug: string
    name: string
    price: number
    salePrice: number | null
    images: string
    material: string | null
    displaySku: string | null
    tags: string | null
    category: { name: string; slug: string } | null
    collection: { name: string; slug: string } | null
    variants: Array<{ id: string; size: string; stock: number }>
}

interface FlashSaleSectionProps {
    products: Product[]
    endsAt?: string | null // ISO date string
}

function CountdownTimer({ endsAt }: { endsAt: string }) {
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })

    useEffect(() => {
        const calc = () => {
            const diff = Math.max(0, new Date(endsAt).getTime() - Date.now())
            setTimeLeft({
                h: Math.floor(diff / 3600000),
                m: Math.floor((diff % 3600000) / 60000),
                s: Math.floor((diff % 60000) / 1000),
            })
        }
        calc()
        const id = setInterval(calc, 1000)
        return () => clearInterval(id)
    }, [endsAt])

    const pad = (n: number) => String(n).padStart(2, '0')

    return (
        <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-medium text-gray-600">Ends in</span>
            {[pad(timeLeft.h), pad(timeLeft.m), pad(timeLeft.s)].map((unit, i) => (
                <React.Fragment key={i}>
                    <div className="bg-rose-500 text-white rounded px-2 py-1 text-sm font-bold tabular-nums min-w-[2rem] text-center">
                        {unit}
                    </div>
                    {i < 2 && <span className="text-rose-500 font-bold">:</span>}
                </React.Fragment>
            ))}
        </div>
    )
}

export function FlashSaleSection({ products, endsAt }: FlashSaleSectionProps) {
    if (!products || products.length === 0) return null

    // Default: 24 hours from now if no endsAt
    const timerTarget = endsAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    return (
        <section className="py-12 bg-gradient-to-br from-rose-50 via-white to-orange-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-rose-300/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-wrap items-center justify-between gap-4 mb-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-rose-500 text-white px-3 py-1.5 rounded-full">
                            <Zap className="w-4 h-4 fill-white" />
                            <span className="text-sm font-bold tracking-wide">FLASH SALE</span>
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Today&apos;s Deals</h2>
                            <p className="text-gray-500 text-sm">Limited time offers — grab them before they&apos;re gone</p>
                        </div>
                    </div>
                    <CountdownTimer endsAt={timerTarget} />
                </motion.div>

                {/* Products */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 mb-6"
                >
                    {products.slice(0, 10).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </motion.div>

                <div className="text-center">
                    <Link
                        href="/products?sale=true"
                        className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-rose-400 text-rose-600 rounded-full font-semibold text-sm hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300"
                    >
                        View All Sale Items <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
