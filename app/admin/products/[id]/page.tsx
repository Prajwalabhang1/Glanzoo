export const dynamic = 'force-dynamic';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ProductForm } from '@/components/admin/ProductForm';
import { updateProduct } from '@/lib/actions/products';

interface EditProductPageProps { params: Promise<{ id: string }>; }

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { id } = await params;

    const [rawProduct, categories, collections] = await Promise.all([
        prisma.product.findUnique({ where: { id }, include: { variants: true } }),
        prisma.category.findMany({
            where: { active: true },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        }),
        prisma.collection.findMany({
            where: { active: true },
            orderBy: { sortOrder: 'asc' },
            select: { id: true, name: true },
        }),
    ]);

    if (!rawProduct) notFound();

    // Cast to any to access new schema fields (Prisma client regenerates at build time)
    const p = rawProduct as any;
    const updateProductWithId = updateProduct.bind(null, p.id);

    const initialData = {
        id: p.id, name: p.name,
        description: p.description ?? undefined,
        shortDescription: p.shortDescription ?? undefined,
        material: p.material ?? undefined,
        fabricType: p.fabricType ?? undefined,
        specifications: p.specifications ?? undefined,
        price: p.price, salePrice: p.salePrice ?? undefined,
        mrp: p.mrp ?? undefined, gstRate: p.gstRate ?? undefined,
        categoryId: p.categoryId, collectionId: p.collectionId ?? undefined,
        images: p.images, active: p.active, slug: p.slug,
        metaTitle: p.metaTitle ?? undefined, metaDesc: p.metaDesc ?? undefined,
        tags: p.tags ?? undefined, featured: p.featured,
        freeShipping: p.freeShipping, returnEligible: p.returnEligible,
        displaySku: p.displaySku ?? undefined, brand: p.brand ?? undefined,
        gender: p.gender ?? undefined, occasion: p.occasion ?? undefined,
        hsnCode: p.hsnCode ?? undefined, countryOfOrigin: p.countryOfOrigin ?? 'India',
        weight: p.weight ?? undefined, shippingDays: p.shippingDays,
        // Clothing
        pattern: p.pattern ?? undefined, fit: p.fit ?? undefined,
        neckType: p.neckType ?? undefined, sleeveType: p.sleeveType ?? undefined,
        workType: p.workType ?? undefined, topLength: p.topLength ?? undefined,
        bottomLength: p.bottomLength ?? undefined, careInstructions: p.careInstructions ?? undefined,
        washCare: p.washCare ?? undefined, bottomType: p.bottomType ?? undefined,
        dupatteIncluded: p.dupatteIncluded ?? undefined, blousePiece: p.blousePiece ?? undefined,
        // Perfume
        concentration: p.concentration ?? undefined, volumeMl: p.volumeMl ?? undefined,
        fragranceFamily: p.fragranceFamily ?? undefined, topNotes: p.topNotes ?? undefined,
        middleNotes: p.middleNotes ?? undefined, baseNotes: p.baseNotes ?? undefined,
        // Electronics
        connectivity: p.connectivity ?? undefined, batteryLife: p.batteryLife ?? undefined,
        warranty: p.warranty ?? undefined, waterResistance: p.waterResistance ?? undefined,
        // Footwear
        heelHeight: p.heelHeight ?? undefined, soleMaterial: p.soleMaterial ?? undefined,
        closureType: p.closureType ?? undefined,
        variants: p.variants.map((v: any) => ({
            size: v.size, color: v.color ?? '',
            price: v.price != null ? String(v.price) : '',
            stock: v.stock, sku: v.sku,
        })),
    };

    return (
        <div className="space-y-6 pb-10">
            <ProductForm initialData={initialData} categories={categories} collections={collections} action={updateProductWithId} />
        </div>
    );
}
