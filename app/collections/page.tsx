import { db } from '@/lib/db';
import { collections, products } from '@/lib/schema';
import { eq, asc, count } from 'drizzle-orm';
import { CollectionCard } from '@/components/collections/CollectionCard';
import { Sparkles } from 'lucide-react';
export const dynamic = 'force-dynamic';

export default async function CollectionsPage() {
    const collectionRows = await db.select().from(collections).orderBy(asc(collections.name));
    const collectionsWithCount = await Promise.all(collectionRows.map(async col => {
        const [{ total }] = await db.select({ total: count() }).from(products).where(eq(products.collectionId, col.id));
        return { id: col.id, name: col.name, slug: col.slug, description: col.description, image: col.banner ?? null, productCount: total };
    }));

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-12 md:py-16">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose/10 via-coral/10 to-gold/10 rounded-full mb-6">
                            <Sparkles className="w-4 h-4 text-coral" /><span className="text-sm font-semibold text-gray-700">Curated Collections</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-4">Explore Our <span className="text-gradient-vibrant">Collections</span></h1>
                        <p className="text-lg md:text-xl text-gray-600">Discover thoughtfully curated styles for every occasion. From timeless classics to trending pieces, find your perfect ensemble.</p>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 py-12">
                {collectionsWithCount.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {collectionsWithCount.map(collection => <CollectionCard key={collection.id} collection={collection} />)}
                    </div>
                ) : (
                    <div className="text-center py-16"><p className="text-gray-500 text-lg">No collections available yet</p></div>
                )}
            </div>
        </div>
    );
}
