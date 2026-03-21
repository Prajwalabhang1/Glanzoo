'use client';

import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Truck, RefreshCw, CreditCard, Package, ShieldCheck, User } from 'lucide-react';
import Link from 'next/link';

const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'orders', label: 'Orders & Payments', icon: CreditCard },
    { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
    { id: 'returns', label: 'Returns & Refunds', icon: RefreshCw },
    { id: 'products', label: 'Products & Sizing', icon: Package },
    { id: 'account', label: 'Account & Security', icon: User },
    { id: 'seller', label: 'Become a Seller', icon: ShieldCheck },
];

const faqs = [
    // Orders
    {
        category: 'orders',
        q: 'How do I place an order on Glanzoo?',
        a: 'Simply browse our catalogue, select your product, choose your size and quantity, and click "Add to Cart". Proceed to checkout, enter your delivery address, and choose your preferred payment method (UPI, Card, Netbanking, or COD). You\'ll receive an order confirmation email and SMS instantly.',
    },
    {
        category: 'orders',
        q: 'What payment methods do you accept?',
        a: 'We accept all major payment methods including UPI (GPay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking, and Cash on Delivery (COD). All online payments are secured with 256-bit SSL encryption.',
    },
    {
        category: 'orders',
        q: 'Can I modify or cancel my order after placing it?',
        a: 'Order modifications or cancellations are possible within 2 hours of placing the order. After 2 hours, the order moves to processing and cannot be changed. To request a cancellation, go to My Account → Orders → Cancel Order, or contact support immediately at support@glanzoo.com.',
    },
    {
        category: 'orders',
        q: 'Is Cash on Delivery (COD) available?',
        a: 'Yes! COD is available on orders up to ₹15,000. A nominal handling fee of ₹49 is charged for COD orders. COD may not be available for remote pin codes. You can check availability at checkout by entering your pin code.',
    },
    {
        category: 'orders',
        q: 'My payment failed but the amount was deducted. What do I do?',
        a: 'Don\'t worry — if your payment failed but money was deducted, it will be automatically refunded to your source account within 5–7 business days. If not received after 7 days, email us at support@glanzoo.com with your transaction ID.',
    },
    // Shipping
    {
        category: 'shipping',
        q: 'How long will my order take to arrive?',
        a: 'We dispatch most orders within 24–48 hours. After dispatch, delivery timelines are: Metro Cities (3–5 days), Tier 2 cities (4–6 days), Rest of India (5–8 days), and Remote/Hill areas (7–12 days). You\'ll receive a tracking link once your order is shipped.',
    },
    {
        category: 'shipping',
        q: 'Is shipping free on all orders?',
        a: 'Yes! All prepaid orders across India qualify for FREE shipping with no minimum order value. COD orders above ₹999 also get free delivery. For COD orders below ₹999, a flat shipping fee of ₹49 applies.',
    },
    {
        category: 'shipping',
        q: 'How do I track my order?',
        a: 'Once your order is dispatched, you\'ll receive an email and SMS with a tracking link. You can also track your order from My Account → Orders → Track Order. Tracking updates may take up to 24 hours to reflect after dispatch.',
    },
    {
        category: 'shipping',
        q: 'My tracking hasn\'t updated in 2+ days. Is my order lost?',
        a: 'Tracking can sometimes stall during transit — this is usually a system delay and not an actual delivery issue. If the status hasn\'t updated for more than 48 hours after the expected delivery date, please contact our support team and we\'ll investigate immediately.',
    },
    {
        category: 'shipping',
        q: 'What happens if I miss the delivery?',
        a: 'Our courier partners make up to 3 delivery attempts. If all 3 attempts fail, the package is returned to our warehouse and you\'ll receive a full refund. You can also contact the courier directly using the tracking number to reschedule delivery.',
    },
    // Returns
    {
        category: 'returns',
        q: 'What is the return window at Glanzoo?',
        a: 'You can initiate a return or exchange request within 7 days of delivery. After 7 days, return requests cannot be accepted except in special cases like quality defects.',
    },
    {
        category: 'returns',
        q: 'Is an unboxing video mandatory for returns?',
        a: 'Yes — an unboxing video is mandatory for all claims involving damaged goods or wrong items received. The video must show the sealed package being opened and the product inside. Without this video, we are unable to process such claims.',
    },
    {
        category: 'returns',
        q: 'How long does a refund take?',
        a: 'Refunds are initiated within 24 hours of the quality check being completed on the returned item. Once initiated: Original payment method (5–7 business days), Glanzoo Store Credit (24–48 hours), COD/Bank transfer (7–10 business days).',
    },
    {
        category: 'returns',
        q: 'Can I exchange for a different product or colour?',
        a: 'Currently, exchanges are only offered for the same product in a different size. If you wish to exchange for a different product, you\'ll need to initiate a return for a refund and place a fresh order.',
    },
    // Products
    {
        category: 'products',
        q: 'How do I find my correct size?',
        a: 'Visit our detailed Size Guide (linked in the footer) for step-by-step measurement instructions and size charts for tops, bottoms, and dresses. If you\'re between sizes, we recommend sizing up. You can also chat with our styling team for personalised size recommendations.',
    },
    {
        category: 'products',
        q: 'Are the product colours accurate to what I see on screen?',
        a: 'We take great care to photograph products in natural lighting to accurately represent colours. However, colours may appear slightly different on various screens due to display settings. If you have concerns about a specific colour, feel free to contact us before purchasing.',
    },
    {
        category: 'products',
        q: 'How do I care for my Glanzoo products?',
        a: 'Each product has specific care instructions printed on the label. As a general rule for ethnic wear: hand wash or use the delicate machine cycle in cold water, avoid wringing, dry in shade, and iron on a low/medium setting. Embellished pieces should be dry cleaned.',
    },
    {
        category: 'products',
        q: 'Can I request a product that is out of stock?',
        a: 'Yes! Click the "Notify Me" button on any out-of-stock product page and enter your email. You\'ll be notified as soon as it is back in stock. You can also contact us and we\'ll check with our seller partners for availability.',
    },
    // Account
    {
        category: 'account',
        q: 'How do I create an account?',
        a: 'Click "Sign Up" at the top of the page, enter your name, email, and create a password. You\'ll receive a verification email — click the link to activate your account. You can also sign up with your Google account for a faster experience.',
    },
    {
        category: 'account',
        q: 'I forgot my password. How do I reset it?',
        a: 'Click "Forgot Password" on the login page, enter your registered email address, and we\'ll send you a password reset link. The link expires in 30 minutes. Check your spam folder if you don\'t receive the email within a few minutes.',
    },
    {
        category: 'account',
        q: 'How can I delete my account?',
        a: 'To request account deletion, email us at support@glanzoo.com from your registered email address with the subject "Account Deletion Request". We\'ll process the request within 7 business days. Note: deletion is permanent and all order history will be removed.',
    },
    // Seller
    {
        category: 'seller',
        q: 'How do I become a seller on Glanzoo?',
        a: 'Click "Become a Seller" in the footer or visit /seller-register. Fill in your personal, business, and address details. Our team will review your application within 1–2 business days and send you an approval email. Once approved, you can log in and start listing products.',
    },
    {
        category: 'seller',
        q: 'Is there a fee to sell on Glanzoo?',
        a: 'Registering as a seller is completely free. Glanzoo deducts a small commission (category-wise) only on successful orders. There are no monthly fees or listing charges. Commission details will be shared during the seller onboarding process.',
    },
    {
        category: 'seller',
        q: 'What documents are required to become a seller?',
        a: 'To register, you need a valid email, phone number, and business address. GST number and PAN are optional at the time of registration but may be required for payouts above certain thresholds as per Indian tax regulations.',
    },
];

