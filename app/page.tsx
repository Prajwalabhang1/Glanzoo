import { db } from '@/lib/db';
import { products, categories, heroBanners } from '@/lib/schema';
import { eq, and, isNotNull, desc, asc } from 'drizzle-orm';
import { HeroSection } from '@/components/home/HeroSection';
import { CategorySection } from '@/components/home/CategorySection';
import { TodaysCollection } from '@/components/home/TodaysCollection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BrandsMarquee } from '@/components/home/BrandsMarquee';
import { FlashSaleSection } from '@/components/home/FlashSaleSection';
import { LookbookBanner } from '@/components/home/LookbookBanner';
import { TrustBadges } from '@/components/home/TrustBadges';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { RecentlyViewedSection } from '@/components/home/RecentlyViewed';
import { getTodaysCollection } from '@/lib/todays-collection';

export const dynamic = 'force-dynamic';

async function getFeaturedProducts() {
    try {
        return await db.select().from(products).where(and(eq(products.active, true), eq(products.featured, true))).orderBy(desc(products.createdAt)).limit(24);
    } catch (error) { console.error('Error fetching products:', error); return []; }
}

async function getCategories() {
    try {
        return await db.select().from(categories).where(and(eq(categories.active, true), isNotNull(categories.parentId))).orderBy(asc(categories.sortOrder));
    } catch (error) { console.error('Error fetching categories:', error); return []; }
}

async function getFlashSaleProducts() {
    try {
        return await db.select().from(products).where(and(eq(products.active, true), isNotNull(products.salePrice))).orderBy(desc(products.updatedAt ?? products.createdAt)).limit(10);
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
            <FeaturedProducts products={featuredProducts} />
            <TrustBadges />
            <TestimonialsSection />
            <NewsletterSection />
            <RecentlyViewedSection />
        </div>
    );
}
