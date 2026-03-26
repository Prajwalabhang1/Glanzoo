/**
 * lib/auth.config.ts — NextAuth configuration (Edge-safe)
 *
 * Fixes:
 *  - Uses authorized() callback for page-level route protection instead of
 *    custom NextResponse.redirect() in middleware. This avoids the Hostinger
 *    reverse-proxy bug where custom middleware redirects cause the browser to
 *    receive raw RSC payloads (unstyled page crash).
 *  - AUTH_SECRET read via process.env (not env.ts — this file runs in Edge/Middleware)
 *  - Session strategy explicitly set to 'jwt' for stateless auth (no DB session lookup)
 */
import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    // authorized() is called by the middleware auth() wrapper to decide whether
    // to allow or redirect. Using this means Next.js handles the redirect
    // internally (no NextResponse.redirect() in our code) — which avoids the
    // Hostinger reverse-proxy bug where custom middleware redirects cause the
    // browser to receive raw RSC payloads instead of full HTML pages.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      const role = (auth?.user as { role?: string })?.role;

      // Protected customer pages — unauthenticated → redirect to /login
      const protectedPaths = ['/my-account', '/saved-items', '/checkout', '/order-confirmation'];
      const isProtected = protectedPaths.some(p => pathname.startsWith(p));
      if (isProtected && !isLoggedIn) {
        // Returning false triggers NextAuth's internal redirect to pages.signIn
        // with callbackUrl — this does NOT use NextResponse.redirect() so it
        // won't cause the Hostinger RSC crash.
        return false;
      }

      // Admin pages — must be logged in as ADMIN
      if (pathname.startsWith('/admin')) {
        if (!isLoggedIn) return false;
        if (role !== 'ADMIN') return Response.redirect(new URL('/', nextUrl));
      }

      // Vendor pages — must be logged in as VENDOR
      if (pathname.startsWith('/vendor')) {
        if (!isLoggedIn) return false;
        if (role !== 'VENDOR') return Response.redirect(new URL('/', nextUrl));
      }

      return true;
    },

    async jwt({ token, user }) {
      // Only set claims on initial sign-in (user object is only present then)
      if (user) {
        if (typeof user.id === 'string') token.id = user.id;
        if (typeof (user as { role?: string }).role === 'string') {
          token.role = (user as { role?: string }).role;
        }

        // Vendor-specific claims
        const vendor = (user as { vendor?: { id?: string; status?: string } }).vendor;
        if (
          (user as { role?: string }).role === 'VENDOR' &&
          vendor != null &&
          typeof vendor.id === 'string' &&
          typeof vendor.status === 'string'
        ) {
          token.vendorId = vendor.id;
          token.vendorStatus = vendor.status;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        if (typeof token.id === 'string') (session.user as { id?: string }).id = token.id;
        if (typeof token.role === 'string') (session.user as { role?: string }).role = token.role;

        // Only attach vendor fields if they exist in the token
        if (typeof token.vendorId === 'string') {
          (session.user as { vendorId?: string }).vendorId = token.vendorId;
        }
        if (typeof token.vendorStatus === 'string') {
          (session.user as { vendorStatus?: string }).vendorStatus = token.vendorStatus;
        }
      }
      return session;
    },
  },

  providers: [], // Providers are configured in auth.ts (non-Edge)

  // AUTH_SECRET read directly from process.env here because this file
  // may be loaded in the Edge runtime (middleware) where lib/env.ts
  // module-level throws are not safe.
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,

  // Required for Hostinger reverse proxy — trusts the X-Forwarded-Host header
  trustHost: true,
};
