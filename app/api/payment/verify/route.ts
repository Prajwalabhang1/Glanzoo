/**
 * app/api/payment/verify/route.ts — Razorpay payment verification
 *
 * Fixes:
 *  - Uses crypto.timingSafeEqual for signature comparison (timing-attack safe)
 *  - After successful verification: decrements stock + sends confirmation email
 *    inside a transaction (was updating order status only)
 *  - Increments coupon usageCount if coupon was applied
 *  - Auth check: session required
 *  - Raw error messages no longer leaked to client
 *  - Idempotent: if order already CONFIRMED, returns success without re-processing
 */
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { orders, orderItems, productVariants, coupons } from '@/lib/schema';
import { eq, and, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { env } from '@/lib/env';
import { sendOrderConfirmationEmail } from '@/lib/emails/order-confirmation';
import { z } from 'zod';

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Missing required payment details' },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    // ── Signature verification (timing-safe) ────────────────────────────────────
    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSig = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(message)
      .digest('hex');

    let sigValid = false;
    try {
      sigValid = crypto.timingSafeEqual(
        Buffer.from(expectedSig, 'hex'),
        Buffer.from(razorpay_signature, 'hex')
      );
    } catch {
      // Buffer length mismatch — invalid signature
      sigValid = false;
    }

    if (!sigValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // ── Find the order ─────────────────────────────────────────────────────────
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.razorpayOrderId, razorpay_order_id))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Ownership check: only the order owner or admin can verify
    if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Idempotency: if already confirmed, return success without re-processing
    if (order.status === 'CONFIRMED' && order.paymentStatus === 'SUCCESS') {
      return NextResponse.json({ success: true, orderId: order.id });
    }

    // ── Fetch order items for email + stock decrement ──────────────────────────
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    // ── Atomic transaction: confirm order + decrement stock ─────────────────────
    await db.transaction(async (tx) => {
      // 1. Mark order confirmed
      await tx
        .update(orders)
        .set({
          status: 'CONFIRMED',
          paymentStatus: 'SUCCESS',
          paymentId: razorpay_payment_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        })
        .where(eq(orders.id, order.id));

      // 2. Decrement stock for each item
      for (const item of items) {
        await tx
          .update(productVariants)
          .set({ stock: sql`${productVariants.stock} - ${item.quantity}` })
          .where(
            and(
              eq(productVariants.productId, item.productId),
              eq(productVariants.size, item.size),
              sql`${productVariants.stock} >= ${item.quantity}`
            )
          );
      }

      // 3. Increment coupon usage count if applicable
      if (order.couponCode) {
        await tx
          .update(coupons)
          .set({ usageCount: sql`${coupons.usageCount} + 1` })
          .where(eq(coupons.code, order.couponCode));
      }
    });

    // ── Send confirmation email (non-fatal) ─────────────────────────────────────
    try {
      const shippingAddr =
        typeof order.shippingAddress === 'string'
          ? JSON.parse(order.shippingAddress)
          : order.shippingAddress;

      await sendOrderConfirmationEmail({
        orderId: order.id,
        customerName: shippingAddr.fullName ?? 'Customer',
        customerEmail: order.userId ? session.user.email ?? '' : '',
        items: items.map((i) => ({
          name: i.name,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
        })),
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        discount: order.discount,
        total: order.total,
        paymentMethod: 'ONLINE',
      });
    } catch (emailErr) {
      console.error('[PaymentVerify] Failed to send confirmation email:', emailErr);
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('[PaymentVerify] Error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed. Please contact support.' },
      { status: 500 }
    );
  }
}
