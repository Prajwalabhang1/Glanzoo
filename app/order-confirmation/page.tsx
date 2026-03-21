'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderDetails {
    id: string;
    status: string;
    total: number;
    paymentStatus: string;
    items: Array<{
        id: string;
        name: string;
        size: string;
        quantity: number;
        price: number;
    }>;
    shippingAddress: Record<string, unknown>;
}

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('id');

    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!orderId) {
            router.push('/');
            return;
        }

        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/orders/${orderId}`);
                if (!res.ok) throw new Error('Failed to fetch order details');
                const data = await res.json();
                setOrder(data.order);
            } catch (err) {
                console.error(err);
                setError('Could not load order details.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
                <p className="text-gray-600 mb-6">{error || 'Order not found'}</p>
                <Link href="/">
                    <Button>Return Home</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Success Header */}
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                    <p className="text-gray-600 text-lg">
                        Thank you for your purchase. Your order ID is <span className="font-mono font-medium text-black">#{order.id.slice(-8).toUpperCase()}</span>
                    </p>
                </div>

                {/* Order Details Card */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Package className="w-5 h-5" /> Order Details
                        </h2>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Order Items */}
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        <p className="text-sm text-gray-500">Size: {item.size} • Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium text-gray-900">₹{item.price * item.quantity}</p>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Total Amount</span>
                                <span className="text-xl font-bold text-gray-900">₹{order.total}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Payment Status</span>
                                <span className={`font-medium ${order.paymentStatus === 'SUCCESS' ? 'text-green-600' : 'text-orange-600'}`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    <Link href="/">
                        <Button variant="outline">Back to Home</Button>
                    </Link>
                    <Link href="/products">
                        <Button className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700">
                            Continue Shopping <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        }>
            <OrderConfirmationContent />
        </Suspense>
    );
}
