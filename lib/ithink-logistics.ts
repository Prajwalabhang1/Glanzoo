import axios from 'axios';



class iThinkLogisticsService {
    private accessToken: string;
    private secretKey: string;
    private baseUrl = 'https://manage.ithinklogistics.com/api_v3';

    constructor() {
        this.accessToken = process.env.ITHINK_ACCESS_TOKEN || '';
        this.secretKey = process.env.ITHINK_SECRET_KEY || '';
    }

    private getAuth() {
        if (!this.accessToken || !this.secretKey) {
            throw new Error('iThink Logistics credentials not configured');
        }
        return {
            access_token: this.accessToken,
            secret_key: this.secretKey,
        };
    }

    async createOrder(orderData: Record<string, unknown>) {
        const auth = this.getAuth();

        // iThink payload structure is complex, we need to map carefully
        const payload = {
            data: {
                shipments: [orderData],
                pickup_address_id: orderData.pickup_address_id || 1, // Default or fetch
                access_token: auth.access_token,
                secret_key: auth.secret_key,
            }
        };

        try {
            const response = await axios.post(`${this.baseUrl}/order/add.json`, payload);

            // Check for API-level errors even in 200 OK
            if (response.data.status_code === 200 && response.data.status === "success") {
                // Success
                // The response structure might vary, usually returns waybill or reference
                // Need to parse response.data.data keys
                const key = Object.keys(response.data.data)[0];
                const result = response.data.data[key];

                if (result.status === "error") {
                    throw new Error(result.remark || 'Error creating order in iThink');
                }

                return {
                    waybill: result.waybill,
                    ref_id: result.ref_id,
                    logistic_name: result.logistic_name,
                };
            } else {
                throw new Error(response.data.message || 'Failed to create order');
            }

        } catch (error: unknown) {
            const err = error as { message?: string; response?: { data?: unknown } };
            console.error('iThink Create Order Error:', err.response?.data || err.message);
            throw new Error(err.message || 'Failed to create order with iThink Logistics');
        }
    }

    // Helper to get tracking URL
    getTrackingUrl(awb: string) {
        return `https://ithinklogistics.com/track-order?awb=${awb}`;
    }
}

export const ithinkLogisticsService = new iThinkLogisticsService();
