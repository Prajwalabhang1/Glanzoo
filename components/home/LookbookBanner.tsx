'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

interface LookbookBannerProps {
    imageUrl?: string
    title?: string
    subtitle?: string
    ctaText?: string
    ctaLink?: string
    badge?: string
}

export function LookbookBanner({
    imageUrl = 'https://images.unsplash.com/photo-1594938298603-c8148c4b4e30?q=80&w=2000&auto=format&fit=crop',
    title = 'Spring\u2013Summer',
    subtitle = 'Where tradition meets contemporary grace. Discover our curated lookbook for the season.',
    ctaText = 'Shop the Look',
    ctaLink = '/collections',
    badge = 'New Season',
}: LookbookBannerProps) {
    return (
        <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] overflow-hidden my-8 mx-4 sm:mx-8 rounded-3xl">
            {/* Background Image */}
            <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 95vw"
                loading="lazy"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
                <div className="px-8 md:px-16 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="space-y-5"
                    >
                        {badge && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/30 rounded-full backdrop-blur-sm bg-white/10">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span className="text-white/90 text-xs font-semibold tracking-widest uppercase">{badge}</span>
                            </div>
                        )}
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white font-heading leading-tight">
                            {title}{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-rose-300 italic font-serif">
                                Lookbook
                            </span>
                        </h2>
                        <p className="text-gray-200 text-base sm:text-lg leading-relaxed max-w-md">
                            {subtitle}
                        </p>
                        <Link
                            href={ctaLink}
                            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-900 rounded-full font-semibold hover:bg-amber-400 hover:text-black transition-all duration-300 group"
                        >
                            {ctaText}
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Corner decoration */}
            <div className="absolute bottom-6 right-6 text-white/30 text-sm font-light tracking-[0.3em] uppercase hidden md:block">
                Glanzoo Editorial
            </div>
        </section>
    )
}
