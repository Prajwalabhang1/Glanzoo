/**
 * Script to update product images with actual image files
 * Run with: npx ts-node scripts/update-product-images.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Map of product names to actual image filenames
const imageMapping: Record<string, string[]> = {
    'Floral Print Cotton Kurti': ['/images/products/kurti_floral_pink_1770538337489.png'],
    'Elegant Co-ord Set - Blue': ['/images/products/kurti_blue_embroidered_1770538353266.png'],
    'Traditional Kurti Pant Set': ['/images/products/kurti_pant_set_navy_1770538420860.png'],
    'Summer Short Kurti - Pink': ['/images/products/short_kurti_yellow_1770538437351.png'],
    'Floral Print Cotton Kurti - Red': ['/images/products/kurti_floral_pink_1770538337489.png'],
    'Embroidered Anarkali Kurti - Royal Blue': ['/images/products/kurti_blue_embroidered_1770538353266.png'],
    'Elegant Co-ord Set - Navy Blue': ['/images/products/coord_set_orange_1770538369265.png'],
    'Floral Co-ord Set - Pink': ['/images/products/coord_set_green_1770538388280.png'],
    'One Piece Kurti - Maroon': ['/images/products/one_piece_maroon_1770538404785.png'],
}

async function updateProductImages() {
    try {
        console.log('🖼️  Updating product images...')

        const products = await prisma.product.findMany()

        for (const product of products) {
            const newImages = imageMapping[product.name]

            if (newImages) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: {
                        images: JSON.stringify(newImages),
                    },
                })
                console.log(`✓ Updated ${product.name}`)
            } else {
                // Use a default placeholder image
                const defaultImage = ['/images/products/kurti_floral_pink_1770538337489.png']
                await prisma.product.update({
                    where: { id: product.id },
                    data: {
                        images: JSON.stringify(defaultImage),
                    },
                })
                console.log(`⚠ ${product.name} - using default image`)
            }
        }

        console.log('\n✅ All product images updated successfully!')
    } catch (error) {
        console.error('❌ Error updating images:', error)
    } finally {
        await prisma.$disconnect()
    }
}

updateProductImages()
