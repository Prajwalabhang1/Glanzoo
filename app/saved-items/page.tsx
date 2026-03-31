'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Trash2, ArrowLeft, Sparkles } from 'lucide-react'
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
                // Small delay for animation
                setTimeout(() => {
                    setItems(prev => prev.filter(item => item.productId !== productId))
                    setRemovingId(null)
                    toast.success('Removed from wishlist')
                }, 300)
            } else {
                setRemovingId(null)
                toast.error('Failed to remove item')
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error)
            setRemovingId(null)
            toast.error('Failed to remove item')
        }
    }

    const addToCart = (productId: string) => {
        const item = items.find(i => i.productId === productId)
        if (item) {
            router.push(`/products/${item.product.slug}`)
        }
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-6 md:py-10">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Header skeleton */}
                    <div className="mb-6">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                            <div>
                                <div className="h-7 w-40 bg-gray-200 rounded animate-pulse mb-1" />
                                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                    {/* Grid skeleton */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl overflow-hidden">
                                <div className="aspect-square bg-gray-200 animate-pulse" />
                                <div className="p-3">
                                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-1" />
                                    <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-3" />
                                    <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 md:py-10">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gold transition-colors mb-3 group">
                        <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
                        Back to Shopping
                    </Link>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center shadow-sm">
                                <Heart className="w-5 h-5 text-white fill-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-luxury-black">My Wishlist</h1>
                                <p className="text-sm text-gray-500">
                                    {items.length} {items.length === 1 ? 'item' : 'items'} saved
                                </p>
                            </div>
                        </div>
                        {items.length > 0 && (
                            <Link href="/products">
                                <Button variant="outline" size="sm" className="hidden sm:flex text-xs border-gold/30 text-gold hover:bg-gold/5">
                                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                    Discover More
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Wishlist Items */}
                {items.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-10 md:p-16 text-center border border-gray-100">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <Heart className="w-10 h-10 text-gray-300" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-luxury-black mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-6 text-sm max-w-sm mx-auto">
                            Tap the heart icon on any product to save it here for later
                        </p>
                        <Link href="/products">
                            <Button className="bg-gradient-to-r from-gold to-amber-500 hover:from-gold-dark hover:to-amber-600 text-white shadow-sm">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Start Shopping
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {items.map((item) => {
                            const discountPercent = item.product.salePrice
                                ? Math.round(((item.product.price - item.product.salePrice) / item.product.price) * 100)
                                : 0
                            const isRemoving = removingId === item.productId

                            return (
                                <div
                                    key={item.id}
                                    className={`bg-white rounded-xl overflow-hidden border border-gray-100 group transition-all duration-300 ${
                                        isRemoving
                                            ? 'opacity-0 scale-95'
                                            : 'opacity-100 scale-100 hover:shadow-md hover:border-gold/20'
                                    }`}
                                >
                                    {/* Image */}
                                    <a href={`/products/${item.product.slug}`} className="block relative">
                                        <div className="aspect-square relative bg-gray-50 overflow-hidden">
                                            <Image
                                                src={item.product.images[0] || '/placeholder-product.jpg'}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            />
                                            {discountPercent > 0 && (
                                                <div className="absolute top-2 left-2 bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                    {discountPercent}% OFF
                                                </div>
                                            )}
                                            {item.product.stock === 0 && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <span className="bg-white text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Remove button - top right corner */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                removeFromWishlist(item.productId)
                                            }}
                                            disabled={isRemoving}
                                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-10"
                                            aria-label="Remove from wishlist"
                                        >
                                            <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-500 transition-colors" />
                                        </button>
                                    </a>

                                    {/* Info */}
                                    <div className="p-2.5 sm:p-3">
                                        {item.product.category?.name && (
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5 truncate">
                                                {item.product.category.name}
                                            </p>
                                        )}
                                        <a href={`/products/${item.product.slug}`}>
                                            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 line-clamp-2 hover:text-gold transition-colors leading-snug">
                                                {item.product.name}
                                            </h3>
                                        </a>

                                        {/* Price */}
                                        <div className="flex items-center gap-1.5 mb-2.5">
                                            <span className="text-sm sm:text-base font-bold text-luxury-black">
                                                ₹{(item.product.salePrice || item.product.price).toLocaleString('en-IN')}
                                            </span>
                                            {item.product.salePrice && (
                                                <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                                                    ₹{item.product.price.toLocaleString('en-IN')}
                                                </span>
                                            )}
                                        </div>

                                        {/* CTA */}
                                        <Button
                                            onClick={() => addToCart(item.productId)}
                                            disabled={item.product.stock === 0}
                                            className="w-full bg-luxury-black hover:bg-luxury-charcoal text-white text-[11px] sm:text-xs py-1.5 h-8 sm:h-9 rounded-lg transition-all"
                                            size="sm"
                                        >
                                            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" />
                                            {item.product.stock === 0 ? 'Out of Stock' : 'View & Add to Cart'}
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
