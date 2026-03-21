'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Truck, Shield, RotateCcw, HeadphonesIcon, CreditCard, Award } from 'lucide-react'

const trustFeatures = [
    {
        icon: Truck,
        title: 'Free Shipping',
        description: 'On orders above ₹999'
    },
    {
        icon: Shield,
        title: 'Secure Payments',
        description: '100% SSL encrypted'
    },
    {
        icon: RotateCcw,
        title: 'Easy Returns',
        description: '7-day return policy'
    },
    {
        icon: HeadphonesIcon,
        title: 'Premium Support',
        description: '24/7 customer service'
    },
    {
        icon: CreditCard,
        title: 'Multiple Payments',
        description: 'All major cards accepted'
    },
    {
        icon: Award,
        title: 'Quality Assured',
        description: 'Authentic products only'
    }
]

const paymentMethods = [
    { name: 'Visa', logo: '💳' },
    { name: 'Mastercard', logo: '💳' },
    { name: 'UPI', logo: '📱' },
    { name: 'PayPal', logo: '🅿️' },
]

export function TrustBadges() {
    return (
        <section className="py-16 bg-white border-y border-gray-100">
            <div className="container mx-auto px-4">
                {/* Trust Features Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
                    {trustFeatures.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className="w-12 h-12 rounded-full bg-gold/10 group-hover:bg-gold/20 flex items-center justify-center mb-3 transition-all">
                                <feature.icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
                            </div>
                            <h3 className="font-semibold text-sm text-luxury-black mb-1">
                                {feature.title}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Payment Methods & Security */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="flex items-center gap-4 flex-wrap justify-center">
                        <span className="text-sm text-gray-500 font-medium">We Accept:</span>
                        {paymentMethods.map((method, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <span className="text-2xl">{method.logo}</span>
                                <span className="text-sm font-medium text-gray-700">{method.name}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Shield className="h-4 w-4 text-gold" />
                        <span>Secured by SSL Encryption | PCI DSS Compliant</span>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
