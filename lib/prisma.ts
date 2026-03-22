import { PrismaClient } from '@prisma/client'

// Proper singleton Prisma client with connection pooling.
// In production with PostgreSQL, each serverless invocation would create a new connection
// without this singleton pattern — leading to connection pool exhaustion under load.

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined
}

function createPrismaClient() {
    // Intercept and fix the DATABASE_URL if Hostinger un-escaped the %40 to @
    const rawUrl = process.env.DATABASE_URL || '';
    const safeUrl = rawUrl.replace('Akash@glanzoo123@', 'Akash%40glanzoo123@');

    return new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
        datasources: {
            db: {
                url: safeUrl
            }
        }
    });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}

export default prisma
