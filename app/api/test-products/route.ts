export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    const products = await prisma.product.findMany({
        where: { active: true },
        include: {
            category: true,
            variants: true,
        },
    });

    return NextResponse.json({
        count: products.length,
        products: products.map(p => ({
            name: p.name,
            active: p.active,
            category: p.category.name,
        })),
    });
}
