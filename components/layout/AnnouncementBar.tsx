'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

interface BarData {
    text: string
    link?: string | null
    linkText?: string | null
    bgColor: string
    textColor: string
    isVisible: boolean
}

export function AnnouncementBar() {
    const [bar, setBar] = useState<BarData | null>(null)
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        fetch('/api/admin/announcement')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.isVisible) setBar(data)
            })
            .catch(() => {
                // Fallback default bar
                setBar({
                    text: '🎉 Free shipping on orders above ₹999!',
                    link: null,
                    linkText: null,
                    bgColor: '#1a1a1a',
                    textColor: '#d4af37',
                    isVisible: true,
                })
            })
    }, [])

    if (!bar || dismissed) return null

    return (
        <div
            className="w-full py-2 px-4 text-center text-sm font-medium relative z-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: bar.bgColor, color: bar.textColor }}
        >
            <span>{bar.text}</span>
            {bar.link && bar.linkText && (
                <Link
                    href={bar.link}
                    className="underline underline-offset-2 font-semibold hover:opacity-80 transition-opacity whitespace-nowrap ml-1"
                    style={{ color: bar.textColor }}
                >
                    {bar.linkText}
                </Link>
            )}
            <button
                onClick={() => setDismissed(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity p-1"
                aria-label="Dismiss announcement"
            >
                <X className="w-3.5 h-3.5" style={{ color: bar.textColor }} />
            </button>
        </div>
    )
}
