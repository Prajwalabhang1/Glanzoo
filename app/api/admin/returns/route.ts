import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { returnRequests, orders, users } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

async function checkAdmin() {
    const session = await auth();
    return session?.user?.role === 'ADMIN';
}

export async function GET() {
    if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const rows = await db.select().from(returnRequests).orderBy(desc(returnRequests.createdAt));
        const withRelations = await Promise.all(rows.map(async r => {
            const [order] = r.orderId ? await db.select().from(orders).where(eq(orders.id, r.orderId)).limit(1) : [null];
            const [user] = r.userId ? await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, r.userId)).limit(1) : [null];
            return { ...r, order: order ?? null, user: user ?? null };
        }));
        return NextResponse.json({ returns: withRelations });
    } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function PATCH(req: Request) {
    if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { id, status, adminNote } = await req.json();
        await db.update(returnRequests).set({ status, adminNote }).where(eq(returnRequests.id, id));
        const [returnReq] = await db.select().from(returnRequests).where(eq(returnRequests.id, id)).limit(1);
        return NextResponse.json({ returnRequest: returnReq });
    } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
