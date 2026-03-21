import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        // Find and validate token
        const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

        if (!resetToken) {
            return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
        }
        if (resetToken.expiresAt < new Date()) {
            await prisma.passwordResetToken.delete({ where: { token } });
            return NextResponse.json({ error: 'Reset link has expired. Please request a new one.' }, { status: 400 });
        }

        // Hash the new password and update
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { email: resetToken.email },
            data: { password: hashedPassword, updatedAt: new Date() },
        });

        // Delete the used token
        await prisma.passwordResetToken.delete({ where: { token } });

        return NextResponse.json({ success: true, message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }
}
