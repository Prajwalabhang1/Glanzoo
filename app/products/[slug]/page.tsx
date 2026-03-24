import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { products, categories, collections, productVariants, reviews, vendors } from '@/lib/schema';
import { eq, and, ne, asc, inArray } from 'drizzle-orm';
import { ProductDetailClient } from './ProductDetailClient';
import { ProductReviews } from '@/components/products/ProductReviews';

export const dynamic = 'force-dynamic';

interface ProductPageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: ProductPageProps) {
    const { slug } = await params;
    const [product] = await db.select({ name: products.name, description: products.description, metaTitle: products.metaTitle, metaDesc: products.metaDesc, images: products.images, price: products.price, salePrice: products.salePrice }).from(products).where(eq(products.slug, slug)).limit(1);
    if (!product) return {};
    const images = (() => { try { return JSON.parse(product.images); } catch { return []; } })();
    const ogImage = images[0] || null;
    const title = product.metaTitle || `${product.name} | Glanzoo`;
    const description = product.metaDesc || product.description || `Buy ${product.name} from Glanzoo — premium ethnic fashion.`;
    return { title, description, openGraph: { title, description, type: 'website' as const, images: ogImage ? [{ url: ogImage, width: 800, height: 800, alt: product.name }] : [] }, twitter: { card: 'summary_large_image' as const, title, description, images: ogImage ? [ogImage] : [] } };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (!product) notFound();

    const [variantRows, approvedReviews, [categoryRow], [collectionRow], [vendorRow]] = await Promise.all([
        db.select().from(productVariants).where(eq(productVariants.productId, product.id)).orderBy(asc(productVariants.size)),
        db.select({ rating: reviews.rating }).from(reviews).where(and(eq(reviews.productId, product.id), eq(reviews.approved, true))),
        db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1),
        product.collectionId ? db.select().from(collections).where(eq(collections.id, product.collectionId)).limit(1) : Promise.resolve([]),
        product.vendorId ? db.select({ businessName: vendors.businessName }).from(vendors).where(eq(vendors.id, product.vendorId)).limit(1) : Promise.resolve([]),
    ]);

    const reviewCount = approvedReviews.length;
    const reviewAvg = reviewCount > 0 ? Math.round((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10 : 0;

    const relatedProductRows = await db.select().from(products).where(and(eq(products.categoryId, product.categoryId), eq(products.active, true), eq(products.approvalStatus, 'APPROVED'), ne(products.id, product.id))).limit(6);
    const relatedVariantRows = relatedProductRows.length > 0 ? await db.select().from(productVariants).where(inArray(productVariants.productId, relatedProductRows.map(p => p.id))) : [];

    const productImages = (() => { try { return JSON.parse(product.images); } catch { return []; } })();
    const inStock = variantRows.some(v => v.stock > 0);

    const jsonLd = { '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.description || '', image: productImages, sku: product.sku || product.slug, brand: { '@type': 'Brand', name: 'Glanzoo' }, offers: { '@type': 'Offer', url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`, priceCurrency: 'INR', price: (product.salePrice ? Number(product.salePrice) : Number(product.price)).toFixed(2), availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', seller: { '@type': 'Organization', name: 'Glanzoo' } }, ...(reviewCount > 0 && { aggregateRating: { '@type': 'AggregateRating', ratingValue: reviewAvg.toFixed(1), reviewCount } }) };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <ProductDetailClient
                product={{ ...product, price: Number(product.price), salePrice: product.salePrice ? Number(product.salePrice) : null, mrp: product.mrp ? Number(product.mrp) : null, gstRate: product.gstRate ? Number(product.gstRate) : null, volumeMl: product.volumeMl ? Number(product.volumeMl) : null, collection: collectionRow ?? null, sizeChart: null, vendorName: vendorRow?.businessName ?? null, variants: variantRows.map(v => ({ id: v.id, size: v.size, stock: v.stock, color: v.color ?? null, price: v.price ? Number(v.price) : null })) }}
                relatedProducts={relatedProductRows.map(p => { const rv = relatedVariantRows.filter(v => v.productId === p.id); return { ...p, price: Number(p.price), salePrice: p.salePrice ? Number(p.salePrice) : null, variants: rv, rating: { avg: 0, count: 0 } }; }) as any}
                rating={{ avg: reviewAvg, count: reviewCount }}
            />
            <div className="container mx-auto px-4 pb-16"><ProductReviews productId={product.id} /></div>
        </>
    );
}
