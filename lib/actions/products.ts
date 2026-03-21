'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const productSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    material: z.string().optional(),
    fabricType: z.string().optional(),
    specifications: z.string().optional(),
    price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
    salePrice: z.coerce.number().min(0).optional(),
    mrp: z.coerce.number().min(0).optional(),
    gstRate: z.coerce.number().optional(),
    categoryId: z.string().min(1, 'Category is required'),
    collectionId: z.string().optional(),
    images: z.string().optional(),
    active: z.boolean().default(true),
    featured: z.boolean().default(false),
    freeShipping: z.boolean().default(true),
    returnEligible: z.boolean().default(true),
    slug: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDesc: z.string().optional(),
    tags: z.string().optional(),
    displaySku: z.string().optional(),
    brand: z.string().optional(),
    gender: z.string().optional(),
    occasion: z.string().optional(),
    hsnCode: z.string().optional(),
    countryOfOrigin: z.string().optional(),
    weight: z.coerce.number().optional(),
    shippingDays: z.string().optional(),
    // Clothing
    pattern: z.string().optional(),
    fit: z.string().optional(),
    neckType: z.string().optional(),
    sleeveType: z.string().optional(),
    workType: z.string().optional(),
    topLength: z.string().optional(),
    bottomLength: z.string().optional(),
    careInstructions: z.string().optional(),
    washCare: z.string().optional(),
    bottomType: z.string().optional(),
    dupatteIncluded: z.boolean().optional(),
    blousePiece: z.string().optional(),
    // Perfume
    concentration: z.string().optional(),
    volumeMl: z.coerce.number().optional(),
    fragranceFamily: z.string().optional(),
    topNotes: z.string().optional(),
    middleNotes: z.string().optional(),
    baseNotes: z.string().optional(),
    // Electronics
    connectivity: z.string().optional(),
    batteryLife: z.string().optional(),
    warranty: z.string().optional(),
    waterResistance: z.string().optional(),
    // Footwear
    heelHeight: z.string().optional(),
    soleMaterial: z.string().optional(),
    closureType: z.string().optional(),
    variants: z.string().optional(),
    detailedInfo: z.string().optional(),
});

function slugify(text: string) {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
    let candidate = base; let suffix = 0;
    while (true) {
        const existing = await prisma.product.findFirst({
            where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) }, select: { id: true },
        });
        if (!existing) return candidate;
        suffix++; candidate = `${base}-${suffix}`;
    }
}

function getStr(fd: FormData, key: string) { const v = fd.get(key); return v ? String(v) : undefined; }

function buildData(data: z.infer<typeof productSchema>) {
    return {
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        material: data.material,
        fabricType: data.fabricType,
        specifications: data.specifications,
        price: data.price,
        salePrice: data.salePrice,
        mrp: data.mrp,
        gstRate: data.gstRate,
        categoryId: data.categoryId,
        collectionId: data.collectionId || null,
        images: data.images as string,
        active: data.active,
        featured: data.featured,
        freeShipping: data.freeShipping,
        returnEligible: data.returnEligible,
        metaTitle: data.metaTitle,
        metaDesc: data.metaDesc,
        tags: data.tags,
        displaySku: data.displaySku,
        brand: data.brand,
        gender: data.gender,
        occasion: data.occasion,
        hsnCode: data.hsnCode,
        countryOfOrigin: data.countryOfOrigin || 'India',
        weight: data.weight,
        shippingDays: data.shippingDays || '3-7 days',
        pattern: data.pattern,
        fit: data.fit,
        neckType: data.neckType,
        sleeveType: data.sleeveType,
        workType: data.workType,
        topLength: data.topLength,
        bottomLength: data.bottomLength,
        careInstructions: data.careInstructions,
        washCare: data.washCare,
        bottomType: data.bottomType,
        dupatteIncluded: data.dupatteIncluded,
        blousePiece: data.blousePiece,
        concentration: data.concentration,
        volumeMl: data.volumeMl,
        fragranceFamily: data.fragranceFamily,
        topNotes: data.topNotes,
        middleNotes: data.middleNotes,
        baseNotes: data.baseNotes,
        connectivity: data.connectivity,
        batteryLife: data.batteryLife,
        warranty: data.warranty,
        waterResistance: data.waterResistance,
        heelHeight: data.heelHeight,
        soleMaterial: data.soleMaterial,
        closureType: data.closureType,
        detailedInfo: data.detailedInfo,
    };
}

