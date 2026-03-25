/**
 * app/page.tsx — Home page
 *
 * Fixes:
 *  - Removed `as any` on FlashSaleSection and FeaturedProducts props
 *    by using proper inferred return types from the data fetching functions.
 *  - Added explicit return type annotation.
 */
import { db } from '@/lib/db';
import { heroBanners, categories, products, productVariants, vendors } from '@/lib/schema';
import { HeroSection } from '@/components/home/HeroSection';
import { CategorySection } from '@/components/home/CategorySection';
import { TodaysCollection } from '@/components/home/TodaysCollection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BrandsMarquee } from '@/components/home/BrandsMarquee';
import { FlashSaleSection } from '@/components/home/FlashSaleSection';
import { LookbookBanner } from '@/components/home/LookbookBanner';
import { TrustBadges } from '@/components/home/TrustBadges';
import { RecentlyViewedSection } from '@/components/home/RecentlyViewed';
import { getTodaysCollection } from '@/lib/todays-collection';
import { eq, and, isNotNull, asc, desc, isNull, inArray } from 'drizzle-orm';

// ISR: Regenerate every hour — home page data is not real-time
export const revalidate = 3600;

async function attachProductRelations<T extends { id: string, categoryId: string, vendorId: string | null }>(productItems: T[]) {
    if (!productItems.length) return [];

    const productIds = productItems.map(p => p.id);
    const categoryIds = [...new Set(productItems.map(p => p.categoryId).filter(Boolean))];
    const vendorIds = [...new Set(productItems.map(p => p.vendorId).filter(Boolean))];

    const [allVariants, allCategories, allVendors] = await Promise.all([
        db.select().from(productVariants).where(inArray(productVariants.productId, productIds)),
        categoryIds.length ? db.select().from(categories).where(inArray(categories.id, categoryIds)) : Promise.resolve([]),
        vendorIds.length ? db.select().from(vendors).where(inArray(vendors.id, vendorIds)) : Promise.resolve([])
    ]);

    const variantsByProduct = allVariants.reduce((acc, v) => {
        if (!acc[v.productId]) acc[v.productId] = [];
        acc[v.productId].push(v);
        return acc;
    }, {} as Record<string, typeof allVariants>);

    const categoryById = Object.fromEntries(allCategories.map(c => [c.id, c]));
    const vendorById = Object.fromEntries(allVendors.map(v => [v.id, v]));

    return productItems.map(p => ({
        ...p,
        category: categoryById[p.categoryId] || null,
        vendor: p.vendorId ? vendorById[p.vendorId] || null : null,
        variants: variantsByProduct[p.id] || []
    }));
}

async function getFeaturedProducts() {
    try {
        const items = await db.select().from(products)
            .where(and(eq(products.active, true), eq(products.featured, true)))
            .orderBy(desc(products.createdAt))
            .limit(24);
        return await attachProductRelations(items);
    } catch (error) {
        console.error('[Home] Error fetching featured products:', error);
        return [];
    }
}

async function getCategories() {
    try {
        return await db
            .select()
            .from(categories)
            .where(and(eq(categories.active, true), isNull(categories.parentId)))
            .orderBy(asc(categories.sortOrder));
    } catch (error) {
        console.error('[Home] Error fetching categories:', error);
        return [];
    }
}

async function getFlashSaleProducts() {
    try {
        const items = await db.select().from(products)
            .where(and(eq(products.active, true), isNotNull(products.salePrice)))
            .orderBy(desc(products.updatedAt))
            .limit(10);
        return await attachProductRelations(items);
    } catch (error) {
        console.error('[Home] Error fetching flash sale products:', error);
        return [];
    }
}

async function getHeroBanners() {
    try {
        return await db
            .select()
            .from(heroBanners)
            .where(eq(heroBanners.active, true))
            .orderBy(asc(heroBanners.order));
    } catch (error) {
        console.error('[Home] Error fetching hero banners:', error);
        return [];
    }
}

type FeaturedProductList = Awaited<ReturnType<typeof getFeaturedProducts>>;
type FlashProductList = Awaited<ReturnType<typeof getFlashSaleProducts>>;

export default async function HomePage() {
    const [featuredProducts, categoriesList, todaysProducts, heroBannersList, flashProducts] =
        await Promise.all([
            getFeaturedProducts(),
            getCategories(),
            getTodaysCollection(),
            getHeroBanners(),
            getFlashSaleProducts(),
        ]);

    return (
        <div className="min-h-screen bg-gray-50/50">
            <HeroSection banners={heroBannersList} />
            <BrandsMarquee />
            <CategorySection categories={categoriesList} />
            <FlashSaleSection products={flashProducts as FlashProductList} />
            <TodaysCollection products={todaysProducts} />
            <LookbookBanner />
            <FeaturedProducts products={featuredProducts as FeaturedProductList} />
            <TrustBadges />
            <RecentlyViewedSection />
        </div>
    );
}
