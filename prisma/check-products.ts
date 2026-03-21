import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
    const products = await prisma.product.findMany({
        include: {
            category: true,
            variants: true,
        },
    });

    console.log(`\nTotal products in database: ${products.length}`);

    products.forEach(p => {
        console.log(`\n- ${p.name}`);
        console.log(`  Slug: ${p.slug}`);
        console.log(`  Active: ${p.active}`);
        console.log(`  Category: ${p.category.name}`);
        console.log(`  Variants: ${p.variants.length}`);
    });

    await prisma.$disconnect();
}

checkProducts().catch(console.error);
