const { PrismaClient } = require('@prisma/client');

async function main() {
    console.log('--- DB Check Start ---');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Defined' : 'UNDEFINED');

    const prisma = new PrismaClient({
        log: ['error'], // Only log errors to keep output clean
    });

    try {
        console.log('Attempting connection...');
        const result = await prisma.$queryRaw`SELECT 1 as connected`;
        console.log('Success:', JSON.stringify(result));
        process.exit(0);
    } catch (err) {
        console.error('DATABASE CONNECTION FAILED');
        console.error('Error:', err.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(e => {
    console.error('FATAL SCRIPT ERROR:', e);
    process.exit(1);
});
