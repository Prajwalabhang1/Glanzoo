/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Vibrant Color System
                rose: {
                    light: "hsl(var(--color-rose-light))",
                    DEFAULT: "hsl(var(--color-rose))",
                    dark: "hsl(var(--color-rose-dark))",
                },
                coral: {
                    light: "hsl(var(--color-coral-light))",
                    DEFAULT: "hsl(var(--color-coral))",
                    dark: "hsl(var(--color-coral-dark))",
                },
                gold: {
                    light: "hsl(var(--color-gold-light))",
                    DEFAULT: "hsl(var(--color-gold))",
                    dark: "hsl(var(--color-gold-dark))",
                },
                teal: {
                    light: "hsl(var(--color-teal-light))",
                    DEFAULT: "hsl(var(--color-teal))",
                    dark: "hsl(var(--color-teal-dark))",
                },
                lavender: {
                    light: "hsl(var(--color-lavender-light))",
                    DEFAULT: "hsl(var(--color-lavender))",
                    dark: "hsl(var(--color-lavender-dark))",
                },
                'luxury-black': "hsl(var(--color-luxury-black))",
                'luxury-charcoal': "hsl(var(--color-luxury-charcoal))",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            zIndex: {
                'overlay': '100',
                'drawer': '200',
                'modal': '300',
                'toast': '400',
            },
            keyframes: {
                "accordion-down": {
                    from: { height: 0 },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: 0 },
                },
                "fade-in": {
                    from: { opacity: 0, transform: "translateY(10px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                },
                "slide-in": {
                    from: { transform: "translateX(-100%)" },
                    to: { transform: "translateX(0)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% center" },
                    "100%": { backgroundPosition: "200% center" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.5s ease-out",
                "slide-in": "slide-in 0.3s ease-out",
                "shimmer": "shimmer 2s linear infinite",
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            fontFamily: {
                heading: ['var(--font-heading)', 'serif'],
                body: ['var(--font-body)', 'sans-serif'],
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}
