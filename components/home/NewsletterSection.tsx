'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export function NewsletterSection() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')
        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            if (res.ok) {
                setStatus('success')
                setEmail('')
                setTimeout(() => setStatus('idle'), 4000)
            } else {
                setStatus('error')
                setTimeout(() => setStatus('idle'), 3000)
            }
        } catch {
            setStatus('error')
            setTimeout(() => setStatus('idle'), 3000)
        }
    }

    return (
        <section className="py-16 md:py-20 bg-gradient-to-br from-luxury-black via-luxury-charcoal to-luxury-black relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold/50 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto text-center"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4 font-heading">
                        Join Our Style Circle
                    </h2>
                    <p className="text-gray-300 mb-6 md:mb-8 text-base md:text-lg max-w-2xl mx-auto">
                        Exclusive access to new collections and special offers
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-xl mx-auto">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="flex-1 px-4 md:px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm md:text-base"
                        />
                        <Button
                            type="submit"
                            disabled={status === 'loading'}
                            className="px-6 md:px-8 py-3 bg-gold hover:bg-gold-dark text-luxury-black font-semibold rounded-full transition-all disabled:opacity-50 whitespace-nowrap text-sm md:text-base"
                        >
                            {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
                        </Button>
                    </form>

                    {status === 'success' ? (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 text-gold text-sm"
                        >
                            ✓ Thank you for subscribing!
                        </motion.p>
                    ) : null}
                </motion.div>
            </div>
        </section>
    )
}
