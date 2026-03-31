'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, X, ArrowLeft, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface WishlistItem {
    id: string
    productId: string
    addedAt: string
    product: {
        id: string
        name: string
        slug: string
        price: number
        salePrice: number | null
        images: string[]
        category: {
            name: string
        } | null
        stock: number
    }
}

export default function WishlistPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [items, setItems] = useState<WishlistItem[]>([])
    const [loading, setLoading] = useState(true)
    const [removingId, setRemovingId] = useState<string | null>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/saved-items')
        }
    }, [status, router])

    useEffect(() => {
        if (session?.user) {
            fetchWishlist()
        }
    }, [session])

    const fetchWishlist = async () => {
        try {
            const response = await fetch('/api/wishlist')
            if (response.ok) {
                const data = await response.json()
                setItems(data.items || [])
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error)
            toast.error('Failed to load wishlist')
        } finally {
            setLoading(false)
        }
    }

    const removeFromWishlist = async (productId: string) => {
        setRemovingId(productId)
        try {
            const response = await fetch(`/api/wishlist?productId=${productId}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                setItems(prev => prev.filter(item => item.productId !== productId))
                toast.success('Removed from wishlist')
            } else {
                toast.error('Failed to remove item')
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error)
            toast.error('Failed to remove item')
        } finally {
            setRemovingId(null)
        }
    }

    const addToCart = (productId: string) => {
        const item = items.find(i => i.productId === productId)
        if (item) {
            router.push(`/products/${item.product.slug}`)
        }
    }

    /* ─── Loading skeleton ───────────────────────────────── */
    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gray-50/80 py-6 md:py-10">
                <div className="container mx-auto px-4">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                        <div className="h-6 w-36 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                                <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
                                <div className="p-3 space-y-2">
                                    <div className="h-3 w-14 bg-gray-100 rounded animate-pulse" />
                                    <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                                    <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                                    <div className="h-5 w-20 bg-gray-100 rounded animate-pulse mt-1" />
                                    <div className="h-8 w-full bg-gray-100 rounded-lg animate-pulse mt-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!session) return null

    /* ─── Main render ────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-gray-50/80 py-6 md:py-10">
            <div className="container mx-auto px-4">

                {/* ── Header ─────────────────────────────── */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center text-xs text-gray-400 hover:text-gold mb-3 transition-colors group"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-0.5 transition-transform" />
                        Continue Shopping
                    </Link>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-coral to-rose flex items-center justify-center shadow-sm">
                                <Heart className="w-4 h-4 text-white fill-white" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-luxury-black leading-tight">
                                    My Wishlist
                                    <span className="text-sm font-normal text-gray-400 ml-2">
                                        ({items.length})
                                    </span>
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Empty state ─────────────────────────── */}
                {items.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-10 md:p-16 text-center max-w-lg mx-auto">
                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5">
                            <Heart className="w-9 h-9 text-gray-300" />
                        </div>
                        <h2 className="text-lg md:text-xl font-bold text-luxury-black mb-1.5">
                            Nothing saved yet
                        </h2>
                        <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
                            Tap the ❤️ on any product you love — it&apos;ll show up here.
                        </p>
                        <Link href="/products">
                            <Button className="bg-gradient-to-r from-coral to-rose hover:from-coral-dark hover:to-rose-dark text-white rounded-full px-6 shadow-sm">
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                Browse Products
                            </Button>
                        </Link>
                    </div>
                ) : (
                    /* ── Product grid ── same layout as /products page */
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                        {items.map((item) => {
                            const displayPrice = item.product.salePrice || item.product.price
                            const hasDiscount = item.product.salePrice && item.product.salePrice < item.product.price
                            const discountPercent = hasDiscount
                                ? Math.round(((item.product.price - (item.product.salePrice || 0)) / item.product.price) * 100)
                                : 0
                            const isRemoving = removingId === item.productId
                            const outOfStock = item.product.stock === 0

                            return (
                                <div
                                    key={item.id}
                                    className={`bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col transition-all duration-300 group
                                        ${isRemoving ? 'opacity-40 scale-[0.97] pointer-events-none' : 'hover:shadow-md hover:border-gold/20'}
                                    `}
                                >
                                    {/* ── Image ──────────────────────── */}
                                    <a
                                        href={`/products/${item.product.slug}`}
                                        className="block relative overflow-hidden"
                                    >
                                        <div className="aspect-[3/4] relative bg-gray-50">
                                            <Image
                                                src={item.product.images[0] || '/placeholder-product.jpg'}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,20vw"
                                            />

                                            {/* Discount badge */}
                                            {discountPercent > 0 && (
                                                <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                    {discountPercent}% OFF
                                                </span>
                                            )}

                                            {/* Out of stock overlay */}
                                            {outOfStock && (
                                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                                    <span className="text-[11px] font-semibold text-gray-600 bg-white border border-gray-200 rounded-full px-3 py-1">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Remove btn — always visible on mobile, hover on desktop */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                removeFromWishlist(item.productId)
                                            }}
                                            disabled={isRemoving}
                                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center
                                                       sm:opacity-0 sm:group-hover:opacity-100 transition-opacity
                                                       hover:bg-red-50 active:scale-90 z-10"
                                            aria-label="Remove from wishlist"
                                        >
                                            <X className="w-3.5 h-3.5 text-gray-500 hover:text-red-500 transition-colors" />
                                        </button>
                                    </a>

                                    {/* ── Info ───────────────────────── */}
                                    <div className="p-2.5 sm:p-3 flex flex-col flex-1">
                                        {/* Category */}
                                        {item.product.category?.name && (
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5 truncate">
                                                {item.product.category.name}
                                            </p>
                                        )}

                                        {/* Title */}
                                        <a href={`/products/${item.product.slug}`} className="flex-1">
                                            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 mb-1.5 hover:text-coral transition-colors leading-snug">
                                                {item.product.name}
                                            </h3>
                                        </a>

                                        {/* Price row */}
                                        <div className="flex items-baseline gap-1.5 mb-2">
                                            <span className="text-sm sm:text-base font-bold text-luxury-black">
                                                ₹{displayPrice.toLocaleString('en-IN')}
                                            </span>
                                            {hasDiscount && (
                                                <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                                                    ₹{item.product.price.toLocaleString('en-IN')}
                                                </span>
                                            )}
                                        </div>

                                        {/* CTA */}
                                        <Button
                                            onClick={() => addToCart(item.productId)}
                                            disabled={outOfStock}
                                            size="sm"
                                            className="w-full mt-auto border-2 border-gray-900 bg-transparent text-gray-900
                                                       hover:bg-gray-900 hover:text-white
                                                       active:bg-gray-900 active:text-white
                                                       disabled:border-gray-200 disabled:text-gray-300 disabled:bg-transparent
                                                       text-[11px] sm:text-xs py-1.5 h-8 sm:h-9 rounded-lg transition-all"
                                            variant="outline"
                                        >
                                            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 flex-shrink-0" />
                                            {outOfStock ? 'Sold Out' : 'Move to Bag'}
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
