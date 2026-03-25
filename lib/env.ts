/**
 * lib/env.ts — Zod-validated environment configuration
 *
 * Validates ALL required environment variables at module-load time.
 * Any missing/malformed var throws immediately with a clear message
 * instead of failing silently at request time.
 *
 * Import `env` instead of `process.env.X` anywhere in server-side code.
 */
import { z } from 'zod';

const envSchema = z.object({
  // ── Database ───────────────────────────────────────────────────
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .startsWith('mysql://', 'DATABASE_URL must be a mysql:// connection string'),

  // ── NextAuth ───────────────────────────────────────────────────
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z
    .string()
    .url('NEXTAUTH_URL must be a valid URL')
    .optional(), // Optional: not needed when trustHost: true on Hostinger

  // ── App ────────────────────────────────────────────────────────
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url('NEXT_PUBLIC_APP_URL must be a valid URL')
    .default('http://localhost:3000'),

  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  // ── Razorpay ───────────────────────────────────────────────────
  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z
    .string()
    .min(1, 'NEXT_PUBLIC_RAZORPAY_KEY_ID is required'),

  // ── SMTP / Email ───────────────────────────────────────────────
  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
  SMTP_PORT: z
    .string()
    .regex(/^\d+$/, 'SMTP_PORT must be a number string')
    .default('587'),
  SMTP_USER: z.string().min(1, 'SMTP_USER is required'),
  SMTP_PASS: z.string().min(1, 'SMTP_PASS is required'),
  EMAIL_FROM: z.string().email('EMAIL_FROM must be a valid email'),

  // ── Cloudinary ─────────────────────────────────────────────────
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.errors
      .map((e) => `  • [${e.path.join('.')}] ${e.message}`)
      .join('\n');
    // Throw a descriptive error that will surface in Hostinger logs
    throw new Error(
      `\n\n🚨 Missing or invalid environment variables:\n${formatted}\n\n` +
        `Please update your .env file or Hostinger environment panel.\n`
    );
  }

  return result.data;
}

/**
 * Use this object anywhere you need an env variable in server-side code.
 * In Edge/Middleware, continue using process.env directly (Edge runtime
 * does not support module-level throws gracefully).
 */
export const env: Env = validateEnv();
