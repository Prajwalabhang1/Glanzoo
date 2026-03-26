'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart, Zap, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { productCardHover, imageZoom, ripple, buttonTap } from '@/lib/animations'
import { QuickViewModal } from './QuickViewModal'

interface Rating {
    avg: number
    count: number
}

interface Product {
    id: string
    slug: string
    name: string
    price: number
    salePrice?: number | null
    images: string // JSON string
    stock?: number | null
    category?: { name: string; slug: string } | null
    material?: string | null
    fabricType?: string | null
    pattern?: string | null
    occasion?: string | null
    brand?: string | null
    gender?: string | null
    // Perfume
    concentration?: string | null
    volumeMl?: number | null
    fragranceFamily?: string | null
    // Electronics
    batteryLife?: string | null
    warranty?: string | null
    connectivity?: string | null
    // Footwear
    heelHeight?: string | null
    soleMaterial?: string | null
    // Clothing
    fit?: string | null
    workType?: string | null
    description?: string | null
    shortDescription?: string | null
    displaySKU?: string | null
    tags?: string | null
    collection?: { name: string; slug: string } | null
    freeShipping?: boolean
    sales?: number
    rating?: Rating
    vendorName?: string | null
    vendor?: { businessName: string } | null
    variants?: Array<{
        id: string
        size: string
        color?: string | null
        stock: number
    }>
}

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const router = useRouter()
    const { addItem } = useCart()
    const [isHovered, setIsHovered] = useState(false)
    const [showRipple, setShowRipple] = useState(false)
    const [selectedSize, setSelectedSize] = useState<string>('')
    const [isAddingToCart, setIsAddingToCart] = useState(false)
    const [showQuickView, setShowQuickView] = useState(false)
    const [imgError, setImgError] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [isWishlistLoading, setIsWishlistLoading] = useState(false)
    // Mobile: tap-to-swap image (mirrors hover on desktop)
    const [isTouched, setIsTouched] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Parse images - handle both JSON array and plain string, and pre-parsed arrays
    let imageUrls: string[] = []
    if (Array.isArray(product.images)) {
        imageUrls = product.images;
    } else if (typeof product.images === 'string') {
        try {
            const parsed = JSON.parse(product.images)
            imageUrls = Array.isArray(parsed) ? parsed : [parsed]
        } catch {
            imageUrls = [product.images]
        }
    }

    // Filter out empty strings and invalid URLs
    imageUrls = imageUrls.filter(url => typeof url === 'string' && url.trim() !== '')

    // Parse tags from JSON string
    let productTags: string[] = []
    try {
        if (product.tags) {
            productTags = JSON.parse(product.tags)
        }
    } catch {
        // ignore
    }

    const FALLBACK_IMAGE = '/placeholder-product.svg'
    const primaryImage = imageUrls[0] || FALLBACK_IMAGE
    const secondaryImage = imageUrls[1] || primaryImage
    const displayPrice = product.salePrice || product.price
    const hasDiscount = product.salePrice && product.salePrice < product.price
    const discountPercent = hasDiscount
        ? Math.round(((product.price - (product.salePrice || 0)) / product.price) * 100)
        : 0

    const hasVariants = product.variants && product.variants.length > 0

    // ─── Category group detection ─────────────────────────────────
    const catName = (product.category?.name ?? '').toLowerCase()
    const getCategoryGroup = () => {
        if (catName.includes('perfume') || catName.includes('fragrance') || catName.includes('attar') || catName.includes('mist') || catName.includes('deodorant') || catName.includes('candle') || catName.includes('diffuser') || catName.includes('incense')) return 'perfume'
        if (catName.includes('electronic') || catName.includes('earbud') || catName.includes('speaker') || catName.includes('neckband') || catName.includes('massager')) return 'electronics'
        if (catName.includes('footwear') || catName.includes('sandal') || catName.includes('heel') || catName.includes('sneaker') || catName.includes('shoe') || catName.includes('mojari') || catName.includes('slipper')) return 'footwear'
        if (catName.includes('accessories') || catName.includes('necklace') || catName.includes('earring') || catName.includes('bracelet') || catName.includes('ring') || catName.includes('wallet') || catName.includes('watch') || catName.includes('clutch') || catName.includes('chain') || catName.includes('belt') || catName.includes('sunglass')) return 'accessories'
        if (catName.includes('wear') || catName.includes('kurti') || catName.includes('saree') || catName.includes('shirt') || catName.includes('dress') || catName.includes('suit') || catName.includes('set') || catName.includes('blouse') || catName.includes('top') || catName.includes('jeans') || catName.includes('night')) return 'clothing'
        return 'generic'
    }
    const catGroup = getCategoryGroup()

    // Build context info pills to show on card
    const infoPills: string[] = []
    if (catGroup === 'clothing') {
        if (product.fabricType) infoPills.push(product.fabricType)
        else if (product.material) infoPills.push(product.material)
        if (product.pattern && product.pattern !== 'Solid') infoPills.push(product.pattern)
        else if (product.fit) infoPills.push(product.fit)
    } else if (catGroup === 'perfume') {
        if (product.volumeMl) infoPills.push(`${product.volumeMl}ml`)
        if (product.concentration) infoPills.push(product.concentration.replace(' (Eau de Parfum)', '').replace(' (Eau de Toilette)', '').replace(' (Eau de Cologne)', ''))
        else if (product.fragranceFamily) infoPills.push(product.fragranceFamily)
    } else if (catGroup === 'electronics') {
        if (product.batteryLife) infoPills.push(`${product.batteryLife}`)
        if (product.connectivity) infoPills.push(product.connectivity.split(' ')[0] === 'Bluetooth' ? `BT ${product.connectivity.split(' ').pop()}` : product.connectivity)
        else if (product.warranty) infoPills.push(product.warranty + ' Warranty')
    } else if (catGroup === 'footwear') {
        if (product.heelHeight) infoPills.push(product.heelHeight)
        if (product.soleMaterial) infoPills.push(product.soleMaterial + ' sole')
    } else if (catGroup === 'accessories') {
        if (product.material) infoPills.push(product.material)
    }

    // Unique colours from variants
    const variantColors = hasVariants
        ? [...new Set(product.variants!.filter(v => v.color).map(v => v.color as string))]
        : []

    // Auto-select first available size on mount
    useEffect(() => {
        if (hasVariants) {
            const firstAvailable = product.variants!.find(v => v.stock > 0)
            if (firstAvailable) {
                setSelectedSize(firstAvailable.size)
            }
        }
    }, [hasVariants, product.variants])

    // Compute available stock for the selected size
    const selectedVariant = hasVariants
        ? product.variants!.find(v => v.size === selectedSize)
        : null
    const totalVariantStock = hasVariants
        ? product.variants!.reduce((sum, v) => sum + v.stock, 0)
        : (product.stock ?? 0)
    const selectedStock = selectedVariant ? selectedVariant.stock : totalVariantStock
    const isLowStock = selectedStock > 0 && selectedStock <= 5

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

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
            maxQuantity: variant?.stock ?? product.stock ?? 1,
            quantity: 1,
        })

        toast.success(`${product.name} added to cart!`)
        setTimeout(() => setIsAddingToCart(false), 800)
    }

    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (hasVariants && !selectedSize) {
            toast.error('Please select a size')
            return
        }

        handleAddToCart(e)
        setTimeout(() => { window.location.href = '/checkout' }, 500)
    }

    const handleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isWishlistLoading) return
        setIsWishlistLoading(true)
        setShowRipple(true)
        setTimeout(() => setShowRipple(false), 600)

        try {
            if (isWishlisted) {
                const res = await fetch(`/api/wishlist?productId=${product.id}`, { method: 'DELETE' })
                if (res.status === 401) {
                    toast.error('Please log in to manage your wishlist')
                    return
                }
                if (res.ok) {
                    setIsWishlisted(false)
                    toast.success('Removed from wishlist')
                } else {
                    toast.error('Failed to update wishlist')
                }
            } else {
                const res = await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: product.id }),
                })
                if (res.status === 401) {
                    toast.error('Please log in to save to wishlist')
                    return
                }
                if (res.ok) {
                    setIsWishlisted(true)
                    toast.success('Added to wishlist! ❤️')
                } else {
                    toast.error('Failed to update wishlist')
                }
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setIsWishlistLoading(false)
        }
    }

    return (
        <>
            <motion.div
                initial="rest"
                whileHover="hover"
                animate="rest"
                variants={productCardHover}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                // Mobile: tap anywhere on card shows alternate image (like hover on desktop)
                onTouchStart={() => setIsTouched(true)}
                onTouchEnd={() => setTimeout(() => setIsTouched(false), 800)}
                className="group h-full"
            >
                <div className="bg-white rounded-2xl overflow-hidden transition-all duration-300 border border-gray-100 hover:border-gold/30 flex flex-col h-full">
                    {/* Image Container */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 cursor-pointer flex-shrink-0"
                        onClick={() => window.location.href = `/products/${product.slug}`}
                    >
                        {/* Primary Image */}
                        <motion.div
                            className="absolute inset-0"
                            variants={imageZoom}
                        >
                            <Image
                                src={imgError ? FALLBACK_IMAGE : primaryImage}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                unoptimized={primaryImage.includes('unsplash.com') || imgError}
                                onError={() => setImgError(true)}
                            />
                        </motion.div>

                        {/* Secondary Image Crossfade — triggers on hover (desktop) or tap (mobile) */}
                        <AnimatePresence>
                            {(isHovered || isTouched) && secondaryImage !== primaryImage && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={secondaryImage}
                                        alt={`${product.name} - alternate view`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                        unoptimized={secondaryImage.includes('unsplash.com')}
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Tags/Badges - Top Left */}
                        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                            {hasDiscount && (
                                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                                    <div className="relative overflow-hidden bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                                        <span className="relative z-10">{discountPercent}% OFF</span>
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                            initial={{ x: '-100%' }}
                                            animate={{ x: '200%' }}
                                            transition={{ repeat: Infinity, duration: 2, ease: 'linear', repeatDelay: 3 }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                            {productTags.includes('New') && (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                    <span className="inline-block px-2.5 py-1 bg-gradient-to-r from-rose to-coral text-white text-xs font-semibold rounded-full shadow-md">
                                        ✨ New
                                    </span>
                                </motion.div>
                            )}
                            {productTags.includes('Trending') && (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                                    <span className="inline-block px-2.5 py-1 bg-gradient-to-r from-gold to-amber-500 text-white text-xs font-semibold rounded-full shadow-md">
                                        🔥 Trending
                                    </span>
                                </motion.div>
                            )}
                        </div>

                        {/* Wishlist Button — 40×40px for comfortable touch target */}
                        <motion.button
                            whileTap={buttonTap}
                            onClick={handleWishlist}
                            disabled={isWishlistLoading}
                            className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-opacity hover:bg-white shadow-md z-10 disabled:opacity-60 touch-manipulation"
                        >
                            <Heart
                                className={`h-4 w-4 transition-colors ${isWishlisted
                                    ? 'fill-red-500 text-red-500'
                                    : 'text-luxury-black hover:text-red-500'
                                    }`}
                            />
                            {showRipple && (
                                <motion.div
                                    variants={ripple}
                                    initial="initial"
                                    animate="animate"
                                    className="absolute inset-0 rounded-full border-2 border-red-500"
                                />
                            )}
                        </motion.button>

                        {/* Occasion Badge */}
                        {product.occasion && (catGroup === 'clothing' || catGroup === 'generic') && (
                            <div className="absolute bottom-10 left-3 z-10">
                                <span className="inline-block px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-semibold rounded-full">
                                    {product.occasion}
                                </span>
                            </div>
                        )}

                        {/* Quick View — icon-only on mobile ≤375px, text+icon on sm+ */}
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); setShowQuickView(true) }}
                            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white/95 backdrop-blur-sm border-2 border-coral text-coral font-semibold rounded-full shadow-lg hover:bg-coral hover:text-white transition-all duration-300 flex items-center gap-1.5 z-10 text-xs touch-manipulation"
                            aria-label="Quick view"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Quick View</span>
                        </motion.button>
                    </div>

                    {/* Product Info */}
                    <div className="p-2.5 sm:p-3 flex flex-col flex-1">
                        {/* Vendor/Brand name */}
                        {(product.vendorName || product.vendor?.businessName) && (
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
                                {product.vendorName ?? product.vendor?.businessName}
                            </p>
                        )}

                        {/* Category & Title */}
                        <a href={`/products/${product.slug}`} className="flex-1">
                            {product.category?.name && (
                                <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase mb-0.5">
                                    {product.category.name}
                                </p>
                            )}
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 line-clamp-2 hover:text-coral transition-colors duration-200">
                                {product.name}
                            </h3>
                            {/* Short description */}
                            {product.shortDescription && (
                                <p className="text-[10px] text-gray-500 line-clamp-1 mb-1 leading-snug">
                                    {product.shortDescription}
                                </p>
                            )}
                        </a>

                        {/* Category-aware info pills */}
                        {infoPills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                                {infoPills.slice(0, 2).map(pill => (
                                    <span key={pill} className="inline-block text-[9px] text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-full font-medium">
                                        {pill}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Colour dots for clothing/accessories variants */}
                        {variantColors.length > 0 && (
                            <div className="flex items-center gap-1 mb-1">
                                {variantColors.slice(0, 7).map(color => (
                                    <span
                                        key={color}
                                        title={color}
                                        className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0"
                                        style={{ backgroundColor: color.startsWith('#') ? color : color }}
                                    />
                                ))}
                                {variantColors.length > 7 && (
                                    <span className="text-[9px] text-gray-400">+{variantColors.length - 7}</span>
                                )}
                            </div>
                        )}

                        {product.rating && product.rating.count > 0 && (
                            <div className="flex items-center gap-1 mb-1.5">
                                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-amber-400">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-[10px] font-semibold text-gray-700">{product.rating.avg.toFixed(1)}</span>
                                <span className="text-[10px] text-gray-400">({product.rating.count})</span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-1.5 mb-1">
                            <p className="text-sm sm:text-base font-bold text-luxury-black">
                                ₹{displayPrice.toLocaleString('en-IN')}
                            </p>
                            {hasDiscount && (
                                <p className="text-xs text-gray-400 line-through">
                                    ₹{product.price.toLocaleString('en-IN')}
                                </p>
                            )}
                        </div>

                        {/* Free shipping badge + social proof */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {product.freeShipping && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                                    🚚 Free
                                </span>
                            )}
                            {(product.sales ?? 0) > 50 && (
                                <span className="text-[10px] text-orange-600 font-medium">
                                    🔥 {product.sales}+ sold
                                </span>
                            )}
                        </div>

                        {/* Size Selector — enlarged touch targets for mobile */}
                        {hasVariants && (
                            <div className="mb-2">
                                <div className="flex flex-nowrap overflow-x-auto gap-1.5 no-scrollbar pb-1 touch-manipulation">
                                    {product.variants!.map((variant) => (
                                        <button
                                            key={variant.id}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                if (variant.stock > 0) setSelectedSize(variant.size)
                                            }}
                                            disabled={variant.stock === 0}
                                            style={{ touchAction: 'manipulation' }}
                                            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all flex-shrink-0 min-h-[32px]
                                                ${selectedSize === variant.size
                                                    ? 'border-orange-500 bg-orange-50 text-orange-600 font-semibold'
                                                    : variant.stock === 0
                                                        ? 'border-gray-100 bg-gray-50 text-gray-300 line-through cursor-not-allowed'
                                                        : 'border-gray-200 text-gray-600 hover:border-orange-200 active:border-orange-400'
                                                }
                                            `}
                                        >
                                            {variant.size}
                                        </button>
                                    ))}
                                </div>
                                {/* Stock indicator */}
                                {isLowStock && (
                                    <p className="text-[9px] text-orange-600 font-medium mt-1">
                                        Only {selectedStock} left!
                                    </p>
                                )}
                                {selectedVariant && selectedVariant.stock === 0 && (
                                    <p className="text-[9px] text-red-500 font-medium mt-1">Out of stock</p>
                                )}
                            </div>
                        )}

                        {/* CTA Buttons — full touch target heights */}
                        <div className="grid grid-cols-2 gap-1.5 mt-auto">
                            <motion.div whileTap={buttonTap}>
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={isAddingToCart}
                                    variant="outline"
                                    className="w-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white active:bg-gray-900 active:text-white transition-all duration-300 text-xs py-2 sm:py-2.5 touch-manipulation"
                                    size="sm"
                                >
                                    {isAddingToCart ? (
                                        <span className="flex items-center gap-1.5">
                                            <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            Adding...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 justify-center">
                                            <ShoppingCart className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span>Add</span>
                                        </span>
                                    )}
                                </Button>
                            </motion.div>

                            <motion.div whileTap={buttonTap}>
                                <Button
                                    onClick={handleBuyNow}
                                    disabled={isAddingToCart}
                                    className="w-full bg-gold hover:bg-gold-dark text-white font-semibold transition-all duration-300 text-xs py-1.5 sm:py-2 shadow-sm hover:shadow-md"
                                    size="sm"
                                >
                                    <span className="flex items-center gap-1 justify-center">
                                        <Zap className="h-3.5 w-3.5 fill-white text-white flex-shrink-0" />
                                        <span>Buy Now</span>
                                    </span>
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div >

            {isMounted && showQuickView && createPortal(
                <QuickViewModal
                    product={product}
                    isOpen={showQuickView}
                    onClose={() => setShowQuickView(false)}
                />,
                document.body
            )
            }
        </>
    )
}
