/**
 * lib/auth.config.ts — NextAuth configuration (Edge-safe)
 *
 * Fixes:
 *  - Removed all `as string` / `as any` type casts in jwt/session callbacks
 *  - Used proper type guards instead of blind casts
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
    async jwt({ token, user }) {
      // Only set claims on initial sign-in (user object is only present then)
      if (user) {
        if (typeof user.id === 'string') token.id = user.id;
        if (typeof user.role === 'string') token.role = user.role;

        // Vendor-specific claims
        if (
          user.role === 'VENDOR' &&
          user.vendor != null &&
          typeof user.vendor.id === 'string' &&
          typeof user.vendor.status === 'string'
        ) {
          token.vendorId = user.vendor.id;
          token.vendorStatus = user.vendor.status;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        if (typeof token.id === 'string') session.user.id = token.id;
        if (typeof token.role === 'string') session.user.role = token.role;

        // Only attach vendor fields if they exist in the token
        if (typeof token.vendorId === 'string') {
          session.user.vendorId = token.vendorId;
        }
        if (typeof token.vendorStatus === 'string') {
          session.user.vendorStatus = token.vendorStatus;
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
