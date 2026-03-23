import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();
        if (!token || !password) return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
        if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });

        const [resetToken] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token)).limit(1);
        if (!resetToken) return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
        if (resetToken.expiresAt < new Date()) {
            await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
            return NextResponse.json({ error: 'Reset link has expired. Please request a new one.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.update(users).set({ password: hashedPassword }).where(eq(users.email, resetToken.email));
        await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
        return NextResponse.json({ success: true, message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }
}
