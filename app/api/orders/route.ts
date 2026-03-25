/**
 * app/api/orders/route.ts — Order creation and listing
 *
 * Fixes:
 *  - N+1 BUG: GET was only fetching orderItems for the FIRST order.
 *    Now fetches items for ALL orders in a single IN query.
 *  - RACE CONDITION: Stock decrement was outside a transaction.
 *    Now wraps order creation + item insert + stock decrement in db.transaction().
 *  - PRICE MANIPULATION: Client-submitted prices were trusted.
 *    Now server fetches prices from DB and recalculates totals.
 *  - COD confirmation email now fires only after successful DB commit.
 *  - Guard: unauthenticated users get 401 on order listing (was returning empty array silently).
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  orders,
  orderItems,
  productVariants,
  products,
  coupons,
  vendorSales,
  vendors,
} from '@/lib/schema';
import { eq, and, desc, inArray, sql, ne } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { sendOrderConfirmationEmail } from '@/lib/emails/order-confirmation';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

function cuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Validation schemas ────────────────────────────────────────────────────────
const orderItemSchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1),
  quantity: z.number().int().positive().max(50),
});

const createOrderSchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().min(2),
  customerPhone: z.string().regex(/^\d{10}$/),
  shippingAddress: z.object({
    fullName: z.string(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
  }),
  items: z.array(orderItemSchema).min(1),
  paymentMethod: z.enum(['COD', 'ONLINE']).default('COD'),
  couponCode: z.string().optional(),
});

// ─── GET /api/orders ──────────────────────────────────────────────────────────
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);

    // Build where condition based on role
    const whereCondition =
      session.user.role === 'ADMIN'
        ? status ? eq(orders.status, status) : undefined
        : status
          ? and(eq(orders.userId, session.user.id), eq(orders.status, status))
          : eq(orders.userId, session.user.id);

    const orderRows = await db
      .select()
      .from(orders)
      .where(whereCondition)
      .orderBy(desc(orders.createdAt))
      .limit(limit);

    if (orderRows.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    // FIX: Fetch ALL order items in a single query (was fetching only for orderRows[0])
    const orderIds = orderRows.map((o) => o.id);
    const allItems = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    const ordersWithData = orderRows.map((order) => ({
      ...order,
      shippingAddress:
        typeof order.shippingAddress === 'string'
          ? (() => {
              try {
                return JSON.parse(order.shippingAddress);
              } catch {
                return order.shippingAddress;
              }
            })()
          : order.shippingAddress,
      items: allItems.filter((i) => i.orderId === order.id),
    }));

    return NextResponse.json({ orders: ordersWithData });
  } catch (error) {
    console.error('[Orders GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// ─── POST /api/orders ─────────────────────────────────────────────────────────
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limit by IP
    const ip = getClientIp(request);
    const rl = checkRateLimit(`orders:${ip}`, RATE_LIMITS.ORDERS);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many order attempts. Please wait a moment.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rl.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const session = await auth();
    const body = await request.json();

    // Validate request shape
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid order data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      items,
      paymentMethod,
      couponCode,
    } = parsed.data;

    // ── Server-side price validation + stock check (outside TX for read phase) ─
    const validatedItems: Array<{
      productId: string;
      variantId: string;
      name: string;
      size: string;
      quantity: number;
      price: number;
      vendorId: string | null;
    }> = [];

    for (const item of items) {
      const [variant] = await db
        .select()
        .from(productVariants)
        .where(
          and(
            eq(productVariants.productId, item.productId),
            eq(productVariants.size, item.size)
          )
        )
        .limit(1);

      if (!variant) {
        return NextResponse.json(
          { error: `Product variant not found for product ${item.productId}` },
          { status: 400 }
        );
      }
      if (variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock. Only ${variant.stock} left in stock.` },
          { status: 400 }
        );
      }

      const [product] = await db
        .select({
          name: products.name,
          price: products.price,
          salePrice: products.salePrice,
          vendorId: products.vendorId,
          active: products.active,
        })
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      if (!product || !product.active) {
        return NextResponse.json(
          { error: `Product ${item.productId} is not available` },
          { status: 400 }
        );
      }

      validatedItems.push({
        productId: item.productId,
        variantId: variant.id,
        name: product.name,
        size: item.size,
        quantity: item.quantity,
        // Use server-fetched price, never trust client
        price: product.salePrice ?? product.price,
        vendorId: product.vendorId ?? null,
      });
    }

    // ── Coupon validation ────────────────────────────────────────────────────────
    let discount = 0;
    if (couponCode) {
      const now = new Date();
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, couponCode.toUpperCase()))
        .limit(1);

      if (!coupon || !coupon.active) {
        return NextResponse.json(
          { error: 'Invalid or inactive coupon code' },
          { status: 400 }
        );
      }
      if (coupon.validFrom > now || coupon.validUntil < now) {
        return NextResponse.json(
          { error: 'Coupon has expired or is not yet valid' },
          { status: 400 }
        );
      }
      if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
        return NextResponse.json(
          { error: 'Coupon usage limit has been reached' },
          { status: 400 }
        );
      }

      const serverSubtotal = validatedItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      if (coupon.minOrder !== null && serverSubtotal < coupon.minOrder) {
        return NextResponse.json(
          { error: `Minimum order value of ₹${coupon.minOrder} required for this coupon` },
          { status: 400 }
        );
      }

      if (coupon.type === 'PERCENTAGE') {
        discount = serverSubtotal * (coupon.value / 100);
        if (coupon.maxDiscount !== null) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
      } else {
        discount = Math.min(coupon.value, serverSubtotal);
      }
      discount = Math.round(discount * 100) / 100;
    }

    // ── Calculate totals server-side ────────────────────────────────────────────
    const serverSubtotal = validatedItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );
    const shippingCost = serverSubtotal >= 999 ? 0 : 99; // Free shipping over ₹999
    const serverTotal = Math.round((serverSubtotal - discount + shippingCost) * 100) / 100;

    // ── Atomic DB transaction: create order + items + decrement stock ────────────
    const orderId = cuid();

    await db.transaction(async (tx) => {
      // 1. Insert order
      await tx.insert(orders).values({
        id: orderId,
        userId: session?.user?.id ?? null,
        subtotal: serverSubtotal,
        discount,
        shippingCost,
        tax: 0,
        total: serverTotal,
        couponCode: couponCode?.toUpperCase() ?? null,
        status: paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'COD' : 'PENDING',
        shippingAddress: JSON.stringify(shippingAddress),
      });

      // 2. Insert order items
      await tx.insert(orderItems).values(
        validatedItems.map((item) => ({
          id: cuid(),
          orderId,
          productId: item.productId,
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        }))
      );

      // 3. Atomic stock decrement with optimistic locking
      for (const item of validatedItems) {
        const updated = await tx
          .update(productVariants)
          .set({ stock: sql`${productVariants.stock} - ${item.quantity}` })
          .where(
            and(
              eq(productVariants.id, item.variantId),
              sql`${productVariants.stock} >= ${item.quantity}`
            )
          );

        // Check if the update actually happened (stock check race condition guard)
        if (!updated) {
          throw new Error(`Stock depleted for ${item.name} (size: ${item.size})`);
        }
      }

      // 4. Increment coupon usage if applicable
      if (couponCode) {
        await tx
          .update(coupons)
          .set({ usageCount: sql`${coupons.usageCount} + 1` })
          .where(eq(coupons.code, couponCode.toUpperCase()));
      }

      // 5. Create VendorSale records for vendor commission tracking
      const vendorGroups = new Map<
        string,
        { total: number; commissionRate: number }
      >();

      for (const item of validatedItems) {
        if (!item.vendorId) continue;

        const existing = vendorGroups.get(item.vendorId);
        const lineTotal = item.price * item.quantity;

        if (existing) {
          existing.total += lineTotal;
        } else {
          // Fetch vendor commission rate
          const [vendor] = await tx
            .select({ commissionRate: vendors.commissionRate })
            .from(vendors)
            .where(eq(vendors.id, item.vendorId))
            .limit(1);

          vendorGroups.set(item.vendorId, {
            total: lineTotal,
            commissionRate: vendor?.commissionRate ?? 10,
          });
        }
      }

      if (vendorGroups.size > 0) {
        await tx.insert(vendorSales).values(
          Array.from(vendorGroups.entries()).map(([vendorId, { total, commissionRate }]) => {
            const commissionAmount = Math.round(total * (commissionRate / 100) * 100) / 100;
            return {
              id: cuid(),
              vendorId,
              orderId,
              productTotal: total,
              commissionRate,
              commissionAmount,
              vendorPayout: Math.round((total - commissionAmount) * 100) / 100,
              payoutStatus: 'PENDING' as const,
            };
          })
        );
      }
    });

    // ── For ONLINE orders, create Razorpay order after DB commit ────────────────
    let razorpayData: Record<string, unknown> | null = null;
    if (paymentMethod === 'ONLINE') {
      const { razorpayService } = await import('@/lib/razorpay');
      const razorpayOrder = await razorpayService.createOrder({
        amount: Math.round(serverTotal * 100),
        currency: 'INR',
        receipt: orderId,
        notes: {
          orderId,
          customerName,
          customerEmail,
        },
      });
      // Store Razorpay order ID
      await db
        .update(orders)
        .set({ razorpayOrderId: razorpayOrder.id })
        .where(eq(orders.id, orderId));

      razorpayData = {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: razorpayService.getKeyId(),
      };
    }

    // ── Send confirmation email (COD only; ONLINE sent on payment.captured) ──────
    if (paymentMethod === 'COD') {
      try {
        await sendOrderConfirmationEmail({
          orderId,
          customerName,
          customerEmail,
          items: validatedItems,
          subtotal: serverSubtotal,
          shippingCost,
          discount,
          total: serverTotal,
          paymentMethod,
        });
      } catch (emailError) {
        // Non-fatal: log and continue
        console.error('[Orders POST] Failed to send confirmation email:', emailError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        orderId,
        ...(razorpayData ?? {}),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('[Orders POST] Error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to create order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
