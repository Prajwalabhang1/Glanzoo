export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const text = await request.text();
        const signature = request.headers.get('x-razorpay-signature');

        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Verify webhook secret exists
        if (!secret) {
            console.error('RAZORPAY_WEBHOOK_SECRET is not defined');
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
        }

        // Verify signature using timing-safe comparison
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(text)
            .digest('hex');

        const isValid = crypto.timingSafeEqual(
            Buffer.from(expectedSignature, 'hex'),
            Buffer.from(signature || '', 'hex')
        );

        if (!isValid) {
            console.error('Invalid webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const body = JSON.parse(text);
        const event = body.event;
        const payload = body.payload;

        if (event === 'payment.captured') {
            const payment = payload.payment.entity;
            const orderId = payment.notes?.orderId;

            if (orderId) {
                // Idempotent: only update if not already confirmed
                await prisma.order.updateMany({
                    where: {
                        id: orderId,
                        paymentStatus: { not: 'SUCCESS' }, // prevent double-processing
                    },
                    data: {
                        paymentStatus: 'SUCCESS',
                        status: 'CONFIRMED',
                        paymentId: payment.id,
                    },
                });
            }
        } else if (event === 'payment.failed') {
            const payment = payload.payment.entity;
            const orderId = payment.notes?.orderId;

            if (orderId) {
                // FIX-3 + FIX-18: Use a single atomic transaction to cancel order and
                // restore stock using updateMany with increment — no race condition possible.
                await prisma.$transaction(async (tx) => {
                    // 1. Fetch and cancel order atomically (idempotent guard)
                    const order = await tx.order.findFirst({
                        where: {
                            id: orderId,
                            paymentStatus: { not: 'FAILED' }, // prevent double-processing
                        },
                        include: { items: true },
                    });

                    if (!order) {
                        // Already processed — return early (no-op)
                        return;
                    }

                    // 2. Mark order as cancelled
                    await tx.order.update({
                        where: { id: order.id },
                        data: {
                            paymentStatus: 'FAILED',
                            status: 'CANCELLED',
                        },
                    });

                    // 3. FIX: Atomically restore stock for all items using increment.
                    // This is safe even if called multiple times due to the idempotency guard above.
                    for (const item of order.items) {
                        await tx.productVariant.updateMany({
                            where: {
                                productId: item.productId,
                                size: item.size,
                            },
                            data: {
                                stock: { increment: item.quantity },
                            },
                        });
                    }
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
