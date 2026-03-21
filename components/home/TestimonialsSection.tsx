'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import Image from 'next/image'

const testimonials = [
    {
        id: 1,
        name: 'Priya Sharma',
        location: 'Mumbai',
        rating: 5,
        text: 'Absolutely stunning collection! The quality and craftsmanship are beyond my expectations. I received so many compliments at the wedding.',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
    },
    {
        id: 2,
        name: 'Ananya Reddy',
        location: 'Bangalore',
        rating: 5,
        text: 'The sarees are exquisite! The fabric feels luxurious and the embroidery work is impeccable. Will definitely order again.',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
    },
    {
        id: 3,
        name: 'Meera Patel',
        location: 'Delhi',
        rating: 5,
        text: 'Perfect blend of tradition and modernity. The kurtis are so comfortable yet elegant. Customer service was excellent too!',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop'
    }
]

export function TestimonialsSection() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-luxury-black font-heading">
                        What Our Customers Say
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-gray-50 rounded-2xl p-8 relative"
                        >
                            <Quote className="absolute top-6 right-6 h-12 w-12 text-gold/20" />

                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="h-5 w-5 fill-gold text-gold" />
                                ))}
                            </div>

                            <p className="text-gray-700 mb-6 leading-relaxed">
                                &quot;{testimonial.text}&quot;
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-100">
                                    <Image
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-luxury-black">
                                        {testimonial.name}
                                    </h4>
                                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
