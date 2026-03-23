import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { heroBanners } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const [banner] = await db.select().from(heroBanners).where(eq(heroBanners.id, id)).limit(1);
        if (!banner) return NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 });
        return NextResponse.json({ success: true, banner });
    } catch (error) { console.error('Error fetching hero banner:', error); return NextResponse.json({ success: false, error: 'Failed to fetch banner' }, { status: 500 }); }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        await db.update(heroBanners).set({ order: body.order, active: body.active, image: body.image, imagePosition: body.imagePosition, badge: body.badge, title: body.title, titleAccent: body.titleAccent, description: body.description, primaryCtaText: body.primaryCtaText, primaryCtaLink: body.primaryCtaLink, secondaryCtaText: body.secondaryCtaText, secondaryCtaLink: body.secondaryCtaLink }).where(eq(heroBanners.id, id));
        const [banner] = await db.select().from(heroBanners).where(eq(heroBanners.id, id)).limit(1);
        return NextResponse.json({ success: true, banner });
    } catch (error) { console.error('Error updating hero banner:', error); return NextResponse.json({ success: false, error: 'Failed to update banner' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await db.delete(heroBanners).where(eq(heroBanners.id, id));
        return NextResponse.json({ success: true, message: 'Banner deleted successfully' });
    } catch (error) { console.error('Error deleting hero banner:', error); return NextResponse.json({ success: false, error: 'Failed to delete banner' }, { status: 500 }); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { active } = await request.json();
        await db.update(heroBanners).set({ active }).where(eq(heroBanners.id, id));
        const [banner] = await db.select().from(heroBanners).where(eq(heroBanners.id, id)).limit(1);
        return NextResponse.json({ success: true, banner });
    } catch (error) { console.error('Error updating banner status:', error); return NextResponse.json({ success: false, error: 'Failed to update banner status' }, { status: 500 }); }
}
