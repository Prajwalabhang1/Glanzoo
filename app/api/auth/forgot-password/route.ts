import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        // Check if user exists (don't reveal if they don't)
        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            // Delete any existing tokens for this email
            await prisma.passwordResetToken.deleteMany({ where: { email } });

            // Create new token (expires in 1 hour)
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

            await prisma.passwordResetToken.create({
                data: { email, token, expiresAt },
            });

            const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

            try {
                await sendPasswordResetEmail(email, resetUrl);
            } catch (mailErr) {
                console.error('[ForgotPassword] Failed to send reset email:', mailErr);
                // Log but don't expose error to client
            }
        }

        // Always return success to prevent email enumeration
        return NextResponse.json({
            success: true,
            message: 'If an account with that email exists, a reset link has been sent.',
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
