'use client'

import Link from 'next/link'
import { ShoppingCart, User, Search, Menu, X, Heart, ChevronDown, ChevronRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useCart } from '@/lib/cart-context'
import { SearchBar } from '@/components/search/SearchBar'
import { usePathname } from 'next/navigation'

interface SubCategory {
    id: string
    name: string
    slug: string
    icon?: string | null
    active: boolean
    parentId?: string | null
    sortOrder: number
}

interface NavCategory {
    id: string
    name: string
    slug: string
    icon?: string | null
    active: boolean
    parentId?: string | null
    sortOrder: number
    children: SubCategory[]
}

export function Header() {
    const { data: session } = useSession()
    const { items } = useCart()
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [wishlistCount, setWishlistCount] = useState(0)
    const [mounted, setMounted] = useState(false)
    const [navCategories, setNavCategories] = useState<NavCategory[]>([])
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const [mobileExpanded, setMobileExpanded] = useState<Set<string>>(new Set())
    const [scrolled, setScrolled] = useState(false)
    const [announcementVisible, setAnnouncementVisible] = useState(true)
    const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Memoized cart count
    const cartItemCount = useMemo(
        () => items.reduce((total, item) => total + item.quantity, 0),
        [items]
    )

    useEffect(() => {
        setMounted(true)
    }, [])

    // Scroll-aware shadow
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Escape key closes mobile menu
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileMenuOpen(false)
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [])

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false)
    }, [pathname])

    // Fetch active categories for navigation and build tree client-side
    useEffect(() => {
        fetch('/api/admin/categories?public=true')
            .then(res => res.json())
            .then((flat: SubCategory[]) => {
                if (!Array.isArray(flat)) { setNavCategories([]); return }
                // Build tree from flat list
                const map = new Map<string, NavCategory>()
                const roots: NavCategory[] = []
                for (const cat of flat) {
                    map.set(cat.id, { ...cat, children: [] })
                }
                for (const cat of flat) {
                    if (cat.parentId && map.has(cat.parentId)) {
                        map.get(cat.parentId)!.children.push(cat)
                    } else if (!cat.parentId) {
                        roots.push(map.get(cat.id)!)
                    }
                }
                roots.sort((a, b) => a.sortOrder - b.sortOrder)
                roots.forEach(r => r.children.sort((a, b) => a.sortOrder - b.sortOrder))
                setNavCategories(roots)
            })
            .catch(() => setNavCategories([]))
    }, [])

    useEffect(() => {
        if (session?.user) {
            fetch('/api/wishlist')
                .then(res => res.json())
                .then(data => setWishlistCount(data.items?.length || 0))
                .catch(() => setWishlistCount(0))
        } else {
            setWishlistCount(0)
        }
    }, [session])

    const handleDropdownEnter = (id: string) => {
        if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current)
        setOpenDropdown(id)
    }

    const handleDropdownLeave = () => {
        dropdownTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 150)
    }

    const toggleMobileExpand = (id: string) => {
        setMobileExpanded(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/'
        return pathname.startsWith(href)
    }

    // Links shown BEFORE category list
    const leadingLinks = [
        { name: 'Sale', href: '/products?sale=true', highlight: true },
        { name: 'All Products', href: '/products', icon: '🛍️' },
    ]

    // Links shown AFTER category list
    const trailingLinks = [
        { name: 'New Arrivals', href: '/products?sort=newest' },
    ]

    return (
        <>
            {/* Announcement Bar */}
            {announcementVisible && (
                <div className="bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-white text-xs py-2 px-4 text-center relative">
                    <span className="font-medium tracking-wide">
                        🎉 FREE shipping on orders above ₹999 · Easy 7-day returns · COD available
                    </span>
                    <button
                        onClick={() => setAnnouncementVisible(false)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
                        aria-label="Dismiss announcement"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            <header
                className={`sticky top-0 z-50 w-full bg-white/98 backdrop-blur-lg border-b border-gray-200 transition-shadow duration-300 ${scrolled ? 'shadow-lg' : 'shadow-sm'
                    }`}
            >
                {/* Top bar */}
                <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center space-x-2 group flex-shrink-0"
                        aria-label="Glanzoo — home"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-orange-400 to-amber-400 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                <span className="text-white font-bold text-xl">G</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400 bg-clip-text text-transparent hidden sm:block">
                                Glanzoo
                            </span>
                        </div>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:block flex-1 max-w-xl">
                        <SearchBar />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 md:space-x-2">
                        {/* Mobile Search */}
                        <Link href="/search" className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-orange-50 hover:text-orange-500 transition-colors"
                                aria-label="Search"
                            >
                                <Search className="h-5 w-5" />
                            </Button>
                        </Link>

                        {/* Wishlist — always visible, guests redirected to login */}
                        <Link href={session ? '/wishlist' : '/login'}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-rose-50 hover:text-rose-500 transition-colors relative"
                                aria-label="Wishlist"
                            >
                                <Heart className="h-5 w-5" />
                                {mounted && wishlistCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs rounded-full flex items-center justify-center shadow-md font-medium">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Button>
                        </Link>

                        {/* Cart */}
                        <Link href="/cart">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-orange-50 hover:text-orange-500 transition-colors relative"
                                aria-label="Shopping cart"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {mounted && cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs rounded-full flex items-center justify-center shadow-md font-medium">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Button>
                        </Link>

                        {/* Account */}
                        {session ? (
                            <Link href="/account">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-orange-50 hover:text-orange-500 transition-colors"
                                    aria-label="My account"
                                >
                                    <User className="h-5 w-5" />
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login" className="hidden md:block">
                                <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md hover:shadow-lg transition-all text-xs px-4"
                                >
                                    Sign In
                                </Button>
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden hover:bg-orange-50"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>

                {/* Mega-Menu Nav Bar — Desktop */}
                <div className="hidden lg:block border-t border-gray-100 bg-white">
                    <div className="container mx-auto px-4">
                        <nav
                            className="flex items-center gap-1 h-11"
                            aria-label="Main navigation"
                        >
                            {/* Leading links: Sale + All Products */}
                            {leadingLinks.map(link => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${link.highlight
                                        ? 'text-red-600 font-semibold hover:bg-red-50 hover:text-red-700'
                                        : isActive(link.href)
                                            ? 'text-orange-600 bg-orange-50 font-semibold'
                                            : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                                        }`}
                                >
                                    {link.name}
                                    {link.highlight && (
                                        <span className="ml-1.5 inline-block text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold leading-none">
                                            HOT
                                        </span>
                                    )}
                                </Link>
                            ))}

                            <div className="w-px h-5 bg-gray-200 mx-1" />

                            {navCategories.map(cat => (
                                <div
                                    key={cat.id}
                                    className="relative"
                                    onMouseEnter={() => handleDropdownEnter(cat.id)}
                                    onMouseLeave={handleDropdownLeave}
                                >
                                    <Link
                                        href={`/category/${cat.slug}`}
                                        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${isActive(`/category/${cat.slug}`)
                                            ? 'text-orange-600 bg-orange-50 font-semibold'
                                            : openDropdown === cat.id
                                                ? 'text-orange-600 bg-orange-50'
                                                : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                                            }`}
                                    >
                                        {cat.name}
                                        {cat.children.length > 0 && (
                                            <ChevronDown
                                                className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === cat.id ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        )}
                                    </Link>

                                    {/* Dropdown */}
                                    {cat.children.length > 0 && openDropdown === cat.id && (
                                        <div
                                            className="absolute top-full left-0 mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 min-w-[200px] z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                                            onMouseEnter={() => handleDropdownEnter(cat.id)}
                                            onMouseLeave={handleDropdownLeave}
                                        >
                                            <div className="mb-2 pb-2 border-b border-gray-100">
                                                <Link
                                                    href={`/category/${cat.slug}`}
                                                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-900 hover:text-orange-600 rounded-xl hover:bg-orange-50 transition-colors"
                                                >
                                                    {cat.icon && <span>{cat.icon}</span>}
                                                    All {cat.name}
                                                    <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                                                </Link>
                                            </div>
                                            <div className="space-y-0.5">
                                                {cat.children.filter(sub => !sub.name.startsWith('All ')).map(sub => (
                                                    <Link
                                                        key={sub.id}
                                                        href={`/category/${sub.slug}`}
                                                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-colors ${isActive(`/category/${sub.slug}`)
                                                            ? 'text-orange-600 bg-orange-50 font-medium'
                                                            : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                                                            }`}
                                                    >
                                                        {sub.icon && <span className="text-sm">{sub.icon}</span>}
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="w-px h-5 bg-gray-200 mx-1" />

                            {/* Trailing links: New Arrivals */}
                            {trailingLinks.map(link => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${isActive(link.href)
                                        ? 'text-orange-600 bg-orange-50 font-semibold'
                                        : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                    </div>{/* end container */}
                </div>{/* end hidden lg:block desktop nav */}

                {/* Mobile Menu Backdrop */}
                {mobileMenuOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                        style={{ top: 'var(--header-height, 64px)' }}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div
                        className="lg:hidden border-t border-gray-200 bg-white shadow-2xl max-h-[80vh] overflow-y-auto relative z-50"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigation menu"
                    >
                        <div className="px-4 py-3">
                            <SearchBar />
                        </div>
                        {/* Mobile Menu */}
                        <nav className="px-4 pb-4 space-y-1" aria-label="Mobile navigation">
                            {/* Leading links: Sale + All Products */}
                            {leadingLinks.map(link => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`flex items-center gap-2 px-3 py-3 text-sm font-medium rounded-xl transition-colors ${link.highlight
                                        ? 'text-red-600 font-semibold hover:bg-red-50'
                                        : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                    {link.highlight && (
                                        <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold leading-none">
                                            HOT
                                        </span>
                                    )}
                                </Link>
                            ))}

                            <div className="h-px bg-gray-100 my-1" />

                            {navCategories.map(cat => (
                                <div key={cat.id}>
                                    <div className="flex items-center">
                                        <Link
                                            href={`/category/${cat.slug}`}
                                            className={`flex-1 flex items-center gap-2 px-3 py-3 text-sm font-semibold rounded-xl transition-colors ${isActive(`/category/${cat.slug}`)
                                                ? 'text-orange-600 bg-orange-50'
                                                : 'text-gray-800 hover:text-orange-600 hover:bg-orange-50'
                                                }`}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {cat.icon && <span>{cat.icon}</span>}
                                            {cat.name}
                                        </Link>
                                        {cat.children.length > 0 && (
                                            <button
                                                onClick={() => toggleMobileExpand(cat.id)}
                                                className="p-2 text-gray-400 hover:text-orange-600 rounded-xl transition-colors"
                                                aria-label={`${mobileExpanded.has(cat.id) ? 'Collapse' : 'Expand'} ${cat.name}`}
                                            >
                                                <ChevronDown
                                                    className={`w-4 h-4 transition-transform ${mobileExpanded.has(cat.id) ? 'rotate-180' : ''
                                                        }`}
                                                />
                                            </button>
                                        )}
                                    </div>
                                    {mobileExpanded.has(cat.id) && cat.children.length > 0 && (
                                        <div className="pl-8 space-y-0.5 pb-2">
                                            {cat.children.filter(sub => !sub.name.startsWith('All ')).map(sub => (
                                                <Link
                                                    key={sub.id}
                                                    href={`/category/${sub.slug}`}
                                                    className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl transition-colors ${isActive(`/category/${sub.slug}`)
                                                        ? 'text-orange-600 bg-orange-50 font-medium'
                                                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                                                        }`}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    {sub.icon && <span className="text-sm">{sub.icon}</span>}
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="h-px bg-gray-100 my-2" />

                            {/* Trailing links: New Arrivals */}
                            {trailingLinks.map(link => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`flex items-center gap-2 px-3 py-3 text-sm font-medium rounded-xl transition-colors text-gray-700 hover:text-orange-600 hover:bg-orange-50`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {!session && (
                                <div className="pt-2">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <p className="text-center text-xs text-gray-400 mt-2">
                                        New here?{' '}
                                        <Link href="/register" className="text-orange-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                                            Create account
                                        </Link>
                                    </p>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </header>
        </>
    )
}
