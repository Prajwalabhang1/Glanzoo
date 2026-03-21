export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        if (!query.trim()) {
            return NextResponse.json({ results: [] });
        }

        const lowerQuery = query.toLowerCase();

        // Fetch more candidates and filter in JS for SQLite compatibility
        const products = await prisma.product.findMany({
            where: {
                active: true,
                OR: [
                    { name: { contains: query } },
                    { description: { contains: query } },
                ],
            },
            include: {
                category: { select: { name: true } },
            },
            take: 50,
            orderBy: { createdAt: 'desc' },
        });

        // JS-level case-insensitive filter and category name match
        const filtered = products
            .filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                (p.description?.toLowerCase().includes(lowerQuery) ?? false) ||
                p.category?.name.toLowerCase().includes(lowerQuery)
            )
            .slice(0, 10);

        const results = filtered.map((product) => {
            let images: string[] = [];
            try {
                const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                images = Array.isArray(parsed) ? parsed : [parsed];
            } catch { /* ignore */ }
            const mainImage = images[0] || '/placeholder-product.svg';

            return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                salePrice: product.salePrice,
                category: product.category?.name ?? '',
                image: mainImage,
            };
        });

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: 'Failed to search products' },
            { status: 500 }
        );
    }
}
