export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { coupons } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

function cuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

async function checkAdminAccess() {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized', status: 401 };
    if (session.user.role !== 'ADMIN') return { error: 'Forbidden: Admin access required', status: 403 };
    return null;
}

export async function GET() {
    try {
        const accessError = await checkAdminAccess();
        if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status });
        const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
        return NextResponse.json({ coupons: rows });
    } catch (error) { console.error('Error fetching coupons:', error); return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 }); }
}

export async function POST(request: Request) {
    try {
        const accessError = await checkAdminAccess();
        if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status });
        const { code, type, value, minOrder, maxDiscount, validFrom, validUntil, usageLimit, active = true } = await request.json();
        if (!code || !type || !value || !validFrom || !validUntil) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        const [existing] = await db.select({ id: coupons.id }).from(coupons).where(eq(coupons.code, code.toUpperCase())).limit(1);
        if (existing) return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });
        const id = cuid();
        await db.insert(coupons).values({ id, code: code.toUpperCase(), type, value, minOrder: minOrder || null, maxDiscount: maxDiscount || null, validFrom: new Date(validFrom), validUntil: new Date(validUntil), usageLimit: usageLimit || null, active });
        const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
        return NextResponse.json({ message: 'Coupon created successfully', coupon }, { status: 201 });
    } catch (error) { console.error('Error creating coupon:', error); return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 }); }
}
