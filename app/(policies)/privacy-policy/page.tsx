export const dynamic = 'force-dynamic';


export const metadata = {
    title: 'Privacy Policy | Glanzoo',
    description: 'Learn how Glanzoo protects and uses your personal information.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="container py-12 md:py-16 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-heading mb-8">Privacy Policy</h1>

            <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
                <section>
                    <h2 className="text-xl font-heading text-black mb-4">1. Introduction</h2>
                    <p>
                        Welcome to Glanzoo. We are committed to protecting your personal information and your right to privacy.
                        When you visit our website and use our services, you trust us with your personal information.
                        We take your privacy very seriously. In this privacy notice, we describe our privacy policy.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading text-black mb-4">2. Information We Collect</h2>
                    <p>
                        We collect personal information that you voluntarily provide to us when expressing an interest in obtaining information about us or our products and services,
                        when participating in activities on the website or otherwise contacting us.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Name and Contact Data (Email, Phone Number, Address)</li>
                        <li>Credentials (Passwords)</li>
                        <li>Payment Data (processed securely by third-party payment processors)</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-heading text-black mb-4">3. How We Use Your Information</h2>
                    <p>
                        We use personal information collected via our website for a variety of business purposes described below:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>To facilitate account creation and logon process.</li>
                        <li>To fulfill and manage your orders.</li>
                        <li>To post testimonials.</li>
                        <li>To send you marketing and promotional communications.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-heading text-black mb-4">4. Contact Us</h2>
                    <p>
                        If you have questions or comments about this policy, you may email us at support@glanzoo.com.
                    </p>
                </section>
            </div>
        </div>
    );
}
