import prisma from '@/lib/prisma'
import { HeroSection } from '@/components/home/HeroSection'
import { CategorySection } from '@/components/home/CategorySection'
import { TodaysCollection } from '@/components/home/TodaysCollection'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { BrandsMarquee } from '@/components/home/BrandsMarquee'
import { FlashSaleSection } from '@/components/home/FlashSaleSection'
import { LookbookBanner } from '@/components/home/LookbookBanner'
import { TrustBadges } from '@/components/home/TrustBadges'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { NewsletterSection } from '@/components/home/NewsletterSection'
import { RecentlyViewedSection } from '@/components/home/RecentlyViewed'
import { getTodaysCollection } from '@/lib/todays-collection'

export const dynamic = 'force-dynamic'

async function getFeaturedProducts() {
    try {
        const products = await prisma.product.findMany({
            where: { active: true, featured: true },
            take: 24,
            orderBy: { createdAt: 'desc' },
            include: { category: true, variants: true },
        })
        return products
    } catch (error) {
        console.error('Error fetching products:', error)
        return []
    }
}

async function getCategories() {
    try {
        const categories = await prisma.category.findMany({
            where: { active: true, parentId: null },
            orderBy: { sortOrder: 'asc' },
        })
        return categories
    } catch (error) {
        console.error('Error fetching categories:', error)
        return []
    }
}

async function getFlashSaleProducts() {
    try {
        // Products with a salePrice set — these are the "on-sale" items
        const products = await prisma.product.findMany({
            where: {
                active: true,
                salePrice: { not: null },
            },
            take: 10,
            orderBy: { updatedAt: 'desc' },
            include: { category: true, variants: true, Collection: true },
        })
        return products
    } catch (error) {
        console.error('Error fetching flash sale products:', error)
        return []
    }
}

export default async function HomePage() {
    const [products, categories, todaysProducts, heroBanners, flashProducts] = await Promise.all([
        getFeaturedProducts(),
        getCategories(),
        getTodaysCollection(),
        prisma.heroBanner.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
        getFlashSaleProducts(),
    ])

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* 1. Hero Slider */}
            <HeroSection banners={heroBanners} />

            {/* 2. Trust Signals Marquee */}
            <BrandsMarquee />

            {/* 3. Category Circles */}
            <CategorySection categories={categories} />

            {/* 4. Flash Sale (only shown if sale products exist) */}
            <FlashSaleSection products={flashProducts as any} />

            {/* 5. Today's Collection */}
            <TodaysCollection products={todaysProducts} />

            {/* 6. Editorial Lookbook Banner */}
            <LookbookBanner />

            {/* 7. Featured Products */}
            <FeaturedProducts products={products} />

            {/* 8. Trust Badges */}
            <TrustBadges />

            {/* 9. Customer Testimonials */}
            <TestimonialsSection />

            {/* 10. Newsletter Signup */}
            <NewsletterSection />

            {/* 11. Recently Viewed */}
            <RecentlyViewedSection />
        </div>
    )
}
