import './globals.css'
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from 'sonner'
import { SessionProvider } from '@/components/providers/session-provider'
import { CartProvider } from '@/lib/cart-context'
import { ToastProvider } from '@/lib/toast-context'
import { ConditionalLayout } from '@/components/layout/ConditionalLayout'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-body',
    display: 'swap',
})

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-heading',
    display: 'swap',
})

export const metadata: Metadata = {
    title: {
        default: 'Glanzoo — Premium Ethnic Wear for Women',
        template: '%s | Glanzoo',
    },
    description:
        'Shop beautifully crafted ethnic wear — co-ord sets, kurti pant sets & one-piece dresses. Free shipping on ₹999+. Easy 7-day returns.',
    keywords: ['ethnic wear', 'women fashion', 'co-ord sets', 'kurti pant sets', 'salwar suits', 'Indian clothing', 'Glanzoo'],
    authors: [{ name: 'Glanzoo' }],
    creator: 'Glanzoo',
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: '/',
        siteName: 'Glanzoo',
        title: 'Glanzoo — Premium Ethnic Wear for Women',
        description: 'Shop beautifully crafted ethnic wear — co-ord sets, kurti pant sets & one-piece dresses.',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Glanzoo Premium Ethnic Wear',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Glanzoo — Premium Ethnic Wear for Women',
        description: 'Shop beautifully crafted ethnic wear — co-ord sets, kurti pant sets & one-piece dresses.',
        images: ['/og-image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
            <body className="font-body antialiased" suppressHydrationWarning>
                <SessionProvider>
                    <ToastProvider>
                        <CartProvider>
                            <ConditionalLayout>
                                {children}
                            </ConditionalLayout>
                            <Toaster position="top-center" style={{ zIndex: 999999 }} toastOptions={{ style: { zIndex: 999999 } }} />
                        </CartProvider>
                    </ToastProvider>
                </SessionProvider>
            </body>
        </html>
    )
}