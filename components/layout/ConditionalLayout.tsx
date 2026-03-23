'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'

// Routes where Header/Footer should be hidden (auth pages, admin/vendor dashboards)
const HIDDEN_LAYOUT_PREFIXES = ['/admin', '/vendor']

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const hideLayout = HIDDEN_LAYOUT_PREFIXES.some(prefix => pathname.startsWith(prefix))

    if (hideLayout) {
        return <>{children}</>
    }

    return (
        <>
            <Header />
            <main className="pb-16 md:pb-0">{children}</main>
            <Footer />
            <BottomNav />
        </>
    )
}
