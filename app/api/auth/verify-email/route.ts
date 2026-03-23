import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emailVerificationTokens, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');
        if (!token) return NextResponse.redirect(new URL('/login?error=missing_token', request.url));

        const [verificationToken] = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.token, token)).limit(1);
        if (!verificationToken) return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));

        if (verificationToken.expiresAt < new Date()) {
            await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));
            return NextResponse.redirect(new URL('/login?error=token_expired', request.url));
        }

        await db.update(users).set({ emailVerified: new Date() }).where(eq(users.email, verificationToken.email));
        await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));
        return NextResponse.redirect(new URL('/login?verified=1', request.url));
    } catch (error) {
        console.error('[VerifyEmail] Error:', error);
        return NextResponse.redirect(new URL('/login?error=server_error', request.url));
    }
}
