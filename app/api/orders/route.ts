import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, productVariants, products } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { sendOrderConfirmationEmail } from '@/lib/emails/order-confirmation';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function cuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

        let orderRows;
        if (session?.user?.role === 'ADMIN') {
            orderRows = await db.select().from(orders)
                .where(status ? eq(orders.status, status) : undefined)
                .orderBy(desc(orders.createdAt)).limit(limit);
        } else if (session?.user?.id) {
            orderRows = await db.select().from(orders)
                .where(and(eq(orders.userId, session.user.id), status ? eq(orders.status, status) : undefined))
                .orderBy(desc(orders.createdAt)).limit(limit);
        } else {
            return NextResponse.json({ orders: [] });
        }

        const orderIds = orderRows.map(o => o.id);
        const items = orderIds.length > 0 ? await db.select().from(orderItems).where(eq(orderItems.orderId, orderRows[0].id)) : [];

        const ordersWithData = orderRows.map(order => ({
            ...order,
            shippingAddress: typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress,
            items: items.filter(i => i.orderId === order.id),
        }));

        return NextResponse.json({ orders: ordersWithData });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const ip = getClientIp(request);
        const rl = checkRateLimit(`orders:${ip}`, RATE_LIMITS.ORDERS);
        if (!rl.success) {
            return NextResponse.json({ error: 'Too many order attempts.' }, {
                status: 429,
                headers: { 'Retry-After': Math.ceil((rl.resetAt - Date.now()) / 1000).toString() },
            });
        }

        const body = await request.json();
        let session = null;
        try { session = await auth(); } catch { console.warn('Auth check failed, proceeding as guest'); }

        const { customerEmail, customerName, customerPhone, shippingAddress, items, total, subtotal, paymentMethod = 'COD', couponCode, shippingCost = 0, tax = 0, discount = 0 } = body;
        if (!customerEmail || !customerName || !customerPhone || !shippingAddress || !items || !total || !subtotal) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate stock and get variant details
        const validatedItems = [];
        for (const item of items) {
            const [variant] = await db.select().from(productVariants)
                .where(and(eq(productVariants.productId, item.productId), eq(productVariants.size, item.size)))
                .limit(1);
            if (!variant || variant.stock < item.quantity) throw new Error(`Insufficient stock for ${item.name}`);
            const [product] = await db.select({ name: products.name, price: products.price, salePrice: products.salePrice })
                .from(products).where(eq(products.id, item.productId)).limit(1);
            await db.update(productVariants).set({ stock: variant.stock - item.quantity }).where(eq(productVariants.id, variant.id));
            validatedItems.push({ productId: item.productId, name: product.name, size: item.size, quantity: item.quantity, price: product.salePrice ?? product.price });
        }

        const serverSubtotal = validatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const calculatedTax = tax || Math.round(serverSubtotal * 0.18);
        const serverTotal = serverSubtotal - discount + shippingCost + calculatedTax;

        const orderId = cuid();
        await db.insert(orders).values({
            id: orderId, userId: session?.user?.id || null, subtotal: serverSubtotal, discount, shippingCost, tax: calculatedTax,
            total: serverTotal, couponCode: couponCode || null, status: 'PENDING', paymentMethod, paymentStatus: 'PENDING',
            shippingAddress: JSON.stringify(shippingAddress),
        });

        if (validatedItems.length > 0) {
            await db.insert(orderItems).values(validatedItems.map(item => ({ id: cuid(), orderId, ...item })));
        }

        let razorpayData = null;
        if (paymentMethod === 'ONLINE') {
            const { razorpayService } = await import('@/lib/razorpay');
            const razorpayOrder = await razorpayService.createOrder({ amount: Math.round(serverTotal * 100), currency: 'INR', receipt: orderId });
            await db.update(orders).set({ razorpayOrderId: razorpayOrder.id }).where(eq(orders.id, orderId));
            razorpayData = { id: razorpayOrder.id, amount: razorpayOrder.amount, keyId: razorpayService.getKeyId() };
        }

        try {
            await sendOrderConfirmationEmail({ orderId, customerName, customerEmail, items: validatedItems, subtotal: serverSubtotal, shippingCost, discount, total: serverTotal, paymentMethod });
        } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
        }

        return NextResponse.json({ success: true, orderId, ...(razorpayData ?? {}) }, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Order failed';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
