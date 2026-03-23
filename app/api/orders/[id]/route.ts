import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        if (order.userId && session?.user?.role !== 'ADMIN') {
            if (!session?.user?.id || session.user.id !== order.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
        return NextResponse.json({ order: { ...order, shippingAddress: JSON.parse(order.shippingAddress), items } });
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}
