import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
    const session = req.auth;
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;

    // Protected routes that require authentication
    const protectedRoutes = ['/my-account', '/checkout', '/saved-items'];
    const adminRoutes = ['/admin'];
    const vendorRoutes = ['/vendor'];

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    const isVendorRoute = vendorRoutes.some(route => pathname.startsWith(route));

    // Redirect to login if accessing protected route without authentication
    if (isProtectedRoute && !session) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isAdminRoute) {
        if (!session) {
            const loginUrl = new URL('/login', req.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        if (session.user?.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    // Check vendor access
    if (isVendorRoute) {
        if (!session) {
            const loginUrl = new URL('/login', req.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        if (session.user?.role !== 'VENDOR') {
            return NextResponse.redirect(new URL('/', req.url));
        }

        // Redirect unapproved vendors to pending page
        // FIX-11: vendorStatus is properly typed in next-auth.d.ts — no need for `as any`
        if (session.user.vendorStatus !== 'APPROVED' && !pathname.includes('/pending')) {
            return NextResponse.redirect(new URL('/vendor/pending', req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/my-account',
        '/my-account/:path*',
        '/saved-items',
        '/admin/:path*',
        '/vendor/:path*',
        '/checkout',
    ],
};
