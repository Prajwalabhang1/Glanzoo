export const dynamic = 'force-dynamic';


export const metadata = {
    title: 'Shipping Policy | Glanzoo',
    description: 'Information about shipping methods, costs, and delivery times at Glanzoo.',
};

export default function ShippingPolicyPage() {
    return (
        <div className="container py-12 md:py-16 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-heading mb-8">Shipping & Delivery Policy</h1>

            <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
                <section>
                    <h2 className="text-xl font-heading text-black mb-4">1. Shipping Coverage</h2>
                    <p>
                        We deliver to most postal codes across India. Glanzoo offers <strong>FREE Shipping</strong> on all prepaid orders across India.
                        For Cash on Delivery (COD) orders, a nominal handling fee may apply.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading text-black mb-4">2. Delivery Timelines</h2>
                    <p>
                        We strive to dispatch your order within 24-48 hours of placing it.
                        Once dispatched, the estimated delivery time is:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Metros:</strong> 3-5 working days</li>
                        <li><strong>Rest of India:</strong> 5-8 working days</li>
                        <li><strong>Remote Areas:</strong> 7-10 working days</li>
                    </ul>
                    <p className="mt-2 text-sm text-gray-500">
                        Note: Delivery times may be affected by public holidays, natural calamities, or other unavoidable circumstances.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading text-black mb-4">3. Tracking Your Order</h2>
                    <p>
                        Once your order is shipped, you will receive a tracking link via SMS and Email.
                        You can also track your order status from the &apos;My Account&apos; section on our website.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading text-black mb-4">4. Damaged or Lost Packages</h2>
                    <p>
                        If you receive a damaged package, please do not accept it. Contact our support team immediately at support@glanzoo.com with photos of the damaged box.
                    </p>
                </section>
            </div>
        </div>
    );
}
