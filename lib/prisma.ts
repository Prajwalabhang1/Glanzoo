import { PrismaClient } from '@prisma/client'

// Proper singleton Prisma client with connection pooling.
// In production with PostgreSQL, each serverless invocation would create a new connection
// without this singleton pattern — leading to connection pool exhaustion under load.

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined
}

function createPrismaClient() {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error']
    });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}

export default prisma
