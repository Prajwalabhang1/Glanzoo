export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Middleware to check admin access
async function checkAdminAccess() {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: 'Unauthorized', status: 401 };
    }

    if (session.user.role !== 'ADMIN') {
        return { error: 'Forbidden: Admin access required', status: 403 };
    }

    return null;
}

// GET /api/admin/coupons - Get all coupons
export async function GET() {
    try {
        const accessError = await checkAdminAccess();
        if (accessError) {
            return NextResponse.json(
                { error: accessError.error },
                { status: accessError.status }
            );
        }

        const coupons = await prisma.coupon.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ coupons });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        return NextResponse.json(
            { error: 'Failed to fetch coupons' },
            { status: 500 }
        );
    }
}

// POST /api/admin/coupons - Create new coupon
export async function POST(request: Request) {
    try {
        const accessError = await checkAdminAccess();
        if (accessError) {
            return NextResponse.json(
                { error: accessError.error },
                { status: accessError.status }
            );
        }

        const body = await request.json();
        const {
            code,
            type,
            value,
            minOrder,
            maxDiscount,
            validFrom,
            validUntil,
            usageLimit,
            active = true,
        } = body;

        // Validate required fields
        if (!code || !type || !value || !validFrom || !validUntil) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if coupon code already exists
        const existingCoupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (existingCoupon) {
            return NextResponse.json(
                { error: 'Coupon code already exists' },
                { status: 409 }
            );
        }

        // Create coupon
        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                type,
                value,
                minOrder: minOrder || null,
                maxDiscount: maxDiscount || null,
                validFrom: new Date(validFrom),
                validUntil: new Date(validUntil),
                usageLimit: usageLimit || null,
                active,
            },
        });

        return NextResponse.json(
            {
                message: 'Coupon created successfully',
                coupon,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating coupon:', error);
        return NextResponse.json(
            { error: 'Failed to create coupon' },
            { status: 500 }
        );
    }
}
