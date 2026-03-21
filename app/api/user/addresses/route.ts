import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET — list all saved addresses for current user
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const addresses = await prisma.address.findMany({
        where: { userId: session.user.id },
        orderBy: [{ isDefault: 'desc' }, { id: 'desc' }],
    });

    return NextResponse.json({ addresses });
}

// POST — create a new address
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { fullName, phone, address, city, state, pincode, isDefault } = await request.json();

        if (!fullName || !phone || !address || !city || !state || !pincode) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // If setting as default, clear existing default
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: session.user.id },
                data: { isDefault: false },
            });
        }

        const newAddress = await prisma.address.create({
            data: {
                userId: session.user.id,
                fullName,
                phone,
                address,
                city,
                state,
                pincode,
                isDefault: isDefault ?? false,
            },
        });

        return NextResponse.json({ address: newAddress }, { status: 201 });
    } catch (error) {
        console.error('Address POST error:', error);
        return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
    }
}

// PATCH — set default or update address
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id, isDefault, fullName, phone, address, city, state, pincode } = await request.json();
        if (!id) return NextResponse.json({ error: 'Address id required' }, { status: 400 });

        // Verify ownership
        const existing = await prisma.address.findFirst({ where: { id, userId: session.user.id } });
        if (!existing) return NextResponse.json({ error: 'Address not found' }, { status: 404 });

        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: session.user.id },
                data: { isDefault: false },
            });
        }

        const updated = await prisma.address.update({
            where: { id },
            data: { fullName, phone, address, city, state, pincode, ...(isDefault !== undefined ? { isDefault } : {}) },
        });

        return NextResponse.json({ address: updated });
    } catch (error) {
        console.error('Address PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
    }
}

// DELETE — remove an address
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await request.json();
        const existing = await prisma.address.findFirst({ where: { id, userId: session.user.id } });
        if (!existing) return NextResponse.json({ error: 'Address not found' }, { status: 404 });

        await prisma.address.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Address DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
    }
}
