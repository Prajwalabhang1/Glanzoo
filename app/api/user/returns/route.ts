import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { returnRequests, orders } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';

function cuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const rows = await db.select().from(returnRequests).where(eq(returnRequests.userId, session.user.id)).orderBy(desc(returnRequests.createdAt));
        const withOrders = await Promise.all(rows.map(async r => {
            const [order] = r.orderId ? await db.select({ total: orders.total, createdAt: orders.createdAt }).from(orders).where(eq(orders.id, r.orderId)).limit(1) : [null];
            return { ...r, order: order ?? null };
        }));
        return NextResponse.json({ returns: withOrders });
    } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { orderId, reason, details } = await req.json();
        const [order] = await db.select({ id: orders.id }).from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, session.user.id))).limit(1);
        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        const [existing] = await db.select({ id: returnRequests.id }).from(returnRequests).where(eq(returnRequests.orderId, orderId)).limit(1);
        if (existing) return NextResponse.json({ error: 'Return already requested for this order' }, { status: 400 });
        const id = cuid();
        await db.insert(returnRequests).values({ id, orderId, userId: session.user.id, reason, details });
        const [returnReq] = await db.select().from(returnRequests).where(eq(returnRequests.id, id)).limit(1);
        return NextResponse.json({ returnRequest: returnReq });
    } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
