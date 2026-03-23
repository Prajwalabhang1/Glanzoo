import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { schema } from './schema'

// Global singleton to prevent multiple connections during development hot-reloads
const globalForDb = global as unknown as { db: ReturnType<typeof drizzle> | undefined }

function createDb() {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set')
    }
    const pool = mysql.createPool({
        uri: connectionString,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    })
    return drizzle(pool, { schema, mode: 'default' })
}

export const db = globalForDb.db ?? createDb()

if (process.env.NODE_ENV !== 'production') {
    globalForDb.db = db
}
