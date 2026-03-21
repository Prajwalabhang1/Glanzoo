'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Edit3, Loader2, LayoutGrid, Star } from 'lucide-react'
import { useToast } from '@/lib/toast-context'
import Image from 'next/image'

interface Collection {
    id: string
    name: string
    slug: string
    description: string | null
    image: string | null
    banner: string | null
    featured: boolean
    type: string | null
    sortOrder: number
    active: boolean
    _count: { products: number }
}

export default function AdminCollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const { success, error } = useToast()

    const [form, setForm] = useState({
        name: '', slug: '', description: '', image: '', banner: '',
        featured: false, type: 'Trending', sortOrder: 0, active: true,
    })

    const fetchCollections = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/collections')
            const data = await res.json()
            setCollections(data.collections || [])
        } catch { error('Failed to load collections') }
        finally { setIsLoading(false) }
    }, [error])

    useEffect(() => { fetchCollections() }, [fetchCollections])

    const handleSave = async () => {
        if (!form.name || !form.slug) { error('Name and Slug are required'); return }
        try {
            const url = editingId ? `/api/admin/collections/${editingId}` : '/api/admin/collections'
            const method = editingId ? 'PATCH' : 'POST'
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            if (!res.ok) throw new Error()
            success(editingId ? 'Collection updated!' : 'Collection created!')
            setEditingId(null)
            setShowForm(false)
            fetchCollections()
        } catch { error('Failed to save collection') }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this collection?')) return
        try {
            await fetch(`/api/admin/collections/${id}`, { method: 'DELETE' })
            success('Collection deleted')
            fetchCollections()
        } catch { error('Failed to delete') }
    }

    const handleEdit = (c: Collection) => {
        setForm({
            name: c.name, slug: c.slug, description: c.description || '',
            image: c.image || '', banner: c.banner || '', featured: c.featured,
            type: c.type || 'Trending', sortOrder: c.sortOrder, active: c.active,
        })
        setEditingId(c.id)
        setShowForm(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
                    <p className="text-sm text-gray-500 mt-1">Group products into featured sets like &quot;Summer Sale&quot; or &quot;New Arrivals&quot;</p>
                </div>
                <button onClick={() => { setEditingId(null); setShowForm(true) }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold text-sm">
                    <Plus className="w-4 h-4" /> New Collection
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold mb-5">{editingId ? 'Edit Collection' : 'New Collection'}</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                            <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Collection Image URL</label>
                            <input type="text" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type (Tag)</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                                <option value="Trending">Trending</option>
                                <option value="Seasonal">Seasonal</option>
                                <option value="New Arrival">New Arrival</option>
                                <option value="Special Edition">Special Edition</option>
                            </select>
                        </div>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 text-orange-500" />
                                <span className="text-sm font-medium">Featured (on homepage)</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 text-orange-500" />
                                <span className="text-sm font-medium">Active</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={handleSave} className="px-5 py-2 bg-orange-500 text-white rounded-lg font-semibold text-sm">Save</button>
                        <button onClick={() => setShowForm(false)} className="px-5 py-2 border rounded-lg text-sm">Cancel</button>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-orange-400" /></div>
            ) : collections.length === 0 ? (
                <div className="bg-white rounded-2xl border p-12 text-center text-gray-500">No collections yet. Click &quot;New Collection&quot; to get started.</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collections.map(c => (
                        <div key={c.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-32 bg-gray-100 flex items-center justify-center relative">
                                {c.image ? (
                                    <Image
                                        src={c.image}
                                        alt={c.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <LayoutGrid className="w-10 h-10 text-gray-300" />
                                )}
                                {c.featured && (
                                    <span className="absolute top-3 right-3 bg-amber-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                        <Star className="w-3 h-3 fill-black" /> Featured
                                    </span>
                                )}
                            </div>
                            <div className="p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{c.name}</h3>
                                        <p className="text-xs text-gray-400 font-medium">/{c.slug}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {c.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{c.description || 'No description provided.'}</p>
                                <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-50">
                                    <span className="text-xs font-semibold text-gray-400">{c._count.products} Products</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(c)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
