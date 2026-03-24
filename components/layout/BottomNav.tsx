'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ShoppingCart, Heart, User } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/products', icon: Search, label: 'Shop' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart', showBadge: true },
    { href: '/saved-items', icon: Heart, label: 'Wishlist' },
    { href: '/my-account', icon: User, label: 'Account' },
]

export function BottomNav() {
    const pathname = usePathname()
    const { items } = useCart()
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

    // Only hide on strictly administrative or checkout pages. Force persistence everywhere else.
    if (
        pathname.startsWith('/admin') ||
        pathname.startsWith('/vendor') ||
        pathname.startsWith('/checkout')
    ) return null

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-inset-bottom">
            <div className="flex items-center justify-around py-2">
                {navItems.map(({ href, icon: Icon, label, showBadge }) => {
                    const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
                    return (
                        <a
                            key={href}
                            href={href}
                            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${isActive
                                    ? 'text-orange-500'
                                    : 'text-gray-500 active:text-orange-400'
                                }`}
                        >
                            <div className="relative">
                                <Icon className={`w-5 h-5 transition-all ${isActive ? 'scale-110' : ''}`} />
                                {showBadge && cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] font-medium ${isActive ? 'text-orange-500' : 'text-gray-500'}`}>
                                {label}
                            </span>
                            {isActive && (
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full" />
                            )}
                        </a>
                    )
                })}
            </div>
        </nav>
    )
}
