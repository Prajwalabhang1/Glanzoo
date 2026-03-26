/**
 * middleware.ts — Next.js Edge Middleware
 *
 * Architecture:
 *  - Page-level auth redirects are handled by the authorized() callback in
 *    lib/auth.config.ts. This avoids using NextResponse.redirect() in this file
 *    for page routes, which broke on Hostinger (RSC payload served instead of HTML).
 *  - This file ONLY handles:
 *    1. API route role enforcement (returns JSON 401/403, not page redirects)
 *    2. Unapproved vendor → /vendor/pending redirect (edge case not in authorized())
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const session = req.auth;
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // ── API route guards ─────────────────────────────────────────────────────────
  const isAdminApi = pathname.startsWith('/api/admin');
  const isVendorApi = pathname.startsWith('/api/vendor');

  if (isAdminApi) {
    // Allow public navigation bar to fetch categories
    const isPublicCategoriesFetch =
      pathname === '/api/admin/categories' &&
      req.method === 'GET' &&
      nextUrl.searchParams.get('public') === 'true';

    if (!isPublicCategoriesFetch) {
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
  }

  if (isVendorApi) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user?.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (
      session.user.vendorStatus !== 'APPROVED' &&
      // Allow the pending-status check endpoint itself
      !pathname.includes('/api/vendor/status')
    ) {
      return NextResponse.json(
        { error: 'Vendor account not yet approved' },
        { status: 403 }
      );
    }
  }

  // ── Unapproved vendor → /vendor/pending ──────────────────────────────────────
  // This edge case isn't handled by authorized() since it needs to check vendorStatus.
  if (
    pathname.startsWith('/vendor') &&
    !pathname.includes('/pending') &&
    !pathname.startsWith('/api/vendor') &&
    session?.user?.role === 'VENDOR' &&
    session?.user?.vendorStatus !== 'APPROVED'
  ) {
    return NextResponse.redirect(new URL('/vendor/pending', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Page routes — needed for the authorized() callback to fire
    '/my-account',
    '/my-account/:path*',
    '/saved-items',
    '/checkout',
    '/checkout/:path*',
    '/order-confirmation/:path*',
    '/admin/:path*',
    '/vendor/:path*',
    // API routes that need role enforcement
    '/api/admin/:path*',
    '/api/vendor/:path*',
  ],
};
