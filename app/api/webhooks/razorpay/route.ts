export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { orders, orderItems, productVariants } from '@/lib/schema';
import { eq, and, ne, sql } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const text = await request.text();
        const signature = request.headers.get('x-razorpay-signature');
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) { console.error('RAZORPAY_WEBHOOK_SECRET is not defined'); return NextResponse.json({ error: 'Configuration error' }, { status: 500 }); }

        const expectedSignature = crypto.createHmac('sha256', secret).update(text).digest('hex');
        const isValid = crypto.timingSafeEqual(Buffer.from(expectedSignature, 'hex'), Buffer.from(signature || '', 'hex'));
        if (!isValid) { console.error('Invalid webhook signature'); return NextResponse.json({ error: 'Invalid signature' }, { status: 400 }); }

        const body = JSON.parse(text);
        const event = body.event;
        const payload = body.payload;

        if (event === 'payment.captured') {
            const payment = payload.payment.entity;
            const orderId = payment.notes?.orderId;
            if (orderId) {
                await db.update(orders).set({ paymentStatus: 'SUCCESS', status: 'CONFIRMED', paymentId: payment.id })
                    .where(and(eq(orders.id, orderId), ne(orders.paymentStatus, 'SUCCESS')));
            }
        } else if (event === 'payment.failed') {
            const payment = payload.payment.entity;
            const orderId = payment.notes?.orderId;
            if (orderId) {
                const [order] = await db.select().from(orders).where(and(eq(orders.id, orderId), ne(orders.paymentStatus, 'FAILED'))).limit(1);
                if (order) {
                    await db.update(orders).set({ paymentStatus: 'FAILED', status: 'CANCELLED' }).where(eq(orders.id, orderId));
                    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
                    for (const item of items) {
                        await db.update(productVariants).set({ stock: sql`${productVariants.stock} + ${item.quantity}` })
                            .where(and(eq(productVariants.productId, item.productId), eq(productVariants.size, item.size ?? '')));
                    }
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
