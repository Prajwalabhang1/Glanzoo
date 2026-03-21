'use client'

import { useCart } from '@/lib/cart-context'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CartPage() {
    const { items, updateQuantity, removeItem, subtotal } = useCart()

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="w-28 h-28 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-8">
                            <ShoppingBag className="w-14 h-14 text-orange-500" />
                        </div>
                        <h1 className="text-3xl font-bold mb-3">Your Cart is Empty</h1>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Looks like you haven&apos;t added anything yet. Explore our beautiful collections and find something you love!
                        </p>
                        <Link href="/products">
                            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all">
                                Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>

                        {/* Feature highlights */}
                        <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-gray-200">
                            <div className="text-center">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <span className="text-green-600 text-sm">🚚</span>
                                </div>
                                <p className="text-xs text-gray-500 font-medium">Free Shipping<br />on ₹999+</p>
                            </div>
                            <div className="text-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <span className="text-blue-600 text-sm">↩️</span>
                                </div>
                                <p className="text-xs text-gray-500 font-medium">Easy Returns<br />within 7 days</p>
                            </div>
                            <div className="text-center">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <span className="text-purple-600 text-sm">🔒</span>
                                </div>
                                <p className="text-xs text-gray-500 font-medium">Secure<br />Payments</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const shipping = subtotal >= 999 ? 0 : 100
    const total = subtotal + shipping

    return (
        <div className="min-h-screen bg-gray-50 py-8 md:py-12">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Shopping Cart</h1>
                    <p className="text-gray-600">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => {
                            const displayPrice = item.salePrice || item.price

                            return (
                                <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow">
                                    <div className="flex gap-4">
                                        {/* Product Image */}
                                        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1 min-w-0 mr-4">
                                                    <Link href={`/products/${item.slug}`}>
                                                        <h3 className="font-semibold text-lg hover:text-orange-600 transition-colors line-clamp-2">
                                                            {item.name}
                                                        </h3>
                                                    </Link>
                                                    {item.size && (
                                                        <p className="text-sm text-gray-500 mt-1">Size: {item.size}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-orange-500 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="font-medium w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-orange-500 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={item.quantity >= item.maxQuantity}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-gray-900">
                                                        ₹{(displayPrice * item.quantity).toLocaleString()}
                                                    </p>
                                                    {item.salePrice && item.salePrice < item.price && (
                                                        <p className="text-sm text-gray-400 line-through">
                                                            ₹{(item.price * item.quantity).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {!item.inStock && (
                                                <p className="text-sm text-red-500 mt-2">Out of stock</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-medium">
                                        {shipping === 0 ? (
                                            <span className="text-green-600">FREE</span>
                                        ) : (
                                            `₹${shipping}`
                                        )}
                                    </span>
                                </div>
                                {subtotal < 999 && shipping > 0 && (
                                    <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                                        Add ₹{(999 - subtotal).toLocaleString()} more for FREE shipping!
                                    </p>
                                )}
                                <div className="border-t pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold">Total</span>
                                        <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                            ₹{total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {items.some(k => !k.inStock || k.quantity > k.maxQuantity) && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                                    <ShoppingBag className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-red-600 font-medium">Some items in your cart are currently unavailable or have insufficient stock. Please remove them to proceed.</p>
                                </div>
                            )}

                            <Link href="/checkout" className={items.some(k => !k.inStock || k.quantity > k.maxQuantity) ? 'pointer-events-none opacity-50' : ''}>
                                <Button
                                    disabled={items.some(k => !k.inStock || k.quantity > k.maxQuantity)}
                                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>

                            <Link href="/products">
                                <Button variant="outline" className="w-full mt-3 border-orange-300 hover:bg-orange-50">
                                    Continue Shopping
                                </Button>
                            </Link>

                            {/* Trust Badges */}
                            <div className="mt-6 pt-6 border-t space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-green-600">✓</span>
                                    </div>
                                    <span>Secure checkout</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-green-600">✓</span>
                                    </div>
                                    <span>7-day easy returns</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-green-600">✓</span>
                                    </div>
                                    <span>Free shipping on ₹999+</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
