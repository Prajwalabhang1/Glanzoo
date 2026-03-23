import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { addresses } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
export const dynamic = 'force-dynamic';

function cuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const rows = await db.select().from(addresses).where(eq(addresses.userId, session.user.id)).orderBy(desc(addresses.isDefault));
    return NextResponse.json({ addresses: rows });
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { fullName, phone, address, city, state, pincode, isDefault } = await request.json();
        if (!fullName || !phone || !address || !city || !state || !pincode) return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        if (isDefault) await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, session.user.id));
        const id = cuid();
        await db.insert(addresses).values({ id, userId: session.user.id, fullName, phone, address, city, state, pincode, isDefault: isDefault ?? false });
        const [newAddress] = await db.select().from(addresses).where(eq(addresses.id, id)).limit(1);
        return NextResponse.json({ address: newAddress }, { status: 201 });
    } catch (error) { console.error('Address POST error:', error); return NextResponse.json({ error: 'Failed to create address' }, { status: 500 }); }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { id, isDefault, fullName, phone, address, city, state, pincode } = await request.json();
        if (!id) return NextResponse.json({ error: 'Address id required' }, { status: 400 });
        const [existing] = await db.select({ id: addresses.id }).from(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, session.user.id))).limit(1);
        if (!existing) return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        if (isDefault) await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, session.user.id));
        await db.update(addresses).set({ fullName, phone, address, city, state, pincode, ...(isDefault !== undefined ? { isDefault } : {}) }).where(eq(addresses.id, id));
        const [updated] = await db.select().from(addresses).where(eq(addresses.id, id)).limit(1);
        return NextResponse.json({ address: updated });
    } catch (error) { console.error('Address PATCH error:', error); return NextResponse.json({ error: 'Failed to update address' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { id } = await request.json();
        const [existing] = await db.select({ id: addresses.id }).from(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, session.user.id))).limit(1);
        if (!existing) return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        await db.delete(addresses).where(eq(addresses.id, id));
        return NextResponse.json({ success: true });
    } catch (error) { console.error('Address DELETE error:', error); return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 }); }
}
