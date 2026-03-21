/**
 * FIX-23 + FIX-24: Order confirmation email service using Nodemailer & Brevo SMTP.
 * Sends a professional HTML email to customers after order placement.
 * Non-blocking — email failure does NOT fail the order.
 */

import nodemailer from 'nodemailer';

interface OrderItem {
    name: string;
    size: string;
    quantity: number;
    price: number;
}

interface OrderConfirmationParams {
    orderId: string;
    customerName: string;
    customerEmail: string;
    items: OrderItem[];
    subtotal: number;
    shippingCost: number;
    discount: number;
    total: number;
    paymentMethod: string;
}

function generateOrderEmailHtml(params: OrderConfirmationParams): string {
    const { orderId, customerName, items, subtotal, shippingCost, discount, total, paymentMethod } = params;
    const shortOrderId = orderId.slice(-8).toUpperCase();

    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
                <strong style="color: #1a1a1a;">${item.name}</strong><br>
                <span style="color: #6b7280; font-size: 13px;">Size: ${item.size} × ${item.quantity}</span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 600;">
                ₹${(item.price * item.quantity).toLocaleString('en-IN')}
            </td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmed — Glanzoo</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); padding: 40px 32px; text-align: center;">
            <div style="font-size: 36px; margin-bottom: 8px;">✨</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Order Confirmed!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Thank you for shopping with Glanzoo</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px;">
            <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">
                Hi <strong>${customerName}</strong>,<br><br>
                Great news! Your order has been placed successfully and is being processed.
            </p>

            <!-- Order Details Box -->
            <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #92400e; font-weight: 600; font-size: 14px;">ORDER NUMBER</span>
                    <span style="color: #ea580c; font-weight: 700; font-size: 18px;">#${shortOrderId}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #92400e; font-size: 14px;">Payment Method</span>
                    <span style="color: #374151; font-weight: 500; font-size: 14px;">${paymentMethod === 'COD' ? '💵 Cash on Delivery' : '💳 Online Payment'}</span>
                </div>
            </div>

            <!-- Items Table -->
            <h2 style="color: #1a1a1a; font-size: 18px; margin: 0 0 16px; font-weight: 600;">Your Items</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <!-- Price Summary -->
            <div style="border-top: 2px solid #f3f4f6; padding-top: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #6b7280;">
                    <span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span>
                </div>
                ${discount > 0 ? `<div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #16a34a;"><span>Discount</span><span>-₹${discount.toLocaleString('en-IN')}</span></div>` : ''}
                <div style="display: flex; justify-content: space-between; margin-bottom: 16px; color: #6b7280;">
                    <span>Shipping</span><span>${shippingCost === 0 ? 'FREE 🎉' : `₹${shippingCost}`}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 16px; background: #1a1a1a; border-radius: 10px; color: #ffffff;">
                    <span style="font-size: 18px; font-weight: 600;">Total Paid</span>
                    <span style="font-size: 22px; font-weight: 700; color: #fb923c;">₹${total.toLocaleString('en-IN')}</span>
                </div>
            </div>

            <!-- Track Order Button -->
            <div style="text-align: center; margin: 32px 0 24px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/account" 
                   style="display: inline-block; background: linear-gradient(135deg, #f97316, #f59e0b); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);">
                    Track Your Order
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #f3f4f6;">
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                Questions? Reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" style="color: #f97316; text-decoration: none;">help center</a>.<br>
                © ${new Date().getFullYear()} Glanzoo. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `;
}

export async function sendOrderConfirmationEmail(params: OrderConfirmationParams): Promise<void> {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('Brevo SMTP credentials not configured — skipping order confirmation email');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const shortOrderId = params.orderId.slice(-8).toUpperCase();

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'orders@glanzoo.com',
            to: params.customerEmail,
            subject: `Order Confirmed #${shortOrderId} — Glanzoo`,
            html: generateOrderEmailHtml(params),
        });
    } catch (error) {
        console.error('Failed to send order confirmation email via Brevo SMTP:', error);
    }
}
