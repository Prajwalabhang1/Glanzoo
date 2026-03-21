'use client'

import { useState, useEffect } from 'react'
import { Store, Bell, Shield, Mail, Megaphone, Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/lib/toast-context'

export default function AdminSettingsPage() {
    const { success, error } = useToast()

    // ── Announcement Bar state ──────────────────────────────────────────────
    const [annLoading, setAnnLoading] = useState(true)
    const [annSaving, setAnnSaving] = useState(false)
    const [ann, setAnn] = useState({
        text: '🎉 Free shipping on orders above ₹999!',
        link: '',
        linkText: '',
        bgColor: '#1a1a1a',
        textColor: '#d4af37',
        isVisible: true,
    })

    useEffect(() => {
        fetch('/api/admin/announcement')
            .then(r => r.json())
            .then(data => {
                setAnn({
                    text: data.text || '',
                    link: data.link || '',
                    linkText: data.linkText || '',
                    bgColor: data.bgColor || '#1a1a1a',
                    textColor: data.textColor || '#d4af37',
                    isVisible: data.isVisible ?? true,
                })
            })
            .catch(() => { })
            .finally(() => setAnnLoading(false))
    }, [])

    const handleAnnSave = async () => {
        setAnnSaving(true)
        try {
            const res = await fetch('/api/admin/announcement', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: ann.text,
                    link: ann.link || null,
                    linkText: ann.linkText || null,
                    bgColor: ann.bgColor,
                    textColor: ann.textColor,
                    isVisible: ann.isVisible,
                }),
            })
            if (!res.ok) throw new Error()
            success('Announcement bar updated!')
        } catch {
            error('Failed to save announcement bar')
        } finally {
            setAnnSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Configure your store settings and preferences</p>
            </div>

            {/* ── Announcement Bar ────────────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                            <Megaphone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Announcement Bar</h2>
                            <p className="text-sm text-gray-500">Shown at the top of every page on the storefront</p>
                        </div>
                    </div>
                    {/* Show / Hide toggle */}
                    <button
                        onClick={() => setAnn(a => ({ ...a, isVisible: !a.isVisible }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${ann.isVisible
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-red-50 hover:text-red-600'
                            : 'bg-gray-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                    >
                        {ann.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {ann.isVisible ? 'Visible' : 'Hidden'}
                    </button>
                </div>

                {annLoading ? (
                    <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-orange-400" /></div>
                ) : (
                    <div className="space-y-4">
                        {/* Live preview */}
                        {ann.text && (
                            <div
                                className="w-full py-2 px-4 rounded-lg text-center text-sm font-medium"
                                style={{ backgroundColor: ann.bgColor, color: ann.textColor }}
                            >
                                {ann.text}
                                {ann.link && ann.linkText && (
                                    <span className="ml-2 underline">{ann.linkText}</span>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Text *</label>
                            <input
                                type="text"
                                value={ann.text}
                                onChange={e => setAnn(a => ({ ...a, text: e.target.value }))}
                                placeholder="🎉 Free shipping on orders above ₹999!"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (optional)</label>
                                <input
                                    type="text"
                                    value={ann.link}
                                    onChange={e => setAnn(a => ({ ...a, link: e.target.value }))}
                                    placeholder="/products"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link Label (optional)</label>
                                <input
                                    type="text"
                                    value={ann.linkText}
                                    onChange={e => setAnn(a => ({ ...a, linkText: e.target.value }))}
                                    placeholder="Shop Now"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        value={ann.bgColor}
                                        onChange={e => setAnn(a => ({ ...a, bgColor: e.target.value }))}
                                        className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5"
                                    />
                                    <input
                                        type="text"
                                        value={ann.bgColor}
                                        onChange={e => setAnn(a => ({ ...a, bgColor: e.target.value }))}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        value={ann.textColor}
                                        onChange={e => setAnn(a => ({ ...a, textColor: e.target.value }))}
                                        className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5"
                                    />
                                    <input
                                        type="text"
                                        value={ann.textColor}
                                        onChange={e => setAnn(a => ({ ...a, textColor: e.target.value }))}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleAnnSave}
                            disabled={annSaving}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                        >
                            {annSaving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : <><Check className="w-4 h-4 mr-2" />Save Announcement Bar</>}
                        </Button>
                    </div>
                )}
            </div>

            {/* Settings Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Store Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
                            <Store className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Store Information</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                            <input type="text" defaultValue="Glanzoo"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
                            <textarea rows={3} defaultValue="Premium ethnic wear for the modern woman"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                            <input type="email" defaultValue="support@glanzoo.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                            <input type="tel" defaultValue="+91 1234567890"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <Button className="bg-gradient-to-r from-orange-500 to-amber-500 w-full">Save Changes</Button>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                            <Bell className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: 'New Orders', desc: 'Get notified when new orders are placed', defaultChecked: true },
                            { label: 'Low Stock Alerts', desc: 'Alert me when products are running low', defaultChecked: true },
                            { label: 'New Inquiries', desc: 'Notify me of new contact form submissions', defaultChecked: true },
                            { label: 'Marketing Emails', desc: 'Receive marketing updates and tips', defaultChecked: false },
                        ].map(item => (
                            <div key={item.label} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">{item.label}</p>
                                    <p className="text-sm text-gray-600">{item.desc}</p>
                                </div>
                                <input type="checkbox" defaultChecked={item.defaultChecked} className="w-5 h-5" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Security</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Emails (comma-separated)</label>
                            <textarea rows={3} placeholder="admin@example.com, manager@example.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono text-sm" />
                            <p className="text-xs text-gray-500 mt-1">Only these emails can access the admin dashboard</p>
                        </div>
                        <Button variant="outline" className="w-full">Update Admin Access</Button>
                    </div>
                </div>

                {/* Payment Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                            <Mail className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Payment Gateway</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Razorpay Key ID</label>
                            <input type="text" placeholder="rzp_test_xxxxx"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Razorpay Secret</label>
                            <input type="password" placeholder="••••••••••••"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="test-mode" className="w-4 h-4" />
                            <label htmlFor="test-mode" className="text-sm text-gray-700">Enable Test Mode</label>
                        </div>
                        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 w-full">Save Payment Settings</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
