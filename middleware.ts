/**
 * middleware.ts — Next.js Edge Middleware
 *
 * Fixes:
 *  - Added /checkout/:path* to matcher (was missing — checkout sub-pages were unprotected)
 *  - Added /order-confirmation/:path* to matcher
 *  - Added JSON 403 response for API routes accessed by wrong role
 *  - /api/admin/* now returns 401/403 JSON instead of silently passing through
 *  - /api/vendor/* now returns 401/403 JSON for non-vendor callers
 *  - Vendor status check: unapproved vendor API calls get 403
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
  // ── Helper to prevent Hostinger caching of Middleware responses ──
  const noCacheResponse = (res: NextResponse) => {
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return res;
  };

  if (isAdminApi) {
    // Allow public navigation bar to fetch categories
    const isPublicCategoriesFetch = pathname === '/api/admin/categories' && req.method === 'GET' && nextUrl.searchParams.get('public') === 'true';

    if (!isPublicCategoriesFetch) {
      if (!session) {
        return noCacheResponse(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }
      if (session.user?.role !== 'ADMIN') {
        return noCacheResponse(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
      }
    }
  }

  if (isVendorApi) {
    if (!session) {
      return noCacheResponse(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }
    if (session.user?.role !== 'VENDOR') {
      return noCacheResponse(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
    }
    if (
      session.user.vendorStatus !== 'APPROVED' &&
      // Allow the pending-status check endpoint itself
      !pathname.includes('/api/vendor/status')
    ) {
      return noCacheResponse(NextResponse.json(
        { error: 'Vendor account not yet approved' },
        { status: 403 }
      ));
    }
  }

  // ── Page route guards ────────────────────────────────────────────────────────
  const protectedRoutes = ['/my-account', '/checkout', '/saved-items', '/order-confirmation'];
  const adminRoutes = ['/admin'];
  const vendorRoutes = ['/vendor'];

  const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r));
  const isVendorRoute = vendorRoutes.some((r) => pathname.startsWith(r));

  // Unauthenticated → redirect to login with callbackUrl
  if ((isProtectedRoute || isAdminRoute || isVendorRoute) && !session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return noCacheResponse(NextResponse.redirect(loginUrl));
  }

  // Admin page: non-ADMIN role → home
  if (isAdminRoute && session?.user?.role !== 'ADMIN') {
    return noCacheResponse(NextResponse.redirect(new URL('/', req.url)));
  }

  // Vendor page: non-VENDOR role → home
  if (isVendorRoute && session?.user?.role !== 'VENDOR') {
    return noCacheResponse(NextResponse.redirect(new URL('/', req.url)));
  }

  // Unapproved vendor → pending page
  if (
    isVendorRoute &&
    session?.user?.vendorStatus !== 'APPROVED' &&
    !pathname.includes('/pending')
  ) {
    return noCacheResponse(NextResponse.redirect(new URL('/vendor/pending', req.url)));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Page routes
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