function extractRawData(formData: FormData) {
    return {
        name: formData.get('name'),
        description: getStr(formData, 'description'),
        shortDescription: getStr(formData, 'shortDescription'),
        material: getStr(formData, 'material'),
        fabricType: getStr(formData, 'fabricType'),
        specifications: getStr(formData, 'specifications'),
        price: formData.get('price'),
        salePrice: getStr(formData, 'salePrice') || undefined,
        mrp: getStr(formData, 'mrp') || undefined,
        gstRate: getStr(formData, 'gstRate') || undefined,
        categoryId: formData.get('categoryId'),
        collectionId: getStr(formData, 'collectionId'),
        images: formData.get('images') || '[]',
        active: formData.get('active') === 'on',
        featured: formData.get('featured') === 'on',
        freeShipping: formData.get('freeShipping') === 'on',
        returnEligible: formData.get('returnEligible') === 'on',
        slug: getStr(formData, 'slug'),
        metaTitle: getStr(formData, 'metaTitle'),
        metaDesc: getStr(formData, 'metaDesc'),
        tags: formData.get('tags') || '[]',
        displaySku: getStr(formData, 'displaySku'),
        brand: getStr(formData, 'brand'),
        gender: getStr(formData, 'gender'),
        occasion: getStr(formData, 'occasion'),
        hsnCode: getStr(formData, 'hsnCode'),
        countryOfOrigin: getStr(formData, 'countryOfOrigin'),
        weight: getStr(formData, 'weight') || undefined,
        shippingDays: getStr(formData, 'shippingDays'),
        pattern: getStr(formData, 'pattern'), fit: getStr(formData, 'fit'),
        neckType: getStr(formData, 'neckType'), sleeveType: getStr(formData, 'sleeveType'),
        workType: getStr(formData, 'workType'), topLength: getStr(formData, 'topLength'),
        bottomLength: getStr(formData, 'bottomLength'), careInstructions: getStr(formData, 'careInstructions'),
        washCare: getStr(formData, 'washCare'), bottomType: getStr(formData, 'bottomType'),
        dupatteIncluded: formData.get('dupatteIncluded') === 'on' || undefined,
        blousePiece: getStr(formData, 'blousePiece'),
        concentration: getStr(formData, 'concentration'), volumeMl: getStr(formData, 'volumeMl') || undefined,
        fragranceFamily: getStr(formData, 'fragranceFamily'), topNotes: getStr(formData, 'topNotes'),
        middleNotes: getStr(formData, 'middleNotes'), baseNotes: getStr(formData, 'baseNotes'),
        connectivity: getStr(formData, 'connectivity'), batteryLife: getStr(formData, 'batteryLife'),
        warranty: getStr(formData, 'warranty'), waterResistance: getStr(formData, 'waterResistance'),
        heelHeight: getStr(formData, 'heelHeight'), soleMaterial: getStr(formData, 'soleMaterial'),
        closureType: getStr(formData, 'closureType'),
        variants: formData.get('variants') || '[]',
        detailedInfo: getStr(formData, 'detailedInfo'),
    };
}

interface VariantInput { size?: string; color?: string; price?: string | number; stock?: number; sku?: string }

export async function createProduct(formData: FormData) {
    try {
        const data = productSchema.parse(extractRawData(formData));
        let variants: VariantInput[] = [];
        try { variants = JSON.parse(data.variants ?? '[]'); } catch { /* ignore */ }
        const slugBase = data.slug ? slugify(data.slug) : slugify(data.name);
        const finalSlug = await uniqueSlug(slugBase || `product-${Date.now()}`);
        await prisma.$transaction(async (tx) => {
            const product = await tx.product.create({ data: { ...buildData(data), slug: finalSlug, sku: finalSlug } });
            if (variants.length === 0) {
                await tx.productVariant.create({ data: { productId: product.id, size: 'Standard', sku: `${finalSlug}-std`, stock: 0 } });
            } else {
                await tx.productVariant.createMany({
                    data: variants.map(v => ({
                        productId: product.id,
                        size: v.size || 'Standard',
                        color: v.color || null,
                        price: v.price ? Number(v.price) : null,
                        sku: v.sku || `${finalSlug}-${(v.size || 'std').toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).slice(2, 6)}`,
                        stock: Number(v.stock) || 0,
                    })),
                });
            }
        });
        revalidatePath('/admin/products'); revalidatePath('/products'); revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to create product:', error);
        if (error instanceof z.ZodError) return { error: error.errors[0].message };
        return { error: 'Failed to create product.' };
    }
}

export async function updateProduct(id: string, formData: FormData) {
    try {
        const data = productSchema.parse(extractRawData(formData));
        let variants: VariantInput[] = [];
        try { variants = JSON.parse(data.variants ?? '[]'); } catch { /* ignore */ }
        const slugBase = data.slug ? slugify(data.slug) : slugify(data.name);
        const finalSlug = await uniqueSlug(slugBase || `product-${Date.now()}`, id);
        await prisma.$transaction(async (tx) => {
            await tx.product.update({ where: { id }, data: { ...buildData(data), slug: finalSlug } });
            if (variants.length > 0) {
                for (const v of variants) {
                    const variantSku = v.sku || `${finalSlug}-${(v.size || 'std').toLowerCase().replace(/\s+/g, '-')}`;
                    await tx.productVariant.upsert({
                        where: { sku: variantSku },
                        update: { size: v.size || 'Standard', color: v.color || null, price: v.price ? Number(v.price) : null, stock: Number(v.stock) || 0 },
                        create: { productId: id, size: v.size || 'Standard', color: v.color || null, price: v.price ? Number(v.price) : null, sku: variantSku, stock: Number(v.stock) || 0 },
                    });
                }
            }
        });
        revalidatePath('/admin/products'); revalidatePath(`/products/${finalSlug}`); revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to update product:', error);
        if (error instanceof z.ZodError) return { error: error.errors[0].message };
        return { error: 'Failed to update product.' };
    }
}

export async function deleteProduct(id: string) {
    try {
        await prisma.product.delete({ where: { id } });
        revalidatePath('/admin/products'); revalidatePath('/products'); revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete product:', error);
        return { error: 'Failed to delete product.' };
    }
}
