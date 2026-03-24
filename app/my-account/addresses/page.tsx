'use client'

import { useState, useEffect } from 'react'
import { Plus, MapPin, Trash2, CheckCircle, Loader2, Home, Briefcase } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/lib/toast-context'

interface Address {
    id: string
    name: string
    phone: string
    street: string
    city: string
    state: string
    pincode: string
    isDefault: boolean
    type: string // HOME, WORK, OTHER
}

export default function AddressBookPage() {
    const { data: session } = useSession()
    const { success, error } = useToast()

    const [addresses, setAddresses] = useState<Address[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [form, setForm] = useState({
        name: '', phone: '', street: '', city: '', state: '', pincode: '',
        type: 'HOME', isDefault: false
    })

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/user/addresses')
            const data = await res.json()
            setAddresses(data.addresses || [])
        } catch { error('Failed to load addresses') }
        finally { setIsLoading(false) }
    }

    useEffect(() => {
        if (session) fetchAddresses()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await fetch('/api/user/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            if (res.ok) {
                success('Address saved')
                setShowForm(false)
                setForm({ name: '', phone: '', street: '', city: '', state: '', pincode: '', type: 'HOME', isDefault: false })
                fetchAddresses()
            } else {
                error('Failed to save address')
            }
        } catch { error('Failed to save address') }
        finally { setSubmitting(false) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this address?')) return
        try {
            const res = await fetch(`/api/user/addresses?id=${id}`, { method: 'DELETE' })
            if (res.ok) {
                success('Address deleted')
                fetchAddresses()
            }
        } catch { error('Failed to delete') }
    }

    const handleSetDefault = async (id: string) => {
        try {
            const res = await fetch(`/api/user/addresses`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isDefault: true })
            })
            if (res.ok) fetchAddresses()
        } catch { /* silent */ }
    }

    if (!session) return <div className="p-8 text-center text-gray-500">Please sign in to view your address book</div>

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Address Book</h1>
                    <p className="text-sm text-gray-500">Manage your shipping addresses for faster checkout</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add New Address
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-lg font-bold mb-5">New Address</h2>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                            <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm" placeholder="e.g. Rahul Sharma" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone Number</label>
                            <input required type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm" placeholder="10-digit number" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Street / Apartment / Area</label>
                            <input required type="text" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm" placeholder="House no, Street name, Landmark..." />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">City</label>
                            <input required type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm" placeholder="Bangalore" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">State</label>
                            <input required type="text" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm" placeholder="Karnataka" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Pincode</label>
                            <input required type="text" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm" placeholder="560001" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Address Type</label>
                            <div className="flex gap-2 mt-1">
                                {['HOME', 'WORK', 'OTHER'].map(t => (
                                    <button
                                        key={t} type="button"
                                        onClick={() => setForm({ ...form, type: t })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${form.type === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-200 hover:border-orange-200'}`}
                                    >
                                        {t === 'HOME' ? <Home className="w-3 h-3 inline mr-1" /> : t === 'WORK' ? <Briefcase className="w-3 h-3 inline mr-1" /> : <MapPin className="w-3 h-3 inline mr-1" />}
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2 mt-2">
                            <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} className="w-4 h-4 text-orange-500 rounded" />
                            <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">Set as default address</label>
                        </div>
                        <div className="md:col-span-2 flex gap-3 mt-4">
                            <button disabled={submitting} type="submit" className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 flex items-center gap-2">
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save Address
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-orange-400" /></div>
            ) : addresses.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No saved addresses found</p>
                    <button onClick={() => setShowForm(true)} className="text-orange-500 text-sm font-bold mt-2 hover:underline">Add your first address</button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                        <div key={addr.id} className={`bg-white rounded-2xl p-6 border-2 transition-all cursor-pointer relative group ${addr.isDefault ? 'border-orange-500 shadow-lg shadow-orange-500/5' : 'border-gray-100 hover:border-orange-200 shadow-sm'}`}>
                            {addr.isDefault && (
                                <span className="absolute -top-3 left-4 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Default
                                </span>
                            )}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold uppercase tracking-tight">
                                        {addr.type}
                                    </span>
                                    <h3 className="font-bold text-gray-900">{addr.name}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleDelete(addr.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>{addr.street}</p>
                                <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                <p className="pt-2 font-medium text-gray-900">Phone: {addr.phone}</p>
                            </div>
                            {!addr.isDefault && (
                                <button
                                    onClick={() => handleSetDefault(addr.id)}
                                    className="mt-4 text-[10px] font-bold text-gray-400 hover:text-orange-500 uppercase tracking-widest flex items-center gap-1"
                                >
                                    Set as default
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
