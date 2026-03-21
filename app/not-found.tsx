import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-lg w-full text-center">
                <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 mb-4">
                    404
                </h1>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Page not found
                </h2>
                <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    Let&apos;s get you back on track.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-md"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-orange-300 hover:text-orange-600 transition-all"
                    >
                        <Search className="w-4 h-4" />
                        Browse Products
                    </Link>
                </div>
            </div>
        </div>
    )
}
