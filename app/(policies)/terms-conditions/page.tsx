export const dynamic = 'force-dynamic';


export const metadata = {
    title: 'Terms & Conditions | Glanzoo',
    description: 'Terms of service and usage conditions for Glanzoo website.',
};

export default function TermsPage() {
    return (
        <div className="container py-12 md:py-16 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-heading mb-8">Terms & Conditions</h1>

            <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
                <section>
                    <h2 className="text-xl font-heading text-black mb-4">1. Agreement to Terms</h2>
                    <p>
                        These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you&quot;) and Glanzoo (&quot;we,&quot; &quot;us&quot; or &quot;our&quot;),
                        concerning your access to and use of the Glanzoo website.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading text-black mb-4">2. Intellectual Property Rights</h2>
                    <p>
                        Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs,
                        and graphics on the Site (collectively, the &quot;Content&quot;) and the trademarks, service marks, and logos contained therein (the &quot;Marks&quot;) are owned or controlled by us.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading text-black mb-4">3. User Representations</h2>
                    <p>
                        By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete;
                        (2) you will maintain the accuracy of such information and promptly update such registration information as necessary.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading text-black mb-4">4. Purchases and Payment</h2>
                    <p>
                        We accept various forms of payment. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site.
                        You further agree to promptly update account and payment information, including email address and payment method details, so that we can complete your transactions.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading text-black mb-4">5. Governing Law</h2>
                    <p>
                        These terms shall be governed by and defined following the laws of India. Glanzoo and yourself irrevocably consent that the courts of Bangalore, Karnataka
                        shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
                    </p>
                </section>
            </div>
        </div>
    );
}
