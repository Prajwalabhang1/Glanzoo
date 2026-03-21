'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Collection {
    id: string
    name: string
    slug: string
    description: string | null
    image: string | null
    productCount: number
}

interface CollectionCardProps {
    collection: Collection
}

export function CollectionCard({ collection }: CollectionCardProps) {
    const defaultImage = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop'

    return (
        <Link href={`/collections/${collection.slug}`}>
            <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300"
            >
                {/* Background Image */}
                <Image
                    src={collection.image || defaultImage}
                    alt={collection.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20 group-hover:from-black/90 group-hover:via-black/60 transition-all duration-300" />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    {/* Collection Name */}
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-coral transition-colors duration-300">
                        {collection.name}
                    </h3>

                    {/* Description (if available) */}
                    {collection.description && (
                        <p className="text-white/80 text-sm mb-3 line-clamp-2">
                            {collection.description}
                        </p>
                    )}

                    {/* Product Count Badge */}
                    <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-3 py-1 bg-coral/90 text-white rounded-full text-sm font-semibold">
                            {collection.productCount} {collection.productCount === 1 ? 'item' : 'items'}
                        </span>

                        {/* Arrow Icon */}
                        <motion.div
                            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ArrowRight className="w-5 h-5 text-white" />
                        </motion.div>
                    </div>
                </div>

                {/* Hover Gradient Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-coral/50 transition-colors duration-300 pointer-events-none" />
            </motion.div>
        </Link>
    )
}
