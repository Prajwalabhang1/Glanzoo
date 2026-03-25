/**
 * app/collections/page.tsx — Collections listing page
 *
 * Fixes:
 *  - N+1 BUG: Was firing one COUNT query per collection with Promise.all(map()).
 *    Now uses a single groupBy(collectionId) COUNT query.
 *  - Added ISR revalidation (revalidate=3600) instead of force-dynamic.
 *  - Added page Metadata (title, description).
 */
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { collections, products } from '@/lib/schema';
import { eq, asc, count, isNotNull } from 'drizzle-orm';
import { CollectionCard } from '@/components/collections/CollectionCard';
import { Sparkles } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Collections | Glanzoo',
  description:
    'Explore Glanzoo\'s curated ethnic fashion collections — from timeless classics to trending co-ord sets.',
};

export default async function CollectionsPage() {
  const collectionRows = await db
    .select()
    .from(collections)
    .orderBy(asc(collections.name));

  // FIX N+1: Single grouped count query instead of one COUNT per collection
  const collectionIds = collectionRows.map((c) => c.id);
  const countRows =
    collectionIds.length > 0
      ? await db
          .select({ collectionId: products.collectionId, total: count() })
          .from(products)
          .where(isNotNull(products.collectionId))
          .groupBy(products.collectionId)
      : [];
  const countMap = Object.fromEntries(
    countRows
      .filter((r) => r.collectionId != null)
      .map((r) => [r.collectionId as string, r.total])
  );

  const collectionsWithCount = collectionRows.map((col) => ({
    id: col.id,
    name: col.name,
    slug: col.slug,
    description: col.description,
    image: col.banner ?? null,
    productCount: countMap[col.id] ?? 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose/10 via-coral/10 to-gold/10 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-coral" />
              <span className="text-sm font-semibold text-gray-700">Curated Collections</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-4">
              Explore Our <span className="text-gradient-vibrant">Collections</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Discover thoughtfully curated styles for every occasion. From timeless classics to
              trending pieces, find your perfect ensemble.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {collectionsWithCount.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collectionsWithCount.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No collections available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
