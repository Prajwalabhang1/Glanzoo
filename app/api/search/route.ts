export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, categories } from '@/lib/schema';
import { eq, and, like, or } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        if (!query.trim()) return NextResponse.json({ results: [] });

        const lowerQuery = query.toLowerCase();
        const rows = await db.select({
            id: products.id, slug: products.slug, name: products.name,
            price: products.price, salePrice: products.salePrice, images: products.images,
            categoryName: categories.name,
        }).from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .where(and(
                eq(products.active, true),
                or(like(products.name, `%${query}%`), like(products.description, `%${query}%`))
            ))
            .limit(50);

        const filtered = rows
            .filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.categoryName?.toLowerCase().includes(lowerQuery)
            )
            .slice(0, 10);

        const results = filtered.map(p => {
            let images: string[] = [];
            try { const parsed = typeof p.images === 'string' ? JSON.parse(p.images) : p.images; images = Array.isArray(parsed) ? parsed : [parsed]; } catch { /* */ }
            return { id: p.id, name: p.name, slug: p.slug, price: p.price, salePrice: p.salePrice, category: p.categoryName ?? '', image: images[0] || '/placeholder-product.svg' };
        });

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
    }
}
