import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
        error: "/login", // Redirect to login page on error
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                // Include vendor info if user is a vendor
                const vendorUser = user as { vendor?: { id: string; status: string } };
                if (user.role === "VENDOR" && vendorUser.vendor) {
                    token.vendorId = vendorUser.vendor.id;
                    token.vendorStatus = vendorUser.vendor.status;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string; // Keep token.id as string
                session.user.role = token.role as string;
                // Include vendor info in session
                if (token.vendorId) {
                    session.user.vendorId = token.vendorId as string;
                    session.user.vendorStatus = token.vendorStatus as string;
                }
            }
            return session;
        },
    },
    providers: [], // Providers are configured in auth.ts
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    // REQUIRED for Hostinger/reverse proxy: allows NextAuth to trust the forwarded host header
    trustHost: true,
} satisfies NextAuthConfig;
