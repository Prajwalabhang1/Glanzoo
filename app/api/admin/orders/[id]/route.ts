import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, orderItems, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

async function checkAdminAccess() {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized', status: 401 };
    if (session.user.role !== 'ADMIN') return { error: 'Forbidden: Admin access required', status: 403 };
    return null;
}

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const accessError = await checkAdminAccess();
        if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status });
        const [order] = await db.select().from(orders).where(eq(orders.id, params.id)).limit(1);
        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        const [items, userInfo] = await Promise.all([
            db.select().from(orderItems).where(eq(orderItems.orderId, params.id)),
            order.userId ? db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone }).from(users).where(eq(users.id, order.userId)).limit(1) : Promise.resolve([]),
        ]);
        return NextResponse.json({ order: { ...order, shippingAddress: JSON.parse(order.shippingAddress), items, user: userInfo[0] ?? null } });
    } catch (error) { console.error('Error fetching order:', error); return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 }); }
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const accessError = await checkAdminAccess();
        if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status });
        const { status, paymentStatus, trackingNumber, notes } = await request.json();
        const updateData: Record<string, unknown> = {};
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
        if (notes !== undefined) updateData.notes = notes;
        await db.update(orders).set(updateData).where(eq(orders.id, params.id));
        const [order] = await db.select().from(orders).where(eq(orders.id, params.id)).limit(1);
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, params.id));
        return NextResponse.json({ message: 'Order updated successfully', order: { ...order, items } });
    } catch (error) { console.error('Error updating order:', error); return NextResponse.json({ error: 'Failed to update order' }, { status: 500 }); }
}
