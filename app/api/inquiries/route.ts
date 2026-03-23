export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inquiries } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

function cuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export async function POST(request: Request) {
    try {
        const { name, email, phone, subject, message } = await request.json();
        if (!name || !email || !subject || !message) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        const id = cuid();
        await db.insert(inquiries).values({ id, name, email, phone: phone || null, subject, message, status: 'NEW' });
        const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id)).limit(1);
        return NextResponse.json({ success: true, inquiry }, { status: 201 });
    } catch (error) { console.error('Error creating inquiry:', error); return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 }); }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const rows = await db.select().from(inquiries)
            .where(status ? eq(inquiries.status, status) : undefined)
            .orderBy(desc(inquiries.createdAt));
        return NextResponse.json({ inquiries: rows });
    } catch (error) { console.error('Error fetching inquiries:', error); return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 }); }
}
