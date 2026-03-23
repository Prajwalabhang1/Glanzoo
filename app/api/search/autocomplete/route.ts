export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, categories } from '@/lib/schema';
import { eq, and, like, or, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const query = request.nextUrl.searchParams.get('q');
        if (!query || query.trim().length < 2) return NextResponse.json({ products: [], categories: [] });

        const searchQuery = query.trim();

        const [productRows, categoryRows] = await Promise.all([
            db.select({ id: products.id, name: products.name, slug: products.slug, price: products.price, salePrice: products.salePrice, images: products.images })
                .from(products).where(and(eq(products.active, true), or(like(products.name, `%${searchQuery}%`), like(products.description, `%${searchQuery}%`), like(products.tags, `%${searchQuery}%`)))).limit(5),
            db.select({ id: categories.id, name: categories.name, slug: categories.slug })
                .from(categories).where(like(categories.name, `%${searchQuery}%`)).limit(3),
        ]);

        const formattedProducts = productRows.map(p => {
            let imageUrls: string[] = [];
            try { const parsed = JSON.parse(p.images); imageUrls = Array.isArray(parsed) ? parsed : [parsed]; } catch { imageUrls = [p.images]; }
            imageUrls = imageUrls.filter(url => typeof url === 'string' && url.trim() !== '');
            return { id: p.id, name: p.name, slug: p.slug, price: p.price, salePrice: p.salePrice, image: imageUrls[0] || 'https://placehold.co/400x600?text=No+Image' };
        });

        const categoriesWithCounts = await Promise.all(categoryRows.map(async cat => {
            const [{ total }] = await db.select({ total: count() }).from(products).where(and(eq(products.active, true), eq(products.categoryId, cat.id)));
            return { id: cat.id, name: cat.name, slug: cat.slug, productCount: total };
        }));

        return NextResponse.json({ products: formattedProducts, categories: categoriesWithCounts });
    } catch (error: unknown) {
        console.error('Autocomplete search error:', error);
        return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
    }
}
