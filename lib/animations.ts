// Animation utilities and variants for Glanzoo luxury theme
// Framer Motion configuration for premium micro-interactions

import { Variants } from 'framer-motion'

// ============================================
// FADE & SLIDE ANIMATIONS
// ============================================

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94], // Smooth cubic-bezier
        },
    },
}

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.5 },
    },
}

export const slideInRight: Variants = {
    hidden: { x: 100, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
        },
    },
}

// ============================================
// SCALE & ZOOM ANIMATIONS
// ============================================

export const scaleIn: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            duration: 0.4,
            ease: 'easeOut',
        },
    },
}

export const hoverLift: Variants = {
    rest: { scale: 1, y: 0 },
    hover: {
        scale: 1.02,
        y: -4,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
}

export const imageZoom: Variants = {
    rest: { scale: 1 },
    hover: {
        scale: 1.1,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
}

// ============================================
// STAGGER ANIMATIONS (for lists/grids)
// ============================================

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
}

export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
        },
    },
}

// ============================================
// BUTTON ANIMATIONS
// ============================================

export const buttonTap = {
    scale: 0.95,
    transition: { duration: 0.1 },
}

export const buttonHover = {
    scale: 1.05,
    transition: {
        duration: 0.2,
        ease: 'easeInOut',
    },
}

// ============================================
// SHIMMER EFFECT (for loading states)
// ============================================

export const shimmer: Variants = {
    initial: {
        backgroundPosition: '-1000px 0',
    },
    animate: {
        backgroundPosition: '1000px 0',
        transition: {
            duration: 2,
            ease: 'linear',
            repeat: Infinity,
        },
    },
}

// ============================================
// DRAWER/MODAL ANIMATIONS
// ============================================

export const drawerSlideIn: Variants = {
    hidden: { x: '100%' },
    visible: {
        x: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30,
        },
    },
    exit: {
        x: '100%',
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30,
        },
    },
}

export const backdropFade: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.3 },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.3 },
    },
}

// ============================================
// PRODUCT CARD SPECIFIC
// ============================================

export const productCardHover: Variants = {
    rest: {
        scale: 1,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    },
    hover: {
        scale: 1.02,
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
}

export const quickViewButton: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
}

// ============================================
// RIPPLE EFFECT (for wishlist heart)
// ============================================

export const ripple: Variants = {
    initial: { scale: 0, opacity: 0.5 },
    animate: {
        scale: 2,
        opacity: 0,
        transition: {
            duration: 0.6,
            ease: 'easeOut',
        },
    },
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Create stagger delay based on index
 */
export const getStaggerDelay = (index: number, baseDelay: number = 0.1) => {
    return index * baseDelay
}

/**
 * Spring configuration presets
 */
export const springConfig = {
    soft: { stiffness: 100, damping: 15 },
    medium: { stiffness: 200, damping: 20 },
    stiff: { stiffness: 300, damping: 30 },
}

/**
 * Easing presets
 */
export const easings = {
    smooth: [0.25, 0.46, 0.45, 0.94],
    easeOut: [0.22, 1, 0.36, 1],
    easeInOut: [0.45, 0, 0.55, 1],
}
