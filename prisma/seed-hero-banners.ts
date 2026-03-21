import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedHeroBanners() {
    console.log('Seeding hero banners...')

    const banners = [
        {
            order: 0,
            active: true,
            image: '/images/hero-fusion-coord.png',
            imagePosition: 'center center',
            badge: 'Trending Now',
            title: 'Fusion',
            titleAccent: 'Co-ords',
            description: 'Contemporary two-piece sets that blend tradition with modern chic. effortless style for every occasion.',
            primaryCtaText: 'Shop Co-ords',
            primaryCtaLink: '/collections/coord-sets',
            secondaryCtaText: 'View Lookbook',
            secondaryCtaLink: '/lookbook'
        },
        {
            order: 1,
            active: true,
            image: 'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
            imagePosition: 'center center',
            badge: 'Best Sellers',
            title: 'Daily',
            titleAccent: 'Ensembles',
            description: 'Effortlessly elegant kurti and pant sets designed for comfort without compromising on style.',
            primaryCtaText: 'Shop Sets',
            primaryCtaLink: '/collections/kurti-pant-sets',
            secondaryCtaText: 'Our Story',
            secondaryCtaLink: '/about'
        },
        {
            order: 2,
            active: true,
            image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
            imagePosition: 'center center',
            badge: 'New Arrivals',
            title: 'Modern',
            titleAccent: 'Silhouettes',
            description: 'Statement one-piece dresses and gowns that redefine your ethnic wardrobe with a western twist.',
            primaryCtaText: 'Shop Dresses',
            primaryCtaLink: '/collections/one-piece',
            secondaryCtaText: 'Artisan Hub',
            secondaryCtaLink: '/artisans'
        }
    ]

    for (const banner of banners) {
        await prisma.heroBanner.create({
            data: banner
        })
        console.log(`Created banner: ${banner.title} ${banner.titleAccent}`)
    }

    console.log('Hero banners seeded successfully!')
}

seedHeroBanners()
    .catch((e) => {
        console.error('Error seeding hero banners:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
