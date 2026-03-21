import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateHeroImages() {
    console.log('Updating hero banner images...')

    await prisma.heroBanner.updateMany({
        where: { order: 0 },
        data: {
            image: '/images/hero-maroon-lehenga.png',
        },
    })

    await prisma.heroBanner.updateMany({
        where: { order: 1 },
        data: {
            image: '/images/hero-floral-dress.png',
        },
    })

    await prisma.heroBanner.updateMany({
        where: { order: 2 },
        data: {
            image: '/images/hero-green-kurti.png',
        },
    })

    console.log('Hero banner images updated successfully!')
}

updateHeroImages()
    .catch((e) => {
        console.error('Error updating hero images:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
