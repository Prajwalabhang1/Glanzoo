import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Find admin user
    const user = await prisma.user.findUnique({
        where: { email: 'admin@glanzoo.com' },
        select: { id: true, email: true, name: true, role: true, password: true },
    });

    if (!user) {
        console.log('❌ No user found with email admin@glanzoo.com');
        return;
    }

    console.log('User found:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Role:', user.role);
    console.log('  Has password:', !!user.password);
    console.log('  Password hash:', user.password?.substring(0, 20) + '...');

    // Test password
    const testPassword = 'Admin@123';
    const isValid = await bcrypt.compare(testPassword, user.password || '');
    console.log(`\n  Password "${testPassword}" valid:`, isValid);

    if (!isValid) {
        // Reset password
        console.log('\n🔧 Resetting password to Admin@123...');
        const newHash = await bcrypt.hash('Admin@123', 12);
        await prisma.user.update({
            where: { email: 'admin@glanzoo.com' },
            data: { password: newHash },
        });
        console.log('✅ Password reset successfully!');
    }
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
