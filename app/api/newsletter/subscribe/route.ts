import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        await prisma.newsletterSubscriber.upsert({
            where: { email },
            update: { active: true },
            create: { email, active: true },
        });

        return NextResponse.json({ success: true, message: 'Thanks for subscribing!' });
    } catch (error: unknown) {
        console.error('Newsletter subscribe error:', error);
        return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }
}
