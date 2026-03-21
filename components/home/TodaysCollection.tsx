'use client'

import { ProductCard } from '@/components/products/ProductCard'
import { motion } from 'framer-motion'
import { Sparkles, ChevronRight } from 'lucide-react'
import Link from 'next/link'

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
    variants: Array<{
        id: string
        size: string
        stock: number
    }>
}

interface TodaysCollectionProps {
    products: Product[]
}

export function TodaysCollection({ products }: TodaysCollectionProps) {
    if (products.length === 0) return null

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: 'easeOut' as const,
            },
        },
    }

    return (
        <section className="py-20 bg-gradient-to-br from-rose/5 via-coral/5 to-gold/5 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-rose/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-gold/10 to-transparent rounded-full blur-3xl" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose to-coral text-white rounded-full mb-6 shadow-lg"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-semibold tracking-wide">Fresh Picks</span>
                    </motion.div>

                    {/* Title */}
                    <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
                        Today&apos;s{' '}
                        <span className="text-gradient-vibrant">Collection</span>
                    </h2>

                    {/* Subtitle */}
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Handpicked daily selections curated just for you
                    </p>
                </motion.div>

                {/* Products Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 mb-8"
                >
                    {products.map((product) => (
                        <motion.div key={product.id} variants={itemVariants}>
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </motion.div>

                {/* View All Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-center"
                >
                    <Link
                        href="/collections/todays-collection"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-rose via-coral to-gold hover:from-rose-dark hover:via-coral-dark hover:to-gold-dark text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                        <span>View Full Collection</span>
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}
