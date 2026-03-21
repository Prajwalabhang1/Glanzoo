import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { ProductDetailClient } from './ProductDetailClient'
import { ProductReviews } from '@/components/products/ProductReviews'

interface ProductPageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps) {
    const { slug } = await params
    const product = await prisma.product.findUnique({
        where: { slug },
        select: { name: true, description: true, metaTitle: true, metaDesc: true, images: true, price: true, salePrice: true, brand: true, detailedInfo: true },
    })
    if (!product) return {}
    const images = (() => { try { return JSON.parse(product.images); } catch { return []; } })()
    const ogImage = images[0] || null
    const title = product.metaTitle || `${product.name} | Glanzoo`
    const description = product.metaDesc || product.description || `Buy ${product.name} from Glanzoo — premium ethnic fashion.`
    return {
        title, description,
        openGraph: { title, description, type: 'website' as const, images: ogImage ? [{ url: ogImage, width: 800, height: 800, alt: product.name }] : [] },
        twitter: { card: 'summary_large_image' as const, title, description, images: ogImage ? [ogImage] : [] },
    }
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params
    const product = await prisma.product.findUnique({
        where: { slug },
        include: {
            category: true,
            Collection: true,
            SizeChart: true,
            variants: { orderBy: { size: 'asc' } },
            reviews: { where: { approved: true }, select: { rating: true } },
            vendor: { select: { businessName: true } },
        },
    })
    if (!product) notFound()

    const approvedReviews = product.reviews ?? []
    const reviewCount = approvedReviews.length
    const reviewAvg = reviewCount > 0
        ? Math.round((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10 : 0
    const rating = { avg: reviewAvg, count: reviewCount }

    const relatedProducts = await prisma.product.findMany({
        where: { categoryId: product.categoryId, active: true, approvalStatus: 'APPROVED', NOT: { id: product.id } },
        include: {
            category: true,
            variants: true,
            reviews: { where: { approved: true }, select: { rating: true } },
        },
        take: 6,
    })

    const productImages = (() => { try { return JSON.parse(product.images); } catch { return []; } })()
    const displayPrice = product.salePrice ? Number(product.salePrice) : Number(product.price)
    const inStock = product.variants.some(v => v.stock > 0)

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description || '',
        image: productImages,
        sku: product.sku || product.slug,
        brand: { '@type': 'Brand', name: product.brand || 'Glanzoo' },
        offers: {
            '@type': 'Offer',
            url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
            priceCurrency: 'INR',
            price: displayPrice.toFixed(2),
            availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: { '@type': 'Organization', name: 'Glanzoo' },
        },
        ...(reviewCount > 0 && { aggregateRating: { '@type': 'AggregateRating', ratingValue: reviewAvg.toFixed(1), reviewCount } }),
    }

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <ProductDetailClient
                product={{
                    ...product,
                    price: Number(product.price),
                    salePrice: product.salePrice ? Number(product.salePrice) : null,
                    mrp: product.mrp ? Number(product.mrp) : null,
                    gstRate: product.gstRate ? Number(product.gstRate) : null,
                    volumeMl: product.volumeMl ? Number(product.volumeMl) : null,
                    collection: product.Collection,
                    sizeChart: product.SizeChart,
                    vendorName: product.vendor?.businessName ?? null,
                    variants: product.variants.map(v => ({
                        id: v.id, size: v.size, stock: v.stock,
                        color: v.color ?? null,
                        price: v.price ? Number(v.price) : null,
                    })),
                }}
                relatedProducts={relatedProducts.map(p => {
                    const relReviews = p.reviews ?? []
                    const relCount = relReviews.length
                    const relAvg = relCount > 0 ? Math.round((relReviews.reduce((sum, r) => sum + r.rating, 0) / relCount) * 10) / 10 : 0
                    return { ...p, price: Number(p.price), salePrice: p.salePrice ? Number(p.salePrice) : null, rating: { avg: relAvg, count: relCount } }
                })}
                rating={rating}
            />
            <div className="container mx-auto px-4 pb-16">
                <ProductReviews productId={product.id} />
            </div>
        </>
    )
}
