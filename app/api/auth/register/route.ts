export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-utils';
import { registerSchema } from '@/lib/validations';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { sendVerificationEmail } from '@/lib/mailer';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        // Rate limit registrations to 3 per IP per hour
        const ip = getClientIp(request);
        const rl = checkRateLimit(`register:${ip}`, RATE_LIMITS.REGISTER);
        if (!rl.success) {
            return NextResponse.json(
                { error: 'Too many registration attempts. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': Math.ceil((rl.resetAt - Date.now()) / 1000).toString(),
                        'X-RateLimit-Limit': rl.limit.toString(),
                        'X-RateLimit-Remaining': '0',
                    },
                }
            );
        }

        const body = await request.json();

        // Validate input
        const validatedFields = registerSchema.safeParse(body);

        if (!validatedFields.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validatedFields.error.flatten() },
                { status: 400 }
            );
        }

        const { name, email, password, phone } = validatedFields.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user (emailVerified is null until they click the link)
        const user = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                phone,
                role: 'CUSTOMER',
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
            },
        });

        // Create email verification token (expires in 24 hours)
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await prisma.emailVerificationToken.create({
            data: { email: email.toLowerCase(), token, expiresAt },
        });

        // Send verification email via Brevo
        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;
        try {
            await sendVerificationEmail(email.toLowerCase(), verifyUrl);
        } catch (mailErr) {
            console.error('[Register] Failed to send verification email:', mailErr);
            // Don't fail registration if email fails — user can see/resend later
        }

        return NextResponse.json(
            {
                message: 'Registration successful! Please check your email to verify your account.',
                user,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Failed to register user' },
            { status: 500 }
        );
    }
}
