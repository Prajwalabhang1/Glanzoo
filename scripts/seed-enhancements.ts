import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed process...')

    // Create Collections
    console.log('Creating collections...')

    const todaysCollection = await prisma.collection.upsert({
        where: { slug: 'todays-collection' },
        update: {},
        create: {
            slug: 'todays-collection',
            name: "Today's Collection",
            description: 'Fresh picks curated daily just for you',
            type: "Today's Collection",
            featured: true,
            sortOrder: 1,
            active: true,
        },
    })

    const trendingCollection = await prisma.collection.upsert({
        where: { slug: 'trending' },
        update: {},
        create: {
            slug: 'trending',
            name: 'Trending Now',
            description: 'Most popular items this week',
            type: 'Trending',
            featured: true,
            sortOrder: 2,
            active: true,
        },
    })

    // Material-based collections
    const materials = [
        { name: 'Cotton', desc: 'Soft, breathable cotton pieces' },
        { name: 'Vatican', desc: 'Premium Vatican fabric collection' },
        { name: 'Kalamkari', desc: 'Traditional Kalamkari designs' },
        { name: 'Denim', desc: 'Trendy denim styles' },
    ]

    for (const material of materials) {
        await prisma.collection.upsert({
            where: { slug: material.name.toLowerCase() },
            update: {},
            create: {
                slug: material.name.toLowerCase(),
                name: `${material.name} Collection`,
                description: material.desc,
                type: 'Material-based',
                featured: false,
                sortOrder: 10,
                active: true,
            },
        })
    }

    console.log(' Created 6 collections')

    // Create Size Charts
    console.log('Creating size charts...')

    const existingKurtiChart = await prisma.sizeChart.findFirst({
        where: { category: 'Kurti' }
    })

    if (!existingKurtiChart) {
        await prisma.sizeChart.create({
            data: {
                name: 'Standard Kurti Size Chart',
                category: 'Kurti',
                chartData: JSON.stringify({
                    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                    measurements: [
                        { label: 'Bust', values: ['34"', '36"', '38"', '40"', '42"'] },
                        { label: 'Length', values: ['42"', '43"', '44"', '45"', '46"'] },
                        { label: 'Waist', values: ['30"', '32"', '34"', '36"', '38"'] },
                    ],
                }),
            },
        })
    }

    const existingCoordChart = await prisma.sizeChart.findFirst({
        where: { category: 'Co-ord Set' }
    })

    if (!existingCoordChart) {
        await prisma.sizeChart.create({
            data: {
                name: 'Co-ord Set Size Chart',
                category: 'Co-ord Set',
                chartData: JSON.stringify({
                    sizes: ['S', 'M', 'L', 'XL'],
                    measurements: [
                        { label: 'Top Length', values: ['24"', '25"', '26"', '27"'] },
                        { label: 'Bottom Length', values: ['38"', '39"', '40"', '41"'] },
                        { label: 'Bust', values: ['34"', '36"', '38"', '40"'] },
                    ],
                }),
            },
        })
    }

    console.log('✅ Created 2 size charts')

    // Update existing products with new fields
    console.log('Updating existing products...')

    const allProducts = await prisma.product.findMany()

    let updateCount = 0
    for (const product of allProducts) {
        // Assign random material
        const materialOptions = ['Cotton', 'Vatican', 'Kalamkari', 'Rayon', 'Denim']
        const fabricTypes = ['Pure Cotton', 'Cotton Blend', 'Rayon Blend', 'Premium']

        const material = materialOptions[Math.floor(Math.random() * materialOptions.length)]
        const fabricType = fabricTypes[Math.floor(Math.random() * fabricTypes.length)]

        // Assign tags to featured products
        let tags = []
        if (product.featured) {
            if (Math.random() > 0.5) tags.push('Trending')
            if (Math.random() > 0.7) tags.push('New')
        }

        // Generate display SKU
        const displaySku = `GZ-${String(updateCount + 1).padStart(6, '0')}`

        await prisma.product.update({
            where: { id: product.id },
            data: {
                material,
                fabricType,
                displaySku,
                tags: tags.length > 0 ? JSON.stringify(tags) : null,
                careInstructions: 'Machine wash cold, tumble dry low',
                washCare: JSON.stringify(['Hand wash recommended', 'Do not bleach', 'Iron on low heat']),
                returnEligible: true,
            },
        })

        updateCount++
    }

    console.log(`✅ Updated ${updateCount} products with new fields`)

    // Assign random products to collections
    console.log('Assigning products to collections...')

    const featuredProducts = await prisma.product.findMany({
        where: { featured: true },
        take: 8,
    })

    // Update featured products with Today's Collection
    if (featuredProducts.length > 0) {
        await prisma.product.updateMany({
            where: {
                id: { in: featuredProducts.slice(0, 4).map(p => p.id) },
            },
            data: {
                collectionId: todaysCollection.id,
            },
        })

        await prisma.product.updateMany({
            where: {
                id: { in: featuredProducts.slice(4, 8).map(p => p.id) },
            },
            data: {
                collectionId: trendingCollection.id,
            },
        })

        console.log('✅ Assigned products to collections')
    }

    console.log('\n🎉 Seed complete!')
    console.log('Summary:')
    console.log('- 6 Collections created')
    console.log('- 2 Size Charts created')
    console.log(`- ${updateCount} Products updated`)
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
