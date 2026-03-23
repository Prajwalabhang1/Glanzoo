export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, emailVerificationTokens } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth-utils';
import { registerSchema } from '@/lib/validations';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { sendVerificationEmail } from '@/lib/mailer';
import crypto from 'crypto';

function cuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export async function POST(request: Request) {
    try {
        const ip = getClientIp(request);
        const rl = checkRateLimit(`register:${ip}`, RATE_LIMITS.REGISTER);
        if (!rl.success) {
            return NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, {
                status: 429,
                headers: {
                    'Retry-After': Math.ceil((rl.resetAt - Date.now()) / 1000).toString(),
                    'X-RateLimit-Limit': rl.limit.toString(),
                    'X-RateLimit-Remaining': '0',
                },
            });
        }

        const body = await request.json();
        const validatedFields = registerSchema.safeParse(body);
        if (!validatedFields.success) {
            return NextResponse.json({ error: 'Invalid input', details: validatedFields.error.flatten() }, { status: 400 });
        }

        const { name, email, password, phone } = validatedFields.data;

        const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase())).limit(1);
        if (existingUser) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);
        const userId = cuid();

        await db.insert(users).values({
            id: userId, name, email: email.toLowerCase(),
            password: hashedPassword, phone, role: 'CUSTOMER',
        });

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await db.insert(emailVerificationTokens).values({
            id: cuid(), email: email.toLowerCase(), token, expiresAt,
        });

        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;
        try {
            await sendVerificationEmail(email.toLowerCase(), verifyUrl);
        } catch (mailErr) {
            console.error('[Register] Failed to send verification email:', mailErr);
        }

        return NextResponse.json({
            message: 'Registration successful! Please check your email to verify your account.',
            user: { id: userId, name, email: email.toLowerCase(), phone, role: 'CUSTOMER' },
        }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
    }
}
