import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.redirect(
                new URL('/login?error=missing_token', request.url)
            );
        }

        // Look up the token
        const verificationToken = await prisma.emailVerificationToken.findUnique({
            where: { token },
        });

        if (!verificationToken) {
            return NextResponse.redirect(
                new URL('/login?error=invalid_token', request.url)
            );
        }

        // Check expiry
        if (verificationToken.expiresAt < new Date()) {
            await prisma.emailVerificationToken.delete({ where: { token } });
            return NextResponse.redirect(
                new URL('/login?error=token_expired', request.url)
            );
        }

        // Mark user as verified
        await prisma.user.update({
            where: { email: verificationToken.email },
            data: { emailVerified: new Date() },
        });

        // Delete token (single-use)
        await prisma.emailVerificationToken.delete({ where: { token } });

        // Redirect to login with success flag
        return NextResponse.redirect(
            new URL('/login?verified=1', request.url)
        );
    } catch (error) {
        console.error('[VerifyEmail] Error:', error);
        return NextResponse.redirect(
            new URL('/login?error=server_error', request.url)
        );
    }
}
