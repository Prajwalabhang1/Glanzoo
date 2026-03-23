// This file kept for backward compatibility during migration.
// All imports from '@/lib/prisma' now receive the Drizzle db instance.
// The exported object mimics enough of the Prisma API surface to prevent 
// import errors in files not yet migrated to Drizzle.
export { db as default } from './db'
