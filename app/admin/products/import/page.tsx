'use client'

import { useState } from 'react'
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Table as TableIcon } from 'lucide-react'
import { useToast } from '@/lib/toast-context'
import Link from 'next/link'
import Image from 'next/image'

interface BulkImportProduct {
    name: string
    price: string | number
    categoryId: string
    material?: string
    variants?: string | Array<{ size: string, stock: number }>
    images?: string | string[]
    [key: string]: string | number | string[] | Array<{ size: string, stock: number }> | undefined
}

export default function BulkImportPage() {
    const [csvData, setCsvData] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [preview, setPreview] = useState<BulkImportProduct[]>([])
    const { success, error } = useToast()

    const handleParse = () => {
        if (!csvData.trim()) return
        const lines = csvData.trim().split('\n')
        const headers = lines[0].split(',')

        try {
            const parsed = lines.slice(1).map(line => {
                const values = line.split(',')
                const obj: BulkImportProduct = { name: '', price: '', categoryId: '' }
                headers.forEach((h, i) => {
                    const key = h.trim() as keyof BulkImportProduct
                    const val = values[i]?.trim()
                    if (val !== undefined) {
                        (obj as Record<string, unknown>)[key] = val
                    }
                })

                // Format variants if present (assuming Size:Stock;Size:Stock format)
                if (typeof obj.variants === 'string' && obj.variants.trim()) {
                    obj.variants = obj.variants.split(';').map((v: string) => {
                        const [size, stock] = v.split(':')
                        return { size: size.trim(), stock: parseInt(stock || '0', 10) }
                    })
                }

                // Format images array
                if (typeof obj.images === 'string' && obj.images.trim()) {
                    obj.images = obj.images.split('|').map((img: string) => img.trim())
                }

                return obj
            })
            setPreview(parsed)
            success(`Parsed ${parsed.length} products! Review the preview below.`)
        } catch {
            error('Failed to parse CSV. Please check formatting.')
        }
    }

    const handleImport = async () => {
        if (preview.length === 0) return
        setIsProcessing(true)
        try {
            const res = await fetch('/api/admin/products/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products: preview })
            })
            const data = await res.json()
            if (res.ok) {
                success(`Successfully imported ${data.count} products!`)
                setPreview([])
                setCsvData('')
            } else {
                error(data.error || 'Import failed')
            }
        } catch {
            error('Server error during import')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bulk Product Import</h1>
                    <p className="text-sm text-gray-500 mt-1">Upload CSV or paste CSV data to import multiple products at once</p>
                </div>
                <Link href="/admin/products" className="text-sm font-bold text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-200">
                    Back to Products
                </Link>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-orange-500" />
                            <h2 className="font-bold text-gray-900">CSV Data Source</h2>
                        </div>
                        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                            Format: name,price,categoryId,material,variants,images<br />
                            Variants: Size:Stock;Size:Stock (e.g. S:10;M:15)<br />
                            Images: url1|url2|url3
                        </p>
                        <textarea
                            value={csvData}
                            onChange={(e) => setCsvData(e.target.value)}
                            className="w-full h-80 p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-orange-500 transition-all no-scrollbar"
                            placeholder="name,price,categoryId,material,variants,images&#10;Summer Dress,1299,cat_id_001,Cotton,S:10|M:5,https://img.com/1.jpg|https://img.com/2.jpg"
                        />
                        <button
                            onClick={handleParse}
                            className="w-full mt-4 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <TableIcon className="w-4 h-4" /> Parse for Preview
                        </button>
                    </div>

                    <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6">
                        <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4" /> Import Guidelines
                        </h3>
                        <ul className="text-xs text-amber-700 space-y-2 list-disc pl-4">
                            <li>Ensure category IDs are correct and exist in the database.</li>
                            <li>Slugs will be auto-generated if not provided.</li>
                            <li>Images should be publicly accessible URLs.</li>
                            <li>Bulk import bypasses standard validation; please verify data.</li>
                        </ul>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[500px] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="font-bold text-gray-900">Import Preview {preview.length > 0 && `(${preview.length})`}</h2>
                            {preview.length > 0 && (
                                <button
                                    disabled={isProcessing}
                                    onClick={handleImport}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Finalize Import
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-auto max-h-[600px] scrollbar-hide">
                            {preview.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center p-12 text-center text-gray-400">
                                    <Upload className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="font-medium">Enter CSV data to see a preview here</p>
                                </div>
                            ) : (
                                <table className="w-full text-left text-xs">
                                    <thead className="sticky top-0 bg-white border-b border-gray-50 z-10">
                                        <tr>
                                            <th className="px-6 py-3 font-bold text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {preview.map((p, i) => (
                                            <tr key={i} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {Array.isArray(p.images) && p.images[0] && (
                                                            <div className="w-8 h-10 bg-gray-100 rounded-md overflow-hidden relative">
                                                                <Image
                                                                    src={p.images[0]}
                                                                    alt={p.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-bold text-gray-900">{p.name}</p>
                                                            <p className="text-[10px] text-gray-400">{p.material}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-700">₹{p.price}</td>
                                                <td className="px-6 py-4 text-gray-500 font-mono">{p.categoryId}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {Array.isArray(p.variants) && p.variants.map((v: { size: string; stock: number }, j: number) => (
                                                            <span key={j} className="bg-gray-100 px-1.5 py-0.5 rounded font-bold text-[9px]">{v.size}:{v.stock}</span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
