'use client'

import { motion } from 'framer-motion'
import { Truck, Zap, RotateCcw, Award, Globe, ShieldCheck } from 'lucide-react'

const trustItems = [
    { icon: Truck, label: 'Free Shipping above ₹999' },
    { icon: Zap, label: '50,000+ Happy Customers' },
    { icon: ShieldCheck, label: 'Secure Payments' },
    { icon: RotateCcw, label: '7-Day Easy Returns' },
    { icon: Award, label: '4.8★ Average Rating' },
    { icon: Globe, label: 'Pan-India Delivery' },
    { icon: Truck, label: 'Free Shipping above ₹999' },
    { icon: Zap, label: '50,000+ Happy Customers' },
    { icon: ShieldCheck, label: 'Secure Payments' },
    { icon: RotateCcw, label: '7-Day Easy Returns' },
    { icon: Award, label: '4.8★ Average Rating' },
    { icon: Globe, label: 'Pan-India Delivery' },
]

export function BrandsMarquee() {
    return (
        <section className="py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 overflow-hidden border-y border-orange-400/30">
            <motion.div
                className="flex gap-0"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            >
                {trustItems.map((item, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-2.5 text-white/95 font-semibold text-sm whitespace-nowrap px-8 border-r border-white/25 last:border-r-0"
                    >
                        <item.icon className="w-4 h-4 text-white/80 flex-shrink-0" strokeWidth={2} />
                        <span>{item.label}</span>
                    </div>
                ))}
            </motion.div>
        </section>
    )
}
