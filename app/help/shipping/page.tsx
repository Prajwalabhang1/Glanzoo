import type { Metadata } from 'next';
import { Truck, Clock, MapPin, Package, Shield, AlertCircle, CheckCircle, PhoneCall } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Shipping & Delivery | Glanzoo',
    description: 'Complete information on Glanzoo shipping methods, delivery timelines, tracking, and policies across India.',
};

const deliveryZones = [
    { zone: 'Metro Cities', cities: 'Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Kolkata', timeline: '3–5 working days', isFree: true },
    { zone: 'Tier 2 Cities', cities: 'Jaipur, Lucknow, Pune, Ahmedabad, Bhopal, Indore', timeline: '4–6 working days', isFree: true },
    { zone: 'Rest of India', cities: 'All other serviceable pin codes', timeline: '5–8 working days', isFree: true },
    { zone: 'Remote / Hill Areas', cities: 'J&K, Northeast States, Andaman & Nicobar', timeline: '7–12 working days', isFree: false },
];

const steps = [
    { step: '01', title: 'Order Placed', desc: 'You receive an email & SMS confirmation with your order ID instantly.' },
    { step: '02', title: 'Processing', desc: 'Our team verifies your order and prepares it for dispatch within 24 hours.' },
    { step: '03', title: 'Dispatched', desc: 'Your package is handed to our courier partner. You receive a tracking link.' },
    { step: '04', title: 'Out for Delivery', desc: 'The courier is on their way. You receive a real-time delivery notification.' },
    { step: '05', title: 'Delivered', desc: 'Package delivered safely. Rate your experience to help us improve.' },
];

const faqs = [
    {
        q: 'What is the minimum order value for free shipping?',
        a: 'All prepaid orders across India qualify for FREE shipping, with no minimum order value. COD orders above ₹999 also get free delivery.',
    },
    {
        q: 'Can I change my delivery address after placing an order?',
        a: 'Address changes are possible within 2 hours of placing the order. Contact us immediately at support@glanzoo.com or call +91 98765 43210.',
    },
    {
        q: 'What happens if I am not available at the time of delivery?',
        a: 'Our courier partner will attempt delivery up to 3 times. After 3 failed attempts, the package is returned to our warehouse and a full refund is processed.',
    },
    {
        q: 'Do you ship internationally?',
        a: 'Currently, Glanzoo ships within India only. International shipping is on our roadmap — stay tuned!',
    },
    {
        q: 'My tracking link shows no updates. What should I do?',
        a: 'Tracking information can take 24–48 hours to reflect after dispatch. If the link shows no update after 48 hours, please contact our support team.',
    },
];

