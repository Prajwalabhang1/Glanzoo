import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { collections } from '@/lib/schema';
import { eq } from 'drizzle-orm';

async function checkAdmin() {
    const session = await auth();
    return session?.user?.role === 'ADMIN';
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    try {
        const body = await req.json();
        await db.update(collections).set(body).where(eq(collections.id, id));
        const [collection] = await db.select().from(collections).where(eq(collections.id, id)).limit(1);
        return NextResponse.json({ collection });
    } catch { return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 }); }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    try {
        await db.delete(collections).where(eq(collections.id, id));
        return NextResponse.json({ success: true });
    } catch { return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 }); }
}
