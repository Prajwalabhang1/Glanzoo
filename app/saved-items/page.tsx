'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react'
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
                setItems(items.filter(item => item.productId !== productId))
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
        // Redirect to product page to select size
        const item = items.find(i => i.productId === productId)
        if (item) {
            router.push(`/products/${item.product.slug}`)
        }
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 md:py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Shopping
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                            <Heart className="w-6 h-6 text-white fill-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold">My Wishlist</h1>
                            <p className="text-gray-600">
                                {items.length} {items.length === 1 ? 'item' : 'items'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Wishlist Items */}
                {items.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-600 mb-6">Save items you love for later!</p>
                        <Link href="/products">
                            <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                                Start Shopping
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => {
                            const discountPercent = item.product.salePrice
                                ? Math.round(((item.product.price - item.product.salePrice) / item.product.price) * 100)
                                : 0

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <a href={`/products/${item.product.slug}`} className="block relative">
                                        <div className="aspect-[3/4] relative bg-gray-100">
                                            <Image
                                                src={item.product.images[0] || '/placeholder-product.jpg'}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                            {discountPercent > 0 && (
                                                <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                    {discountPercent}% OFF
                                                </div>
                                            )}
                                        </div>
                                    </a>

                                    <div className="p-4">
                                        <a href={`/products/${item.product.slug}`}>
                                            <h3 className="font-semibold text-gray-900 mb-1 hover:text-orange-600 line-clamp-2">
                                                {item.product.name}
                                            </h3>
                                        </a>
                                        {item.product.category?.name && (
                                            <p className="text-sm text-gray-600 mb-3">{item.product.category.name}</p>
                                        )}

                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-xl font-bold text-gray-900">
                                                ₹{(item.product.salePrice || item.product.price).toLocaleString()}
                                            </span>
                                            {item.product.salePrice && (
                                                <span className="text-sm text-gray-500 line-through">
                                                    ₹{item.product.price.toLocaleString()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => addToCart(item.productId)}
                                                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                                                size="sm"
                                            >
                                                <ShoppingCart className="w-4 h-4 mr-2" />
                                                Add to Cart
                                            </Button>
                                            <Button
                                                onClick={() => removeFromWishlist(item.productId)}
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:bg-red-50"
                                                disabled={removingId === item.productId}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        {item.product.stock === 0 && (
                                            <p className="text-sm text-red-600 mt-2">Out of Stock</p>
                                        )}
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
