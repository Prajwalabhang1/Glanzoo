import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { products as productsTable, categories } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://glanzoo.com';

    const staticPages = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
        { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
        { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
        { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    ];

    interface SitemapEntry { url: string; lastModified: Date; changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'; priority: number; }

    let productPages: SitemapEntry[] = [];
    let categoryPages: SitemapEntry[] = [];

    try {
        const [productRows, categoryRows] = await Promise.all([
            db.select({ slug: productsTable.slug, updatedAt: productsTable.updatedAt }).from(productsTable).where(eq(productsTable.active, true)),
            db.select({ slug: categories.slug }).from(categories),
        ]);

        productPages = productRows.map(p => ({
            url: `${baseUrl}/products/${p.slug}`,
            lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
            changeFrequency: 'weekly' as const, priority: 0.8,
        }));

        categoryPages = categoryRows.map(c => ({
            url: `${baseUrl}/collections/${c.slug}`, lastModified: new Date(),
            changeFrequency: 'daily' as const, priority: 0.7,
        }));
    } catch {
        console.warn('Sitemap generation: Database unreachable, skipping dynamic pages.');
    }

    return [...staticPages, ...productPages, ...categoryPages];
}
