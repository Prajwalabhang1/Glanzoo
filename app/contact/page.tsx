export const dynamic = 'force-dynamic';

import { Mail, Phone, MapPin, Send } from 'lucide-react';

export const metadata = {
    title: 'Contact Us | Glanzoo',
    description: 'Get in touch with Glanzoo for any queries regarding your order, shipping, or returns.',
};

export default function ContactPage() {
    return (
        <div className="container py-12 md:py-16">
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-5xl font-heading font-light uppercase tracking-wider mb-4">Contact Us</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    we love to hear from you. Whether you have a question about our products, need help with an order, or just want to say hello, feel free to reach out.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 max-w-5xl mx-auto">
                {/* Contact Info */}
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-heading mb-6 border-b border-gray-200 pb-2">Get In Touch</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[var(--color-gold)]/10 rounded-full text-[var(--color-gold)]">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">WhatsApp & Phone</h4>
                                    <p className="text-gray-600">+91 98765 43210</p>
                                    <p className="text-sm text-gray-500 mt-1">Mon - Sat, 10:00 AM - 6:00 PM</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[var(--color-gold)]/10 rounded-full text-[var(--color-gold)]">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Email</h4>
                                    <p className="text-gray-600">support@glanzoo.com</p>
                                    <p className="text-sm text-gray-500 mt-1">We usually reply within 24 hours</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[var(--color-gold)]/10 rounded-full text-[var(--color-gold)]">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Office Address</h4>
                                    <address className="text-gray-600 non-italic">
                                        Glanzoo Fashion Pvt Ltd.<br />
                                        123 Fashion Street, Sector 4<br />
                                        Bangalore, Karnataka 560001<br />
                                        India
                                    </address>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-gray-50 p-8 rounded-lg border border-gray-100">
                    <h3 className="text-xl font-heading mb-6">Send a Message</h3>
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                            <input
                                type="tel"
                                id="phone"
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                                placeholder="+91"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium">Message</label>
                            <textarea
                                id="message"
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors resize-none"
                                placeholder="How can we help you?"
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-black text-white py-3 font-semibold uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                            Send Message <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
