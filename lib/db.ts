/**
 * lib/db.ts — Drizzle ORM MySQL connection
 *
 * Fixes:
 *  - Uses env.ts for validated DATABASE_URL (startup crash if missing)
 *  - Correct return type annotation for the drizzle instance
 *  - Added keepAlive + enableKeepAlive for long-lived Hostinger connections
 *  - Singleton pattern preserved for Next.js dev hot-reload
 */
import { drizzle } from 'drizzle-orm/mysql2';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { schema } from './schema';
import { env } from './env';

type DrizzleDB = MySql2Database<typeof schema>;

// Global singleton to prevent multiple connections during hot-reloads
const globalForDb = global as unknown as { db: DrizzleDB | undefined };

function createDb(): DrizzleDB {
  const pool = mysql.createPool({
    uri: env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
  return drizzle(pool, { schema, mode: 'default' });
}

export const db: DrizzleDB = globalForDb.db ?? createDb();

if (env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}
