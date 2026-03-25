'use client'

/**
 * ProductCardSkeleton — Loading placeholder that matches ProductCard's layout.
 * Uses the .skeleton CSS utility (globals.css) which respects prefers-reduced-motion.
 *
 * Usage:
 *   import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton'
 *   <ProductCardSkeleton count={6} />
 */
export function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col h-full">
            {/* Image placeholder — 3:4 aspect ratio */}
            <div className="skeleton aspect-[3/4] w-full" />

            {/* Content */}
            <div className="p-3 flex flex-col gap-2 flex-1">
                {/* Category */}
                <div className="skeleton h-2.5 w-1/3 rounded-full" />
                {/* Title */}
                <div className="skeleton h-3.5 w-4/5 rounded" />
                <div className="skeleton h-3.5 w-3/5 rounded" />
                {/* Price */}
                <div className="skeleton h-4 w-1/3 rounded mt-1" />
                {/* Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-auto pt-1">
                    <div className="skeleton h-8 rounded-lg" />
                    <div className="skeleton h-8 rounded-lg" />
                </div>
            </div>
        </div>
    )
}

interface ProductSkeletonGridProps {
    count?: number
}

export function ProductSkeletonGrid({ count = 6 }: ProductSkeletonGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    )
}
