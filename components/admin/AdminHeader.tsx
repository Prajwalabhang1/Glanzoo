'use client'

import { useState, useEffect } from 'react'
import { Bell, Search } from 'lucide-react'

interface AdminHeaderProps {
    user: {
        name?: string | null
        email?: string | null
        image?: string | null
    }
}

export function AdminHeader({ user }: AdminHeaderProps) {
    const [date, setDate] = useState('')

    useEffect(() => {
        setDate(new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }))
    }, [])

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 h-20 flex items-center justify-between">
            {/* Left: Search / Context */}
            <div className="flex items-center gap-4 flex-1">
                <div className="relative max-w-md w-full hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <button className="relative p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Mobile Menu Trigger (Visible on mobile only, logic handled in sidebar but placeholder here if needed) */}

                <div className="h-8 w-px bg-gray-100 mx-2 hidden md:block"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-gray-900">{user.name || 'Admin'}</p>
                        <p className="text-xs text-gray-500">{date}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-sm overflow-hidden relative">
                        {/* Placeholder avatar if image missing */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white font-medium">
                            {user.name?.charAt(0) || 'A'}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