export default function ShippingPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative bg-gray-950 text-white py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/30 via-gray-950 to-gray-950" />
                <div className="relative container mx-auto max-w-5xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Link href="/" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">Home</Link>
                        <span className="text-gray-600">/</span>
                        <span className="text-amber-400 text-sm">Shipping &amp; Delivery</span>
                    </div>
                    <div className="flex items-start gap-6">
                        <div className="p-4 bg-amber-400/10 rounded-2xl border border-amber-400/20 shrink-0">
                            <Truck className="w-10 h-10 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3">
                                Shipping &amp; Delivery
                            </h1>
                            <p className="text-gray-400 text-lg max-w-2xl">
                                Fast, reliable deliveries across India — from our warehouse to your doorstep.
                                Here&apos;s everything you need to know.
                            </p>
                        </div>
                    </div>

                    {/* Quick Badges */}
                    <div className="flex flex-wrap gap-3 mt-10">
                        {[
                            { icon: '🚚', text: 'Free Shipping on all Prepaid Orders' },
                            { icon: '⏱️', text: 'Dispatched within 24–48 hrs' },
                            { icon: '📍', text: 'Pan-India Delivery' },
                            { icon: '🔒', text: '100% Secure Packaging' },
                        ].map(b => (
                            <div key={b.text} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300">
                                <span>{b.icon}</span>
                                <span>{b.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="container mx-auto max-w-5xl px-4 py-16 space-y-20">

                {/* Delivery Zones Table */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-amber-50 rounded-xl">
                            <MapPin className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-gray-900">Delivery Zones &amp; Timelines</h2>
                            <p className="text-gray-500 text-sm mt-0.5">Estimated delivery after dispatch confirmation</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-950 text-white">
                                    <th className="text-left px-6 py-4 font-semibold">Zone</th>
                                    <th className="text-left px-6 py-4 font-semibold">Cities / Areas</th>
                                    <th className="text-left px-6 py-4 font-semibold">Estimated Time</th>
                                    <th className="text-left px-6 py-4 font-semibold">Shipping Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {deliveryZones.map((z, i) => (
                                    <tr key={i} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-800">{z.zone}</td>
                                        <td className="px-6 py-4 text-gray-600">{z.cities}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                                                <span className="text-gray-700">{z.timeline}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {z.isFree ? (
                                                <span className="inline-flex items-center gap-1 text-green-700 font-semibold bg-green-50 border border-green-100 px-3 py-1 rounded-full text-xs">
                                                    <CheckCircle className="w-3.5 h-3.5" /> FREE
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full text-xs">
                                                    ₹99 extra
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                        * Working days exclude Sundays and public holidays. Timelines may vary during peak sale periods, natural calamities, or extreme weather events.
                    </p>
                </section>

                {/* Order Journey */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-amber-50 rounded-xl">
                            <Package className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-gray-900">Your Order&apos;s Journey</h2>
                            <p className="text-gray-500 text-sm mt-0.5">From the moment you place an order to your doorstep</p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute left-[28px] top-8 bottom-8 w-px bg-gradient-to-b from-amber-400 via-amber-300 to-amber-100 hidden md:block" />
                        <div className="space-y-6">
                            {steps.map((s, i) => (
                                <div key={i} className="flex gap-5 items-start group">
                                    <div className="relative z-10 w-14 h-14 rounded-full bg-gray-950 border-2 border-amber-400 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0 group-hover:bg-amber-400 group-hover:text-gray-950 transition-all duration-300">
                                        {s.step}
                                    </div>
                                    <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-5 group-hover:border-amber-200 group-hover:bg-amber-50/30 transition-all duration-300">
                                        <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Shipping Policies */}
                <section className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-950 text-white rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-5">
                            <Shield className="w-6 h-6 text-amber-400" />
                            <h3 className="text-lg font-heading font-bold">Secure Packaging</h3>
                        </div>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            Every Glanzoo order is carefully packed with premium packaging material to ensure your products arrive
                            in pristine condition. Delicate and premium items are given additional bubble-wrap protection.
                        </p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-5">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                            <h3 className="text-lg font-heading font-bold text-gray-900">Damaged / Lost Packages</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            If you receive a visibly damaged package, <strong>do not accept it</strong>. Contact us within 24 hours
                            with photos/video of the damage. We will arrange a replacement or full refund at no extra cost.
                        </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-5">
                            <Clock className="w-6 h-6 text-blue-600" />
                            <h3 className="text-lg font-heading font-bold text-gray-900">Cash on Delivery (COD)</h3>
                        </div>
                        <ul className="text-gray-600 text-sm space-y-2">
                            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> COD is available on orders up to ₹15,000.</li>
                            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> A nominal COD handling fee of ₹49 applies.</li>
                            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> COD orders may take 1 additional working day for dispatch.</li>
                        </ul>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-5">
                            <Truck className="w-6 h-6 text-green-600" />
                            <h3 className="text-lg font-heading font-bold text-gray-900">Courier Partners</h3>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            We partner with India&apos;s most reliable logistics providers — Delhivery, BlueDart, Xpressbees, and DTDC —
                            to ensure fast and safe deliveries to every corner of India.
                        </p>
                    </div>
                </section>

                {/* FAQs */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-amber-50 rounded-xl">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                        <h2 className="text-2xl font-heading font-bold text-gray-900">Frequently Asked Questions</h2>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50">
                                    <h3 className="font-semibold text-gray-900 text-sm">{faq.q}</h3>
                                </div>
                                <div className="px-6 py-4">
                                    <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-gray-950 rounded-2xl p-10 text-center text-white">
                    <PhoneCall className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-heading font-bold mb-2">Still have questions?</h2>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">Our customer support team is here to help you Mon–Sat, 10 AM–6 PM.</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link
                            href="/contact"
                            className="px-6 py-3 bg-amber-400 text-gray-950 font-semibold rounded-full hover:bg-amber-300 transition-colors text-sm"
                        >
                            Contact Support
                        </Link>
                        <a
                            href="mailto:support@glanzoo.com"
                            className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-colors text-sm"
                        >
                            support@glanzoo.com
                        </a>
                    </div>
                </section>
            </div>
        </main>
    );
}
