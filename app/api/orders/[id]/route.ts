import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: true,
            },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Security check: Only allow admin or the order owner to view it
        if (order.userId && session?.user?.role !== 'ADMIN') {
            if (!session?.user?.id || session.user.id !== order.userId) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
        }

        // Parse shipping address
        const orderWithParsedData = {
            ...order,
            shippingAddress: JSON.parse(order.shippingAddress),
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
