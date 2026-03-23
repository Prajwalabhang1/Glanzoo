export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { heroBanners } from '@/lib/schema';
import { asc, desc } from 'drizzle-orm';

function cuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export async function GET() {
    try {
        const banners = await db.select().from(heroBanners).orderBy(asc(heroBanners.order), desc(heroBanners.createdAt));
        return NextResponse.json({ success: true, banners, total: banners.length });
    } catch (error) {
        console.error('Error fetching hero banners:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch banners' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        if (!body.image || !body.title || !body.titleAccent || !body.description) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }
        const id = cuid();
        await db.insert(heroBanners).values({
            id, order: body.order ?? 0, active: body.active ?? true, image: body.image,
            imagePosition: body.imagePosition ?? 'center center', imageOnly: body.imageOnly ?? false,
            badge: body.badge, title: body.title, titleAccent: body.titleAccent, description: body.description,
            primaryCtaText: body.primaryCtaText ?? 'Shop Now', primaryCtaLink: body.primaryCtaLink ?? '/products',
            secondaryCtaText: body.secondaryCtaText, secondaryCtaLink: body.secondaryCtaLink,
        });
        const [banner] = await db.select().from(heroBanners).where((t: typeof heroBanners.$inferSelect | any) => t.id === id).limit(1);
        return NextResponse.json({ success: true, banner });
    } catch (error) {
        console.error('Error creating hero banner:', error);
        return NextResponse.json({ success: false, error: 'Failed to create banner' }, { status: 500 });
    }
}
