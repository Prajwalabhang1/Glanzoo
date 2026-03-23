export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { coupons } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const total = parseFloat(searchParams.get('total') || '0');
        if (!code) return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });

        const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase())).limit(1);
        if (!coupon) return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
        if (!coupon.active) return NextResponse.json({ error: 'This coupon is no longer active' }, { status: 400 });

        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validUntil) return NextResponse.json({ error: 'This coupon has expired or is not yet valid' }, { status: 400 });
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 });
        if (coupon.minOrder && total < coupon.minOrder) return NextResponse.json({ error: `Minimum order value of ₹${coupon.minOrder} required` }, { status: 400 });

        let discount = 0;
        if (coupon.type === 'PERCENTAGE') {
            discount = (total * coupon.value) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
        } else if (coupon.type === 'FIXED') {
            discount = coupon.value;
        }

        return NextResponse.json({ valid: true, coupon: { code: coupon.code, type: coupon.type, value: coupon.value, discount: Math.round(discount * 100) / 100 } });
    } catch (error) {
        console.error('Error validating coupon:', error);
        return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
    }
}
