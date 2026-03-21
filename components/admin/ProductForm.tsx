'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Loader2, Save, X, UploadCloud, ChevronLeft, Plus, Trash2, Star, StarOff, ChevronDown, Search, Tag, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

/* ─── Types ─────────────────────────────────────────────────── */
interface Category { id: string; name: string; parentId?: string | null; sortOrder?: number; }
interface CategoryOption { id: string; label: string; depth: number; }
interface UploadingFile { id: string; name: string; progress: number; url?: string; error?: string; }
interface Variant { size: string; color: string; price: string; stock: number; sku: string; }
interface Spec { key: string; value: string; }

interface InitialData {
    id?: string; name?: string; description?: string; shortDescription?: string;
    material?: string; fabricType?: string; specifications?: string;
    price?: number | string; salePrice?: number | string; mrp?: number | string;
    categoryId?: string; images?: string; active?: boolean; slug?: string;
    metaTitle?: string; metaDesc?: string; tags?: string; featured?: boolean;
    freeShipping?: boolean; returnEligible?: boolean;
    brand?: string; gender?: string; occasion?: string;
    gstRate?: number | string; hsnCode?: string; countryOfOrigin?: string;
    weight?: number | string; shippingDays?: string; displaySku?: string;
    // Clothing
    pattern?: string; fit?: string; neckType?: string; sleeveType?: string;
    workType?: string; topLength?: string; bottomLength?: string;
    careInstructions?: string; washCare?: string;
    bottomType?: string; dupatteIncluded?: boolean; blousePiece?: string;
    // Perfume
    concentration?: string; volumeMl?: number | string; fragranceFamily?: string;
    topNotes?: string; middleNotes?: string; baseNotes?: string;
    // Electronics
    connectivity?: string; batteryLife?: string; warranty?: string; waterResistance?: string;
    // Footwear
    heelHeight?: string; soleMaterial?: string; closureType?: string;
    variants?: { size: string; color: string; price: string; stock: number; sku: string }[];
    collectionId?: string;
    detailedInfo?: string;
}

interface ProductFormProps {
    initialData?: InitialData;
    categories: Category[];
    collections?: { id: string; name: string }[];
    action: (fd: FormData) => Promise<{ success?: boolean; error?: string } | void>;
}

/* ─── Category Group Detection ───────────────────────────────── */
type CategoryGroup = 'clothing' | 'accessories' | 'electronics' | 'footwear' | 'perfume' | 'kids' | 'generic';


function detectGroup(categoryId: string, categories: Category[]): CategoryGroup {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return 'generic';
    const parent = cat.parentId ? categories.find(c => c.id === cat.parentId) : cat;
    if (!parent) return 'generic';
    // Try match by name keywords
    const n = parent.name.toLowerCase();
    if (n.includes('perfume') || n.includes('fragrance')) return 'perfume';
    if (n.includes('electronic')) return 'electronics';
    if (n.includes('footwear')) return 'footwear';
    if (n.includes('accessories')) return 'accessories';
    if (n.includes('kids')) return 'kids';
    if (n.includes('wear')) return 'clothing';
    return 'generic';
}

/* ─── Helpers ────────────────────────────────────────────────── */
function slugify(t: string) { return t.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, ''); }

function buildCategoryOptions(categories: Category[]): CategoryOption[] {
    const childrenOf = new Map<string, Category[]>();
    const roots: Category[] = [];
    for (const c of categories) {
        if (c.parentId) { const a = childrenOf.get(c.parentId) ?? []; a.push(c); childrenOf.set(c.parentId, a); }
        else roots.push(c);
    }
    const opts: CategoryOption[] = [];
    function walk(cat: Category, depth: number) {
        opts.push({ id: cat.id, label: (depth === 0 ? '' : '  '.repeat(depth) + '└ ') + cat.name, depth });
        (childrenOf.get(cat.id) ?? []).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).forEach(c => walk(c, depth + 1));
    }
    roots.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).forEach(r => walk(r, 0));
    return opts;
}

