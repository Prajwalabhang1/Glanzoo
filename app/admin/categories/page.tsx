'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
    Plus, ChevronRight, ChevronDown, Pencil, Trash2, Eye, EyeOff,
    FolderTree, Loader2, X, Check, ChevronsDownUp, ChevronsUpDown,
    ChevronUp, AlertCircle, ImageIcon, GripVertical, Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Category {
    id: string
    name: string
    slug: string
    description?: string | null
    icon?: string | null
    image?: string | null
    active: boolean
    sortOrder: number
    parentId?: string | null
    _count: { products: number }
}

// Tree node — same as Category but with resolved children
interface CategoryNode extends Category {
    children: CategoryNode[]
}

interface CategoryFormData {
    name: string
    slug: string
    description: string
    icon: string
    image: string
    parentId: string
    active: boolean
    sortOrder: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — build tree from flat list
// ─────────────────────────────────────────────────────────────────────────────

function buildTree(flat: Category[]): CategoryNode[] {
    const map = new Map<string, CategoryNode>()
    const roots: CategoryNode[] = []

    for (const cat of flat) {
        map.set(cat.id, { ...cat, children: [] })
    }
    for (const cat of flat) {
        if (cat.parentId && map.has(cat.parentId)) {
            map.get(cat.parentId)!.children.push(map.get(cat.id)!)
        } else {
            roots.push(map.get(cat.id)!)
        }
    }

    return roots
}

/** Return all descendant IDs of a node in the tree */
function getDescendantIds(node: CategoryNode): string[] {
    const ids: string[] = []
    const walk = (n: CategoryNode) => {
        for (const child of n.children) {
            ids.push(child.id)
            walk(child)
        }
    }
    walk(node)
    return ids
}

/** Sort siblings by sortOrder ascending */
function sortedChildren(nodes: CategoryNode[]): CategoryNode[] {
    return [...nodes].sort((a, b) => a.sortOrder - b.sortOrder)
}

function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

const defaultForm: CategoryFormData = {
    name: '',
    slug: '',
    description: '',
    icon: '',
    image: '',
    parentId: '',
    active: true,
    sortOrder: 0,
}

// ─────────────────────────────────────────────────────────────────────────────
// ErrorBanner — replaces all window.alert() calls
// ─────────────────────────────────────────────────────────────────────────────

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
    return (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="flex-1">{message}</span>
            <button onClick={onDismiss} className="p-0.5 hover:bg-red-100 rounded transition-colors">
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// CategoryRow — moved OUTSIDE the parent component to prevent remounting
// ─────────────────────────────────────────────────────────────────────────────

interface CategoryRowProps {
    cat: CategoryNode
    level: number
    expandedIds: Set<string>
    togglingId: string | null
    deletingId: string | null
    onToggleExpand: (id: string) => void
    onToggleActive: (cat: Category) => void
    onDelete: (cat: Category) => void
    onAddSub: (parentId: string) => void
    onEdit: (cat: Category) => void
    onMoveUp: (cat: Category) => void
    onMoveDown: (cat: Category) => void
    siblings: CategoryNode[]
}

function CategoryRow({
    cat,
    level,
    expandedIds,
    togglingId,
    deletingId,
    onToggleExpand,
    onToggleActive,
    onDelete,
    onAddSub,
    onEdit,
    onMoveUp,
    onMoveDown,
    siblings,
}: CategoryRowProps) {
    const isExpanded = expandedIds.has(cat.id)
    const hasChildren = cat.children.length > 0
    const siblingsSorted = sortedChildren(siblings)
    const myIndex = siblingsSorted.findIndex(s => s.id === cat.id)
    const isFirst = myIndex === 0
    const isLast = myIndex === siblingsSorted.length - 1

    return (
        <>
            <tr
                className={`border-b border-gray-100 hover:bg-gray-50/60 transition-colors group ${!cat.active ? 'opacity-50' : ''}`}
            >
                {/* Category name + expand */}
                <td className="py-3 px-4">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
                        {hasChildren ? (
                            <button
                                onClick={() => onToggleExpand(cat.id)}
                                className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors shrink-0"
                            >
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                        ) : (
                            <span className="w-6 shrink-0" />
                        )}
                        <span className="text-lg leading-none">{cat.icon || '📁'}</span>
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{cat.name}</p>
                            <p className="text-xs text-gray-400 font-mono truncate">{cat.slug}</p>
                        </div>
                    </div>
                </td>

                {/* Description */}
                <td className="py-3 px-4 text-sm text-gray-500 hidden md:table-cell max-w-xs">
                    <span className="truncate block">{cat.description || '—'}</span>
                </td>

                {/* Sort order + move arrows */}
                <td className="py-3 px-4 text-center">
                    <div className="inline-flex flex-col items-center gap-0.5">
                        <span className="text-xs font-mono text-gray-400 tabular-nums">{cat.sortOrder}</span>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onMoveUp(cat)}
                                disabled={isFirst}
                                title="Move up"
                                className="p-0.5 text-gray-400 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => onMoveDown(cat)}
                                disabled={isLast}
                                title="Move down"
                                className="p-0.5 text-gray-400 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </td>

                {/* Product count */}
                <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {cat._count.products}
                    </span>
                </td>

                {/* Status toggle */}
                <td className="py-3 px-4 text-center">
                    <button
                        onClick={() => onToggleActive(cat)}
                        disabled={togglingId === cat.id}
                        title={cat.active ? 'Click to hide from storefront' : 'Click to show on storefront'}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all
                            ${cat.active
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-red-50 hover:text-red-600'
                                : 'bg-gray-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                    >
                        {togglingId === cat.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : cat.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {cat.active ? 'Visible' : 'Hidden'}
                    </button>
                </td>

                {/* Actions */}
                <td className="py-3 px-4">
                    <div className="flex items-center gap-1 justify-end">
                        <button
                            onClick={() => onAddSub(cat.id)}
                            title="Add subcategory"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onEdit(cat)}
                            title="Edit"
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(cat)}
                            disabled={deletingId === cat.id}
                            title="Delete"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {deletingId === cat.id
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Trash2 className="w-4 h-4" />}
                        </button>
                    </div>
                </td>
            </tr>

            {/* Recursive children */}
            {isExpanded && hasChildren && sortedChildren(cat.children).map(child => (
                <CategoryRow
                    key={child.id}
                    cat={child}
                    level={level + 1}
                    expandedIds={expandedIds}
                    togglingId={togglingId}
                    deletingId={deletingId}
                    onToggleExpand={onToggleExpand}
                    onToggleActive={onToggleActive}
                    onDelete={onDelete}
                    onAddSub={onAddSub}
                    onEdit={onEdit}
                    onMoveUp={onMoveUp}
                    onMoveDown={onMoveDown}
                    siblings={cat.children}
                />
            ))}
        </>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
    // ── State ─────────────────────────────────────────────────────────────
    const [flatCategories, setFlatCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [inlineError, setInlineError] = useState<string | null>(null) // table-level errors

    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
    const [allExpanded, setAllExpanded] = useState(false)

    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [editNode, setEditNode] = useState<CategoryNode | null>(null)
    const [formData, setFormData] = useState<CategoryFormData>(defaultForm)
    const [formLoading, setFormLoading] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    const [togglingId, setTogglingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [catImageUploading, setCatImageUploading] = useState(false)
    const catFileInputRef = useRef<HTMLInputElement>(null)

    const handleCatImageUpload = async (file: File) => {
        setCatImageUploading(true)
        try {
            const fd = new FormData()
            fd.append('file', file)
            const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
            const data = await res.json()
            if (data.success && data.url) {
                setFormData(prev => ({ ...prev, image: data.url }))
            }
        } catch { /* silent */ }
        finally { setCatImageUploading(false) }
    }

    // ── Derived data ──────────────────────────────────────────────────────
    const categoryTree = useMemo(() => buildTree(flatCategories), [flatCategories])

    /** Flat list with indented labels for the parent selector */
    const parentOptions = useMemo(() => {
        const options: { id: string; label: string; depth: number }[] = []
        const walk = (nodes: CategoryNode[], depth = 0) => {
            for (const node of sortedChildren(nodes)) {
                options.push({ id: node.id, label: node.name, depth })
                walk(node.children, depth + 1)
            }
        }
        walk(categoryTree)
        return options
    }, [categoryTree])

    // ── Fetch ─────────────────────────────────────────────────────────────
    const fetchCategories = useCallback(async () => {
        setFetchError(null)
        try {
            const res = await fetch('/api/admin/categories')
            if (!res.ok) {
                const d = await res.json().catch(() => ({}))
                throw new Error(d.error || `Server error ${res.status}`)
            }
            const data: Category[] = await res.json()
            setFlatCategories(data)
        } catch (e: unknown) {
            setFetchError(e instanceof Error ? e.message : 'Failed to load categories')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    // ── Expand / Collapse ─────────────────────────────────────────────────
    const toggleExpand = useCallback((id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }, [])

    const toggleExpandAll = useCallback(() => {
        if (allExpanded) {
            setExpandedIds(new Set())
            setAllExpanded(false)
        } else {
            setExpandedIds(new Set(flatCategories.filter(c => c.parentId === null || flatCategories.some(p => p.id === c.id && flatCategories.some(ch => ch.parentId === p.id))).map(c => c.id)))
            // Simpler: expand all IDs that have children
            const idsWithChildren = new Set(
                flatCategories
                    .filter(c => flatCategories.some(ch => ch.parentId === c.id))
                    .map(c => c.id)
            )
            setExpandedIds(idsWithChildren)
            setAllExpanded(true)
        }
    }, [allExpanded, flatCategories])

    // ── Form helpers ──────────────────────────────────────────────────────
    const openAddForm = useCallback((parentId?: string) => {
        setEditId(null)
        setEditNode(null)
        // Default sort order: one higher than the current max among siblings
        const siblings = flatCategories.filter(c => (c.parentId || '') === (parentId || ''))
        const maxSort = siblings.length > 0 ? Math.max(...siblings.map(c => c.sortOrder)) : -1
        setFormData({ ...defaultForm, parentId: parentId || '', sortOrder: maxSort + 1 })
        setFormError(null)
        setShowForm(true)
    }, [flatCategories])

    const openEditForm = useCallback((cat: Category) => {
        setEditId(cat.id)
        // Find the node in tree for descendant checking
        const findNode = (nodes: CategoryNode[]): CategoryNode | null => {
            for (const n of nodes) {
                if (n.id === cat.id) return n
                const found = findNode(n.children)
                if (found) return found
            }
            return null
        }
        setEditNode(findNode(categoryTree))
        setFormData({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            icon: cat.icon || '',
            image: cat.image || '',
            parentId: cat.parentId || '',
            active: cat.active,
            sortOrder: cat.sortOrder,
        })
        setFormError(null)
        setShowForm(true)
    }, [categoryTree])

    const handleNameChange = useCallback((name: string) => {
        setFormData(prev => ({
            ...prev,
            name,
            slug: editId ? prev.slug : generateSlug(name),
        }))
    }, [editId])

    // ── Submit ────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)
        setFormError(null)

        const payload = {
            ...formData,
            parentId: formData.parentId || null,
            ...(editId && { id: editId }),
        }

        try {
            const res = await fetch('/api/admin/categories', {
                method: editId ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to save category')
            await fetchCategories()
            setShowForm(false)
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : 'An unknown error occurred')
        } finally {
            setFormLoading(false)
        }
    }

    // ── Toggle active ─────────────────────────────────────────────────────
    const handleToggleActive = useCallback(async (cat: Category) => {
        setTogglingId(cat.id)
        setInlineError(null)
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: cat.id, active: !cat.active }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to update status')
            await fetchCategories()
        } catch (err: unknown) {
            setInlineError(err instanceof Error ? err.message : 'Failed to update status')
        } finally {
            setTogglingId(null)
        }
    }, [fetchCategories])

    // ── Delete ────────────────────────────────────────────────────────────
    const handleDelete = useCallback(async (cat: Category) => {
        if (!confirm(`Delete "${cat.name}"? This cannot be undone.`)) return
        setDeletingId(cat.id)
        setInlineError(null)
        try {
            const res = await fetch(`/api/admin/categories?id=${cat.id}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to delete category')
            await fetchCategories()
        } catch (err: unknown) {
            setInlineError(err instanceof Error ? err.message : 'Failed to delete category')
        } finally {
            setDeletingId(null)
        }
    }, [fetchCategories])

    // ── Sort order swap ───────────────────────────────────────────────────
    const handleMove = useCallback(async (cat: Category, direction: 'up' | 'down') => {
        // Find siblings (categories with same parentId)
        const siblings = sortedChildren(
            flatCategories
                .filter(c => (c.parentId || '') === (cat.parentId || ''))
                .map(c => ({ ...c, children: [] }))
        )
        const myIndex = siblings.findIndex(s => s.id === cat.id)
        const swapIndex = direction === 'up' ? myIndex - 1 : myIndex + 1
        if (swapIndex < 0 || swapIndex >= siblings.length) return

        const swapCat = siblings[swapIndex]

        // Swap sortOrder values between the two categories
        try {
            await Promise.all([
                fetch('/api/admin/categories', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: cat.id, sortOrder: swapCat.sortOrder }),
                }),
                fetch('/api/admin/categories', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: swapCat.id, sortOrder: cat.sortOrder }),
                }),
            ])
            await fetchCategories()
        } catch {
            setInlineError('Failed to reorder categories')
        }
    }, [flatCategories, fetchCategories])

    // ── Validation: excluded parents when editing ─────────────────────────
    const excludedParentIds = useMemo(() => {
        if (!editId || !editNode) return new Set<string>([editId || ''])
        return new Set([editId, ...getDescendantIds(editNode)])
    }, [editId, editNode])

    const editNodeHasChildren = editNode && editNode.children.length > 0
    const parentWillChange = editId && formData.parentId !== (flatCategories.find(c => c.id === editId)?.parentId || '')

    // ─────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FolderTree className="w-7 h-7 text-amber-500" />
                        Categories
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Manage all product categories. Toggle active/inactive to control storefront visibility.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleExpandAll}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        {allExpanded
                            ? <><ChevronsDownUp className="w-4 h-4" /> Collapse All</>
                            : <><ChevronsUpDown className="w-4 h-4" /> Expand All</>}
                    </button>
                    <Button
                        onClick={() => openAddForm()}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Category
                    </Button>
                </div>
            </div>

            {/* Info banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-amber-500 text-lg">💡</span>
                <p className="text-sm text-amber-800">
                    <strong>Visibility Rule:</strong> Only <strong>Active</strong> categories and their products appear on the website.
                    Hiding a parent automatically hides all its sub-categories.
                </p>
            </div>

            {/* Inline table error */}
            {inlineError && (
                <ErrorBanner message={inlineError} onDismiss={() => setInlineError(null)} />
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    </div>
                ) : fetchError ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                        <p className="font-semibold text-gray-700 mb-1">Failed to load categories</p>
                        <p className="text-sm text-gray-400 mb-4">{fetchError}</p>
                        <Button variant="outline" onClick={() => { setLoading(true); fetchCategories() }}>
                            Try Again
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Description</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        <div className="flex items-center justify-center gap-1">
                                            <GripVertical className="w-3 h-3" /> Order
                                        </div>
                                    </th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Products</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoryTree.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-16 text-gray-400">
                                            <FolderTree className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                            <p className="font-medium">No categories yet</p>
                                            <p className="text-sm mt-1">Add your first category to get started</p>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedChildren(categoryTree).map(cat => (
                                        <CategoryRow
                                            key={cat.id}
                                            cat={cat}
                                            level={0}
                                            expandedIds={expandedIds}
                                            togglingId={togglingId}
                                            deletingId={deletingId}
                                            onToggleExpand={toggleExpand}
                                            onToggleActive={handleToggleActive}
                                            onDelete={handleDelete}
                                            onAddSub={openAddForm}
                                            onEdit={openEditForm}
                                            onMoveUp={(c) => handleMove(c, 'up')}
                                            onMoveDown={(c) => handleMove(c, 'down')}
                                            siblings={categoryTree}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Modal Form ──────────────────────────────────────────────────── */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editId ? 'Edit Category' : formData.parentId ? 'Add Subcategory' : 'Add Category'}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Form body — scrollable */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            {formError && (
                                <ErrorBanner message={formError} onDismiss={() => setFormError(null)} />
                            )}

                            {/* Warning: reparenting a node that has children */}
                            {editNodeHasChildren && parentWillChange && (
                                <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl text-sm">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-yellow-500" />
                                    <span>
                                        This category has <strong>{editNode!.children.length}</strong> sub-categor{editNode!.children.length === 1 ? 'y' : 'ies'}.
                                        Changing its parent will make them grandchildren under the new parent.
                                    </span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                {/* Name */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => handleNameChange(e.target.value)}
                                        placeholder="e.g. Women Wear"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 text-sm"
                                    />
                                </div>

                                {/* Slug */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                                        placeholder="women-wear"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 text-sm font-mono"
                                    />
                                </div>

                                {/* Icon — image upload OR emoji fallback */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                                        <ImageIcon className="w-3.5 h-3.5" /> Category Icon Image
                                        <span className="text-gray-400 text-xs font-normal ml-1">(shown as circular icon on homepage)</span>
                                    </label>
                                    {/* Dedicated hidden input for icon upload */}
                                    <input
                                        id="cat-icon-file-input"
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        className="hidden"
                                        onChange={async e => {
                                            const f = e.target.files?.[0]
                                            if (!f) return
                                            setCatImageUploading(true)
                                            try {
                                                const fd = new FormData()
                                                fd.append('file', f)
                                                fd.append('folder', 'categories')
                                                const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
                                                const data = await res.json()
                                                if (data.success && data.url) {
                                                    // Set as icon AND as image for max compatibility
                                                    setFormData(prev => ({ ...prev, icon: data.url, image: prev.image || data.url }))
                                                }
                                            } catch { /* silent */ }
                                            finally { setCatImageUploading(false); e.target.value = '' }
                                        }}
                                    />
                                    <div className="flex gap-3 items-start">
                                        {/* Upload button */}
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('cat-icon-file-input')?.click()}
                                            disabled={catImageUploading}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 text-sm font-semibold disabled:opacity-60 transition-all shadow-sm whitespace-nowrap"
                                        >
                                            {catImageUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            {catImageUploading ? 'Uploading...' : 'Upload Icon Image'}
                                        </button>
                                        {/* OR emoji fallback */}
                                        <div className="flex-1">
                                            <div className="text-xs text-gray-400 mb-1">— or type an emoji instead —</div>
                                            <input
                                                type="text"
                                                value={formData.icon && formData.icon.startsWith('/') ? '' : formData.icon}
                                                onChange={e => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                                                placeholder="👗"
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 text-sm text-center text-2xl"
                                            />
                                        </div>
                                    </div>
                                    {/* Icon preview */}
                                    {formData.icon && formData.icon.startsWith('/') && (
                                        <div className="mt-2 flex items-center gap-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={formData.icon}
                                                alt="Icon"
                                                className="w-12 h-12 rounded-full object-cover border-2 border-amber-200 shadow-sm"
                                                onError={e => (e.currentTarget.style.display = 'none')}
                                            />
                                            <span className="text-xs text-gray-500">Icon image uploaded ✓</span>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, icon: '' }))}
                                                className="text-xs text-red-500 hover:underline"
                                            >Remove</button>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Short category description"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 text-sm"
                                    />
                                </div>

                                {/* Image URL */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                                        <ImageIcon className="w-3.5 h-3.5" /> Category Image URL
                                    </label>
                                    <input
                                        ref={catFileInputRef as React.RefObject<HTMLInputElement>}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={e => { const f = e.target.files?.[0]; if (f) handleCatImageUpload(f) }}
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={formData.image}
                                            onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                            placeholder="https://..."
                                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => catFileInputRef.current?.click()}
                                            disabled={catImageUploading}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl hover:bg-amber-100 text-sm font-medium disabled:opacity-50 whitespace-nowrap"
                                        >
                                            {catImageUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            {catImageUploading ? 'Uploading...' : 'Upload Image'}
                                        </button>
                                    </div>
                                    {formData.image && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            className="mt-2 h-16 w-auto rounded-lg border border-gray-200 object-cover"
                                            onError={e => (e.currentTarget.style.display = 'none')}
                                        />
                                    )}
                                </div>

                                {/* Parent Category — full tree, no circular refs */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Parent Category</label>
                                    <select
                                        value={formData.parentId}
                                        onChange={e => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 text-sm"
                                    >
                                        <option value="">— Top Level —</option>
                                        {parentOptions
                                            .filter(opt => !excludedParentIds.has(opt.id))
                                            .map(opt => (
                                                <option key={opt.id} value={opt.id}>
                                                    {'  '.repeat(opt.depth)}{opt.depth > 0 ? '└ ' : ''}{opt.label}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                {/* Sort Order */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
                                    <input
                                        type="number"
                                        value={formData.sortOrder}
                                        onChange={e => setFormData(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 text-sm"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Lower numbers appear first. Use ▲▼ in the table for quick reordering.</p>
                                </div>

                                {/* Active toggle — accessible checkbox */}
                                <div className="col-span-2">
                                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={formData.active}
                                            onChange={e => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                                        />
                                        <div
                                            aria-hidden="true"
                                            onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                                            className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${formData.active ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.active ? 'translate-x-7' : 'translate-x-1'}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                {formData.active ? 'Active — Visible on storefront' : 'Inactive — Hidden from storefront'}
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Form actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-70"
                                >
                                    {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {editId ? 'Save Changes' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
