import type { Metadata } from 'next';
import { RefreshCw, Package, Clock, CreditCard, AlertTriangle, CheckCircle, XCircle, PhoneCall, Video } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Returns & Exchanges | Glanzoo',
    description: 'Glanzoo\'s complete returns and exchange policy — 7-day easy returns, size exchanges, and hassle-free refunds.',
};

const eligibleReasons = [
    'Wrong item delivered (different from what you ordered)',
    'Defective or damaged product received',
    'Size issue — product does not match the size chart',
    'Product significantly different from images shown on website',
];

const notEligibleReasons = [
    'Items used, washed, or altered after delivery',
    'Missing original tags, packaging, or accessories',
    'No unboxing video provided for damaged/wrong-item claims',
    'Request raised after the 7-day return window',
    'Custom-made or personalised orders',
    'Items purchased during a Final Sale / Non-Returnable promotion',
];

const returnSteps = [
    {
        step: '01',
        title: 'Raise a Return Request',
        desc: 'Go to My Account → Orders → Select your order → Click "Request Return/Exchange" within 7 days of delivery.',
    },
    {
        step: '02',
        title: 'Submit Unboxing Video',
        desc: 'Upload the mandatory unboxing video and photos of the product defect/issue. This is required for all claims.',
    },
    {
        step: '03',
        title: 'Approval Review',
        desc: 'Our team reviews your request within 24–48 hours and emails you the decision.',
    },
    {
        step: '04',
        title: 'Schedule Pickup',
        desc: 'If approved, a courier is dispatched to pick up the item from your address. Keep the original packaging ready.',
    },
    {
        step: '05',
        title: 'Refund / Exchange Processed',
        desc: 'Once the returned item is received and quality-checked, your refund or replacement is dispatched within 5–7 days.',
    },
];

const refundMethods = [
    { method: 'Original Payment (Credit/Debit Card, UPI, Netbanking)', timeline: '5–7 business days', notes: 'Processed to your original payment instrument' },
    { method: 'Glanzoo Store Credit (Fastest Option)', timeline: '24–48 hours', notes: 'Credited directly to your Glanzoo wallet for future purchases' },
    { method: 'COD /  Cash Orders', timeline: '7–10 business days', notes: 'Refunded via NEFT/IMPS to the bank account you provide' },
];