/* ─── Sub-components ─────────────────────────────────────────── */
function FieldRow({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
            {children}
            {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
        </div>
    );
}

function SelectField({ name, value, onChange, options, placeholder }: { name: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
    return (
        <select name={name} value={value} onChange={e => onChange(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40">
            <option value="">{placeholder ?? 'Select…'}</option>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    );
}

function TextInput({ name, value, onChange, placeholder, type = 'text' }: { name: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
    return <input type={type} name={name} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40" />;
}

/* ─── Main Component ─────────────────────────────────────────── */
export function ProductForm({ initialData, categories, collections = [], action }: ProductFormProps) {
    const isEdit = !!initialData?.id;

    // Basic
    const [name, setName] = useState(initialData?.name ?? '');
    const [slug, setSlug] = useState(initialData?.slug ?? '');
    const [slugTouched, setSlugTouched] = useState(false);
    const [desc, setDesc] = useState(initialData?.description ?? '');
    const [shortDesc, setShortDesc] = useState(initialData?.shortDescription ?? '');
    const [detailedInfo, setDetailedInfo] = useState(initialData?.detailedInfo ?? '');
    const [material, setMaterial] = useState(initialData?.material ?? '');
    const [fabricType, setFabricType] = useState(initialData?.fabricType ?? '');
    const [specs, setSpecs] = useState<Spec[]>(() => { try { const p = JSON.parse(initialData?.specifications ?? '[]'); return Array.isArray(p) ? p : []; } catch { return []; } });
    const [displaySku, setDisplaySku] = useState(initialData?.displaySku ?? '');
    const [brand, setBrand] = useState(initialData?.brand ?? '');

    // Pricing
    const [price, setPrice] = useState(String(initialData?.price ?? ''));
    const [salePrice, setSalePrice] = useState(String(initialData?.salePrice ?? ''));
    const [mrp, setMrp] = useState(String(initialData?.mrp ?? ''));
    const [gstRate, setGstRate] = useState(String(initialData?.gstRate ?? ''));

    // Organisation
    const [active, setActive] = useState(initialData?.active ?? true);
    const [featured, setFeatured] = useState(initialData?.featured ?? false);
    const [freeShipping, setFreeShipping] = useState(initialData?.freeShipping ?? true);
    const [returnEligible, setReturnEligible] = useState(initialData?.returnEligible ?? true);
    const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? '');
    const [collectionId, setCollectionId] = useState(initialData?.collectionId ?? '');
    const [tags, setTags] = useState<string[]>(() => { try { return JSON.parse(initialData?.tags ?? '[]'); } catch { return []; } });
    const [tagInput, setTagInput] = useState('');

    // Compliance / Logistics
    const [hsnCode, setHsnCode] = useState(initialData?.hsnCode ?? '');
    const [countryOfOrigin, setCountryOfOrigin] = useState(initialData?.countryOfOrigin ?? 'India');
    const [weight, setWeight] = useState(String(initialData?.weight ?? ''));
    const [shippingDays, setShippingDays] = useState(initialData?.shippingDays ?? '3-7 days');

    // Universal attributes
    const [gender, setGender] = useState(initialData?.gender ?? '');
    const [occasion, setOccasion] = useState(initialData?.occasion ?? '');

    // Clothing
    const [pattern, setPattern] = useState(initialData?.pattern ?? '');
    const [fit, setFit] = useState(initialData?.fit ?? '');
    const [neckType, setNeckType] = useState(initialData?.neckType ?? '');
    const [sleeveType, setSleeveType] = useState(initialData?.sleeveType ?? '');
    const [workType, setWorkType] = useState(initialData?.workType ?? '');
    const [topLength, setTopLength] = useState(initialData?.topLength ?? '');
    const [bottomLength, setBottomLength] = useState(initialData?.bottomLength ?? '');
    const [careInstructions, setCareInstructions] = useState(initialData?.careInstructions ?? '');
    const [washCare, setWashCare] = useState<string[]>(() => { try { return JSON.parse(initialData?.washCare ?? '[]'); } catch { return []; } });
    const [bottomType, setBottomType] = useState(initialData?.bottomType ?? '');
    const [dupatteIncluded, setDupatteIncluded] = useState(initialData?.dupatteIncluded ?? false);
    const [blousePiece, setBlousePiece] = useState(initialData?.blousePiece ?? '');

    // Perfume
    const [concentration, setConcentration] = useState(initialData?.concentration ?? '');
    const [volumeMl, setVolumeMl] = useState(String(initialData?.volumeMl ?? ''));
    const [fragranceFamily, setFragranceFamily] = useState(initialData?.fragranceFamily ?? '');
    const [topNotes, setTopNotes] = useState(initialData?.topNotes ?? '');
    const [middleNotes, setMiddleNotes] = useState(initialData?.middleNotes ?? '');
    const [baseNotes, setBaseNotes] = useState(initialData?.baseNotes ?? '');

    // Electronics
    const [connectivity, setConnectivity] = useState(initialData?.connectivity ?? '');
    const [batteryLife, setBatteryLife] = useState(initialData?.batteryLife ?? '');
    const [warranty, setWarranty] = useState(initialData?.warranty ?? '');
    const [waterResistance, setWaterResistance] = useState(initialData?.waterResistance ?? '');

    // Footwear
    const [heelHeight, setHeelHeight] = useState(initialData?.heelHeight ?? '');
    const [soleMaterial, setSoleMaterial] = useState(initialData?.soleMaterial ?? '');
    const [closureType, setClosureType] = useState(initialData?.closureType ?? '');

    // SEO
    const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle ?? '');
    const [metaDesc, setMetaDesc] = useState(initialData?.metaDesc ?? '');

    // Images
    const [images, setImages] = useState<string[]>(() => { try { const p = JSON.parse(initialData?.images ?? '[]'); return Array.isArray(p) ? p : []; } catch { return []; } });
    const [heroIdx, setHeroIdx] = useState(0);
    const [uploading, setUploading] = useState<UploadingFile[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);

    // Variants
    const [variants, setVariants] = useState<Variant[]>(initialData?.variants?.map(v => ({ ...v, price: String(v.price ?? ''), color: v.color ?? '' })) ?? []);

    // UI
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [catOpen, setCatOpen] = useState(false);
    const [catSearch, setCatSearch] = useState('');
    const catRef = useRef<HTMLDivElement>(null);

    // Auto-slug
    useEffect(() => { if (!slugTouched && name) setSlug(slugify(name)); }, [name, slugTouched]);

    // Detect category group
    const group = useMemo(() => detectGroup(categoryId, categories), [categoryId, categories]);
    const isClothing = group === 'clothing' || group === 'kids';
    const isSaree = isClothing && categories.find(c => c.id === categoryId)?.name?.toLowerCase().includes('saree');
    const isSet = isClothing && (categories.find(c => c.id === categoryId)?.name?.toLowerCase().includes('set') || categories.find(c => c.id === categoryId)?.name?.toLowerCase().includes('three'));
    const isPerfume = group === 'perfume';
    const isElectronics = group === 'electronics';
    const isFootwear = group === 'footwear';

    // Category options
    const catOptions = useMemo(() => buildCategoryOptions(categories), [categories]);
    const filteredCatOptions = useMemo(() => catSearch ? catOptions.filter(o => o.label.toLowerCase().includes(catSearch.toLowerCase())) : catOptions, [catOptions, catSearch]);
    const selectedCatLabel = catOptions.find(o => o.id === categoryId)?.label ?? '';

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => { if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // File upload
    async function handleFiles(files: FileList | null) {
        if (!files) return;
        const arr = Array.from(files);
        const newUploading: UploadingFile[] = arr.map(f => ({ id: Math.random().toString(36).slice(2), name: f.name, progress: 0 }));
        setUploading(prev => [...prev, ...newUploading]);
        await Promise.all(arr.map(async (file, i) => {
            const id = newUploading[i].id;
            const fd = new FormData(); fd.append('file', file);
            try {
                setUploading(prev => prev.map(u => u.id === id ? { ...u, progress: 30 } : u));
                const res = await fetch('/api/upload', { method: 'POST', body: fd });
                setUploading(prev => prev.map(u => u.id === id ? { ...u, progress: 80 } : u));
                const data = await res.json();
                if (data.url) {
                    setImages(prev => [...prev, data.url]);
                    setUploading(prev => prev.map(u => u.id === id ? { ...u, progress: 100, url: data.url } : u));
                    setTimeout(() => setUploading(prev => prev.filter(u => u.id !== id)), 1500);
                } else {
                    setUploading(prev => prev.map(u => u.id === id ? { ...u, error: data.error ?? 'Failed' } : u));
                }
            } catch {
                setUploading(prev => prev.map(u => u.id === id ? { ...u, error: 'Upload failed' } : u));
            }
        }));
    }

    function moveImage(idx: number, dir: -1 | 1) {
        const ni = idx + dir;
        if (ni < 0 || ni >= images.length) return;
        const next = [...images];[next[idx], next[ni]] = [next[ni], next[idx]];
        setImages(next);
        if (heroIdx === idx) setHeroIdx(ni);
        else if (heroIdx === ni) setHeroIdx(idx);
    }

    function addTag(val: string) {
        const t = val.trim();
        if (t && !tags.includes(t)) setTags([...tags, t]);
        setTagInput('');
    }

    function addVariant() { setVariants([...variants, { size: '', color: '', price: '', stock: 0, sku: '' }]); }
    function removeVariant(i: number) { setVariants(variants.filter((_, j) => j !== i)); }
    function updateVariant(i: number, k: keyof Variant, v: string | number) {
        setVariants(variants.map((va, j) => j === i ? { ...va, [k]: v } : va));
    }

    function addSpec() { setSpecs([...specs, { key: '', value: '' }]); }
    function updateSpec(i: number, k: 'key' | 'value', v: string) { setSpecs(specs.map((s, j) => j === i ? { ...s, [k]: v } : s)); }
    function removeSpec(i: number) { setSpecs(specs.filter((_, j) => j !== i)); }

    const discountPct = price && salePrice && Number(salePrice) < Number(price)
        ? Math.round((1 - Number(salePrice) / Number(price)) * 100) : 0;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (!categoryId) { setError('Please select a category.'); return; }
        if (!price || Number(price) <= 0) { setError('Please enter a valid price.'); return; }
        if (images.length === 0) { setError('Please upload at least one image.'); return; }
        setSaving(true);

        // Reorder images so hero is first
        const orderedImages = heroIdx > 0 ? [images[heroIdx], ...images.filter((_, i) => i !== heroIdx)] : images;

        const fd = new FormData();
        fd.append('name', name);
        fd.append('slug', slug || slugify(name));
        fd.append('description', desc);
        fd.append('shortDescription', shortDesc);
        fd.append('material', material);
        fd.append('fabricType', fabricType);
        fd.append('specifications', JSON.stringify(specs.filter(s => s.key)));
        fd.append('price', price);
        fd.append('salePrice', salePrice);
        fd.append('mrp', mrp);
        fd.append('gstRate', gstRate);
        fd.append('categoryId', categoryId);
        fd.append('collectionId', collectionId);
        fd.append('images', JSON.stringify(orderedImages));
        if (active) fd.append('active', 'on');
        if (featured) fd.append('featured', 'on');
        if (freeShipping) fd.append('freeShipping', 'on');
        if (returnEligible) fd.append('returnEligible', 'on');
        fd.append('metaTitle', metaTitle);
        fd.append('metaDesc', metaDesc);
        fd.append('tags', JSON.stringify(tags));
        fd.append('displaySku', displaySku);
        fd.append('brand', brand);
        fd.append('gender', gender);
        fd.append('occasion', occasion);
        fd.append('hsnCode', hsnCode);
        fd.append('countryOfOrigin', countryOfOrigin);
        fd.append('weight', weight);
        fd.append('shippingDays', shippingDays);
        // Clothing
        fd.append('pattern', pattern); fd.append('fit', fit);
        fd.append('neckType', neckType); fd.append('sleeveType', sleeveType);
        fd.append('workType', workType); fd.append('topLength', topLength);
        fd.append('bottomLength', bottomLength); fd.append('careInstructions', careInstructions);
        fd.append('washCare', JSON.stringify(washCare));
        fd.append('bottomType', bottomType);
        if (dupatteIncluded) fd.append('dupatteIncluded', 'on');
        fd.append('blousePiece', blousePiece);
        // Perfume
        fd.append('concentration', concentration); fd.append('volumeMl', volumeMl);
        fd.append('fragranceFamily', fragranceFamily); fd.append('topNotes', topNotes);
        fd.append('middleNotes', middleNotes); fd.append('baseNotes', baseNotes);
        // Electronics
        fd.append('connectivity', connectivity); fd.append('batteryLife', batteryLife);
        fd.append('warranty', warranty); fd.append('waterResistance', waterResistance);
        // Footwear
        fd.append('heelHeight', heelHeight); fd.append('soleMaterial', soleMaterial);
        fd.append('closureType', closureType);
        fd.append('variants', JSON.stringify(variants));
        fd.append('detailedInfo', detailedInfo);

        try {
            const res = await action(fd);
            if (res?.error) setError(res.error);
            else window.location.href = '/admin/products';
        } catch { setError('An unexpected error occurred.'); }
        finally { setSaving(false); }
    }

    const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40';
    const toggleCls = (on: boolean) => `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${on ? 'bg-gold' : 'bg-gray-300'}`;

    return (
        <form onSubmit={handleSubmit}>
            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3 -mx-6 mb-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></Link>
                    <div>
                        <h2 className="font-semibold text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
                        <p className="text-xs text-gray-500">Fill in the details to {isEdit ? 'update' : 'create'} a product</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/products" className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">Cancel</Link>
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-60">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving…' : 'Save Product'}
                    </button>
                </div>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

            {/* ── Step 1: Category (full-width, always first) ───────── */}
            <div className="bg-white rounded-xl border-2 border-dashed border-gold/40 p-5 mb-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold text-white text-sm font-bold flex items-center justify-center">1</div>
                    <div className="flex-1 min-w-0">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">
                            Select Category <span className="text-red-500">*</span>
                            <span className="ml-2 text-xs font-normal text-gray-400">— product fields update based on your selection</span>
                        </label>
                        <div className="relative" ref={catRef}>
                            <button type="button" onClick={() => setCatOpen(!catOpen)}
                                className={`w-full flex items-center justify-between border-2 rounded-lg px-4 py-2.5 text-sm text-left transition-colors ${categoryId ? 'border-gold/40 bg-amber-50/50' : 'border-gray-200'
                                    }`}>
                                <span className={categoryId ? 'text-gray-800 font-medium truncate' : 'text-gray-400'}>
                                    {selectedCatLabel || 'Choose a category…'}
                                </span>
                                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${catOpen ? 'rotate-180' : ''} ${categoryId ? 'text-gold' : 'text-gray-400'}`} />
                            </button>
                            {catOpen && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-hidden flex flex-col">
                                    <div className="p-2 border-b"><div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2">
                                        <Search className="w-3.5 h-3.5 text-gray-400" />
                                        <input autoFocus value={catSearch} onChange={e => setCatSearch(e.target.value)} placeholder="Search categories…" className="flex-1 py-1.5 text-xs bg-transparent outline-none" />
                                    </div></div>
                                    <div className="overflow-y-auto">
                                        {filteredCatOptions.map(opt => (
                                            <button key={opt.id} type="button" onClick={() => { setCategoryId(opt.id); setCatOpen(false); setCatSearch(''); }}
                                                className={`w-full text-left px-3 py-2 text-xs hover:bg-amber-50 transition-colors ${categoryId === opt.id ? 'bg-amber-50 text-gold font-semibold' : 'text-gray-700'}`}
                                                style={{ paddingLeft: `${12 + opt.depth * 12}px` }}>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {categoryId && (
                            <p className="text-xs text-gold mt-1.5 font-medium">✓ Category set — relevant fields are now shown below</p>
                        )}
                        {!categoryId && <p className="text-xs text-amber-600 mt-1">⚠ Select a category first to see category-specific fields</p>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Left / Main ─────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Basic Information */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <h3 className="font-semibold text-gray-900">Basic Information</h3>
                        <FieldRow label="Product Name" required>
                            <TextInput name="name" value={name} onChange={setName} placeholder="e.g. Rajasthani Floral Kurti" />
                        </FieldRow>
                        <div className="grid grid-cols-2 gap-4">
                            <FieldRow label="Brand / Label">
                                <TextInput name="brand" value={brand} onChange={setBrand} placeholder="e.g. Glanzoo, No Brand" />
                            </FieldRow>
                            <FieldRow label="Display SKU" hint="Customer-facing code, e.g. KC-080202">
                                <TextInput name="displaySku" value={displaySku} onChange={setDisplaySku} placeholder="KC-080202" />
                            </FieldRow>
                        </div>
                        <FieldRow label="URL Slug">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 shrink-0">/products/</span>
                                <input type="text" value={slug} onChange={e => { setSlug(e.target.value); setSlugTouched(true); }}
                                    className={inputCls} placeholder="auto-generated" />
                                <button type="button" onClick={() => { setSlug(slugify(name)); setSlugTouched(false); }}
                                    className="text-xs text-blue-500 hover:underline shrink-0">Reset</button>
                            </div>
                        </FieldRow>
                        <FieldRow label="Description" hint={`${desc.length} chars`}>
                            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} placeholder="Describe your product in detail…" className={inputCls} />
                        </FieldRow>
                        <FieldRow label="Short Description" hint={`${shortDesc.length}/160 chars`}>
                            <textarea value={shortDesc} onChange={e => setShortDesc(e.target.value.slice(0, 160))} rows={2} className={inputCls} />
                        </FieldRow>
                        <FieldRow label="Detailed Production Information / Story" hint={`${detailedInfo.length} chars (Supports multiple paragraphs)`}>
                            <textarea value={detailedInfo} onChange={e => setDetailedInfo(e.target.value)} rows={10} placeholder="Write a detailed story or information about this product. This will be shown in its own section on the web." className={inputCls} />
                        </FieldRow>
                        <div className="grid grid-cols-2 gap-4">
                            <FieldRow label="Primary Material">
                                <TextInput name="material" value={material} onChange={setMaterial} placeholder="e.g. Cotton, Leather, Metal" />
                            </FieldRow>
                            <FieldRow label="Gender">
                                <SelectField name="gender" value={gender} onChange={setGender}
                                    options={[{ value: 'Women', label: 'Women' }, { value: 'Men', label: 'Men' }, { value: 'Girls', label: 'Girls' }, { value: 'Boys', label: 'Boys' }, { value: 'Unisex', label: 'Unisex' }]} />
                            </FieldRow>
                        </div>
                        <FieldRow label="Occasion">
                            <SelectField name="occasion" value={occasion} onChange={setOccasion}
                                options={[{ value: 'Casual', label: 'Casual' }, { value: 'Festive', label: 'Festive' }, { value: 'Party', label: 'Party Wear' }, { value: 'Wedding', label: 'Wedding' }, { value: 'Formal', label: 'Formal' }, { value: 'Gym', label: 'Gym / Sports' }, { value: 'Sleep', label: 'Sleepwear' }, { value: 'Everyday', label: 'Everyday' }]} />
                        </FieldRow>
                    </div>

                    {/* Media */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <h3 className="font-semibold text-gray-900">Product Images</h3>
                        <div onClick={() => fileRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gold/50 hover:bg-amber-50/30 transition-all">
                            <UploadCloud className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Click to upload images</p>
                            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP · Max 5MB each</p>
                        </div>
                        <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden"
                            onChange={e => handleFiles(e.target.files)} />
                        {uploading.map(u => (
                            <div key={u.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                <span className="text-xs text-gray-600 flex-1 truncate">{u.name}</span>
                                {u.error ? <span className="text-xs text-red-500">{u.error}</span>
                                    : u.progress < 100 ? <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-gold transition-all" style={{ width: `${u.progress}%` }} /></div>
                                        : <span className="text-xs text-green-600">✓ Done</span>}
                            </div>
                        ))}
                        {images.length > 0 && (
                            <div className="grid grid-cols-4 gap-3">
                                {images.map((url, i) => (
                                    <div key={url + i} className="relative group">
                                        <div className="aspect-square rounded-lg overflow-hidden border-2 transition-colors" style={{ borderColor: i === heroIdx ? '#D4AF37' : '#e5e7eb' }}>
                                            <Image src={url} alt={`img-${i}`} fill className="object-cover" unoptimized />
                                        </div>
                                        {i === heroIdx && <span className="absolute top-1 left-1 bg-gold text-white text-[9px] font-bold px-1 rounded">MAIN</span>}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                                            <button type="button" onClick={() => setHeroIdx(i)} title="Set as main">
                                                {i === heroIdx ? <StarOff className="w-4 h-4 text-gold" /> : <Star className="w-4 h-4 text-white" />}
                                            </button>
                                            <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0}><ArrowUp className="w-4 h-4 text-white disabled:opacity-30" /></button>
                                            <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1}><ArrowDown className="w-4 h-4 text-white" /></button>
                                            <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}><X className="w-4 h-4 text-red-400" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Clothing Attributes ─────────────────────────── */}
                    {isClothing && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                            <h3 className="font-semibold text-gray-900">Clothing Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FieldRow label="Fabric Type">
                                    <SelectField name="fabricType" value={fabricType} onChange={setFabricType}
                                        options={['Cotton', 'Rayon', 'Georgette', 'Chiffon', 'Silk', 'Chanderi', 'Viscose', 'Linen', 'Polyester', 'Denim', 'Crepe', 'Net', 'Organza', 'Velvet'].map(v => ({ value: v, label: v }))} />
                                </FieldRow>
                                <FieldRow label="Pattern / Print">
                                    <SelectField name="pattern" value={pattern} onChange={setPattern}
                                        options={['Solid', 'Floral', 'Ethnic Motifs', 'Bandhani', 'Ikat', 'Geometric', 'Striped', 'Printed', 'Embroidered', 'Checked', 'Abstract', 'Animal Print', 'Ombre'].map(v => ({ value: v, label: v }))} />
                                </FieldRow>
                                <FieldRow label="Fit / Silhouette">
                                    <SelectField name="fit" value={fit} onChange={setFit}
                                        options={['Regular', 'Slim', 'Loose / Comfort', 'A-Line', 'Straight', 'Flared', 'Anarkali', 'Empire', 'Relaxed'].map(v => ({ value: v, label: v }))} />
                                </FieldRow>
                                <FieldRow label="Neck Type">
                                    <SelectField name="neckType" value={neckType} onChange={setNeckType}
                                        options={['Round', 'V-Neck', 'Mandarin', 'Notch', 'Halter', 'Square', 'Boat', 'Off-shoulder', 'Keyhole'].map(v => ({ value: v, label: v }))} />
                                </FieldRow>
                                <FieldRow label="Sleeve Type">
                                    <SelectField name="sleeveType" value={sleeveType} onChange={setSleeveType}
                                        options={['Sleeveless', 'Short (< 1/4)', 'Half (1/2)', '3/4th', 'Full', 'Flared', 'Roll-up', 'Cap'].map(v => ({ value: v, label: v }))} />
                                </FieldRow>
                                <FieldRow label="Work / Embellishment">
                                    <SelectField name="workType" value={workType} onChange={setWorkType}
                                        options={['None', 'Embroidery', 'Zari', 'Gotta Patti', 'Sequins', 'Block Print', 'Mirror Work', 'Smocking', 'Tie-Dye', 'Applique', 'Lace', 'Stone Work'].map(v => ({ value: v, label: v }))} />
                                </FieldRow>
                                <FieldRow label="Top Length" hint="e.g. 42 inches / Knee Length">
                                    <TextInput name="topLength" value={topLength} onChange={setTopLength} placeholder="e.g. 42 inches" />
                                </FieldRow>
                                <FieldRow label="Bottom Length">
                                    <TextInput name="bottomLength" value={bottomLength} onChange={setBottomLength} placeholder="e.g. 38 inches" />
                                </FieldRow>
                            </div>
                            {isSet && (
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                                    <FieldRow label="Bottom Type">
                                        <SelectField name="bottomType" value={bottomType} onChange={setBottomType}
                                            options={['Palazzo', 'Salwar', 'Sharara', 'Trouser', 'Churidar', 'Leggings', 'Dhoti'].map(v => ({ value: v, label: v }))} />
                                    </FieldRow>
                                    <FieldRow label="Dupatta Included">
                                        <button type="button" onClick={() => setDupatteIncluded(!dupatteIncluded)} className={toggleCls(dupatteIncluded)}>
                                            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${dupatteIncluded ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </FieldRow>
                                </div>
                            )}
                            {isSaree && (
                                <FieldRow label="Blouse Piece">
                                    <SelectField name="blousePiece" value={blousePiece} onChange={setBlousePiece}
                                        options={[{ value: 'Included', label: 'Included' }, { value: 'Not Included', label: 'Not Included' }, { value: 'Separate', label: 'Sold Separately' }]} />
                                </FieldRow>
                            )}
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                                <FieldRow label="Care Instructions">
                                    <textarea value={careInstructions} onChange={e => setCareInstructions(e.target.value)} rows={2}
                                        placeholder="e.g. Hand wash cold, do not tumble dry" className={inputCls} />
                                </FieldRow>
                                <FieldRow label="Wash Care">
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {['Hand wash', 'Machine wash', 'Dry clean only', 'Do not bleach', 'Do not iron', 'Flat dry'].map(w => (
                                            <label key={w} className="flex items-center gap-1.5 cursor-pointer">
                                                <input type="checkbox" checked={washCare.includes(w)} onChange={e => setWashCare(e.target.checked ? [...washCare, w] : washCare.filter(x => x !== w))} className="rounded" />
                                                <span className="text-xs text-gray-600">{w}</span>
                                            </label>
                                        ))}
                                    </div>
                                </FieldRow>
                            </div>
                        </div>
                    )}

                    {/* ── Perfume Attributes ──────────────────────────── */}
                    {isPerfume && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                            <h3 className="font-semibold text-gray-900">Fragrance Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FieldRow label="Concentration">
                                    <SelectField name="concentration" value={concentration} onChange={setConcentration}
                                        options={['Parfum / Extrait', 'EDP (Eau de Parfum)', 'EDT (Eau de Toilette)', 'EDC (Eau de Cologne)', 'Attar / Itr', 'Body Mist', 'Deodorant'].map(v => ({ value: v, label: v }))} />
                                </FieldRow>
                                <FieldRow label="Volume (ml)">
                                    <TextInput name="volumeMl" value={volumeMl} onChange={setVolumeMl} type="number" placeholder="e.g. 100" />
                                </FieldRow>
                                <FieldRow label="Fragrance Family">
                                    <SelectField name="fragranceFamily" value={fragranceFamily} onChange={setFragranceFamily}
                                        options={['Floral', 'Oriental', 'Woody', 'Fresh / Citrus', 'Aquatic', 'Gourmand', 'Spicy', 'Fruity', 'Green'].map(v => ({ value: v, label: v }))} />
                                </FieldRow>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <FieldRow label="Top Notes" hint="First impression"><TextInput name="topNotes" value={topNotes} onChange={setTopNotes} placeholder="Bergamot, Lemon" /></FieldRow>
                                <FieldRow label="Middle Notes" hint="Heart of fragrance"><TextInput name="middleNotes" value={middleNotes} onChange={setMiddleNotes} placeholder="Rose, Jasmine" /></FieldRow>
                                <FieldRow label="Base Notes" hint="Long-lasting finish"><TextInput name="baseNotes" value={baseNotes} onChange={setBaseNotes} placeholder="Sandalwood, Musk" /></FieldRow>
                            </div>
                        </div>
                    )}

                    {/* ── Electronics Attributes ─────────────────────── */}
                    {isElectronics && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                            <h3 className="font-semibold text-gray-900">Technical Specifications</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FieldRow label="Connectivity"><TextInput name="connectivity" value={connectivity} onChange={setConnectivity} placeholder="e.g. Bluetooth 5.3, Wired" /></FieldRow>
                                <FieldRow label="Battery Life"><TextInput name="batteryLife" value={batteryLife} onChange={setBatteryLife} placeholder="e.g. 30 hours" /></FieldRow>
                                <FieldRow label="Water Resistance">
                                    <SelectField name="waterResistance" value={waterResistance} onChange={setWaterResistance}
                                        options={['None', 'IPX4', 'IPX5', 'IPX7', 'IP67', 'IP68'].map(v => ({ value: v, label: v }))} />
                                </FieldRow>
                                <FieldRow label="Warranty"><TextInput name="warranty" value={warranty} onChange={setWarranty} placeholder="e.g. 1 Year, 6 Months" /></FieldRow>
                            </div>
                        </div>
                    )}

                    {/* ── Footwear Attributes ─────────────────────────── */}
                    {isFootwear && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                            <h3 className="font-semibold text-gray-900">Footwear Details</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <FieldRow label="Heel Height">
                                    <SelectField name="heelHeight" value={heelHeight} onChange={setHeelHeight}
                                        options={['Flat', 'Low (< 1 inch)', 'Mid (1–2 inch)', 'High (> 2 inch)', 'Block Heel', 'Stiletto', 'Kitten Heel'].map(v => ({ value: v, label: v }))} />
                                </FieldRow>
                                <FieldRow label="Sole Material">
                                    <SelectField name="soleMaterial" value={soleMaterial} onChange={setSoleMaterial}
                                        options={['Rubber', 'EVA', 'TPR', 'Leather', 'PU', 'Cork', 'Synthetic'].map(v => ({ value: v, label: v }))} />
                                </FieldRow>
                                <FieldRow label="Closure Type">
                                    <SelectField name="closureType" value={closureType} onChange={setClosureType}
                                        options={['Slip-on', 'Lace-up', 'Velcro', 'Buckle', 'Ankle Strap', 'Zip', 'Hook & Loop'].map(v => ({ value: v, label: v }))} />
                                </FieldRow>
                            </div>
                        </div>
                    )}

                    {/* Specifications */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Specifications</h3>
                            <button type="button" onClick={addSpec} className="text-xs text-gold hover:underline flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Spec</button>
                        </div>
                        {specs.map((s, i) => (
                            <div key={i} className="flex gap-2 items-center">
                                <input value={s.key} onChange={e => updateSpec(i, 'key', e.target.value)} placeholder="e.g. Weight" className={`${inputCls} w-1/3`} />
                                <input value={s.value} onChange={e => updateSpec(i, 'value', e.target.value)} placeholder="e.g. 250g" className={`${inputCls} flex-1`} />
                                <button type="button" onClick={() => removeSpec(i)}><Trash2 className="w-4 h-4 text-red-400" /></button>
                            </div>
                        ))}
                        {specs.length === 0 && <p className="text-xs text-gray-400">No specs added yet.</p>}
                    </div>

                    {/* Variants */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">Variants & Inventory</h3>
                                <p className="text-xs text-gray-400">Add size/colour combinations with individual stock counts.</p>
                            </div>
                            <button type="button" onClick={addVariant} className="flex items-center gap-1 text-sm text-gold hover:underline"><Plus className="w-4 h-4" /> Add Variant</button>
                        </div>
                        {variants.length === 0
                            ? <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed rounded-xl">No variants added yet.<br /><span className="text-xs">Leave empty to auto-create a &quot;Standard&quot; variant.</span></div>
                            : (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-5 gap-2 text-xs font-medium text-gray-500 px-1">
                                        <span>Size / Label</span><span>Colour</span><span>Price Override (₹)</span><span>Stock</span><span>SKU</span>
                                    </div>
                                    {variants.map((v, i) => (
                                        <div key={i} className="grid grid-cols-5 gap-2 items-center">
                                            <input value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} placeholder="S / M / 30ml" className={inputCls} />
                                            <input value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)} placeholder="Red / #FF0000" className={inputCls} />
                                            <input value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} type="number" placeholder="Leave blank to use base" className={inputCls} />
                                            <input value={v.stock} onChange={e => updateVariant(i, 'stock', Number(e.target.value))} type="number" min="0" className={inputCls} />
                                            <div className="flex gap-1">
                                                <input value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} placeholder="auto" className={`${inputCls} flex-1 min-w-0`} />
                                                <button type="button" onClick={() => removeVariant(i)}><Trash2 className="w-4 h-4 text-red-400" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>

                    {/* SEO */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <h3 className="font-semibold text-gray-900">SEO</h3>
                        <FieldRow label="Meta Title" hint={`${metaTitle.length}/60 chars`}>
                            <input value={metaTitle} onChange={e => setMetaTitle(e.target.value.slice(0, 60))} maxLength={60} className={inputCls} placeholder="SEO title for search engines" />
                        </FieldRow>
                        <FieldRow label="Meta Description" hint={`${metaDesc.length}/160 chars`}>
                            <textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value.slice(0, 160))} maxLength={160} rows={3} className={inputCls} placeholder="SEO description for search engines" />
                        </FieldRow>
                        {metaTitle && (
                            <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                                <p className="text-xs text-gray-400 mb-1">Google Preview</p>
                                <p className="text-[#1a0dab] text-sm font-medium truncate hover:underline cursor-pointer">{metaTitle}</p>
                                <p className="text-[#006621] text-xs">glanzoo.com/products/{slug || 'product-slug'}</p>
                                <p className="text-gray-600 text-xs mt-0.5 line-clamp-2">{metaDesc}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right Sidebar ─────────────────────────────────── */}
                <div className="space-y-6">
                    {/* Pricing */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                        <h3 className="font-semibold text-gray-900">Pricing</h3>
                        <FieldRow label="Base Price (₹)" required>
                            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" step="0.01" className={`${inputCls} pl-7`} placeholder="0.00" /></div>
                        </FieldRow>
                        <FieldRow label="Sale Price (₹)">
                            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                <input type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} min="0" step="0.01" className={`${inputCls} pl-7`} placeholder="Leave blank if no sale" /></div>
                        </FieldRow>
                        <FieldRow label="MRP (₹)" hint="Printed on label">
                            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                <input type="number" value={mrp} onChange={e => setMrp(e.target.value)} min="0" step="0.01" className={`${inputCls} pl-7`} placeholder="Maximum Retail Price" /></div>
                        </FieldRow>
                        {discountPct > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center text-sm text-green-700 font-semibold">{discountPct}% OFF · Customer saves ₹{(Number(price) - Number(salePrice)).toFixed(0)}</div>
                        )}
                    </div>

                    {/* Organisation */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                        <h3 className="font-semibold text-gray-900">Organisation</h3>
                        <FieldRow label="Status">
                            <select value={active ? 'active' : 'draft'} onChange={e => setActive(e.target.value === 'active')} className={inputCls}>
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                            </select>
                        </FieldRow>
                        {/* Category is now at the top — removed from here */}
                        {/* Collection */}
                        {collections.length > 0 && (
                            <FieldRow label="Collection">
                                <select value={collectionId} onChange={e => setCollectionId(e.target.value)} className={inputCls}>
                                    <option value="">No collection</option>
                                    {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </FieldRow>
                        )}
                        {/* Tags */}
                        <FieldRow label="Tags">
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {tags.map(t => (
                                    <span key={t} className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-0.5 rounded-full">
                                        <Tag className="w-2.5 h-2.5" />{t}
                                        <button type="button" onClick={() => setTags(tags.filter(x => x !== t))}><X className="w-2.5 h-2.5" /></button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); } }}
                                    placeholder="Type tag, press Enter" className={`${inputCls} flex-1`} />
                                <button type="button" onClick={() => addTag(tagInput)} className="px-3 py-2 bg-gray-100 rounded-lg text-xs hover:bg-gray-200">Add</button>
                            </div>
                        </FieldRow>
                        {/* Toggles */}
                        {[
                            { label: 'Featured Product', sub: 'Show in featured sections', val: featured, set: setFeatured },
                            { label: 'Free Shipping', sub: 'Offer free shipping', val: freeShipping, set: setFreeShipping },
                            { label: 'Return Eligible', sub: 'Allow returns / exchanges', val: returnEligible, set: setReturnEligible },
                        ].map(({ label, sub, val, set }) => (
                            <div key={label} className="flex items-center justify-between py-2 border-t border-gray-50">
                                <div><p className="text-sm font-medium text-gray-700">{label}</p><p className="text-xs text-gray-400">{sub}</p></div>
                                <button type="button" onClick={() => set(!val)} className={toggleCls(val)}>
                                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${val ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Logistics */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                        <h3 className="font-semibold text-gray-900">Logistics</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <FieldRow label="Weight (grams)">
                                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} min="0" placeholder="e.g. 350" className={inputCls} />
                            </FieldRow>
                            <FieldRow label="Shipping Days">
                                <select value={shippingDays} onChange={e => setShippingDays(e.target.value)} className={inputCls}>
                                    {['1-3 days', '3-5 days', '5-7 days', '7-10 days', '10-15 days'].map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </FieldRow>
                        </div>
                    </div>

                    {/* Compliance */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                        <h3 className="font-semibold text-gray-900">Compliance & Tax</h3>
                        <FieldRow label="HSN Code" hint="India GST compliance">
                            <TextInput name="hsnCode" value={hsnCode} onChange={setHsnCode} placeholder="e.g. 6104" />
                        </FieldRow>
                        <FieldRow label="GST Rate">
                            <SelectField name="gstRate" value={gstRate} onChange={setGstRate}
                                options={[{ value: '0', label: '0% (Exempt)' }, { value: '5', label: '5% (≤ ₹1000 garments)' }, { value: '12', label: '12% (> ₹1000 garments)' }, { value: '18', label: '18%' }, { value: '28', label: '28%' }]} />
                        </FieldRow>
                        <FieldRow label="Country of Origin">
                            <TextInput name="countryOfOrigin" value={countryOfOrigin} onChange={setCountryOfOrigin} placeholder="India" />
                        </FieldRow>
                    </div>
                </div>
            </div>
        </form>
    );
}
