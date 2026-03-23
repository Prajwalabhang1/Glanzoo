import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { products, productVariants } from '@/lib/schema';

interface Variant { size: string; stock: string; sku?: string; }

function cuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export async function POST(req: Request) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { products: productList } = await req.json();
        if (!Array.isArray(productList)) return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });

        const created = [];
        for (const p of productList) {
            const slug = p.slug || p.name.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substring(2, 7);
            const productId = cuid();
            await db.insert(products).values({
                id: productId, name: p.name, slug, description: p.description || '', price: parseFloat(p.price),
                salePrice: p.salePrice ? parseFloat(p.salePrice) : null, images: JSON.stringify(p.images || []),
                categoryId: p.categoryId, material: p.material, active: true, approvalStatus: 'APPROVED',
            });
            if (p.variants && p.variants.length > 0) {
                await db.insert(productVariants).values(
                    p.variants.map((v: Variant) => ({ id: cuid(), productId, size: v.size, stock: parseInt(v.stock), sku: v.sku || `${slug}-${v.size}` }))
                );
            }
            created.push({ id: productId, slug });
        }

        return NextResponse.json({ success: true, count: created.length });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Bulk import failed';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
