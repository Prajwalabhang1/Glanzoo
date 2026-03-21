'use client'

import { useState, useEffect } from 'react'
import { RotateCcw, Package, Loader2, MessageSquare, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface ReturnRequest {
    id: string
    orderId: string
    reason: string
    status: string
    createdAt: string
    details?: string | null
    adminNote?: string | null
    order: { total: number }
}

export default function UserReturnsPage() {
    const { data: session } = useSession()
    const [returns, setReturns] = useState<ReturnRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchReturns = async () => {
            try {
                const res = await fetch('/api/user/returns')
                const data = await res.json()
                setReturns(data.returns || [])
            } catch { /* silent */ }
            finally { setIsLoading(false) }
        }
        if (session) fetchReturns()
    }, [session])

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700'
            case 'REJECTED': return 'bg-red-100 text-red-700'
            case 'COMPLETED': return 'bg-blue-100 text-blue-700'
            default: return 'bg-orange-100 text-orange-700'
        }
    }

    if (!session) return <div className="p-8 text-center text-gray-500">Please sign in to view your returns</div>

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Return Requests</h1>
            <p className="text-sm text-gray-500 mb-8">Manage your recent return and refund requests</p>

            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-orange-400" /></div>
            ) : returns.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                    <RotateCcw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No return requests found</p>
                    <p className="text-xs text-gray-400 mt-2">You can request a return from your order history</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {returns.map(req => (
                        <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-50 rounded-xl"><Package className="w-5 h-5 text-gray-400" /></div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                                        <p className="text-sm font-bold text-gray-900">#{req.orderId.slice(-8).toUpperCase()}</p>
                                    </div>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(req.status)}`}>
                                    {req.status}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Return Details</p>
                                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-sm font-bold text-gray-900 mb-1">{req.reason}</p>
                                        <p className="text-xs text-gray-500 leading-relaxed italic">&quot;{req.details || 'No additional details provided'}&quot;</p>
                                    </div>
                                </div>
                                {req.adminNote && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><MessageSquare className="w-3 h-3" /> Admin Response</p>
                                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                            <p className="text-xs text-blue-800 leading-relaxed font-medium">{req.adminNote}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>Requested on {new Date(req.createdAt).toLocaleDateString()}</span>
                                <span className="text-orange-600">Refund Amount: ₹{req.order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                    <h4 className="text-sm font-bold text-amber-900">Important Note</h4>
                    <p className="text-xs text-amber-700 leading-relaxed mt-1">Returns are typically processed within 3-5 business days after approval. Refund amounts will be credited back to your original payment method or as store credit for COD orders.</p>
                </div>
            </div>
        </div>
    )
}
