import { PrismaClient } from '@prisma/client'
import { PrismaMysql } from '@prisma/adapter-mysql2'
import mysql from 'mysql2/promise'

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined
}

function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL
    const pool = mysql.createPool({ uri: connectionString })
    const adapter = new PrismaMysql(pool)

    return new PrismaClient({
        adapter,
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
