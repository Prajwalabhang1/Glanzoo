import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function checkAdmin() {
    const session = await auth();
    return session?.user?.role === 'ADMIN';
}

export async function GET() {
    if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const returns = await prisma.returnRequest.findMany({
            include: {
                order: true,
                user: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ returns });
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id, status, adminNote } = await req.json();
        const returnReq = await prisma.returnRequest.update({
            where: { id },
            data: { status, adminNote }
        });
        return NextResponse.json({ returnRequest: returnReq });
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
