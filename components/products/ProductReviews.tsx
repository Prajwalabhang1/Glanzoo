'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, ThumbsUp, AlertCircle, Loader2, Send } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/lib/toast-context'

interface ReviewUser {
    name: string | null
    image: string | null
}

interface Review {
    id: string
    rating: number
    title: string | null
    comment: string | null
    verified: boolean
    createdAt: string
    user: ReviewUser
}

interface ReviewsProps {
    productId: string
}

function StarRating({ value, onChange, readonly }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
    const [hover, setHover] = useState(0)
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => !readonly && setHover(star)}
                    onMouseLeave={() => !readonly && setHover(0)}
                    className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
                >
                    <Star
                        className={`w-5 h-5 ${star <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} transition-colors`}
                    />
                </button>
            ))}
        </div>
    )
}

export function ProductReviews({ productId }: ReviewsProps) {
    const { data: session } = useSession()
    const { success, error } = useToast()

    const [reviews, setReviews] = useState<Review[]>([])
    const [avgRating, setAvgRating] = useState(0)
    const [totalRatings, setTotalRatings] = useState(0)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState({ rating: 0, title: '', comment: '' })

    const fetchReviews = useCallback(async (p = 1) => {
        try {
            const res = await fetch(`/api/reviews?productId=${productId}&page=${p}`)
            const data = await res.json()
            if (p === 1) setReviews(data.reviews || [])
            else setReviews(prev => [...prev, ...(data.reviews || [])])
            setAvgRating(data.avgRating || 0)
            setTotalRatings(data.totalRatings || 0)
            setHasMore(p < (data.pages || 1))
        } catch { /* silent */ }
        finally { setIsLoading(false) }
    }, [productId])

    useEffect(() => { fetchReviews() }, [fetchReviews])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (form.rating === 0) { error('Please select a star rating'); return }
        setSubmitting(true)
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, ...form }),
            })
            const data = await res.json()
            if (res.ok) {
                success('Review submitted!')
                setForm({ rating: 0, title: '', comment: '' })
                setShowForm(false)
                fetchReviews(1)
            } else {
                error(data.error || 'Failed to submit review')
            }
        } catch { error('Failed to submit review') }
        finally { setSubmitting(false) }
    }

    const ratingDist = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        pct: totalRatings > 0 ? (reviews.filter(r => r.rating === star).length / totalRatings) * 100 : 0,
    }))

    return (
        <section className="mt-12 pt-10 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

            {/* Summary */}
            {totalRatings > 0 && (
                <div className="flex flex-col sm:flex-row gap-6 mb-8 bg-gray-50 rounded-2xl p-6">
                    <div className="text-center sm:border-r sm:pr-6 sm:border-gray-200">
                        <div className="text-5xl font-bold text-gray-900 mb-1">{avgRating.toFixed(1)}</div>
                        <StarRating value={Math.round(avgRating)} readonly />
                        <p className="text-sm text-gray-500 mt-1">{totalRatings} review{totalRatings !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                        {ratingDist.map(({ star, count, pct }) => (
                            <div key={star} className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-3">{star}</span>
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-gray-500 w-5 text-right">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Write Review Button */}
            {session?.user && !showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="mb-6 flex items-center gap-2 px-4 py-2.5 border-2 border-orange-300 text-orange-600 rounded-xl font-semibold text-sm hover:bg-orange-50 transition-colors"
                >
                    <Star className="w-4 h-4" /> Write a Review
                </button>
            )}

            {/* Review Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-orange-50 rounded-2xl border border-orange-200 p-6 mb-8">
                    <h3 className="font-bold text-gray-900 mb-4">Your Review</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Rating *</label>
                            <StarRating value={form.rating} onChange={v => setForm({ ...form, rating: v })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Title (optional)</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="Great quality!"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Your Experience (optional)</label>
                            <textarea
                                value={form.comment}
                                onChange={e => setForm({ ...form, comment: e.target.value })}
                                rows={3}
                                placeholder="Tell others what you thought about this product..."
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 resize-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" disabled={submitting}
                                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold text-sm disabled:opacity-60">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Submit Review
                            </button>
                            <button type="button" onClick={() => setShowForm(false)}
                                className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700">
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {!session?.user && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 bg-gray-50 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Please <a href="/login" className="text-orange-500 font-medium hover:underline">sign in</a> to write a review</span>
                </div>
            )}

            {/* Reviews List */}
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-7 h-7 animate-spin text-orange-400" />
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <Star className="w-10 h-10 text-gray-200 mx-auto mb-3 fill-gray-200" />
                    <p className="font-medium text-gray-700">No reviews yet</p>
                    <p className="text-sm mt-1">Be the first to review this product</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {reviews.map(review => (
                        <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {review.user.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900">{review.user.name || 'Anonymous'}</p>
                                        <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <StarRating value={review.rating} readonly />
                            </div>
                            {review.title && <p className="font-semibold text-gray-800 mt-2 mb-1">{review.title}</p>}
                            {review.comment && <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>}
                            {review.verified && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                                    <ThumbsUp className="w-3 h-3" /> Verified Purchase
                                </div>
                            )}
                        </div>
                    ))}
                    {hasMore && (
                        <button onClick={() => { setPage(p => p + 1); fetchReviews(page + 1) }}
                            className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            Load More Reviews
                        </button>
                    )}
                </div>
            )}
        </section>
    )
}
