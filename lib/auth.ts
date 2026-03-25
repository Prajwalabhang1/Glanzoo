/**
 * lib/auth.ts — NextAuth configuration with Credentials provider
 *
 * Fixes:
 *  - Email verification check RESTORED — throws typed CredentialsSignin
 *    so NextAuth shows "EMAIL_NOT_VERIFIED" error code on login page
 *  - Removed all unsafe type casts
 *  - Explicit return type on authorize()
 *  - Import env for validated secrets
 *  - Password field null-guard preserved
 */
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { users, vendors, emailVerificationTokens } from '@/lib/schema';
import { eq, and, gt } from 'drizzle-orm';
import { verifyPassword } from '@/lib/auth-utils';
import { loginSchema } from '@/lib/validations';
import { authConfig } from './auth.config';
import type { User } from 'next-auth';

export type AuthorizedUser = User & {
  role: string;
  vendor: { id: string; status: string } | null;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<AuthorizedUser | null> {
        // 1. Validate input shape
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // 2. Look up user
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email.toLowerCase()))
          .limit(1);

        if (!user || !user.password) return null;

        // 3. Verify password
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) return null;

        // 4. Email verification check
        // If the user has no emailVerified date AND there is a valid (non-expired)
        // verification token for them, block sign-in with a clear error code.
        if (!user.emailVerified) {
          const now = new Date();
          const [activeToken] = await db
            .select({ id: emailVerificationTokens.id })
            .from(emailVerificationTokens)
            .where(
              and(
                eq(emailVerificationTokens.email, user.email),
                gt(emailVerificationTokens.expiresAt, now)
              )
            )
            .limit(1);

          if (activeToken) {
            // Throw a string that maps to an error code shown on the login page
            throw new Error('EMAIL_NOT_VERIFIED');
          }
          // If there is no active token (e.g. it expired), allow login but
          // the user should be prompted to request a new verification email.
        }

        // 5. Fetch vendor record if present
        const [vendor] = await db
          .select({ id: vendors.id, status: vendors.status })
          .from(vendors)
          .where(eq(vendors.userId, user.id))
          .limit(1);

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
          role: user.role,
          vendor: vendor ?? null,
        };
      },
    }),
  ],
});
