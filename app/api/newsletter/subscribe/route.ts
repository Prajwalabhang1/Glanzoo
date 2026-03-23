import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsletterSubscribers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic';

function cuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }
        const [existing] = await db.select({ id: newsletterSubscribers.id }).from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email)).limit(1);
        if (existing) {
            await db.update(newsletterSubscribers).set({ active: true }).where(eq(newsletterSubscribers.email, email));
        } else {
            await db.insert(newsletterSubscribers).values({ id: cuid(), email, active: true });
        }
        return NextResponse.json({ success: true, message: 'Thanks for subscribing!' });
    } catch (error: unknown) {
        console.error('Newsletter subscribe error:', error);
        return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }
}
