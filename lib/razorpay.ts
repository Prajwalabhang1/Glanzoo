import crypto from 'crypto';

interface RazorpayOrderParams {
    amount: number; // in paise
    currency?: string;
    receipt: string;
    notes?: Record<string, string>;
}

interface RazorpayVerifyParams {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

class RazorpayService {
    private keyId: string;
    private keySecret: string;
    private baseUrl = 'https://api.razorpay.com/v1';

    constructor() {
        this.keyId = process.env.RAZORPAY_KEY_ID || '';
        this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';

        if (!this.keyId || !this.keySecret) {
            console.warn('Razorpay credentials not configured');
        }
    }

    // Create Razorpay order
    async createOrder(params: RazorpayOrderParams) {
        if (!this.keyId || !this.keySecret) {
            throw new Error('Razorpay API keys are not configured in environment variables.');
        }

        try {
            const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');

            const response = await fetch(`${this.baseUrl}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${auth}`,
                },
                body: JSON.stringify({
                    amount: params.amount,
                    currency: params.currency || 'INR',
                    receipt: params.receipt,
                    notes: params.notes,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.description || 'Failed to create Razorpay order');
            }

            return await response.json();
        } catch (error: unknown) {
            const err = error as { message?: string };
            console.error('Razorpay create order error:', err);
            throw new Error(err.message || 'Failed to create payment order');
        }
    }

    // Verify payment signature
    verifyPayment(params: RazorpayVerifyParams): boolean {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;

            const message = `${razorpay_order_id}|${razorpay_payment_id}`;
            const expectedSignature = crypto
                .createHmac('sha256', this.keySecret)
                .update(message)
                .digest('hex');

            return expectedSignature === razorpay_signature;
        } catch (error) {
            console.error('Razorpay verify payment error:', error);
            return false;
        }
    }

    // Fetch payment details
    async getPayment(paymentId: string) {
        try {
            const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');

            const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch payment details');
            }

            return await response.json();
        } catch (error: unknown) {
            const err = error as { message?: string };
            console.error('Razorpay get payment error:', err);
            throw new Error(err.message || 'Failed to fetch payment');
        }
    }

    // Initiate refund
    async createRefund(paymentId: string, amount?: number) {
        try {
            const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');

            const body: Record<string, unknown> = {};
            if (amount) {
                body.amount = amount; // in paise
            }

            const response = await fetch(`${this.baseUrl}/payments/${paymentId}/refund`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${auth}`,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.description || 'Failed to create refund');
            }

            return await response.json();
        } catch (error: unknown) {
            const err = error as { message?: string };
            console.error('Razorpay create refund error:', err);
            throw new Error(err.message || 'Failed to create refund');
        }
    }

    // Get key ID for frontend
    getKeyId(): string {
        return this.keyId;
    }
}

export const razorpayService = new RazorpayService();
