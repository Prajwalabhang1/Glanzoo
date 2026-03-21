'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import {
    Plus, Trash2, Edit3, ChevronUp, ChevronDown,
    Eye, EyeOff, Loader2, Image as ImageIcon, Upload, ImageOff
} from 'lucide-react'
import { useToast } from '@/lib/toast-context'

interface HeroBanner {
    id: string
    order: number
    active: boolean
    image: string
    imagePosition: string
    imageOnly: boolean
    badge?: string
    title: string
    titleAccent: string
    description: string
    primaryCtaText: string
    primaryCtaLink: string
    secondaryCtaText?: string
    secondaryCtaLink?: string
}

const emptyForm = {
    image: '',
    imagePosition: 'center center',
    imageOnly: false,
    badge: '',
    title: '',
    titleAccent: '',
    description: '',
    primaryCtaText: 'Shop Now',
    primaryCtaLink: '/products',
    secondaryCtaText: '',
    secondaryCtaLink: '',
    active: true,
}

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<HeroBanner[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [imageUploading, setImageUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { success, error } = useToast()

    const [form, setForm] = useState({ ...emptyForm })

    // ── Fetch ────────────────────────────────────────────────────────────────
    const fetchBanners = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/hero-banners')
            const data = await res.json()
            setBanners(data.banners || [])
        } catch { error('Failed to load banners') }
        finally { setIsLoading(false) }
    }, [error])

    useEffect(() => { fetchBanners() }, [fetchBanners])

    // ── Upload Image ─────────────────────────────────────────────────────────
    const handleImageUpload = async (file: File) => {
        setImageUploading(true)
        try {
            const fd = new FormData()
            fd.append('file', file)
            fd.append('folder', 'hero')
            const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
            const data = await res.json()
            if (data.success && data.url) {
                setForm(f => ({ ...f, image: data.url }))
                success('Image uploaded successfully!')
            } else {
                error(data.error || 'Upload failed')
            }
        } catch { error('Upload failed. Please try again.') }
        finally { setImageUploading(false) }
    }

    // ── Form helpers ─────────────────────────────────────────────────────────
    const resetForm = () => {
        setForm({ ...emptyForm })
        setEditingId(null)
        setShowForm(false)
    }

    const handleEdit = (banner: HeroBanner) => {
        setForm({
            image: banner.image,
            imagePosition: banner.imagePosition,
            imageOnly: banner.imageOnly ?? false,
            badge: banner.badge || '',
            title: banner.title,
            titleAccent: banner.titleAccent,
            description: banner.description,
            primaryCtaText: banner.primaryCtaText,
            primaryCtaLink: banner.primaryCtaLink,
            secondaryCtaText: banner.secondaryCtaText || '',
            secondaryCtaLink: banner.secondaryCtaLink || '',
            active: banner.active,
        })
        setEditingId(banner.id)
        setShowForm(true)
        // Scroll to form
        setTimeout(() => document.getElementById('banner-form')?.scrollIntoView({ behavior: 'smooth' }), 100)
    }

    // ── Save ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!form.image) { error('Image is required'); return }
        if (!form.imageOnly && !form.title) { error('Title is required unless Image-Only mode is on'); return }
        try {
            const url = editingId ? `/api/admin/hero-banners/${editingId}` : '/api/admin/hero-banners'
            const method = editingId ? 'PATCH' : 'POST'
            const payload = {
                ...form,
                title: form.imageOnly ? (form.title || ' ') : form.title,
                titleAccent: form.imageOnly ? (form.titleAccent || '') : form.titleAccent,
                description: form.imageOnly ? (form.description || ' ') : form.description,
            }
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error()
            success(editingId ? 'Banner updated!' : 'Banner created!')
            resetForm()
            fetchBanners()
        } catch { error('Failed to save banner') }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this banner?')) return
        try {
            await fetch(`/api/admin/hero-banners/${id}`, { method: 'DELETE' })
            success('Banner deleted')
            fetchBanners()
        } catch { error('Failed to delete') }
    }

    const handleToggleActive = async (banner: HeroBanner) => {
        try {
            await fetch(`/api/admin/hero-banners/${banner.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !banner.active }),
            })
            fetchBanners()
        } catch { error('Failed to update') }
    }

    const handleReorder = async (id: string, direction: 'up' | 'down') => {
        const idx = banners.findIndex(b => b.id === id)
        if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === banners.length - 1)) return
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1
        const newOrder = [...banners];
        [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]]
        setBanners(newOrder)
        await Promise.all(newOrder.map((b, i) =>
            fetch(`/api/admin/hero-banners/${b.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: i }),
            })
        ))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hero Banners</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage homepage hero slider — upload images, add text, or use image-only mode
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true) }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-amber-600 transition-all shadow-md"
                >
                    <Plus className="w-4 h-4" /> Add Banner
                </button>
            </div>

            {/* ── Create / Edit Form ─────────────────────────────────────────── */}
            {showForm && (
                <div id="banner-form" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                    <h2 className="text-lg font-bold text-gray-900">
                        {editingId ? 'Edit Banner' : 'New Banner'}
                    </h2>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = '' }}
                    />

                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Banner Image <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={form.image}
                                onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                                placeholder="Paste image URL or click Upload →"
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={imageUploading}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 text-sm font-semibold disabled:opacity-60 transition-all shadow-sm"
                            >
                                {imageUploading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                                ) : (
                                    <><Upload className="w-4 h-4" /> Upload Image</>
                                )}
                            </button>
                        </div>

                        {/* Image preview */}
                        {form.image && (
                            <div className="mt-3 relative w-full h-40 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                <Image
                                    src={form.image}
                                    alt="Banner preview"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                                <div className="absolute top-2 right-2">
                                    <span className="text-xs bg-black/60 text-white px-2 py-1 rounded-lg">Preview</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Image Position */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image Position</label>
                            <select
                                value={form.imagePosition}
                                onChange={e => setForm(f => ({ ...f, imagePosition: e.target.value }))}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                            >
                                <option value="center center">Center (default)</option>
                                <option value="top center">Top</option>
                                <option value="bottom center">Bottom</option>
                                <option value="center left">Left</option>
                                <option value="center right">Right</option>
                                <option value="top left">Top Left</option>
                                <option value="top right">Top Right</option>
                            </select>
                        </div>

                        {/* Image-Only Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Display Mode</label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, imageOnly: false }))}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-medium transition-all ${!form.imageOnly
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <ImageIcon className="w-4 h-4" /> With Text
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, imageOnly: true }))}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-medium transition-all ${form.imageOnly
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <ImageOff className="w-4 h-4" /> Image Only
                                </button>
                            </div>
                            {form.imageOnly && (
                                <p className="text-xs text-orange-600 mt-1.5 flex items-center gap-1">
                                    <ImageOff className="w-3 h-3" /> Clean image slide — no text, badge or buttons shown
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Text fields — only shown when NOT image-only */}
                    {!form.imageOnly && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
                                <input
                                    type="text"
                                    value={form.badge}
                                    onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                                    placeholder="New Arrivals"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="Fusion"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title Accent <span className="text-amber-500 text-xs">(gold highlight)</span></label>
                                <input
                                    type="text"
                                    value={form.titleAccent}
                                    onChange={e => setForm(f => ({ ...f, titleAccent: e.target.value }))}
                                    placeholder="Co-ords"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={2}
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Subtitle text shown below title..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button Text</label>
                                <input
                                    type="text"
                                    value={form.primaryCtaText}
                                    onChange={e => setForm(f => ({ ...f, primaryCtaText: e.target.value }))}
                                    placeholder="Shop Now"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button Link</label>
                                <input
                                    type="text"
                                    value={form.primaryCtaLink}
                                    onChange={e => setForm(f => ({ ...f, primaryCtaLink: e.target.value }))}
                                    placeholder="/products"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button <span className="text-gray-400">(optional)</span></label>
                                <input
                                    type="text"
                                    value={form.secondaryCtaText}
                                    onChange={e => setForm(f => ({ ...f, secondaryCtaText: e.target.value }))}
                                    placeholder="View All"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Link <span className="text-gray-400">(optional)</span></label>
                                <input
                                    type="text"
                                    value={form.secondaryCtaLink}
                                    onChange={e => setForm(f => ({ ...f, secondaryCtaLink: e.target.value }))}
                                    placeholder="/collections"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm"
                                />
                            </div>
                        </div>
                    )}

                    {/* Active toggle + Action buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div
                                className={`relative w-11 h-6 rounded-full transition-colors ${form.active ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                            >
                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-5' : ''}`} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                                {form.active ? 'Active — visible on homepage' : 'Inactive — hidden from homepage'}
                            </span>
                        </label>
                        <div className="flex gap-3">
                            <button
                                onClick={resetForm}
                                className="px-5 py-2 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm"
                            >
                                {editingId ? 'Update Banner' : 'Create Banner'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Banners List ────────────────────────────────────────────────── */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
                </div>
            ) : banners.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No banners yet</p>
                    <p className="text-gray-400 text-sm mt-1">Click &quot;Add Banner&quot; to create your first hero slide</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {banners.map((banner, idx) => (
                        <div
                            key={banner.id}
                            className={`bg-white rounded-2xl border shadow-sm p-4 flex gap-4 items-center transition-opacity ${!banner.active ? 'opacity-50' : ''}`}
                        >
                            {/* Thumbnail */}
                            <div className="w-28 h-18 min-h-[72px] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                                <Image
                                    src={banner.image}
                                    alt={banner.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                                {banner.imageOnly && (
                                    <div className="absolute inset-0 flex items-end justify-center pb-1">
                                        <span className="text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">Image Only</span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${banner.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {banner.active ? 'Active' : 'Inactive'}
                                    </span>
                                    {banner.imageOnly && (
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <ImageOff className="w-3 h-3" /> Image Only
                                        </span>
                                    )}
                                    {banner.badge && (
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{banner.badge}</span>
                                    )}
                                </div>
                                {banner.imageOnly ? (
                                    <p className="text-gray-400 text-sm italic">Clean image slide — no overlay text</p>
                                ) : (
                                    <>
                                        <p className="font-semibold text-gray-900 truncate">
                                            {banner.title} <span className="text-orange-500">{banner.titleAccent}</span>
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">{banner.description}</p>
                                    </>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button onClick={() => handleReorder(banner.id, 'up')} disabled={idx === 0}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors" title="Move up">
                                    <ChevronUp className="w-4 h-4 text-gray-600" />
                                </button>
                                <button onClick={() => handleReorder(banner.id, 'down')} disabled={idx === banners.length - 1}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors" title="Move down">
                                    <ChevronDown className="w-4 h-4 text-gray-600" />
                                </button>
                                <button onClick={() => handleToggleActive(banner)}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title={banner.active ? 'Hide' : 'Show'}>
                                    {banner.active
                                        ? <EyeOff className="w-4 h-4 text-gray-500" />
                                        : <Eye className="w-4 h-4 text-emerald-500" />}
                                </button>
                                <button onClick={() => handleEdit(banner)}
                                    className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors" title="Edit">
                                    <Edit3 className="w-4 h-4 text-orange-500" />
                                </button>
                                <button onClick={() => handleDelete(banner.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
