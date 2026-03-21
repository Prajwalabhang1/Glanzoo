import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://glanzoo.com';

    // Static pages
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
    ];

    // Sitemap entries type
    interface SitemapEntry {
        url: string;
        lastModified: Date;
        changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
        priority: number;
    }

    // Get all active products and categories with a try-catch to prevent build failures when DB is offline
    let productPages: SitemapEntry[] = [];
    let categoryPages: SitemapEntry[] = [];

    try {
        const [products, categories] = await Promise.all([
            prisma.product.findMany({
                where: { active: true },
                select: { slug: true, updatedAt: true },
            }),
            prisma.category.findMany({
                select: { slug: true },
            }),
        ]);

        productPages = products.map((product) => ({
            url: `${baseUrl}/products/${product.slug}`,
            lastModified: product.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

        categoryPages = categories.map((category) => ({
            url: `${baseUrl}/collections/${category.slug}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
        }));
    } catch {
        console.warn('Sitemap generation: Database unreachable, skipping dynamic pages.');
    }

    return [...staticPages, ...productPages, ...categoryPages];
}
