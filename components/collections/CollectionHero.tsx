'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface Collection {
    name: string
    slug: string
    description: string | null
    image: string | null
}

interface CollectionHeroProps {
    collection: Collection
    productCount: number
}

export function CollectionHero({ collection, productCount }: CollectionHeroProps) {
    const defaultBanner = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=600&fit=crop'

    return (
        <div className="relative h-64 md:h-80 w-full overflow-hidden bg-gray-900">
            {/* Background Image */}
            <Image
                src={collection.image || defaultBanner}
                alt={collection.name}
                fill
                className="object-cover opacity-60"
                priority
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />

            {/* Content */}
            <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
                {/* Breadcrumbs */}
                <nav className="mb-4">
                    <ol className="flex items-center gap-2 text-sm text-white/80">
                        <li>
                            <Link
                                href="/"
                                className="hover:text-white transition-colors flex items-center gap-1"
                            >
                                <Home className="w-4 h-4" />
                                Home
                            </Link>
                        </li>
                        <ChevronRight className="w-4 h-4" />
                        <li>
                            <Link
                                href="/collections"
                                className="hover:text-white transition-colors"
                            >
                                Collections
                            </Link>
                        </li>
                        <ChevronRight className="w-4 h-4" />
                        <li className="text-white font-medium">{collection.name}</li>
                    </ol>
                </nav>

                {/* Collection Name */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 font-heading">
                    {collection.name}
                    <span className="block h-1 w-24 bg-gradient-to-r from-rose via-coral to-gold mt-3 rounded-full" />
                </h1>

                {/* Description */}
                {collection.description && (
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-4">
                        {collection.description}
                    </p>
                )}

                {/* Product Count */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 w-fit">
                    <span className="text-white font-semibold">
                        {productCount} {productCount === 1 ? 'Product' : 'Products'}
                    </span>
                </div>
            </div>
        </div>
    )
}
