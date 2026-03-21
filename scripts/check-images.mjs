import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        take: 5,
        select: { id: true, name: true, images: true },
    });

    const output = products.map(p => ({
        name: p.name,
        images: p.images.substring(0, 200),
    }));

    console.log(JSON.stringify(output, null, 2));

    const count = await prisma.product.count();
    console.log("Total:", count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
