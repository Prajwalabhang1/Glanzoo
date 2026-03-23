import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { productVariants, products, vendors } from '@/lib/schema';
import { eq, lte } from 'drizzle-orm';

export async function GET() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const variants = await db.select({
            id: productVariants.id, productId: productVariants.productId,
            size: productVariants.size, stock: productVariants.stock,
            productName: products.name, productSlug: products.slug,
            productImages: products.images, vendorId: products.vendorId,
            vendorName: vendors.businessName,
        }).from(productVariants)
            .innerJoin(products, eq(productVariants.productId, products.id))
            .leftJoin(vendors, eq(products.vendorId, vendors.id))
            .where(lte(productVariants.stock, 10))
            .orderBy(productVariants.stock);

        const formatted = variants.map(v => {
            let image = '/placeholder-product.svg';
            try { const parsed = JSON.parse(v.productImages); image = Array.isArray(parsed) ? parsed[0] : parsed; } catch { image = v.productImages; }
            return { id: v.id, productId: v.productId, productName: v.productName, slug: v.productSlug, size: v.size, stock: v.stock, image, vendor: v.vendorName || 'Admin' };
        });

        return NextResponse.json({ lowStock: formatted });
    } catch { return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 }); }
}
