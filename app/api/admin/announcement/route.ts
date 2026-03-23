export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { announcementBars } from '@/lib/schema';
import { eq } from 'drizzle-orm';

function cuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export async function GET() {
    try {
        const [bar] = await db.select().from(announcementBars).limit(1);
        if (!bar) {
            const id = cuid();
            await db.insert(announcementBars).values({ id, text: '🎉 Free shipping on orders above ₹999!', isVisible: true, bgColor: '#1a1a1a', textColor: '#d4af37' });
            const [newBar] = await db.select().from(announcementBars).where(eq(announcementBars.id, id)).limit(1);
            return NextResponse.json(newBar);
        }
        return NextResponse.json(bar);
    } catch (error) {
        console.error('Announcement GET error:', error);
        return NextResponse.json({ error: 'Failed to load announcement bar' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { text, link, linkText, bgColor, textColor, isVisible } = await request.json();
        const [existing] = await db.select().from(announcementBars).limit(1);
        if (!existing) {
            const id = cuid();
            await db.insert(announcementBars).values({ id, text: text ?? '🎉 Free shipping on orders above ₹999!', link: link ?? null, linkText: linkText ?? null, bgColor: bgColor ?? '#1a1a1a', textColor: textColor ?? '#d4af37', isVisible: isVisible ?? true });
            const [bar] = await db.select().from(announcementBars).where(eq(announcementBars.id, id)).limit(1);
            return NextResponse.json(bar);
        }
        const updateData: Record<string, unknown> = {};
        if (text !== undefined) updateData.text = text;
        if (link !== undefined) updateData.link = link;
        if (linkText !== undefined) updateData.linkText = linkText;
        if (bgColor !== undefined) updateData.bgColor = bgColor;
        if (textColor !== undefined) updateData.textColor = textColor;
        if (isVisible !== undefined) updateData.isVisible = isVisible;
        await db.update(announcementBars).set(updateData).where(eq(announcementBars.id, existing.id));
        const [bar] = await db.select().from(announcementBars).where(eq(announcementBars.id, existing.id)).limit(1);
        return NextResponse.json(bar);
    } catch (error) {
        console.error('Announcement PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update announcement bar' }, { status: 500 });
    }
}
