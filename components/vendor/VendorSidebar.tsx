"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    TrendingUp,
    User,
    Store,
    LogOut,
    X,
} from "lucide-react";
import { useState } from "react";

const navigation = [
    { name: "Dashboard", href: "/vendor", icon: LayoutDashboard },
    { name: "Products", href: "/vendor/products", icon: Package },
    { name: "Orders", href: "/vendor/orders", icon: ShoppingBag },
    { name: "Sales", href: "/vendor/sales", icon: TrendingUp },
    { name: "Profile", href: "/vendor/profile", icon: User },
];

export default function VendorSidebar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-[#0F0F0F] text-white rounded-full shadow-2xl border border-gray-800"
            >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <LayoutDashboard className="w-6 h-6" />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full w-72 bg-[#0F0F0F] text-white transition-transform duration-300 z-50 lg:z-40 border-r border-gray-800 flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                {/* Logo */}
                <div className="p-8 border-b border-gray-800/50">
                    <Link href="/vendor" className="block">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20">
                                <Store className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-white">
                                    Vendor<span className="text-amber-500">Hub</span>
                                </h1>
                                <p className="text-xs text-gray-500 tracking-widest uppercase">Seller Portal</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/vendor" && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive
                                        ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-white border border-orange-500/20"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-amber-500" : "text-gray-500 group-hover:text-white"
                                    }`} />
                                <span className="font-medium text-sm">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-gray-800/50 bg-[#0a0a0a]">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors mb-2 text-sm"
                    >
                        <Store className="w-4 h-4" />
                        Visit Store
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
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
    );
}
