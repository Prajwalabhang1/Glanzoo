import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendOrderConfirmationEmail } from '@/lib/emails/order-confirmation';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

        const where: Prisma.OrderWhereInput = {};
        if (session?.user?.id && session.user.role !== 'ADMIN') {
            where.userId = session.user.id;
        }
        if (status) {
            where.status = status;
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                items: true,
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        const ordersWithParsedData = orders.map((order) => ({
            ...order,
            shippingAddress: typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress,
        }));

        return NextResponse.json({ orders: ordersWithParsedData });
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
            return NextResponse.json(
                { error: 'Too many order attempts.' },
                {
                    status: 429,
                    headers: { 'Retry-After': Math.ceil((rl.resetAt - Date.now()) / 1000).toString() },
                }
            );
        }

        const body = await request.json();
        let session = null;
        try {
            session = await auth();
        } catch {
            console.warn('Auth check failed, proceeding as guest');
        }

        const {
            customerEmail, customerName, customerPhone, shippingAddress, items, total, subtotal, paymentMethod = 'COD', couponCode, shippingCost = 0, tax = 0, discount = 0
        } = body;

        if (!customerEmail || !customerName || !customerPhone || !shippingAddress || !items || !total || !subtotal) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const validatedItems = [];
            for (const item of items) {
                const variant = await tx.productVariant.findFirst({
                    where: { productId: item.productId, size: item.size },
                    include: { product: { select: { name: true, price: true, salePrice: true } } },
                });
                if (!variant || variant.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${item.name}`);
                }
                await tx.productVariant.update({
                    where: { id: variant.id },
                    data: { stock: variant.stock - item.quantity },
                });
                validatedItems.push({
                    productId: item.productId, name: variant.product.name, size: item.size, quantity: item.quantity, price: variant.product.salePrice ?? variant.product.price,
                });
            }

            const serverSubtotal = validatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

            // Calculate tax (GST 18%) if not provided
            const calculatedTax = tax || Math.round(serverSubtotal * 0.18);
            const serverTotal = serverSubtotal - discount + shippingCost + calculatedTax;

            const order = await tx.order.create({
                data: {
                    userId: session?.user?.id || null,
                    subtotal: serverSubtotal,
                    discount: discount,
                    shippingCost: shippingCost,
                    tax: calculatedTax,
                    total: serverTotal,
                    couponCode: couponCode || null,
                    status: 'PENDING',
                    paymentMethod,
                    paymentStatus: 'PENDING',
                    shippingAddress: JSON.stringify(shippingAddress),
                    items: {
                        create: validatedItems.map((item) => ({ ...item })),
                    },
                },
                include: { items: true },
            });

            if (paymentMethod === 'ONLINE') {
                const { razorpayService } = await import('@/lib/razorpay');
                const razorpayOrder = await razorpayService.createOrder({
                    amount: Math.round(serverTotal * 100), currency: 'INR', receipt: order.id,
                });
                await tx.order.update({ where: { id: order.id }, data: { razorpayOrderId: razorpayOrder.id } });
                return { ...order, razorpay: { id: razorpayOrder.id, amount: razorpayOrder.amount, keyId: razorpayService.getKeyId() } };
            }

            return { ...order, razorpay: null };
        });

        try {
            await sendOrderConfirmationEmail({
                orderId: result.id, customerName, customerEmail, items: result.items, subtotal: result.subtotal, shippingCost, discount, total: result.total, paymentMethod,
            });
        } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
            // Continue processing even if email fails
        }

        return NextResponse.json({ success: true, orderId: result.id, ...result.razorpay }, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Order failed';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
