'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useToast } from '@/lib/toast-context'
import { ShoppingBag, ArrowLeft, Lock } from 'lucide-react'
import { INDIAN_STATES } from '@/lib/constants'

interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => Promise<void>;
    prefill: {
        name: string;
        email: string;
        contact: string;
    };
    theme: {
        color: string;
    };
    modal: {
        ondismiss: () => void;
    };
}

interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
}

export default function CheckoutPage() {
    const { items, subtotal, clearCart } = useCart()
    const { data: session } = useSession()
    const router = useRouter()
    const { success, error } = useToast()
    const [isProcessing, setIsProcessing] = useState(false)
    const [couponCode, setCouponCode] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: string; value: number; discount: number } | null>(null)
    const [couponLoading, setCouponLoading] = useState(false)

    const [formData, setFormData] = useState({
        // Shipping Address
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        // Payment
        paymentMethod: 'COD', // COD, ONLINE
    })

    // Sync form with session data when it loads
    useEffect(() => {
        if (session?.user) {
            setFormData((prev) => ({
                ...prev,
                fullName: prev.fullName || session.user.name || '',
                email: prev.email || session.user.email || '',
                phone: prev.phone || session.user.phone || '',
            }))
        }
    }, [session])

    // Redirect if any item is out of stock
    useEffect(() => {
        const hasInvalidItems = items.some(item => !item.inStock || item.quantity > item.maxQuantity);
        if (hasInvalidItems && items.length > 0) {
            error('Some items in your cart are no longer available. Please review your cart.');
            router.push('/cart');
        }
    }, [items, router, error]);

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-12 h-12 text-orange-600" />
                        </div>
                        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
                        <p className="text-gray-600 mb-8">
                            Add some items to your cart before checking out.
                        </p>
                        <Link href="/products">
                            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const shipping = subtotal >= 999 ? 0 : 100
    const couponDiscount = appliedCoupon?.discount ?? 0
    const total = subtotal + shipping - couponDiscount

    const applyCoupon = async () => {
        if (!couponCode.trim()) return
        setCouponLoading(true)
        try {
            const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponCode)}&total=${subtotal}`)
            const data = await res.json()
            if (res.ok && data.valid) {
                setAppliedCoupon(data.coupon)
                success(`Coupon applied! You save ₹${data.coupon.discount}`)
            } else {
                error(data.error || 'Invalid coupon code')
            }
        } catch {
            error('Failed to validate coupon')
        } finally {
            setCouponLoading(false)
        }
    }

    // FIX-16: Load Razorpay script only once (check if already loaded to prevent duplicate script tags)
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            // Already loaded
            if (typeof (window as unknown as Window).Razorpay !== 'undefined') {
                resolve(true);
                return;
            }
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => {
                resolve(true)
            }
            script.onerror = () => {
                resolve(false)
            }
            // Check if script is already being appended
            if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
                document.body.appendChild(script)
            } else {
                // Script tag exists, wait for it to load
                script.addEventListener('load', () => resolve(true));
                resolve(false);
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Client-side validation
        if (!formData.fullName.trim()) {
            error('Please enter your full name')
            return
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            error('Please enter a valid email address')
            return
        }
        if (!formData.phone.trim() || !/^[6-9]\d{9}$/.test(formData.phone)) {
            error('Please enter a valid 10-digit Indian phone number')
            return
        }
        if (!formData.address.trim()) {
            error('Please enter your delivery address')
            return
        }
        if (!formData.city.trim()) {
            error('Please enter your city')
            return
        }
        if (!formData.state.trim()) {
            error('Please select your state')
            return
        }
        if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode)) {
            error('Please enter a valid 6-digit pincode')
            return
        }

        setIsProcessing(true)

        try {
            // Load Razorpay if online payment
            if (formData.paymentMethod === 'ONLINE') {
                const isLoaded = await loadRazorpay()
                if (!isLoaded) {
                    throw new Error('Razorpay SDK failed to load. Are you online?')
                }
            }

            // Create order
            const orderResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerEmail: formData.email,
                    customerName: formData.fullName,
                    customerPhone: formData.phone.replace(/\D/g, ''), // strip non-digits
                    shippingAddress: {
                        fullName: formData.fullName,
                        phone: formData.phone.replace(/\D/g, ''),
                        address: formData.address,   // FIX: was addressLine1
                        city: formData.city,
                        state: formData.state,
                        pincode: formData.pincode,  // FIX: was postalCode
                    },
                    items: items.map(item => ({
                        productId: item.productId,
                        size: item.size || 'FREE', // size is required by API
                        quantity: item.quantity,
                    })),
                    couponCode: appliedCoupon?.code,
                    paymentMethod: formData.paymentMethod,
                }),
            })

            if (!orderResponse.ok) {
                const errorData = await orderResponse.json()
                throw new Error(errorData.error || 'Failed to create order')
            }

            const data = await orderResponse.json()

            if (formData.paymentMethod === 'ONLINE') {
                const { orderId, razorpayOrderId, amount, currency, keyId } = data

                if (!razorpayOrderId) {
                    throw new Error('Failed to initiate online payment')
                }

                const options = {
                    key: keyId,
                    amount: amount,
                    currency: currency,
                    name: "Glanzoo",
                    description: "Order Payment",
                    order_id: razorpayOrderId,
                    handler: async function (response: RazorpayResponse) {
                        try {
                            const verifyResponse = await fetch('/api/payment/verify', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                }),
                            })

                            if (!verifyResponse.ok) {
                                throw new Error('Payment verification failed')
                            }

                            // Success
                            clearCart()
                            router.push(`/order-confirmation?id=${orderId}`)
                            success('Payment successful! Order placed.')

                        } catch (err: unknown) {
                            console.error('Verification error:', err)
                            error('Payment verification failed. Please contact support if money was deducted.')
                        }
                    },
                    prefill: {
                        name: formData.fullName,
                        email: formData.email,
                        contact: formData.phone,
                    },
                    theme: {
                        color: "#f97316",
                    },
                    modal: {
                        ondismiss: function () {
                            setIsProcessing(false)
                            // Optional: Redirect to orders or show message that payment failed/cancelled
                            error('Payment cancelled. You can retry from your orders page.')
                        }
                    }
                }

                const paymentObject = new (window as unknown as Window).Razorpay(options)
                paymentObject.open()

            } else {
                // COD Flow
                clearCart()
                router.push(`/order-confirmation?id=${data.orderId}`)
                success('Order placed successfully!')
            }

        } catch (err: unknown) {
            console.error('Checkout error:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
            error(errorMessage)
            setIsProcessing(false) // Stop processing heavily if error before modal
        } finally {
            // Processing state is kept true for Online payments until modal closes or verification finishes
            if (formData.paymentMethod === 'COD') {
                setIsProcessing(false)
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 md:py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/cart" className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Cart
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold">Checkout</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Address */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            required
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                            Address *
                                        </label>
                                        <textarea
                                            id="address"
                                            required
                                            rows={3}
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                                            placeholder="Street address, apartment, etc."
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            id="city"
                                            required
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                                            State *
                                        </label>
                                        {/* FIX-28: Dropdown select with all Indian states — prevents typos and invalid values */}
                                        <select
                                            id="state"
                                            required
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                        >
                                            <option value="">Select State / UT</option>
                                            {INDIAN_STATES.map((state) => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                                            Pincode *
                                        </label>
                                        <input
                                            type="text"
                                            id="pincode"
                                            required
                                            pattern="[0-9]{6}"
                                            value={formData.pincode}
                                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="400001"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Coupon Code */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-bold mb-4">Coupon Code</h2>
                                {appliedCoupon ? (
                                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                                        <div>
                                            <p className="font-semibold text-green-700">{appliedCoupon.code} applied ✓</p>
                                            <p className="text-sm text-green-600">You save ₹{appliedCoupon.discount}</p>
                                        </div>
                                        <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode('') }} className="text-red-500 text-sm font-medium hover:text-red-600">
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="Enter coupon code"
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm uppercase"
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
                                        />
                                        <button
                                            type="button"
                                            onClick={applyCoupon}
                                            disabled={couponLoading || !couponCode.trim()}
                                            className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-sm transition-all"
                                        >
                                            {couponLoading ? 'Checking...' : 'Apply'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-bold mb-6">Payment Method</h2>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-4 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-orange-300 transition-colors has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="COD"
                                            checked={formData.paymentMethod === 'COD'}
                                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                            className="w-5 h-5 text-orange-600 focus:ring-orange-500"
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold">Cash on Delivery</div>
                                            <div className="text-sm text-gray-600">Pay when you receive your order</div>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-4 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-orange-300 transition-colors has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="ONLINE"
                                            checked={formData.paymentMethod === 'ONLINE'}
                                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                            className="w-5 h-5 text-orange-600 focus:ring-orange-500"
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold">Online Payment (Razorpay)</div>
                                            <div className="text-sm text-gray-600">UPI, Cards, Net Banking</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                                {/* Items */}
                                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                    {items.map((item) => {
                                        const displayPrice = item.salePrice || item.price
                                        return (
                                            <div key={item.id} className="flex gap-3">
                                                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
                                                    <p className="text-xs text-gray-600">
                                                        {item.size} × {item.quantity}
                                                    </p>
                                                    <p className="text-sm font-semibold">₹{(displayPrice * item.quantity).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Pricing */}
                                <div className="space-y-3 pt-4 border-t">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                                            {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                        </span>
                                    </div>
                                    {couponDiscount > 0 && (
                                        <div className="flex justify-between text-green-600 font-medium">
                                            <span>Coupon ({appliedCoupon?.code})</span>
                                            <span>-₹{couponDiscount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-3 border-t">
                                        <span className="text-lg font-bold">Total</span>
                                        <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                            ₹{total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full mt-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-6 text-lg shadow-lg hover:shadow-xl"
                                >
                                    {isProcessing ? (
                                        'Processing...'
                                    ) : (
                                        <>
                                            <Lock className="mr-2 h-5 w-5" />
                                            {formData.paymentMethod === 'ONLINE' ? 'Pay Now' : 'Place Order'}
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-gray-500 text-center mt-4">
                                    By placing this order, you agree to our Terms & Conditions
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
