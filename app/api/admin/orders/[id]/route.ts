import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Middleware to check admin access
async function checkAdminAccess() {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: 'Unauthorized', status: 401 };
    }

    if (session.user.role !== 'ADMIN') {
        return { error: 'Forbidden: Admin access required', status: 403 };
    }

    return null;
}

// GET /api/admin/orders/[id] - Get order details
export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const accessError = await checkAdminAccess();
        if (accessError) {
            return NextResponse.json(
                { error: accessError.error },
                { status: accessError.status }
            );
        }

        const order = await prisma.order.findUnique({
            where: { id: params.id },
            include: {
                items: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Parse shipping address
        const orderWithParsedData = {
            ...order,
            shippingAddress: typeof order.shippingAddress === 'string'
                ? JSON.parse(order.shippingAddress)
                : order.shippingAddress,
        };

        return NextResponse.json({ order: orderWithParsedData });
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}

// PATCH /api/admin/orders/[id] - Update order status
export async function PATCH(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;

    try {
        const accessError = await checkAdminAccess();
        if (accessError) {
            return NextResponse.json(
                { error: accessError.error },
                { status: accessError.status }
            );
        }

        const body = await request.json();
        const { status, paymentStatus, trackingNumber, notes } = body;

        // Build update data
        const updateData: Record<string, string | Date | number | boolean | null | undefined> = { updatedAt: new Date() };

        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
        if (notes !== undefined) updateData.notes = notes;

        const order = await prisma.order.update({
            where: { id: params.id },
            data: updateData,
            include: {
                items: true,
            },
        });

        return NextResponse.json({
            message: 'Order updated successfully',
            order,
        });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        );
    }
}
