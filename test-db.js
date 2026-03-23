const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasourceUrl: 'postgresql://postgres.jtkudquwauxzwcmzlrnl:Akash%40glanzoo123@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

async function main() {
    console.log("Testing connection...");
    await prisma.$queryRaw`SELECT 1`;
    console.log("SUCCESS!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
