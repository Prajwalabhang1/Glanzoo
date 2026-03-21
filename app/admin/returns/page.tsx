'use client'

import { useState, useEffect, useCallback } from 'react'
import { RotateCcw, MessageSquare, Loader2, User, Calendar, IndianRupee } from 'lucide-react'
import { useToast } from '@/lib/toast-context'

interface ReturnRequest {
    id: string
    orderId: string
    reason: string
    details: string | null
    status: string
    adminNote: string | null
    createdAt: string
    order: { total: number, paymentStatus: string }
    user: { name: string, email: string }
}

export default function AdminReturnsPage() {
    const [returns, setReturns] = useState<ReturnRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const { success, error } = useToast()

    const fetchReturns = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/returns')
            const data = await res.json()
            setReturns(data.returns || [])
        } catch { error('Failed to load return requests') }
        finally { setIsLoading(false) }
    }, [error])

    useEffect(() => { fetchReturns() }, [fetchReturns])

    const handleUpdateStatus = async (id: string, status: string) => {
        const adminNote = prompt('Add an internal/external note (optional):')
        if (adminNote === null) return // Cancelled

        setProcessingId(id)
        try {
            const res = await fetch('/api/admin/returns', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, adminNote })
            })
            if (res.ok) {
                success(`Return request ${status.toLowerCase()}`)
                fetchReturns()
            } else {
                error('Update failed')
            }
        } catch { error('Update failed') }
        finally { setProcessingId(null) }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'text-green-600 bg-green-50'
            case 'REJECTED': return 'text-red-600 bg-red-50'
            case 'COMPLETED': return 'text-blue-600 bg-blue-100'
            default: return 'text-orange-600 bg-orange-50'
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Returns</h1>
                <p className="text-sm text-gray-500 mt-1">Review and process customer refund and return requests</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-orange-400" /></div>
            ) : returns.length === 0 ? (
                <div className="bg-white rounded-2xl border p-12 text-center text-gray-500 shadow-sm">No return requests found.</div>
            ) : (
                <div className="grid gap-6">
                    {returns.map(req => (
                        <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
                            <div className="p-6 md:w-80 border-b md:border-b-0 md:border-r border-gray-50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-gray-50 rounded-lg"><RotateCcw className="w-5 h-5 text-orange-500" /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Return ID</p>
                                        <p className="text-xs font-mono font-bold text-gray-900 uppercase">{req.id.slice(-8)}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1"><User className="w-3 h-3" /> Customer</p>
                                        <p className="text-sm font-bold text-gray-900">{req.user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{req.user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1"><IndianRupee className="w-3 h-3" /> Order Total</p>
                                        <p className="text-sm font-bold text-orange-600">₹{req.order.total.toLocaleString()}</p>
                                        <p className="text-[9px] font-bold text-green-600 uppercase">Status: {req.order.paymentStatus}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase inline-block mb-2 shadow-sm border border-gray-100 ${getStatusColor(req.status)}`}>
                                            {req.status}
                                        </p>
                                        <h3 className="text-lg font-bold text-gray-900">{req.reason}</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed max-w-2xl italic font-serif">&quot;{req.details || 'No additional details provided'}&quot;</p>
                                    </div>
                                    {req.status === 'PENDING' && (
                                        <div className="flex gap-2">
                                            <button
                                                disabled={processingId === req.id}
                                                onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-lg shadow-green-500/20"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                disabled={processingId === req.id}
                                                onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                                className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold hover:bg-red-100 shadow-sm"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    {req.status === 'APPROVED' && (
                                        <button
                                            disabled={processingId === req.id}
                                            onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                                        >
                                            Mark as Refunded
                                        </button>
                                    )}
                                </div>
                                {req.adminNote && (
                                    <div className="mt-6 flex items-start gap-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                        <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Admin History / Notes</p>
                                            <p className="text-xs text-gray-600">{req.adminNote}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-50 opacity-60">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                                        <Calendar className="w-3 h-3" /> Requested on {new Date(req.createdAt).toLocaleDateString()}
                                    </div>
                                    <span className="text-[10px] font-mono">Order #{req.orderId}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
