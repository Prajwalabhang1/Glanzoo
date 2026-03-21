'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    ShoppingCart, Heart, Share2, Truck, Shield, Star, Zap, Ruler,
    Package, ChevronDown, Tag, ZoomIn, CheckCircle2, Info, Droplets,
    Wind, Layers, Battery, Wifi, Watch, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { useToast } from '@/lib/toast-context'
import { ProductCard } from '@/components/products/ProductCard'
import { SizeChartModal } from '@/components/products/SizeChartModal'
import { StickyAddToCart } from '@/components/products/StickyAddToCart'
import { ProductImageZoom } from '@/components/products/ProductImageZoom'
import { SpecificationsTable } from '@/components/products/SpecificationsTable'

interface Rating { avg: number; count: number }

type ProductVariant = {
    id: string; size: string; stock: number;
    color?: string | null; price?: number | null;
}

interface ProductDetailClientProps {
    product: {
        id: string; name: string; slug: string;
        description: string | null; shortDescription: string | null;
        price: number; salePrice: number | null; mrp?: number | null; gstRate?: number | null;
        images: string;
        // Universal
        brand?: string | null; gender?: string | null; occasion?: string | null;
        countryOfOrigin?: string | null; weight?: number | null;
        hsnCode?: string | null;
        material: string | null; fabricType: string | null;
        specifications: string | null;
        detailedInfo?: string | null;
        topLength: string | null; bottomLength: string | null;
        careInstructions: string | null; washCare: string | null;
        displaySku: string | null; shippingDays: string; returnEligible: boolean; freeShipping: boolean; sales: number;
        vendorName: string | null;
        // Clothing
        pattern?: string | null; fit?: string | null; neckType?: string | null;
        sleeveType?: string | null; workType?: string | null; bottomType?: string | null;
        dupatteIncluded?: boolean | null; blousePiece?: string | null;
        // Perfume
        concentration?: string | null; volumeMl?: number | null; fragranceFamily?: string | null;
        topNotes?: string | null; middleNotes?: string | null; baseNotes?: string | null;
        // Electronics
        connectivity?: string | null; batteryLife?: string | null;
        warranty?: string | null; waterResistance?: string | null;
        // Footwear
        heelHeight?: string | null; soleMaterial?: string | null; closureType?: string | null;
        category: { name: string; slug: string };
        collection?: { name: string; slug: string } | null;
        sizeChart?: { name: string; category: string; chartData: string } | null;
        variants: ProductVariant[];
    }
    relatedProducts: Array<{
        id: string; name: string; slug: string; price: number; salePrice: number | null;
        images: string; freeShipping?: boolean; sales?: number;
        shortDescription?: string | null; rating?: Rating;
        category?: { name: string; slug: string } | null;
        variants: Array<{ id: string; size: string; stock: number; color?: string | null }>
    }>
    rating: Rating
}

// ─── Category group helper ──────────────────────────────────────────────────
function getCatGroup(catName: string) {
    const n = catName.toLowerCase()
    if (n.includes('perfume') || n.includes('fragrance') || n.includes('attar') || n.includes('mist') || n.includes('deodorant') || n.includes('candle') || n.includes('diffuser') || n.includes('incense')) return 'perfume'
    if (n.includes('electronic') || n.includes('earbud') || n.includes('speaker') || n.includes('neckband') || n.includes('massager')) return 'electronics'
    if (n.includes('footwear') || n.includes('sandal') || n.includes('heel') || n.includes('sneaker') || n.includes('shoe') || n.includes('mojari') || n.includes('slipper')) return 'footwear'
    if (n.includes('accessories') || n.includes('necklace') || n.includes('earring') || n.includes('bracelet') || n.includes('ring') || n.includes('wallet') || n.includes('watch') || n.includes('clutch') || n.includes('chain') || n.includes('belt') || n.includes('sunglass')) return 'accessories'
    return 'clothing'
}

