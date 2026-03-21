export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/coupons/validate?code=XXXXX&total=1000
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const total = parseFloat(searchParams.get('total') || '0');

        if (!code) {
            return NextResponse.json(
                { error: 'Coupon code is required' },
                { status: 400 }
            );
        }

        // Find coupon
        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!coupon) {
            return NextResponse.json(
                { error: 'Invalid coupon code' },
                { status: 404 }
            );
        }

        // Check if active
        if (!coupon.active) {
            return NextResponse.json(
                { error: 'This coupon is no longer active' },
                { status: 400 }
            );
        }

        // Check date validity
        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validUntil) {
            return NextResponse.json(
                { error: 'This coupon has expired or is not yet valid' },
                { status: 400 }
            );
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return NextResponse.json(
                { error: 'This coupon has reached its usage limit' },
                { status: 400 }
            );
        }

        // Check minimum order value
        if (coupon.minOrder && total < coupon.minOrder) {
            return NextResponse.json(
                { error: `Minimum order value of ₹${coupon.minOrder} required` },
                { status: 400 }
            );
        }

        // Calculate discount
        let discount = 0;
        if (coupon.type === 'PERCENTAGE') {
            discount = (total * coupon.value) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else if (coupon.type === 'FIXED') {
            discount = coupon.value;
        }

        return NextResponse.json({
            valid: true,
            coupon: {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                discount: Math.round(discount * 100) / 100,
            },
        });
    } catch (error) {
        console.error('Error validating coupon:', error);
        return NextResponse.json(
            { error: 'Failed to validate coupon' },
            { status: 500 }
        );
    }
}
