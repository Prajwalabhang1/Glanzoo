const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
    try {
        const admin = await prisma.user.findUnique({
            where: { email: 'admin@glanzoo.com' }
        });
        if (admin) {
            console.log('✅ Admin user found:');
            console.log(JSON.stringify(admin, null, 2));
        } else {
            console.log('❌ Admin user NOT found in database.');
        }
    } catch (error) {
        console.error('Error checking admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdmin();
