import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const lowStockVariants = await prisma.productVariant.findMany({
            where: {
                stock: { lte: 10 }, // Alert for stock <= 10
            },
            include: {
                product: {
                    select: {
                        name: true,
                        slug: true,
                        images: true,
                        vendorId: true,
                        vendor: {
                            select: { businessName: true }
                        }
                    }
                }
            },
            orderBy: { stock: 'asc' }
        });

        const formatted = lowStockVariants.map(v => {
            let image = '/placeholder-product.svg';
            try {
                const parsed = JSON.parse(v.product.images);
                image = Array.isArray(parsed) ? parsed[0] : parsed;
            } catch { image = v.product.images; }

            return {
                id: v.id,
                productId: v.productId,
                productName: v.product.name,
                slug: v.product.slug,
                size: v.size,
                stock: v.stock,
                image,
                vendor: v.product.vendor?.businessName || 'Admin'
            };
        });

        return NextResponse.json({ lowStock: formatted });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
    }
}
