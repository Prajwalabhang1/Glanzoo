import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // Create or update admin user
    const adminEmail = 'admin@glanzoo.com'
    const adminPassword = await bcrypt.hash('Admin@123', 10)

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            role: 'ADMIN',
        },
        create: {
            email: adminEmail,
            password: adminPassword,
            name: 'Admin User',
            role: 'ADMIN',
            phone: '9999999999',
        },
    })

    console.log('✅ Admin user created/updated:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: Admin@123`)
    console.log(`   Role: ADMIN`)
    console.log(``)

    // Create a test vendor user
    const vendorEmail = 'vendor@test.com'
    const vendorPassword = await bcrypt.hash('Vendor@123', 10)

    const vendorUser = await prisma.user.upsert({
        where: { email: vendorEmail },
        update: {},
        create: {
            email: vendorEmail,
            password: vendorPassword,
            name: 'Test Vendor',
            role: 'VENDOR',
            phone: '8888888888',
        },
    })

    // Create vendor profile if doesn't exist
    const existingVendor = await prisma.vendor.findUnique({
        where: { userId: vendorUser.id },
    })

    if (!existingVendor) {
        await prisma.vendor.create({
            data: {
                userId: vendorUser.id,
                businessName: 'Test Fashion Store',
                businessType: 'COMPANY',
                description: 'A test vendor store for testing',
                contactEmail: vendorEmail,
                contactPhone: '8888888888',
                businessAddress: JSON.stringify({
                    street: '123 Test Street',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400001',
                    country: 'India',
                }),
                status: 'APPROVED', // Pre-approved for testing
                commissionRate: 10,
            },
        })
        console.log('✅ Test vendor created:')
    } else {
        console.log('✅ Test vendor already exists:')
    }

    console.log(`   Email: ${vendorEmail}`)
    console.log(`   Password: Vendor@123`)
    console.log(`   Status: APPROVED`)
    console.log(``)

    // Create a regular customer user
    const customerEmail = 'customer@test.com'
    const customerPassword = await bcrypt.hash('Customer@123', 10)

    await prisma.user.upsert({
        where: { email: customerEmail },
        update: {},
        create: {
            email: customerEmail,
            password: customerPassword,
            name: 'Test Customer',
            role: 'CUSTOMER',
            phone: '7777777777',
        },
    })

    console.log('✅ Test customer created:')
    console.log(`   Email: ${customerEmail}`)
    console.log(`   Password: Customer@123`)
    console.log(``)

    console.log('🎉 Database seeding completed!')
    console.log('')
    console.log('📋 Test Accounts Summary:')
    console.log('─'.repeat(50))
    console.log('ADMIN:')
    console.log('  URL: http://localhost:3001/login')
    console.log('  Email: admin@glanzoo.com')
    console.log('  Password: Admin@123')
    console.log('')
    console.log('VENDOR:')
    console.log('  URL: http://localhost:3001/login')
    console.log('  Email: vendor@test.com')
    console.log('  Password: Vendor@123')
    console.log('')
    console.log('CUSTOMER:')
    console.log('  URL: http://localhost:3001/login')
    console.log('  Email: customer@test.com')
    console.log('  Password: Customer@123')
    console.log('─'.repeat(50))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
