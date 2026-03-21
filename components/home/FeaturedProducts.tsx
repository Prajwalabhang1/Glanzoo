'use client'

import Link from 'next/link'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface Product {
    id: string
    slug: string
    name: string
    price: number
    salePrice?: number | null
    images: string // JSON string
    category: { name: string; slug: string }
    variants?: Array<{
        id: string
        size: string
        stock: number
    }>
}

interface FeaturedProductsProps {
    products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
    if (products.length === 0) {
        return null
    }

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-luxury-black mb-4">
                        Featured <span className="text-gold">Collection</span>
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Handpicked pieces that embody timeless elegance and modern sophistication
                    </p>
                </motion.div>

                {/* Product Grid with Stagger Animation */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 mb-12"
                >
                    {products.map((product) => (
                        <motion.div key={product.id} variants={staggerItem}>
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </motion.div>

                {/* View All Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                >
                    <Link href="/products">
                        <Button
                            size="lg"
                            className="bg-luxury-black hover:bg-luxury-charcoal text-white px-8 py-6 rounded-full group transition-all duration-300 hover:shadow-xl"
                        >
                            View All Products
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}
