import { PrismaClient } from '@prisma/client'

// FIX-19 + PostgreSQL migration: Proper singleton Prisma client with connection pooling.
// In production with PostgreSQL, each serverless invocation would create a new connection
// without this singleton pattern — leading to connection pool exhaustion under load.

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined
}

const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
        // PostgreSQL performance: set query timeout to prevent hanging requests
        // Connection limit is managed via DATABASE_URL parameters:
        // ?connection_limit=10&pool_timeout=20
    })

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}

export default prisma
