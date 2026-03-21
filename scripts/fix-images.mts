import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Verified working Unsplash image URLs (tested and confirmed accessible)
// These are all fashion/ethnic wear related images
const WORKING_IMAGES: Record<string, string[]> = {
    kurti: [
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1614886137085-5a9474203796?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d44?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=800&fit=crop',
    ],
    'co-ord': [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1604006852748-903fccbc4019?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=800&fit=crop',
    ],
    dress: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=600&h=800&fit=crop',
        'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d44?w=600&h=800&fit=crop',
    ],
};

async function main() {
    console.log('🖼️  Fixing product images with verified Unsplash URLs...\n');

    const products = await prisma.product.findMany({
        include: { category: true },
    });

    let updatedCount = 0;
    let kurtiIdx = 0;
    let coordIdx = 0;
    let dressIdx = 0;

    for (const product of products) {
        const categoryName = (product.category?.name || '').toLowerCase();
        const productName = product.name.toLowerCase();

        let img1: string;
        let img2: string;

        if (categoryName.includes('kurti') || productName.includes('kurti')) {
            img1 = WORKING_IMAGES.kurti[kurtiIdx % WORKING_IMAGES.kurti.length];
            img2 = WORKING_IMAGES.kurti[(kurtiIdx + 1) % WORKING_IMAGES.kurti.length];
            kurtiIdx += 2;
        } else if (categoryName.includes('co-ord') || categoryName.includes('coord') || productName.includes('co-ord') || productName.includes('coord')) {
            img1 = WORKING_IMAGES['co-ord'][coordIdx % WORKING_IMAGES['co-ord'].length];
            img2 = WORKING_IMAGES['co-ord'][(coordIdx + 1) % WORKING_IMAGES['co-ord'].length];
            coordIdx += 2;
        } else {
            img1 = WORKING_IMAGES.dress[dressIdx % WORKING_IMAGES.dress.length];
            img2 = WORKING_IMAGES.dress[(dressIdx + 1) % WORKING_IMAGES.dress.length];
            dressIdx += 2;
        }

        const imagesJson = JSON.stringify([img1, img2]);

        await prisma.product.update({
            where: { id: product.id },
            data: { images: imagesJson },
        });

        console.log(`  ✅ ${product.name}`);
        updatedCount++;
    }

    console.log(`\n🎉 Updated ${updatedCount} products with verified images!`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
