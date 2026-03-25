/**
 * app/page.tsx — Home page
 *
 * Fixes:
 *  - Removed `as any` on FlashSaleSection and FeaturedProducts props
 *    by using proper inferred return types from the data fetching functions.
 *  - Added explicit return type annotation.
 */
import { db } from '@/lib/db';
import { heroBanners, categories } from '@/lib/schema';
import { products } from '@/lib/schema';
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
import { eq, and, isNotNull, asc, desc, isNull } from 'drizzle-orm';

// ISR: Regenerate every hour — home page data is not real-time
export const revalidate = 3600;

async function getFeaturedProducts() {
    try {
        return await db.query.products.findMany({
            where: (p, { eq, and }) => and(eq(p.active, true), eq(p.featured, true)),
            with: { category: true, variants: true, vendor: true },
            orderBy: (p, { desc }) => [desc(p.createdAt)],
            limit: 24,
        });
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
        return await db.query.products.findMany({
            where: (p, { eq, and, isNotNull }) => and(eq(p.active, true), isNotNull(p.salePrice)),
            with: { category: true, variants: true, vendor: true },
            orderBy: (p, { desc }) => [desc(p.updatedAt)],
            limit: 10,
        });
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
