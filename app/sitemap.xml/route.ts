import prisma from '@/lib/prisma';

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://glanzoo.com';

    // Fetch all dynamic routes
    const [products, categories, collections] = await Promise.all([
        prisma.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
        prisma.category.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
        prisma.collection.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    ]);

    const staticPages = [
        '',
        '/products',
        '/categories',
        '/about',
        '/contact',
        '/login',
        '/register',
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticPages
            .map((page) => `
        <url>
          <loc>${baseUrl}${page}</loc>
          <changefreq>daily</changefreq>
          <priority>${page === '' ? '1.0' : '0.8'}</priority>
        </url>
      `).join('')}
      ${products
            .map((p) => `
        <url>
          <loc>${baseUrl}/products/${p.slug}</loc>
          <lastmod>${p.updatedAt.toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
      `).join('')}
      ${categories
            .map((c) => `
        <url>
          <loc>${baseUrl}/category/${c.slug}</loc>
          <lastmod>${c.updatedAt.toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.6</priority>
        </url>
      `).join('')}
      ${collections
            .map((col) => `
        <url>
          <loc>${baseUrl}/collection/${col.slug}</loc>
          <lastmod>${col.updatedAt.toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.6</priority>
        </url>
      `).join('')}
    </urlset>`;

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
