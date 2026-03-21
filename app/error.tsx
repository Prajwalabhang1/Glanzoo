'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Application error:', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    Something went wrong
                </h1>
                <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                    We encountered an unexpected error. Please try again or return to the homepage.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={reset}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-md"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-orange-300 hover:text-orange-600 transition-all"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
