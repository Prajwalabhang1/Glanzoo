export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { razorpayService } from '@/lib/razorpay';

// POST /api/payment/create-order
export async function POST(request: Request) {
    try {
        const { amount, orderId, customerDetails } = await request.json();

        if (!amount || !orderId) {
            return NextResponse.json(
                { error: 'Amount and order ID are required' },
                { status: 400 }
            );
        }

        // Convert to paise (Razorpay uses smallest currency unit)
        const amountInPaise = Math.round(amount * 100);

        // Create Razorpay order
        const razorpayOrder = await razorpayService.createOrder({
            amount: amountInPaise,
            currency: 'INR',
            receipt: orderId,
            notes: {
                orderId,
                customerName: customerDetails?.name || '',
                customerEmail: customerDetails?.email || '',
            },
        });

        return NextResponse.json({
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: razorpayService.getKeyId(),
        });
    } catch (error: unknown) {
        console.error('Payment order creation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create payment order';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
