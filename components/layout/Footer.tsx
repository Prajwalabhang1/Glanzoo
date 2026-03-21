'use client'

import React from 'react'
import Link from 'next/link'
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Youtube } from 'lucide-react'

const shopCategories = [
    { name: 'Women Wear', href: '/category/women-wear' },
    { name: 'Women Accessories', href: '/category/women-accessories' },
    { name: "Men's Wear", href: '/category/mens-wear' },
    { name: "Men's Accessories", href: '/category/mens-accessories' },
    { name: 'Electronics', href: '/category/electronics' },
    { name: 'Kids', href: '/category/kids' },
    { name: 'Footwear', href: '/category/footwear' },
    { name: 'Perfume & Fragrance', href: '/category/perfume-fragrance' },
]

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-gray-950 text-white pt-16 pb-8 border-t border-white/10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
                    {/* Brand */}
                    <div className="space-y-5 lg:col-span-1">
                        <Link href="/" className="inline-block">
                            <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                                Glanzoo
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Your one-stop destination for fashion, accessories, electronics & more.
                            Quality products, great prices — for the whole family.
                        </p>
                        <div className="flex items-center gap-3">
                            <SocialLink href="#" icon={Instagram} label="Instagram" />
                            <SocialLink href="#" icon={Facebook} label="Facebook" />
                            <SocialLink href="#" icon={Twitter} label="Twitter" />
                            <SocialLink href="#" icon={Youtube} label="YouTube" />
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-amber-400 font-semibold tracking-widest uppercase text-xs mb-5">Shop</h3>
                        <ul className="space-y-3">
                            {shopCategories.map(cat => (
                                <FooterLink key={cat.name} href={cat.href}>{cat.name}</FooterLink>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-amber-400 font-semibold tracking-widest uppercase text-xs mb-5">Support</h3>
                        <ul className="space-y-3">
                            <FooterLink href="/help/shipping">Shipping & Delivery</FooterLink>
                            <FooterLink href="/help/returns">Returns & Exchanges</FooterLink>
                            <FooterLink href="/help/size-guide">Size Guide</FooterLink>
                            <FooterLink href="/help/faq">FAQs</FooterLink>
                            <FooterLink href="/contact">Contact Us</FooterLink>
                            <FooterLink href="/seller-register">Become a Seller</FooterLink>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-amber-400 font-semibold tracking-widest uppercase text-xs mb-5">Contact Us</h3>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                                <span>123 Fashion Avenue, Design District, Mumbai, India 400001</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-amber-400 shrink-0" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-amber-400 shrink-0" />
                                <span>support@glanzoo.com</span>
                            </li>
                        </ul>

                        {/* Trust Badges */}
                        <div className="mt-6 flex flex-wrap gap-2">
                            {['🔒 Secure Pay', '🚚 Fast Ship', '↩️ Easy Return'].map(badge => (
                                <span key={badge} className="text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400">
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        © {currentYear} Glanzoo. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
                        <Link href="/sitemap" className="hover:text-amber-400 transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="text-gray-400 hover:text-amber-400 transition-colors text-sm flex items-center group">
                <span className="w-0 group-hover:w-2 h-px bg-amber-400 mr-0 group-hover:mr-2 transition-all duration-300" />
                {children}
            </Link>
        </li>
    )
}

function SocialLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
    return (
        <a
            href={href}
            aria-label={label}
            className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-amber-400 hover:border-amber-400/50 hover:bg-amber-400/10 transition-all duration-300"
        >
            <Icon className="h-4 w-4" />
        </a>
    )
}
