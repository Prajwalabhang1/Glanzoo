'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Store,
    Users,
    MessageSquare,
    Tag,
    Settings,
    X,
    ChevronRight,
    LogOut,
    FolderTree,
    Image as ImageIcon
} from 'lucide-react'
import { useState } from 'react'
import { signOut } from 'next-auth/react'

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Vendors', href: '/admin/vendors', icon: Store },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
    { name: 'Coupons', href: '/admin/coupons', icon: Tag },
    { name: 'Banners', href: '/admin/banners', icon: ImageIcon },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
]


export function AdminSidebar() {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-black text-white rounded-full shadow-2xl border border-gray-800"
            >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <LayoutDashboard className="w-6 h-6" />}
            </button>

            {/* Sidebar Container */}
            <aside
                className={`fixed left-0 top-0 h-full w-72 bg-[#0F0F0F] text-white transition-transform duration-300 z-50 lg:z-40 border-r border-gray-800 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Logo Area */}
                <div className="p-8 border-b border-gray-800/50">
                    <Link href="/admin" className="block">
                        <h1 className="text-2xl font-heading font-bold tracking-tight text-white">
                            GLANZOO<span className="text-amber-500">.</span>
                        </h1>
                        <p className="text-xs text-gray-500 mt-1 tracking-widest uppercase">Admin Console</p>
                    </Link>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-4">
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== '/admin' && pathname.startsWith(item.href))

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-white/5 text-white shadow-inner border border-white/5'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-amber-500' : 'text-gray-500 group-hover:text-white'
                                            }`} />
                                        <span className="font-medium text-sm">{item.name}</span>
                                    </div>
                                    {isActive && <ChevronRight className="w-4 h-4 text-amber-500" />}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* User / Footer Area */}
                <div className="p-4 border-t border-gray-800/50 bg-[#0a0a0a]">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-sm shadow-lg shadow-amber-900/20">
                            A
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">Administrator</p>
                            <p className="text-xs text-gray-500 truncate">admin@glanzoo.com</p>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    )
}
