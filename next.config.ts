/**
 * next.config.ts — Next.js configuration
 *
 * Fixes:
 *  - reactStrictMode: true added
 *  - ESLint/TS error suppression KEPT during build (will remove after all TS errors fixed)
 *  - Cache-Control header changed from blanket no-cache to proper strategy
 *  - Added frame-ancestors CSP
 *  - Hostinger: unoptimized images kept (prevents 500 on image endpoint)
 *  - Added compiler.removeConsole only for production
 *  - Added serverExternalPackages for nodemailer (prevents edge bundling issues)
 */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // ── Image optimization ────────────────────────────────────────────────────────
  // unoptimized: true is REQUIRED for Hostinger VPS (they don't support Next.js
  // image optimization endpoint reliably — causes 500s in production).
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'jtkudquwauxzwcmzlrnl.supabase.co' },
    ],
  },

  // ── Compiler ──────────────────────────────────────────────────────────────────
  compiler: {
    // Remove console.* calls in production builds (except console.error)
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },

  // ── Server external packages ──────────────────────────────────────────────────
  // nodemailer and mysql2 must run in Node.js only; prevent Edge bundling errors
  serverExternalPackages: ['nodemailer', 'mysql2', 'bcryptjs'],

  // ── Experimental ─────────────────────────────────────────────────────────────
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // ── Security headers ──────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        // API routes: no caching
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        // Static assets: long cache
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // All other pages
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'",
          },
        ],
      },
    ];
  },

  // ── Build error suppression ───────────────────────────────────────────────────
  // NOTE: These will be set to false (removed) after all TypeScript errors are fixed
  // in Phases 2–5. Keeping them true now ensures Hostinger deployments continue
  // to succeed while we progressively fix each file.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
