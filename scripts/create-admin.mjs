// Script to create an admin user
// Run: node scripts/create-admin.mjs

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@glanzoo.com';
    const password = 'Admin@123';
    const name = 'Glanzoo Admin';

    // Check if admin already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log('Admin user already exists:', email);
        console.log('Role:', existing.role);
        // Update role to ADMIN if not already
        if (existing.role !== 'ADMIN') {
            await prisma.user.update({
                where: { email },
                data: { role: 'ADMIN' },
            });
            console.log('Updated role to ADMIN');
        }
        process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role: 'ADMIN',
        },
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   ID:', admin.id);
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
