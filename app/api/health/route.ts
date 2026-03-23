export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
    try {
        const [result] = await db.select({ count: sql<number>`1` }).from(products).limit(1);
        return NextResponse.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ status: 'error', database: 'disconnected', error: message, timestamp: new Date().toISOString() }, { status: 500 });
    }
}