// ─── Star display ───────────────────────────────────────────────────────────
function StarDisplay({ avg, count, size = 'sm' }: { avg: number; count: number; size?: 'sm' | 'md' }) {
    const filled = Math.floor(avg); const half = avg - filled >= 0.5
    const sz = size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
    if (count === 0) return <span className="text-sm text-gray-400 italic">No reviews yet</span>
    return (
        <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`${sz} transition-colors ${s <= filled ? 'fill-amber-400 text-amber-400' : s === filled + 1 && half ? 'fill-amber-200 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">{avg.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({count} review{count !== 1 ? 's' : ''})</span>
        </div>
    )
}

// ─── Accordion ──────────────────────────────────────────────────────────────
function AccordionItem({ title, icon, children, defaultOpen = false }: {
    title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean
}) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left group">
                <span className="flex items-center gap-2.5 font-semibold text-gray-800 text-sm">{icon}{title}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <div className="pb-5 text-sm text-gray-600 space-y-2 animate-in fade-in-0 slide-in-from-top-2 duration-200">{children}</div>}
        </div>
    )
}

// ─── Spec Row ───────────────────────────────────────────────────────────────
function SpecRow({ label, value }: { label: string; value: string | number | null | undefined }) {
    if (!value) return null
    return (
        <div className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-500 w-36 shrink-0 pt-0.5 uppercase tracking-wide font-medium">{label}</span>
            <span className="text-sm text-gray-800 font-medium">{String(value)}</span>
        </div>
    )
}

// ─── Highlight Chip ─────────────────────────────────────────────────────────
function Chip({ icon, label }: { icon?: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            {icon && <span className="text-amber-600">{icon}</span>}
            <span className="text-xs font-semibold text-gray-700">{label}</span>
        </div>
    )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function ProductDetailClient({ product, relatedProducts, rating }: ProductDetailClientProps) {
    const images = (() => { try { return JSON.parse(product.images) as string[] } catch { return [] } })()
    const [selectedImage, setSelectedImage] = useState(0)
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColor, setSelectedColor] = useState<string | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [showSizeChart, setShowSizeChart] = useState(false)
    const [showZoom, setShowZoom] = useState(false)
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [isWishlistLoading, setIsWishlistLoading] = useState(false)
    const [showStickyBar, setShowStickyBar] = useState(false)
    const ctaRef = useRef<HTMLDivElement>(null)
    const { addItem } = useCart()
    const { success, error } = useToast()

    const catGroup = getCatGroup(product.category.name)

    // Parse wash care
    let washCareList: string[] = []
    try { if (product.washCare) washCareList = JSON.parse(product.washCare) } catch { /* ignore */ }

    const displayPrice = product.salePrice || product.price
    const hasDiscount = product.salePrice !== null && product.salePrice < product.price
    const discountPercent = hasDiscount ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0
    const hasMrp = product.mrp && product.mrp > product.price

    // Unique colours from variants
    const allColors = [...new Set(product.variants.filter(v => v.color).map(v => v.color as string))]
    const hasColors = allColors.length > 0

    // Filter sizes by selected colour
    const sizesForColor = selectedColor
        ? product.variants.filter(v => v.color === selectedColor)
        : product.variants

    const selectedVariant = sizesForColor.find(v => v.size === selectedSize)
    const maxStock = selectedVariant?.stock || 0
    const isLowStock = maxStock > 0 && maxStock <= 5

    // Size label per category
    const sizeLabel = catGroup === 'perfume' ? 'Volume' : catGroup === 'footwear' ? 'UK Size' : 'Select Size'

    // Build highlight chips
    const highlights: { icon?: React.ReactNode; label: string }[] = []
    if (catGroup === 'clothing') {
        if (product.fabricType) highlights.push({ icon: <Layers className="w-3.5 h-3.5" />, label: product.fabricType })
        if (product.pattern) highlights.push({ label: product.pattern })
        if (product.fit) highlights.push({ label: product.fit + ' Fit' })
        if (product.occasion) highlights.push({ label: product.occasion })
        if (product.workType && product.workType !== 'None') highlights.push({ label: product.workType })
    } else if (catGroup === 'perfume') {
        if (product.volumeMl) highlights.push({ icon: <Droplets className="w-3.5 h-3.5" />, label: `${product.volumeMl}ml` })
        if (product.concentration) highlights.push({ label: product.concentration })
        if (product.fragranceFamily) highlights.push({ icon: <Wind className="w-3.5 h-3.5" />, label: product.fragranceFamily })
    } else if (catGroup === 'electronics') {
        if (product.batteryLife) highlights.push({ icon: <Battery className="w-3.5 h-3.5" />, label: product.batteryLife })
        if (product.connectivity) highlights.push({ icon: <Wifi className="w-3.5 h-3.5" />, label: product.connectivity })
        if (product.waterResistance && product.waterResistance !== 'None') highlights.push({ label: product.waterResistance })
        if (product.warranty) highlights.push({ icon: <Watch className="w-3.5 h-3.5" />, label: product.warranty + ' Warranty' })
    } else if (catGroup === 'footwear') {
        if (product.heelHeight) highlights.push({ label: product.heelHeight + ' Heel' })
        if (product.soleMaterial) highlights.push({ label: product.soleMaterial + ' Sole' })
        if (product.closureType) highlights.push({ label: product.closureType })
        if (product.material) highlights.push({ label: product.material })
    } else if (catGroup === 'accessories') {
        if (product.material) highlights.push({ label: product.material })
    }

    useEffect(() => {
        const el = ctaRef.current
        if (!el) return
        const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), { threshold: 0.1 })
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const handleAddToCart = useCallback(() => {
        if (!selectedSize) { error('Please select a size'); return }
        if (maxStock === 0) { error('This size is out of stock'); return }
        addItem({ productId: product.id, variantId: selectedVariant?.id || '', name: product.name, slug: product.slug, image: images[0], price: product.price, salePrice: product.salePrice, size: selectedSize, inStock: maxStock > 0, maxQuantity: maxStock, quantity })
        success('Added to cart!')
    }, [selectedSize, maxStock, product, images, selectedVariant, quantity, addItem, success, error])

    const handleBuyNow = useCallback(() => {
        if (!selectedSize) { error('Please select a size'); return }
        if (maxStock === 0) { error('This size is out of stock'); return }
        addItem({ productId: product.id, variantId: selectedVariant?.id || '', name: product.name, slug: product.slug, image: images[0], price: product.price, salePrice: product.salePrice, size: selectedSize, inStock: maxStock > 0, maxQuantity: maxStock, quantity })
        window.location.href = '/checkout'
    }, [selectedSize, maxStock, product, images, selectedVariant, quantity, addItem, error])

    const handleShare = async () => {
        const url = typeof window !== 'undefined' ? window.location.href : ''
        try {
            if (navigator.share) await navigator.share({ title: product.name, text: `Check out ${product.name} on Glanzoo!`, url })
            else { await navigator.clipboard.writeText(url); success('Link copied!') }
        } catch { /* cancelled */ }
    }

    const handleWishlist = async () => {
        if (isWishlistLoading) return
        setIsWishlistLoading(true)
        try {
            if (isWishlisted) {
                const res = await fetch(`/api/wishlist?productId=${product.id}`, { method: 'DELETE' })
                if (res.status === 401) { error('Please log in to manage your wishlist'); return }
                if (res.ok) { setIsWishlisted(false); success('Removed from wishlist') }
            } else {
                const res = await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: product.id }) })
                if (res.status === 401) { error('Please log in to save to wishlist'); return }
                if (res.ok) { setIsWishlisted(true); success('❤️ Added to wishlist!') }
            }
        } catch { error('Something went wrong') }
        finally { setIsWishlistLoading(false) }
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-6">

                {/* ── Breadcrumb ─────────────────────────────────────────────── */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 flex-wrap">
                    <Link href="/" className="hover:text-orange-600 transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-orange-600 transition-colors">Products</Link>
                    <span>/</span>
                    <Link href={`/collections/${product.category.slug}`} className="hover:text-orange-600 transition-colors">{product.category.name}</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
                </div>

                <div className="grid lg:grid-cols-2 gap-10 mb-16">

                    {/* ── Left: Image Gallery ────────────────────────────────── */}
                    <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
                        {/* Main Image */}
                        <div className="relative aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden group cursor-zoom-in border border-gray-100" onClick={() => setShowZoom(true)}>
                            {images[selectedImage] && (
                                <Image src={images[selectedImage]} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" priority sizes="(max-width:1024px) 100vw,50vw" />
                            )}
                            {hasDiscount && (
                                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">{discountPercent}% OFF</div>
                            )}
                            {product.occasion && catGroup === 'clothing' && (
                                <div className="absolute bottom-14 left-4">
                                    <span className="inline-block px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold rounded-full">{product.occasion}</span>
                                </div>
                            )}
                            <div className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
                                <ZoomIn className="w-4 h-4 text-gray-700" />
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {images.map((img, idx) => (
                                    <button key={idx} onClick={() => setSelectedImage(idx)}
                                        className={`relative aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-orange-500 shadow-md' : 'border-transparent hover:border-gray-300'}`}>
                                        <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" sizes="80px" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Right: Product Info ────────────────────────────────── */}
                    <div className="space-y-5">

                        {/* Brand / Vendor */}
                        <div className="flex items-center gap-2">
                            {(product.brand || product.vendorName) && (
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{product.brand || product.vendorName}</span>
                            )}
                            {product.collection && (
                                <Link href={`/collections/${product.collection.slug}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors">
                                    <Tag className="w-3 h-3" />{product.collection.name}
                                </Link>
                            )}
                        </div>

                        {/* Name */}
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

                        {/* Short description */}
                        {product.shortDescription && (
                            <p className="text-sm text-gray-600 italic leading-snug border-l-4 border-orange-300 pl-3">{product.shortDescription}</p>
                        )}

                        {/* Rating */}
                        <StarDisplay avg={rating.avg} count={rating.count} size="md" />

                        {/* ── Price Row (Myntra-style 3-tier) ────────────────── */}
                        <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
                            <div className="flex items-baseline gap-3 flex-wrap">
                                <span className="text-3xl font-extrabold text-gray-900">₹{displayPrice.toLocaleString('en-IN')}</span>
                                {hasDiscount && (
                                    <span className="text-lg text-gray-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
                                )}
                                {hasDiscount && (
                                    <span className="text-base font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">{discountPercent}% off</span>
                                )}
                            </div>
                            {hasMrp && (
                                <p className="text-xs text-gray-500">
                                    MRP: <span className="line-through">₹{Number(product.mrp).toLocaleString('en-IN')}</span>
                                    <span className="ml-1 text-gray-400">(inclusive of all taxes)</span>
                                </p>
                            )}
                            {product.freeShipping && (
                                <p className="text-xs text-green-600 font-semibold flex items-center gap-1"><Truck className="w-3.5 h-3.5" />Free delivery on this order</p>
                            )}
                        </div>

                        {/* Social Proof */}
                        {product.sales > 50 && (
                            <p className="text-sm text-orange-600 font-medium flex items-center gap-1.5">🔥 {product.sales}+ people bought this</p>
                        )}

                        {/* ── Key Highlights ─────────────────────────────────── */}
                        {highlights.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Key Highlights</p>
                                <div className="flex flex-wrap gap-2">
                                    {highlights.slice(0, 5).map((h, i) => <Chip key={i} icon={h.icon} label={h.label} />)}
                                </div>
                            </div>
                        )}

                        {/* ── Colour Picker ──────────────────────────────────── */}
                        {hasColors && (
                            <div>
                                <p className="text-sm font-semibold text-gray-800 mb-2">
                                    Colour{selectedColor && <span className="ml-2 font-normal text-gray-500">— {selectedColor}</span>}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {allColors.map(col => (
                                        <button key={col} title={col} onClick={() => { setSelectedColor(selectedColor === col ? null : col); setSelectedSize('') }}
                                            className={`w-8 h-8 rounded-full border-4 transition-all ${selectedColor === col ? 'border-orange-500 scale-110 shadow-lg' : 'border-gray-200 hover:border-gray-400'}`}
                                            style={{ backgroundColor: col.startsWith('#') ? col : col }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Size / Volume Picker ───────────────────────────── */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-semibold text-gray-800">{sizeLabel}</label>
                                {product.sizeChart && (
                                    <button onClick={() => setShowSizeChart(true)} className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1 font-medium">
                                        <Ruler className="w-4 h-4" />Size Guide
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {sizesForColor.map(variant => (
                                    <button key={variant.id} onClick={() => { if (variant.stock > 0) setSelectedSize(variant.size) }} disabled={variant.stock === 0}
                                        className={`min-w-[52px] py-2.5 px-4 border-2 rounded-xl font-semibold text-sm transition-all ${selectedSize === variant.size
                                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                                            : variant.stock === 0
                                                ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through bg-gray-50'
                                                : 'border-gray-200 hover:border-orange-300 text-gray-700 hover:bg-orange-50/50'}`}>
                                        {variant.size}
                                    </button>
                                ))}
                            </div>
                            {selectedVariant && isLowStock && (
                                <p className="mt-2 text-sm text-amber-600 font-semibold flex items-center gap-1">⚡ Only {maxStock} left in {selectedSize}!</p>
                            )}
                            {selectedVariant && maxStock === 0 && (
                                <p className="mt-2 text-sm text-red-500 font-medium">Out of stock in this size</p>
                            )}
                        </div>

                        {/* ── Quantity ───────────────────────────────────────── */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-800">Quantity</label>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 border-2 border-gray-200 rounded-xl hover:border-orange-500 transition-colors font-bold text-lg">−</button>
                                <span className="w-10 text-center font-bold text-lg">{quantity}</span>
                                <button onClick={() => setQuantity(Math.min(maxStock || 1, quantity + 1))} disabled={!selectedSize || quantity >= maxStock} className="w-10 h-10 border-2 border-gray-200 rounded-xl hover:border-orange-500 transition-colors disabled:opacity-40 font-bold text-lg">+</button>
                                {selectedSize && <span className="text-xs text-gray-400">({maxStock} available)</span>}
                            </div>
                        </div>

                        {/* ── CTA Buttons ────────────────────────────────────── */}
                        <div ref={ctaRef} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <Button onClick={handleAddToCart} variant="outline" className="w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-50 py-6 text-base font-semibold">
                                    <ShoppingCart className="mr-2 h-5 w-5" />Add to Cart
                                </Button>
                                <Button onClick={handleBuyNow} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-6 text-base font-semibold shadow-lg hover:shadow-xl">
                                    <Zap className="mr-2 h-5 w-5" />Buy Now
                                </Button>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className={`flex-1 border-2 font-medium ${isWishlisted ? 'border-red-400 text-red-500 hover:bg-red-50' : 'border-gray-200 hover:border-red-300'}`} onClick={handleWishlist} disabled={isWishlistLoading}>
                                    <Heart className={`mr-2 h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                                    {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                                </Button>
                                <Button variant="outline" size="icon" className="border-2 border-gray-200 px-6 hover:border-blue-300" onClick={handleShare}>
                                    <Share2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* ── Trust Badges ───────────────────────────────────── */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-3">
                                <Truck className={`w-5 h-5 flex-shrink-0 ${product.freeShipping ? 'text-green-600' : 'text-orange-500'}`} />
                                <div>
                                    <p className="text-xs font-semibold text-gray-800">{product.freeShipping ? 'Free Shipping' : 'Fast Shipping'}</p>
                                    <p className="text-[10px] text-gray-500">In {product.shippingDays}</p>
                                </div>
                            </div>
                            {product.returnEligible && (
                                <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-3">
                                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-800">7-Day Returns</p>
                                        <p className="text-[10px] text-gray-500">Easy exchange policy</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-3">
                                <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-800">100% Authentic</p>
                                    <p className="text-[10px] text-gray-500">Quality guaranteed</p>
                                </div>
                            </div>
                            {product.displaySku && (
                                <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-3">
                                    <Package className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-800">SKU</p>
                                        <p className="text-[10px] text-gray-500">{product.displaySku}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                                <p>{product.description}</p>
                            </div>
                        )}

                        {/* Detailed Production Information / Story */}
                        {product.detailedInfo && (
                            <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 text-gold">
                                    <Sparkles className="w-5 h-5" />
                                    Product Story & Detailed Information
                                </h3>
                                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                                    {product.detailedInfo}
                                </div>
                            </div>
                        )}

                        {/* ── Accordion Sections ─────────────────────────────── */}
                        <div className="border border-gray-200 rounded-2xl px-5 divide-y divide-gray-100">

                            {/* Product Details (all categories) */}
                            {(product.brand || product.gender || product.occasion || product.pattern || product.fit ||
                                product.neckType || product.sleeveType || product.workType || product.bottomType ||
                                product.material || product.fabricType || product.countryOfOrigin) && (
                                    <AccordionItem title="Product Details" icon={<Info className="w-4 h-4 text-orange-400" />} defaultOpen>
                                        <div className="divide-y divide-gray-50">
                                            <SpecRow label="Brand" value={product.brand} />
                                            <SpecRow label="Gender" value={product.gender} />
                                            <SpecRow label="Occasion" value={product.occasion} />
                                            <SpecRow label="Fabric Type" value={product.fabricType} />
                                            <SpecRow label="Material" value={product.material} />
                                            <SpecRow label="Pattern" value={product.pattern} />
                                            <SpecRow label="Fit" value={product.fit} />
                                            <SpecRow label="Neck Type" value={product.neckType} />
                                            <SpecRow label="Sleeve Type" value={product.sleeveType} />
                                            <SpecRow label="Work / Embellishment" value={product.workType} />
                                            <SpecRow label="Top Length" value={product.topLength} />
                                            <SpecRow label="Bottom Length" value={product.bottomLength} />
                                            <SpecRow label="Bottom Type" value={product.bottomType} />
                                            <SpecRow label="Blouse Piece" value={product.blousePiece} />
                                            {product.dupatteIncluded !== null && product.dupatteIncluded !== undefined && (
                                                <SpecRow label="Dupatta Included" value={product.dupatteIncluded ? 'Yes' : 'No'} />
                                            )}
                                            <SpecRow label="Country of Origin" value={product.countryOfOrigin} />
                                        </div>
                                    </AccordionItem>
                                )}

                            {/* Fragrance Notes (perfume only) */}
                            {catGroup === 'perfume' && (product.topNotes || product.middleNotes || product.baseNotes || product.fragranceFamily) && (
                                <AccordionItem title="Fragrance Notes" icon={<Droplets className="w-4 h-4 text-purple-400" />} defaultOpen>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Top Notes', value: product.topNotes, hint: 'First impression · fades in 15–30 min', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                                            { label: 'Heart Notes', value: product.middleNotes, hint: 'Core scent · lasts 2–4 hours', color: 'bg-pink-50 border-pink-200 text-pink-700' },
                                            { label: 'Base Notes', value: product.baseNotes, hint: 'Long-lasting finish · 6–8 hours', color: 'bg-amber-50 border-amber-200 text-amber-700' },
                                        ].filter(n => n.value).map(n => (
                                            <div key={n.label} className={`border rounded-xl p-3 ${n.color}`}>
                                                <p className="font-semibold text-xs uppercase tracking-wide mb-0.5">{n.label}</p>
                                                <p className="font-medium text-sm">{n.value}</p>
                                                <p className="text-[10px] opacity-70 mt-0.5">{n.hint}</p>
                                            </div>
                                        ))}
                                        <div className="divide-y divide-gray-50">
                                            <SpecRow label="Concentration" value={product.concentration} />
                                            <SpecRow label="Volume" value={product.volumeMl ? `${product.volumeMl}ml` : null} />
                                            <SpecRow label="Fragrance Family" value={product.fragranceFamily} />
                                        </div>
                                    </div>
                                </AccordionItem>
                            )}

                            {/* Technical Info (electronics only) */}
                            {catGroup === 'electronics' && (product.connectivity || product.batteryLife || product.warranty || product.waterResistance) && (
                                <AccordionItem title="Technical Specifications" icon={<Wifi className="w-4 h-4 text-blue-400" />} defaultOpen>
                                    <div className="divide-y divide-gray-50">
                                        <SpecRow label="Connectivity" value={product.connectivity} />
                                        <SpecRow label="Battery Life" value={product.batteryLife} />
                                        <SpecRow label="Water Resistance" value={product.waterResistance} />
                                        <SpecRow label="Warranty" value={product.warranty} />
                                    </div>
                                </AccordionItem>
                            )}

                            {/* Footwear Details */}
                            {catGroup === 'footwear' && (product.heelHeight || product.soleMaterial || product.closureType) && (
                                <AccordionItem title="Footwear Details" icon={<span>👟</span>} defaultOpen>
                                    <div className="divide-y divide-gray-50">
                                        <SpecRow label="Heel Height" value={product.heelHeight} />
                                        <SpecRow label="Sole Material" value={product.soleMaterial} />
                                        <SpecRow label="Closure Type" value={product.closureType} />
                                        <SpecRow label="Material" value={product.material} />
                                    </div>
                                </AccordionItem>
                            )}

                            {/* Measurements */}
                            {(product.topLength || product.bottomLength) && catGroup === 'clothing' && (
                                <AccordionItem title="Measurements" icon={<Ruler className="w-4 h-4 text-orange-400" />}>
                                    <div className="grid grid-cols-2 gap-3">
                                        {product.topLength && (
                                            <div className="bg-white border border-gray-100 p-3 rounded-xl text-center">
                                                <p className="text-xs text-gray-500 mb-1">Top Length</p>
                                                <p className="font-bold text-gray-900 text-lg">{product.topLength}</p>
                                            </div>
                                        )}
                                        {product.bottomLength && (
                                            <div className="bg-white border border-gray-100 p-3 rounded-xl text-center">
                                                <p className="text-xs text-gray-500 mb-1">Bottom Length</p>
                                                <p className="font-bold text-gray-900 text-lg">{product.bottomLength}</p>
                                            </div>
                                        )}
                                    </div>
                                </AccordionItem>
                            )}

                            {/* Specifications (custom key-value) */}
                            {product.specifications && (
                                <AccordionItem title="Specifications" icon={<span>📋</span>}>
                                    <SpecificationsTable specificationsJson={product.specifications} />
                                </AccordionItem>
                            )}

                            {/* Care Instructions */}
                            {(product.careInstructions || washCareList.length > 0) && (
                                <AccordionItem title="Care Instructions" icon={<Package className="w-4 h-4 text-orange-400" />}>
                                    {product.careInstructions && <p className="text-gray-600 mb-2">{product.careInstructions}</p>}
                                    {washCareList.length > 0 && (
                                        <ul className="space-y-1.5">
                                            {washCareList.map((inst, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-orange-500 mt-0.5 font-bold">•</span>
                                                    <span>{inst}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </AccordionItem>
                            )}

                            {/* Shipping & Returns */}
                            <AccordionItem title="Shipping & Returns" icon={<Truck className="w-4 h-4 text-orange-400" />}>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Truck className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-semibold text-gray-800">{product.freeShipping ? 'Free Shipping Included' : 'Standard Shipping'}</p>
                                            <p className="text-gray-500 text-xs mt-0.5">Dispatched within {product.shippingDays}</p>
                                        </div>
                                    </div>
                                    {product.returnEligible && (
                                        <div className="flex items-start gap-3">
                                            <Shield className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="font-semibold text-gray-800">7-Day Easy Returns</p>
                                                <p className="text-gray-500 text-xs mt-0.5">Returns and exchanges within 7 days of delivery</p>
                                            </div>
                                        </div>
                                    )}
                                    {product.countryOfOrigin && (
                                        <div className="flex items-start gap-3">
                                            <Info className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="font-semibold text-gray-800">Country of Origin</p>
                                                <p className="text-gray-500 text-xs mt-0.5">{product.countryOfOrigin}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </AccordionItem>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {product.sizeChart && (
                    <SizeChartModal isOpen={showSizeChart} onClose={() => setShowSizeChart(false)} sizeChart={product.sizeChart} />
                )}
                <ProductImageZoom images={images} selectedIndex={selectedImage} isOpen={showZoom} onClose={() => setShowZoom(false)} onNavigate={setSelectedImage} />

                {/* ── Related Products ───────────────────────────────────── */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16 border-t border-gray-100 pt-12">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
                                <p className="text-gray-500 text-sm mt-1">More from {product.category.name}</p>
                            </div>
                            <Link href={`/collections/${product.category.slug}`} className="text-sm font-semibold text-orange-600 hover:underline">View All →</Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {relatedProducts.slice(0, 6).map(prod => <ProductCard key={prod.id} product={prod} />)}
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Bar */}
            <StickyAddToCart isVisible={showStickyBar} productName={product.name} displayPrice={displayPrice} selectedSize={selectedSize} isAddingToCart={false} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
        </div>
    )
}
