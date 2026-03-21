import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function checkAdmin() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return false;
    return true;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    try {
        const body = await req.json();
        const collection = await prisma.collection.update({
            where: { id },
            data: body
        });
        return NextResponse.json({ collection });
    } catch {
        return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    try {
        await prisma.collection.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
    }
}
