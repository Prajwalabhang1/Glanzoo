'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { X, ShoppingCart, Star } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { toast } from 'sonner'

interface Rating {
    avg: number
    count: number
}

interface Product {
    id: string
    name: string
    slug: string
    price: number
    salePrice?: number | null
    description?: string | null
    images: string
    material?: string | null
    displaySKU?: string | null
    freeShipping?: boolean
    shippingDays?: string
    rating?: Rating
    variants?: Array<{
        id: string
        size: string
        stock: number
    }>
}

interface QuickViewModalProps {
    product: Product
    isOpen: boolean
    onClose: () => void
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
    const { addItem } = useCart()
    const [selectedSize, setSelectedSize] = useState<string>('')
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [isAddingToCart, setIsAddingToCart] = useState(false)

    // Parse images
    let imageUrls: string[] = []
    try {
        const parsed = JSON.parse(product.images)
        imageUrls = Array.isArray(parsed) ? parsed : [parsed]
    } catch {
        imageUrls = [product.images]
    }
    imageUrls = imageUrls.filter(url => typeof url === 'string' && url.trim() !== '')

    const primaryImage = imageUrls[0] || 'https://placehold.co/400x600?text=No+Image'
    const displayPrice = product.salePrice || product.price
    const hasDiscount = product.salePrice && product.salePrice < product.price
    const hasVariants = product.variants && product.variants.length > 0

    // Auto-select first available size
    useEffect(() => {
        if (isOpen && hasVariants && !selectedSize) {
            const firstAvailable = product.variants!.find(v => v.stock > 0)
            if (firstAvailable) {
                setSelectedSize(firstAvailable.size)
            }
        }
    }, [isOpen, hasVariants, product.variants, selectedSize])

    // Reset state AFTER modal closes (delay for animation)
    useEffect(() => {
        if (!isOpen) {
            // Delay reset to allow exit animation to complete
            const timer = setTimeout(() => {
                setSelectedImageIndex(0)
                setSelectedSize('')
                setIsAddingToCart(false)
            }, 300) // Match AnimatePresence exit duration

            return () => clearTimeout(timer)
        }
    }, [isOpen])

    const handleAddToCart = () => {
        if (hasVariants && !selectedSize) {
            toast.error('Please select a size')
            return
        }

        const variant = hasVariants
            ? product.variants!.find(v => v.size === selectedSize)
            : null

        if (hasVariants && (!variant || variant.stock === 0)) {
            toast.error('Selected size is out of stock')
            return
        }

        setIsAddingToCart(true)

        addItem({
            productId: product.id,
            variantId: variant?.id || '',
            name: product.name,
            slug: product.slug,
            price: displayPrice,
            salePrice: product.salePrice,
            image: primaryImage,
            size: hasVariants ? selectedSize : undefined,
            inStock: true,
            maxQuantity: variant?.stock || 10,
            quantity: 1,
        })

        toast.success(`${product.name} added to cart!`)

        setTimeout(() => {
            setIsAddingToCart(false)
            onClose()
        }, 800)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={isAddingToCart ? undefined : onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            disabled={isAddingToCart}
                            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X className="w-5 h-5 text-gray-700" />
                        </button>

                        {/* Content */}
                        <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8 overflow-y-auto max-h-[90vh]">
                            {/* Left: Image Gallery */}
                            <div className="space-y-4">
                                {/* Main Image */}
                                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                                    <Image
                                        src={imageUrls[selectedImageIndex] || primaryImage}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>

                                {/* Thumbnails */}
                                {imageUrls.length > 1 && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {imageUrls.slice(0, 4).map((url, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImageIndex(index)}
                                                className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index
                                                    ? 'border-coral ring-2 ring-coral/20'
                                                    : 'border-gray-200 hover:border-coral/50'
                                                    }`}
                                            >
                                                <Image
                                                    src={url}
                                                    alt={`${product.name} ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Product Details */}
                            <div className="flex flex-col">
                                {/* Product Name */}
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                                    {product.name}
                                </h2>

                                {/* Price */}
                                <div className="flex items-baseline gap-3 mb-4">
                                    <span className="text-3xl font-bold text-gradient-vibrant">
                                        ₹{displayPrice.toLocaleString()}
                                    </span>
                                    {hasDiscount && (
                                        <span className="text-lg text-gray-400 line-through">
                                            ₹{product.price.toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                {/* Rating */}
                                {product.rating && product.rating.count > 0 ? (
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < Math.floor(product.rating!.avg)
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-gray-200 fill-gray-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700">{product.rating.avg.toFixed(1)}</span>
                                        <span className="text-sm text-gray-500">({product.rating.count} reviews)</span>
                                    </div>
                                ) : null}

                                {/* Description */}
                                {product.description && (
                                    <p className="text-gray-600 mb-6 line-clamp-3">
                                        {product.description}
                                    </p>
                                )}

                                {/* Material, SKU & Delivery */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {product.material && (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                            {product.material}
                                        </span>
                                    )}
                                    {product.displaySKU && (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm">
                                            SKU: {product.displaySKU}
                                        </span>
                                    )}
                                    {product.freeShipping && (
                                        <span className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm font-semibold">
                                            🚚 Free Shipping
                                        </span>
                                    )}
                                </div>
                                {product.shippingDays && (
                                    <p className="text-sm text-gray-500 mb-4">
                                        Delivers in <strong className="text-gray-700">{product.shippingDays}</strong>
                                    </p>
                                )}

                                {/* Size Selector */}
                                {hasVariants && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Select Size
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {product.variants!.map((variant) => {
                                                const isSelected = selectedSize === variant.size
                                                const isOutOfStock = variant.stock === 0

                                                return (
                                                    <button
                                                        key={variant.id}
                                                        onClick={() =>
                                                            !isOutOfStock && setSelectedSize(variant.size)
                                                        }
                                                        disabled={isOutOfStock}
                                                        className={`
                                                            px-4 py-2 rounded-full font-medium text-sm transition-all
                                                            ${isSelected
                                                                ? 'bg-gradient-to-r from-rose via-coral to-gold text-white'
                                                                : isOutOfStock
                                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-coral'
                                                            }
                                                        `}
                                                    >
                                                        {variant.size}
                                                        {isOutOfStock && (
                                                            <span className="ml-1 text-xs">(Out)</span>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-auto space-y-3">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isAddingToCart}
                                        className="w-full py-3 bg-gradient-to-r from-rose via-coral to-gold text-white font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                                    </button>

                                    <Link
                                        href={`/products/${product.slug}`}
                                        onClick={onClose}
                                        className="block w-full py-3 bg-white border-2 border-coral text-coral font-semibold rounded-lg hover:bg-coral/5 transition-all duration-300 text-center"
                                    >
                                        View Full Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
