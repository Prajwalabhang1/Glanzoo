export const dynamic = 'force-dynamic';


export const metadata = {
    title: 'Returns & Exchange Policy | Glanzoo',
    description: 'Policy regarding returns, exchanges, and refunds at Glanzoo.',
};

export default function ReturnsPolicyPage() {
    return (
        <div className="container py-12 md:py-16 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-heading mb-8">Returns & Exchange Policy</h1>

            <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
                <div className="bg-red-50 border border-red-100 p-6 rounded-lg mb-8">
                    <h3 className="text-red-800 font-bold text-lg mb-2">Important Requirement</h3>
                    <p className="text-red-700">
                        To be eligible for a return or exchange, you MUST provide an <strong>Unboxing Video</strong> of the package.
                        This helps us verify if the product was damaged during transit or if the wrong item was sent.
                    </p>
                </div>

                <section>
                    <h2 className="text-xl font-heading text-black mb-4">1. Return Window</h2>
                    <p>
                        You can initiate a return or exchange request within <strong>7 days</strong> of delivery.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading text-black mb-4">2. Eligibility Criteria</h2>
                    <p>
                        To be eligible for a return/exchange:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>The item must be unused and in the same condition that you received it.</li>
                        <li>It must be in the original packaging with all tags intact.</li>
                        <li>You must have the receipt or proof of purchase.</li>
                        <li><strong>Unboxing video is mandatory.</strong></li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-heading text-black mb-4">3. Exchange Process</h2>
                    <p>
                        We offer exchanges for size issues. If you need to exchange an item for the same item in a different size, send us an email at support@glanzoo.com
                        or WhatsApp us with your Order ID.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading text-black mb-4">4. Refunds</h2>
                    <p>
                        Once your return is received and inspected, we will notify you of the approval or rejection of your refund.
                        If approved, your refund will be processed to your original method of payment within 5-7 working days.
                    </p>
                    <p className="mt-2">
                        For COD orders, we will refund the amount to your bank account via UPI/NEFT.
                    </p>
                </section>
            </div>
        </div>
    );
}
