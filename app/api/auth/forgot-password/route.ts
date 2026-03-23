import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/mailer';
export const dynamic = 'force-dynamic';

function cuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);

        if (user) {
            await db.delete(passwordResetTokens).where(eq(passwordResetTokens.email, email));
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
            await db.insert(passwordResetTokens).values({ id: cuid(), email, token, expiresAt });
            const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
            try { await sendPasswordResetEmail(email, resetUrl); } catch (mailErr) { console.error('[ForgotPassword] Failed to send reset email:', mailErr); }
        }

        return NextResponse.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