export default function ReturnsPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative bg-gray-950 text-white py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-900/30 via-gray-950 to-gray-950" />
                <div className="relative container mx-auto max-w-5xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Link href="/" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">Home</Link>
                        <span className="text-gray-600">/</span>
                        <span className="text-amber-400 text-sm">Returns &amp; Exchanges</span>
                    </div>
                    <div className="flex items-start gap-6">
                        <div className="p-4 bg-amber-400/10 rounded-2xl border border-amber-400/20 shrink-0">
                            <RefreshCw className="w-10 h-10 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3">
                                Returns &amp; Exchanges
                            </h1>
                            <p className="text-gray-400 text-lg max-w-2xl">
                                We want you to love every purchase. If something&apos;s not right, we make it easy to
                                return or exchange within 7 days of delivery.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-10">
                        {[
                            { icon: '🔄', text: '7-Day Easy Returns' },
                            { icon: '📦', text: 'Free Pickup on Approved Returns' },
                            { icon: '⚡', text: 'Exchange Within 48 hrs Approval' },
                            { icon: '💳', text: 'Full Refund Guaranteed' },
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

                {/* Critical Notice */}
                <section className="relative bg-amber-50 border-2 border-amber-300 rounded-2xl p-8 overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber-200/30 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative flex items-start gap-5">
                        <div className="p-3 bg-amber-400 rounded-xl shrink-0">
                            <Video className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-heading font-bold text-amber-900 mb-2">
                                Unboxing Video is Mandatory
                            </h2>
                            <p className="text-amber-800 leading-relaxed">
                                For <strong>all</strong> return and exchange claims involving damaged goods or wrong items,
                                an <strong>unboxing video</strong> is required. The video must be recorded from the moment you start
                                opening the package, showing the sealed parcel and the contents inside. Claims without an unboxing
                                video cannot be processed.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Eligible vs Not Eligible */}
                <section>
                    <h2 className="text-2xl font-heading font-bold text-gray-900 mb-8">Return Eligibility</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-green-50 border border-green-100 rounded-2xl p-7">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 bg-green-100 rounded-xl">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">Eligible for Return</h3>
                            </div>
                            <ul className="space-y-3">
                                {eligibleReasons.map((r, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                        <span className="text-gray-700 text-sm">{r}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-7">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 bg-red-100 rounded-xl">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">Not Eligible for Return</h3>
                            </div>
                            <ul className="space-y-3">
                                {notEligibleReasons.map((r, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                        <span className="text-gray-700 text-sm">{r}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Return Process */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-amber-50 rounded-xl">
                            <Package className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-gray-900">How to Initiate a Return</h2>
                            <p className="text-gray-500 text-sm mt-0.5">Simple 5-step process to return or exchange an item</p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute left-[28px] top-8 bottom-8 w-px bg-gradient-to-b from-amber-400 via-amber-300 to-amber-100 hidden md:block" />
                        <div className="space-y-5">
                            {returnSteps.map((s, i) => (
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

                {/* Refund Methods */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-amber-50 rounded-xl">
                            <CreditCard className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-gray-900">Refund Methods &amp; Timelines</h2>
                            <p className="text-gray-500 text-sm mt-0.5">Refund initiated within 24 hrs of quality check completion</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-950 text-white">
                                    <th className="text-left px-6 py-4 font-semibold">Method</th>
                                    <th className="text-left px-6 py-4 font-semibold">Timeline</th>
                                    <th className="text-left px-6 py-4 font-semibold">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {refundMethods.map((r, i) => (
                                    <tr key={i} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-800">{r.method}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                                                <span className="text-gray-700 font-semibold">{r.timeline}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{r.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Exchange Policy */}
                <section className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gray-950 text-white rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-5">
                            <RefreshCw className="w-6 h-6 text-amber-400" />
                            <h3 className="text-xl font-heading font-bold">Size Exchange Policy</h3>
                        </div>
                        <ul className="text-gray-400 text-sm space-y-3 leading-relaxed">
                            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> Exchanges are accepted for the same product in a different size only.</li>
                            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> Request must be raised within 7 days of delivery.</li>
                            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> Subject to stock availability. If the size is unavailable, a full refund will be issued.</li>
                            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> Free pickup and re-delivery on all approved size exchanges.</li>
                        </ul>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-5">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                            <h3 className="text-xl font-heading font-bold text-gray-900">Things to Remember</h3>
                        </div>
                        <ul className="text-gray-600 text-sm space-y-3 leading-relaxed">
                            <li className="flex gap-2"><span className="text-amber-500 font-bold shrink-0">→</span> Ship items back in original packaging with all tags attached.</li>
                            <li className="flex gap-2"><span className="text-amber-500 font-bold shrink-0">→</span> Do not use the product while a return/exchange is pending.</li>
                            <li className="flex gap-2"><span className="text-amber-500 font-bold shrink-0">→</span> One exchange is allowed per order item.</li>
                            <li className="flex gap-2"><span className="text-amber-500 font-bold shrink-0">→</span> Shipping charges (if any) for returns outside the serviceable zone are borne by the customer.</li>
                        </ul>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-gray-950 rounded-2xl p-10 text-center text-white">
                    <PhoneCall className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-heading font-bold mb-2">Need help with a return?</h2>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">Our support team is available Mon–Sat, 10 AM–6 PM to assist you.</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link href="/contact" className="px-6 py-3 bg-amber-400 text-gray-950 font-semibold rounded-full hover:bg-amber-300 transition-colors text-sm">
                            Contact Support
                        </Link>
                        <a href="mailto:support@glanzoo.com" className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-colors text-sm">
                            support@glanzoo.com
                        </a>
                    </div>
                </section>
            </div>
        </main>
    );
}
