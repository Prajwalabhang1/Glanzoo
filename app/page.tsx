import { db } from '@/lib/db';
import { products, categories, heroBanners } from '@/lib/schema';
import { eq, and, isNull, isNotNull, desc, asc } from 'drizzle-orm';
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

// FIX 1: Enable ISR Caching instead of Database-crushing force-dynamic
export const revalidate = 3600;

async function getFeaturedProducts() {
    try {
        // FIX 2: Fetch Relational data so ProductCards have categories & variants
        return await db.query.products.findMany({
            where: (products, { eq, and }) => and(eq(products.active, true), eq(products.featured, true)),
            with: { category: true, variants: true, vendor: true },
            orderBy: (products, { desc }) => [desc(products.createdAt)],
            limit: 24,
        });
    } catch (error) { console.error('Error fetching featured products:', error); return []; }
}

async function getCategories() {
    try {
        // FIX 3: Display Top-Level Parent Categories instead of hiding them
        return await db.select().from(categories).where(and(eq(categories.active, true), isNull(categories.parentId))).orderBy(asc(categories.sortOrder));
    } catch (error) { console.error('Error fetching categories:', error); return []; }
}

async function getFlashSaleProducts() {
    try {
        // FIX 4: Fetch Relational data for Flash Sale items
        return await db.query.products.findMany({
            where: (products, { eq, and, isNotNull }) => and(eq(products.active, true), isNotNull(products.salePrice)),
            with: { category: true, variants: true, vendor: true },
            orderBy: (products, { desc }) => [desc(products.updatedAt)],
            limit: 10,
        });
    } catch (error) { console.error('Error fetching flash sale products:', error); return []; }
}

async function getHeroBanners() {
    try {
        return await db.select().from(heroBanners).where(eq(heroBanners.active, true)).orderBy(asc(heroBanners.order));
    } catch (error) { console.error('Error fetching hero banners:', error); return []; }
}

export default async function HomePage() {
    const [featuredProducts, categoriesList, todaysProducts, heroBannersList, flashProducts] = await Promise.all([
        getFeaturedProducts(), getCategories(), getTodaysCollection(), getHeroBanners(), getFlashSaleProducts(),
    ]);

    return (
        <div className="min-h-screen bg-gray-50/50">
            <HeroSection banners={heroBannersList} />
            <BrandsMarquee />
            <CategorySection categories={categoriesList} />
            <FlashSaleSection products={flashProducts as any} />
            <TodaysCollection products={todaysProducts} />
            <LookbookBanner />
            <FeaturedProducts products={featuredProducts as any} />
            <TrustBadges />
            <RecentlyViewedSection />
        </div>
    );
}
