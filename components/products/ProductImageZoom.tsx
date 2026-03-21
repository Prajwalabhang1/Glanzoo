'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductImageZoomProps {
    images: string[]
    selectedIndex: number
    isOpen: boolean
    onClose: () => void
    onNavigate: (index: number) => void
}

export function ProductImageZoom({
    images,
    selectedIndex,
    isOpen,
    onClose,
    onNavigate,
}: ProductImageZoomProps) {
    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft') onNavigate(Math.max(0, selectedIndex - 1))
            if (e.key === 'ArrowRight') onNavigate(Math.min(images.length - 1, selectedIndex + 1))
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [isOpen, selectedIndex, images.length, onClose, onNavigate])

    // Prevent body scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
                    onClick={onClose}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        aria-label="Close zoom"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    {/* Counter */}
                    {images.length > 1 && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium z-10">
                            {selectedIndex + 1} / {images.length}
                        </div>
                    )}

                    {/* Main image */}
                    <motion.div
                        key={selectedIndex}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="relative w-full h-full max-w-3xl max-h-[90vh] mx-12"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={images[selectedIndex]}
                            alt={`Product image ${selectedIndex + 1}`}
                            fill
                            className="object-contain"
                            sizes="90vw"
                            priority
                        />
                    </motion.div>

                    {/* Left nav */}
                    {selectedIndex > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onNavigate(selectedIndex - 1) }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors z-10"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                    )}

                    {/* Right nav */}
                    {selectedIndex < images.length - 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onNavigate(selectedIndex + 1) }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors z-10"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                    )}

                    {/* Thumbnail strip */}
                    {images.length > 1 && (
                        <div
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => onNavigate(i)}
                                    className={`relative w-12 h-16 rounded-md overflow-hidden border-2 transition-all ${i === selectedIndex
                                        ? 'border-white opacity-100'
                                        : 'border-white/30 opacity-50 hover:opacity-80'
                                        }`}
                                >
                                    <Image src={img} alt="" fill className="object-cover" sizes="48px" />
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}
