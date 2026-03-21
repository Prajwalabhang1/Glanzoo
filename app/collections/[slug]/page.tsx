import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { CollectionHero } from '@/components/collections/CollectionHero'
import { CategoryFilterBar } from '@/components/products/CategoryFilterBar'

export const revalidate = 3600 // ISR

interface CollectionPageProps {
    params: Promise<{ slug: string }>
}

export default async function CollectionPage({ params }: CollectionPageProps) {
    const { slug } = await params

    const collection = await prisma.collection.findUnique({
        where: { slug },
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            banner: true,
            products: {
                where: { active: true },
                include: {
                    category: { select: { name: true, slug: true } },
                    variants: true,
                },
                orderBy: { createdAt: 'desc' },
            },
        },
    })

    if (!collection) notFound()

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'itemListElement': collection.products.map((p, i) => ({
            '@type': 'ListItem',
            'position': i + 1,
            'url': `${process.env.NEXT_PUBLIC_APP_URL}/products/${p.slug}`
        }))
    }

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <div className="min-h-screen bg-gray-50/50">
                <CollectionHero
                    collection={{
                        name: collection.name,
                        slug: collection.slug,
                        description: collection.description,
                        image: collection.banner ?? null,
                    }}
                    productCount={collection.products.length}
                />
                <CategoryFilterBar products={collection.products} />
            </div>
        </>
    )
}

