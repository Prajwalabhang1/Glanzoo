import { db } from '../lib/db'
import { collections, products, categories, users, vendors, productVariants } from '../lib/schema'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

async function main() {
    console.log('🌱 Starting Drizzle seed process...')

    try {
        const adminId = uuidv4()
        await db.insert(users).values({
            id: adminId,
            email: 'admin@glanzoo.com',
            name: 'Glanzoo Admin',
            role: 'ADMIN',
            password: await bcrypt.hash('Admin@123', 10),
            phone: '9999999999'
        }).catch(e => console.log('Admin may already exist.'));
        console.log('✅ Admin user checked')

        const vendorUserId = uuidv4()
        await db.insert(users).values({
            id: vendorUserId,
            email: 'vendor@glanzoo.com',
            name: 'Vendor',
            role: 'VENDOR',
            password: await bcrypt.hash('Vendor@123', 10),
            phone: '8888888888'
        }).catch(e => console.log('Vendor user may already exist.'));
        
        const vendorId = uuidv4()
        await db.insert(vendors).values({
            id: vendorId,
            userId: vendorUserId,
            businessName: 'Glanzoo Official',
            businessType: 'Retail',
            contactEmail: 'vendor@glanzoo.com',
            contactPhone: '8888888888',
            businessAddress: 'Virtual Office',
            status: 'APPROVED'
        }).catch(e => console.log('Vendor profile may already exist.'));

        const catId = uuidv4()
        await db.insert(categories).values({
            id: catId,
            slug: 'mens-fashion',
            name: 'Mens Fashion',
            active: true,
            sortOrder: 1
        }).catch(e => console.log('Category may already exist.'));
        console.log('✅ Category checked')

        const colId = uuidv4()
        await db.insert(collections).values({
            id: colId,
            slug: 'todays-collection',
            name: "Today's Collection",
            type: "Today's Collection",
            featured: true,
            active: true,
            sortOrder: 1
        }).catch(e => console.log('Collection may already exist.'));
        console.log("✅ Today's Collection checked")

        const prodId = uuidv4()
        await db.insert(products).values({
            id: prodId,
            slug: 'premium-cotton-shirt',
            name: 'Premium Cotton Shirt',
            description: 'A highly comfortable, premium cotton shirt perfect for daily wear or dates.',
            shortDescription: 'Premium cotton daily wear',
            price: 799.00,
            salePrice: 599.00,
            mrp: 1200.00,
            images: JSON.stringify(['https://images.unsplash.com/photo-1596755094514-f87e32f08286?w=600&auto=format&fit=crop']),
            categoryId: catId,
            collectionId: colId,
            vendorId: vendorId,
            featured: true,
            active: true,
            brand: 'Glanzoo',
            displaySku: 'GZ-000001'
        }).catch(e => console.log('Product may already exist.', e.message));

        const varId = uuidv4()
        await db.insert(productVariants).values({
            id: varId,
            productId: prodId,
            size: 'M',
            color: 'White',
            price: 599.00,
            sku: 'GZ-000001-M-WH',
            stock: 50
        }).catch(e => console.log('Variant may already exist.', e.message));

        console.log('✅ Product and Variant inserted')

    } catch(err) {
        console.error("Seed error:", err)
    }

    console.log('🎉 Drizzle seed complete!')
    process.exit(0)
}

main()
