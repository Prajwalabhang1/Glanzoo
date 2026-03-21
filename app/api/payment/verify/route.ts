export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { razorpayService } from '@/lib/razorpay';
import prisma from '@/lib/prisma';

// POST /api/payment/verify
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { error: 'Missing required payment details' },
                { status: 400 }
            );
        }

        // 1. Verify Signature
        const isValid = razorpayService.verifyPayment({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // 2. Update Order Status
        // Find order by Razorpay Order ID
        const order = await prisma.order.findFirst({
            where: { razorpayOrderId: razorpay_order_id },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Update Order
        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: 'CONFIRMED',
                paymentStatus: 'SUCCESS',
                paymentId: razorpay_payment_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
            },
        });

        return NextResponse.json({
            success: true,
            orderId: order.id,
        });

    } catch (error: unknown) {
        console.error('Payment verification error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to verify payment';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
