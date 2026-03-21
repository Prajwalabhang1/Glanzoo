import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProducts() {
    console.log('Updating all products to active: true...');

    const result = await prisma.product.updateMany({
        data: {
            active: true,
            freeShipping: true,
        },
    });

    console.log(`✓ Updated ${result.count} products`);
    await prisma.$disconnect();
}

updateProducts().catch(console.error);
