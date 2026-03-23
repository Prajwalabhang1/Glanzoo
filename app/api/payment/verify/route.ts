export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { razorpayService } from '@/lib/razorpay';
import { db } from '@/lib/db';
import { orders } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: 'Missing required payment details' }, { status: 400 });
        }
        const isValid = razorpayService.verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
        if (!isValid) return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });

        const [order] = await db.select({ id: orders.id }).from(orders).where(eq(orders.razorpayOrderId, razorpay_order_id)).limit(1);
        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        await db.update(orders).set({ status: 'CONFIRMED', paymentStatus: 'SUCCESS', paymentId: razorpay_payment_id, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature }).where(eq(orders.id, order.id));
        return NextResponse.json({ success: true, orderId: order.id });
    } catch (error: unknown) {
        console.error('Payment verification error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to verify payment' }, { status: 500 });
    }
}
