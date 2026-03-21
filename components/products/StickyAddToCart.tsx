'use client'

import { ShoppingCart, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface StickyAddToCartProps {
    isVisible: boolean
    productName: string
    displayPrice: number
    selectedSize: string
    isAddingToCart: boolean
    onAddToCart: () => void
    onBuyNow: () => void
}

export function StickyAddToCart({
    isVisible,
    productName,
    displayPrice,
    selectedSize,
    isAddingToCart,
    onAddToCart,
    onBuyNow,
}: StickyAddToCartProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl px-4 py-3 safe-area-inset-bottom"
                >
                    <div className="container mx-auto max-w-4xl flex items-center gap-3">
                        {/* Product name + size + price */}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 truncate">{productName}</p>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 text-sm">
                                    ₹{displayPrice.toLocaleString('en-IN')}
                                </span>
                                {selectedSize && (
                                    <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-full font-medium">
                                        Size: {selectedSize}
                                    </span>
                                )}
                                {!selectedSize && (
                                    <span className="text-xs text-amber-600 font-medium">
                                        ← Select a size
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 flex-shrink-0">
                            <button
                                onClick={onAddToCart}
                                disabled={isAddingToCart}
                                className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-gray-900 text-gray-900 rounded-xl text-sm font-semibold hover:bg-gray-900 hover:text-white transition-all duration-200 disabled:opacity-60"
                            >
                                <ShoppingCart className="w-4 h-4 flex-shrink-0" />
                                <span className="hidden sm:inline">Add to Cart</span>
                                <span className="sm:hidden">Cart</span>
                            </button>
                            <button
                                onClick={onBuyNow}
                                disabled={isAddingToCart}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-sm font-semibold shadow-md transition-all duration-200 disabled:opacity-60"
                            >
                                <Zap className="w-4 h-4 fill-white flex-shrink-0" />
                                <span className="hidden sm:inline">Buy Now</span>
                                <span className="sm:hidden">Buy</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
