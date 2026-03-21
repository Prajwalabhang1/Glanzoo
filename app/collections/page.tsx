import prisma from '@/lib/prisma'
import { CollectionCard } from '@/components/collections/CollectionCard'
import { Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CollectionsPage() {
    // Fetch all collections with product counts
    const collections = await prisma.collection.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            banner: true,
            _count: {
                select: {
                    products: true,
                },
            },
        },
        orderBy: {
            name: 'asc',
        },
    })

    const collectionsWithCount = collections.map((collection) => ({
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        image: collection.banner ?? null,
        productCount: collection._count.products,
    }))

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Hero Section */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-12 md:py-16">
                    <div className="max-w-3xl">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose/10 via-coral/10 to-gold/10 rounded-full mb-6">
                            <Sparkles className="w-4 h-4 text-coral" />
                            <span className="text-sm font-semibold text-gray-700">
                                Curated Collections
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-4">
                            Explore Our{' '}
                            <span className="text-gradient-vibrant">Collections</span>
                        </h1>

                        {/* Description */}
                        <p className="text-lg md:text-xl text-gray-600">
                            Discover thoughtfully curated styles for every occasion. From timeless
                            classics to trending pieces, find your perfect ensemble.
                        </p>
                    </div>
                </div>
            </div>

            {/* Collections Grid */}
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
    )
}
