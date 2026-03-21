import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const returns = await prisma.returnRequest.findMany({
            where: { userId: session.user.id },
            include: { order: { select: { total: true, createdAt: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ returns });
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { orderId, reason, details } = await req.json();

        // Check if order exists and belongs to user
        const order = await prisma.order.findUnique({
            where: { id: orderId, userId: session.user.id }
        });

        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        // Check if return already exists
        const existing = await prisma.returnRequest.findFirst({
            where: { orderId }
        });

        if (existing) return NextResponse.json({ error: 'Return already requested for this order' }, { status: 400 });

        const returnReq = await prisma.returnRequest.create({
            data: { orderId, userId: session.user.id, reason, details }
        });

        return NextResponse.json({ returnRequest: returnReq });
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
