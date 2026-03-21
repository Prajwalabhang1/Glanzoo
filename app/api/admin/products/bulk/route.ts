import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface Variant {
    size: string;
    stock: string;
    sku?: string;
}

export async function POST(req: Request) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { products } = await req.json(); // Array of product objects

        if (!Array.isArray(products)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        const results = await prisma.$transaction(async (tx) => {
            const created = [];
            for (const p of products) {
                // Basic validation and slug generation
                const slug = p.slug || p.name.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substring(2, 7);

                const product = await tx.product.create({
                    data: {
                        name: p.name,
                        slug,
                        description: p.description || '',
                        price: parseFloat(p.price),
                        salePrice: p.salePrice ? parseFloat(p.salePrice) : null,
                        images: JSON.stringify(p.images || []),
                        categoryId: p.categoryId,
                        material: p.material,
                        active: true,
                        approvalStatus: 'APPROVED',
                        variants: {
                            create: p.variants?.map((v: Variant) => ({
                                size: v.size,
                                stock: parseInt(v.stock),
                                sku: v.sku || `${slug}-${v.size}`
                            })) || []
                        }
                    }
                });
                created.push(product);
            }
            return created;
        });

        return NextResponse.json({ success: true, count: results.length });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Bulk import failed';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
