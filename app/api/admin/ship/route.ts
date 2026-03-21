export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { ithinkLogisticsService } from '@/lib/ithink-logistics';

export async function POST(request: Request) {
    try {
        const session = await auth();

        // Check Admin Auth
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.logisticsOrderId) {
            return NextResponse.json({ error: 'Order already shipped' }, { status: 400 });
        }

        // Parse shipping address
        let shippingAddress;
        try {
            shippingAddress = JSON.parse(order.shippingAddress);
        } catch {
            return NextResponse.json({ error: 'Invalid shipping address format' }, { status: 400 });
        }

        const orderDate = new Date(order.createdAt);
        const formattedDate = `${String(orderDate.getDate()).padStart(2, '0')}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${orderDate.getFullYear()}`;

        // Prepare iThink Payload
        // ... (rest of the payload logic)
        const iThinkPayload = {
            waybill: "",
            order: order.id,
            sub_order: order.id,
            order_date: formattedDate,
            total_amount: order.total,
            name: shippingAddress.fullName,
            company_name: shippingAddress.fullName,
            add: shippingAddress.addressLine1 || shippingAddress.address,
            add2: "",
            add3: "",
            pin: shippingAddress.postalCode || shippingAddress.pincode,
            city: shippingAddress.city,
            state: shippingAddress.state,
            country: "India",
            phone: shippingAddress.phone,
            alt_phone: shippingAddress.phone,
            email: "customer@example.com",
            is_billing_same_as_shipping: "yes",
            billing_name: shippingAddress.fullName,
            billing_company_name: shippingAddress.fullName,
            billing_add: shippingAddress.addressLine1 || shippingAddress.address,
            billing_add2: "",
            billing_add3: "",
            billing_pin: shippingAddress.postalCode || shippingAddress.pincode,
            billing_city: shippingAddress.city,
            billing_state: shippingAddress.state,
            billing_country: "India",
            billing_phone: shippingAddress.phone,
            billing_alt_phone: shippingAddress.phone,
            billing_email: "customer@example.com",

            products: order.items.map((item) => ({
                product_name: item.name,
                product_sku: item.productId,
                product_quantity: item.quantity,
                product_price: item.price,
                product_tax_rate: 0,
                product_discount: 0,
            })),

            shipment_length: 10,
            shipment_width: 10,
            shipment_height: 10,
            weight: 0.5,

            cod_amount: order.paymentMethod === 'COD' ? order.total : 0,
            payment_mode: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
        };

        // Call iThink Logistics
        const result = await ithinkLogisticsService.createOrder(iThinkPayload);

        // Update DB
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'PROCESSING',
                logisticsOrderId: order.id, // iThink uses our Order ID as ref usually, or we can store their ref_id
                awbCode: result.waybill,
                courierName: result.logistic_name || 'iThink Logistics',
                trackingUrl: ithinkLogisticsService.getTrackingUrl(result.waybill),
                shippingProvider: 'ITHINK',
            },
        });

        return NextResponse.json({ success: true, shipment: result });

    } catch (error: unknown) {
        console.error('Shipping Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to ship order';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
