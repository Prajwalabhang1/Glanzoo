import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { collections, products, productVariants, categories } from '@/lib/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { CollectionHero } from '@/components/collections/CollectionHero';
import { CategoryFilterBar } from '@/components/products/CategoryFilterBar';
export const revalidate = 3600;

interface CollectionPageProps { params: Promise<{ slug: string }> }

export default async function CollectionPage({ params }: CollectionPageProps) {
    const { slug } = await params;
    const [collection] = await db.select().from(collections).where(eq(collections.slug, slug)).limit(1);
    if (!collection) notFound();

    const productRows = await db.select().from(products).where(and(eq(products.collectionId, collection.id), eq(products.active, true))).orderBy(desc(products.createdAt));
    const productIds = productRows.map(p => p.id);

    const [variantRows, categoryRows] = productIds.length > 0 ? await Promise.all([
        db.select().from(productVariants).where(inArray(productVariants.productId, productIds)),
        db.select().from(categories),
    ]) : [[], await db.select().from(categories)];

    const catMap = Object.fromEntries(categoryRows.map(c => [c.id, c]));
    const variantMap = variantRows.reduce((acc, v) => { if (!acc[v.productId]) acc[v.productId] = []; acc[v.productId].push(v); return acc; }, {} as Record<string, any[]>);
    const enriched = productRows.map(p => ({ ...p, images: (() => { try { return JSON.parse(p.images); } catch { return []; } })(), category: catMap[p.categoryId] ?? null, variants: variantMap[p.id] ?? [] }));

    const jsonLd = { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: enriched.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${p.slug}` })) };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <div className="min-h-screen bg-gray-50/50">
                <CollectionHero collection={{ name: collection.name, slug: collection.slug, description: collection.description, image: collection.banner ?? null }} productCount={enriched.length} />
                <CategoryFilterBar products={enriched as any} />
            </div>
        </>
    );
}
