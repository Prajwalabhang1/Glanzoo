'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface HeroSlide {
    id: string
    badge?: string | null
    title: string
    titleAccent: string
    description: string
    primaryCTA: { text: string; href: string }
    secondaryCTA?: { text: string; href: string } | null
    image: string
    position: string
    imageOnly: boolean
}

interface HeroSectionProps {
    banners: Array<{
        id: string
        badge?: string | null
        title: string
        titleAccent: string
        description: string
        primaryCtaText: string
        primaryCtaLink: string
        secondaryCtaText?: string | null
        secondaryCtaLink?: string | null
        image: string
        imagePosition: string
        imageOnly?: boolean
    }>
}

export function HeroSection({ banners }: HeroSectionProps) {
    // Transform database banners to slides format
    const slides: HeroSlide[] = banners.map(banner => ({
        id: banner.id,
        badge: banner.badge,
        title: banner.title,
        titleAccent: banner.titleAccent,
        description: banner.description,
        primaryCTA: { text: banner.primaryCtaText, href: banner.primaryCtaLink },
        secondaryCTA: banner.secondaryCtaText && banner.secondaryCtaLink
            ? { text: banner.secondaryCtaText, href: banner.secondaryCtaLink }
            : null,
        image: banner.image,
        position: banner.imagePosition,
        imageOnly: banner.imageOnly ?? false,
    }))

    // All hooks must be declared before any early returns (React rules of hooks)
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, [slides.length])

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }

    const goToSlide = (index: number) => {
        setCurrentSlide(index)
        setIsAutoPlaying(false)
        setTimeout(() => setIsAutoPlaying(true), 10000)
    }

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isAutoPlaying && slides.length > 0) {
            interval = setInterval(nextSlide, 6000)
        }
        return () => clearInterval(interval)
    }, [isAutoPlaying, nextSlide, slides.length])

    // Return early if no banners (after all hooks)
    if (slides.length === 0) {
        return null
    }

    return (
        <section className="relative h-[60vh] sm:h-[75vh] md:h-screen w-full bg-black overflow-hidden group">
            <AnimatePresence mode="wait">
                {slides.map((slide, index) => (
                    index === currentSlide && (
                        <motion.div
                            key={slide.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                            className="absolute inset-0"
                        >
                            <div className="relative w-full h-full">
                                <Image
                                    src={slide.image}
                                    alt={slide.title || 'Banner'}
                                    fill
                                    priority={index === 0}
                                    className="object-cover"
                                    style={{ objectPosition: slide.position || 'center' }}
                                    sizes="100vw"
                                    quality={90}
                                    unoptimized={slide.image.startsWith('/uploads')}
                                />
                                {/* Only show gradient overlays when NOT image-only */}
                                {!slide.imageOnly && (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                                    </>
                                )}
                            </div>

                            {/* Only show text content when NOT image-only */}
                            {!slide.imageOnly && (
                                <div className="absolute inset-0 flex items-center">
                                    <div className="container mx-auto px-4 md:px-8">
                                        <div className="max-w-2xl text-white space-y-6 md:space-y-8">
                                            <motion.div
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5, duration: 0.8 }}
                                            >
                                                {slide.badge && (
                                                    <span className="inline-block py-1 px-3 border border-gold/50 rounded-full text-gold text-xs md:text-sm tracking-[0.2em] uppercase backdrop-blur-sm bg-black/20 mb-4">
                                                        {slide.badge}
                                                    </span>
                                                )}
                                                <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-medium leading-tight">
                                                    {slide.title} <br />
                                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-gold italic font-serif">
                                                        {slide.titleAccent}
                                                    </span>
                                                </h1>
                                            </motion.div>

                                            <motion.p
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.8, duration: 0.8 }}
                                                className="text-sm sm:text-lg md:text-xl text-gray-200 font-light leading-relaxed max-w-lg hidden sm:block"
                                            >
                                                {slide.description}
                                            </motion.p>

                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 1.1, duration: 0.8 }}
                                                className="flex flex-col sm:flex-row gap-3 pt-3"
                                            >
                                                <Link href={slide.primaryCTA.href}>
                                                    <Button size="lg" className="h-12 sm:h-14 px-6 sm:px-8 bg-luxury-black hover:bg-black text-gold border border-gold/30 hover:border-gold text-sm sm:text-base tracking-widest rounded-none transition-all duration-500 uppercase font-medium">
                                                        {slide.primaryCTA.text}
                                                    </Button>
                                                </Link>
                                                {slide.secondaryCTA && (
                                                    <Link href={slide.secondaryCTA?.href || '#'}>
                                                        <Button variant="outline" size="lg" className="h-12 sm:h-14 px-6 sm:px-8 bg-white/5 hover:bg-white text-white hover:text-black border-white/30 hover:border-white text-sm sm:text-base tracking-widest rounded-none backdrop-blur-sm transition-all duration-500 uppercase font-medium">
                                                            {slide.secondaryCTA?.text}
                                                        </Button>
                                                    </Link>
                                                )}
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )
                ))}
            </AnimatePresence>

            <div className="absolute bottom-4 sm:bottom-10 left-0 right-0 z-20">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            {slides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => goToSlide(idx)}
                                    className="group relative h-10 w-10 flex items-center justify-center focus:outline-none"
                                    aria-label={`Go to slide ${idx + 1}`}
                                >
                                    <span
                                        className={`absolute h-1 w-full transition-all duration-500 rounded-full
                                        ${idx === currentSlide ? 'bg-gold w-12 opacity-100' : 'bg-white/30 w-2 opacity-50 group-hover:bg-white/60 group-hover:w-4'}`}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                            <button
                                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
                            >
                                {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </button>
                            <div className="h-6 w-px bg-white/20 mx-2" />
                            <div className="flex gap-2">
                                <button
                                    onClick={prevSlide}
                                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
