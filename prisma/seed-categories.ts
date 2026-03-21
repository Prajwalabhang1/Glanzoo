import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CATEGORIES = [
    {
        name: 'Women Wear',
        slug: 'women-wear',
        icon: 'W',
        description: 'Sarees, Kurtis, Co-ord Sets & more',
        active: true,
        sortOrder: 1,
        children: [
            { name: 'All Products', slug: 'women-wear-all', icon: '', sortOrder: 0 },
            { name: 'Sarees', slug: 'sarees', icon: '', sortOrder: 1 },
            { name: 'Kurtis', slug: 'kurtis', icon: '', sortOrder: 2 },
            { name: 'Co-ord Sets', slug: 'co-ord-sets', icon: '', sortOrder: 3 },
            { name: 'Three-Piece Sets', slug: 'three-piece-sets', icon: '', sortOrder: 4 },
            { name: 'Ethnic Wear', slug: 'women-ethnic-wear', icon: '', sortOrder: 5 },
            { name: 'Jeans & Bottom Wear', slug: 'women-jeans-bottom-wear', icon: '', sortOrder: 6 },
            { name: 'Tops & Upper Wear', slug: 'women-tops-upper-wear', icon: '', sortOrder: 7 },
            { name: 'Party Wear', slug: 'women-party-wear', icon: '', sortOrder: 8 },
            { name: 'Winter Wear', slug: 'women-winter-wear', icon: '', sortOrder: 9 },
            { name: 'Night Dresses', slug: 'night-dresses', icon: '', sortOrder: 10 },
            { name: 'Blouses', slug: 'blouses', icon: '', sortOrder: 11 },
            { name: 'Undergarments', slug: 'women-undergarments', icon: '', sortOrder: 12 },
        ],
    },
    {
        name: 'Women Accessories',
        slug: 'women-accessories',
        icon: 'A',
        description: 'Jewellery, Bags & Accessories',
        active: true,
        sortOrder: 2,
        children: [
            { name: 'All Products', slug: 'women-accessories-all', icon: '', sortOrder: 0 },
            { name: 'Trendy Necklaces', slug: 'necklaces', icon: '', sortOrder: 1 },
            { name: 'Earrings', slug: 'earrings', icon: '', sortOrder: 2 },
            { name: 'Clutches', slug: 'clutches', icon: '', sortOrder: 3 },
            { name: 'Scrunchies', slug: 'scrunchies', icon: '', sortOrder: 4 },
            { name: 'Bracelets', slug: 'women-bracelets', icon: '', sortOrder: 5 },
            { name: 'Rings', slug: 'rings', icon: '', sortOrder: 6 },
        ],
    },
    {
        name: "Men's Wear",
        slug: 'mens-wear',
        icon: 'M',
        description: 'Shirts, T-Shirts, Ethnic & More',
        active: true,
        sortOrder: 3,
        children: [
            { name: 'All Products', slug: 'mens-wear-all', icon: '', sortOrder: 0 },
            { name: 'Shirts', slug: 'shirts', icon: '', sortOrder: 1 },
            { name: 'T-Shirts', slug: 't-shirts', icon: '', sortOrder: 2 },
            { name: 'Jeans & Bottom Wear', slug: 'mens-jeans-bottom-wear', icon: '', sortOrder: 3 },
            { name: 'Ethnic Wear', slug: 'mens-ethnic-wear', icon: '', sortOrder: 4 },
            { name: 'Gym Wear', slug: 'gym-wear', icon: '', sortOrder: 5 },
            { name: 'Winter Wear', slug: 'mens-winter-wear', icon: '', sortOrder: 6 },
            { name: 'Undergarments', slug: 'mens-undergarments', icon: '', sortOrder: 7 },
        ],
    },
    {
        name: "Men's Accessories",
        slug: 'mens-accessories',
        icon: 'MA',
        description: 'Wallets, Watches, Chains & More',
        active: true,
        sortOrder: 4,
        children: [
            { name: 'All Products', slug: 'mens-accessories-all', icon: '', sortOrder: 0 },
            { name: 'Wallets', slug: 'wallets', icon: '', sortOrder: 1 },
            { name: 'Bracelets', slug: 'mens-bracelets', icon: '', sortOrder: 2 },
            { name: 'Watches', slug: 'watches', icon: '', sortOrder: 3 },
            { name: 'Chains', slug: 'chains', icon: '', sortOrder: 4 },
            { name: 'Belts', slug: 'belts', icon: '', sortOrder: 5 },
            { name: 'Sunglasses', slug: 'sunglasses', icon: '', sortOrder: 6 },
        ],
    },
    {
        name: 'Electronics',
        slug: 'electronics',
        icon: 'E',
        description: 'Earbuds, Speakers, Gadgets',
        active: true,
        sortOrder: 5,
        children: [
            { name: 'All Products', slug: 'electronics-all', icon: '', sortOrder: 0 },
            { name: 'Earbuds', slug: 'earbuds', icon: '', sortOrder: 1 },
            { name: 'Speakers', slug: 'speakers', icon: '', sortOrder: 2 },
            { name: 'Massagers', slug: 'massagers', icon: '', sortOrder: 3 },
            { name: 'Neckbands', slug: 'neckbands', icon: '', sortOrder: 4 },
        ],
    },
    {
        name: 'Kids',
        slug: 'kids',
        icon: 'K',
        description: 'Boys & Girls Fashion',
        active: true,
        sortOrder: 6,
        children: [
            { name: 'Girls - All Products', slug: 'girls-all', icon: '', sortOrder: 0 },
            { name: 'Girls - Ethnic Wear', slug: 'girls-ethnic-wear', icon: '', sortOrder: 1 },
            { name: 'Girls - Frocks & Dresses', slug: 'girls-frocks-dresses', icon: '', sortOrder: 2 },
            { name: 'Girls - Tops & Upper Wear', slug: 'girls-tops-upper-wear', icon: '', sortOrder: 3 },
            { name: 'Girls - Kurti Sets', slug: 'girls-kurti-sets', icon: '', sortOrder: 4 },
            { name: 'Girls - Jeans & Track Pants', slug: 'girls-jeans-track-pants', icon: '', sortOrder: 5 },
            { name: 'Girls - Night Suits', slug: 'girls-night-suits', icon: '', sortOrder: 6 },
            { name: 'Girls - Winter Wear', slug: 'girls-winter-wear', icon: '', sortOrder: 7 },
            { name: 'Boys - All Products', slug: 'boys-all', icon: '', sortOrder: 8 },
            { name: 'Boys - Ethnic Wear', slug: 'boys-ethnic-wear', icon: '', sortOrder: 9 },
            { name: 'Boys - Combo Sets', slug: 'boys-combo-sets', icon: '', sortOrder: 10 },
            { name: 'Boys - Shirts & T-Shirts', slug: 'boys-shirts-tshirts', icon: '', sortOrder: 11 },
            { name: 'Boys - Bottom Wear', slug: 'boys-bottom-wear', icon: '', sortOrder: 12 },
            { name: 'Boys - Night Suits', slug: 'boys-night-suits', icon: '', sortOrder: 13 },
            { name: 'Boys - Track Pants', slug: 'boys-track-pants', icon: '', sortOrder: 14 },
            { name: 'Boys - Winter Wear', slug: 'boys-winter-wear', icon: '', sortOrder: 15 },
        ],
    },
    {
        name: 'Footwear',
        slug: 'footwear',
        icon: 'F',
        description: 'Women, Men & Kids Footwear',
        active: true,
        sortOrder: 7,
        children: [
            { name: 'Women - All Footwear', slug: 'women-footwear-all', icon: '', sortOrder: 0 },
            { name: 'Women - Sandals', slug: 'women-sandals', icon: '', sortOrder: 1 },
            { name: 'Women - Heels', slug: 'heels', icon: '', sortOrder: 2 },
            { name: 'Women - Sneakers', slug: 'women-sneakers', icon: '', sortOrder: 3 },
            { name: 'Women - Flip-Flops & Slippers', slug: 'women-flipflops-slippers', icon: '', sortOrder: 4 },
            { name: 'Women - Mojaris', slug: 'mojaris', icon: '', sortOrder: 5 },
            { name: 'Men - All Footwear', slug: 'men-footwear-all', icon: '', sortOrder: 6 },
            { name: 'Men - Casual Shoes', slug: 'mens-casual-shoes', icon: '', sortOrder: 7 },
            { name: 'Men - Sports Shoes', slug: 'mens-sports-shoes', icon: '', sortOrder: 8 },
            { name: 'Men - Sandals', slug: 'mens-sandals', icon: '', sortOrder: 9 },
            { name: 'Men - Flip-Flops & Slippers', slug: 'mens-flipflops-slippers', icon: '', sortOrder: 10 },
            { name: 'Kids - All Footwear', slug: 'kids-footwear-all', icon: '', sortOrder: 11 },
            { name: 'Kids - Boys Shoes', slug: 'kids-boys-shoes', icon: '', sortOrder: 12 },
            { name: 'Kids - Girls Shoes', slug: 'kids-girls-shoes', icon: '', sortOrder: 13 },
            { name: 'Kids - Casual Shoes', slug: 'kids-casual-shoes', icon: '', sortOrder: 14 },
            { name: 'Kids - Flip-Flops & Slippers', slug: 'kids-flipflops-slippers', icon: '', sortOrder: 15 },
            { name: 'Kids - Sandals', slug: 'kids-sandals', icon: '', sortOrder: 16 },
        ],
    },
    {
        name: 'Perfume & Fragrance',
        slug: 'perfume-fragrance',
        icon: 'P',
        description: 'Perfumes, Attars & Home Fragrances',
        active: true,
        sortOrder: 8,
        children: [
            { name: 'Personal - All', slug: 'personal-fragrances-all', icon: '', sortOrder: 0 },
            { name: 'Women Perfumes', slug: 'women-perfumes', icon: '', sortOrder: 1 },
            { name: 'Men Perfumes', slug: 'men-perfumes', icon: '', sortOrder: 2 },
            { name: 'Unisex Perfumes', slug: 'unisex-perfumes', icon: '', sortOrder: 3 },
            { name: 'Luxury Perfumes', slug: 'luxury-perfumes', icon: '', sortOrder: 4 },
            { name: 'Mini / Travel Size', slug: 'travel-size-perfumes', icon: '', sortOrder: 5 },
            { name: 'Attars', slug: 'attars', icon: '', sortOrder: 6 },
            { name: 'Body Mists', slug: 'body-mists', icon: '', sortOrder: 7 },
            { name: 'Deodorants', slug: 'deodorants', icon: '', sortOrder: 8 },
            { name: 'Gift Sets', slug: 'perfume-gift-sets', icon: '', sortOrder: 9 },
            { name: 'Home - Room Fresheners', slug: 'room-fresheners', icon: '', sortOrder: 10 },
            { name: 'Home - Car Perfumes', slug: 'car-perfumes', icon: '', sortOrder: 11 },
            { name: 'Home - Scented Candles', slug: 'scented-candles', icon: '', sortOrder: 12 },
            { name: 'Home - Aroma Diffusers', slug: 'aroma-diffusers', icon: '', sortOrder: 13 },
            { name: 'Home - Essential Oils', slug: 'essential-oils', icon: '', sortOrder: 14 },
            { name: 'Home - Incense Sticks', slug: 'incense-sticks', icon: '', sortOrder: 15 },
        ],
    },
]

async function main() {
    console.log('Seeding categories...')

    for (const cat of CATEGORIES) {
        const { children, ...parentData } = cat

        // Upsert parent category
        const parent = await (prisma as any).category.upsert({
            where: { slug: parentData.slug },
            update: {
                name: parentData.name,
                icon: parentData.icon,
                description: parentData.description,
                active: parentData.active,
                sortOrder: parentData.sortOrder,
            },
            create: {
                name: parentData.name,
                slug: parentData.slug,
                icon: parentData.icon,
                description: parentData.description,
                active: parentData.active,
                sortOrder: parentData.sortOrder,
            },
        })

        console.log(`  Created/updated: ${parent.name}`)

        // Upsert children
        for (const child of children) {
            await (prisma as any).category.upsert({
                where: { slug: child.slug },
                update: {
                    name: child.name,
                    icon: child.icon,
                    sortOrder: child.sortOrder,
                    parentId: parent.id,
                    active: true,
                },
                create: {
                    name: child.name,
                    slug: child.slug,
                    icon: child.icon,
                    sortOrder: child.sortOrder,
                    parentId: parent.id,
                    active: true,
                },
            })
        }

        console.log(`    -> ${children.length} subcategories seeded`)
    }

    console.log('Categories seeded successfully!')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