function FAQItem({ faq }: { faq: typeof faqs[0] }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${open ? 'border-amber-300 shadow-sm' : 'border-gray-100'}`}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                aria-expanded={open}
            >
                <span className="font-semibold text-gray-900 text-sm leading-snug">{faq.q}</span>
                {open ? <ChevronUp className="w-4 h-4 text-amber-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
            </button>
            {open && (
                <div className="px-6 pb-5 border-t border-gray-100 bg-amber-50/30">
                    <p className="text-gray-600 text-sm leading-relaxed pt-4">{faq.a}</p>
                </div>
            )}
        </div>
    );
}

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = faqs.filter(f => {
        const matchCategory = activeCategory === 'all' || f.category === activeCategory;
        const matchSearch = !searchQuery || f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    return (
        <main className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative bg-gray-950 text-white py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-gray-950 to-gray-950" />
                <div className="relative container mx-auto max-w-5xl text-center">
                    <div className="flex items-center gap-3 justify-center mb-4">
                        <Link href="/" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">Home</Link>
                        <span className="text-gray-600">/</span>
                        <span className="text-amber-400 text-sm">FAQs</span>
                    </div>
                    <div className="flex items-center justify-center mb-5">
                        <div className="p-4 bg-amber-400/10 rounded-2xl border border-amber-400/20">
                            <HelpCircle className="w-10 h-10 text-amber-400" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3">Frequently Asked Questions</h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                        Find quick answers to the most common questions about orders, shipping, returns, sizing, and more.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-5 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:bg-white/15 transition-all"
                        />
                    </div>
                </div>
            </section>

            <div className="container mx-auto max-w-5xl px-4 py-16">
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Category Sidebar */}
                    <aside className="lg:w-64 shrink-0">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Categories</h3>
                        <nav className="space-y-2">
                            {categories.map(cat => {
                                const Icon = cat.icon;
                                const count = cat.id === 'all' ? faqs.length : faqs.filter(f => f.category === cat.id).length;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeCategory === cat.id
                                                ? 'bg-gray-950 text-white shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${activeCategory === cat.id ? 'text-amber-400' : 'text-gray-400'}`} />
                                        <span className="flex-1 text-left">{cat.label}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-amber-400 text-gray-950 font-bold' : 'bg-gray-100 text-gray-500'}`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Quick Links */}
                        <div className="mt-8 bg-amber-50 border border-amber-100 rounded-xl p-5">
                            <h3 className="text-sm font-bold text-gray-800 mb-3">Quick Help</h3>
                            <ul className="space-y-2.5">
                                <li>
                                    <Link href="/help/shipping" className="text-sm text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-2">
                                        <Truck className="w-3.5 h-3.5" /> Shipping Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/help/returns" className="text-sm text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-2">
                                        <RefreshCw className="w-3.5 h-3.5" /> Returns Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/help/size-guide" className="text-sm text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-2">
                                        <Package className="w-3.5 h-3.5" /> Size Guide
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="text-sm text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-2">
                                        <HelpCircle className="w-3.5 h-3.5" /> Contact Support
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </aside>

                    {/* FAQ List */}
                    <div className="flex-1 min-w-0">
                        {searchQuery && (
                            <p className="text-sm text-gray-500 mb-5">
                                Showing <strong>{filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                            </p>
                        )}
                        {filtered.length === 0 ? (
                            <div className="text-center py-20">
                                <HelpCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No results found</h3>
                                <p className="text-gray-500 text-sm mb-6">Try a different search term or browse by category.</p>
                                <Link href="/contact" className="text-sm text-amber-600 hover:underline font-medium">
                                    Can&apos;t find your answer? Contact us →
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filtered.map((faq, i) => (
                                    <FAQItem key={i} faq={faq} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-20 bg-gray-950 rounded-2xl p-10 text-center text-white">
                    <HelpCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-heading font-bold mb-2">Couldn&apos;t find what you were looking for?</h2>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
                        Our friendly support team is here to help. Reach out via email or WhatsApp and we&apos;ll get back to you within a few hours.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link href="/contact" className="px-6 py-3 bg-amber-400 text-gray-950 font-semibold rounded-full hover:bg-amber-300 transition-colors text-sm">
                            Contact Support
                        </Link>
                        <a href="mailto:support@glanzoo.com" className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-colors text-sm">
                            support@glanzoo.com
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}
