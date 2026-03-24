import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users, vendors } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth-utils";
import { loginSchema } from "@/lib/validations";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    const validatedFields = loginSchema.safeParse(credentials);
                    if (!validatedFields.success) return null;

                    const { email, password } = validatedFields.data;

                    const [user] = await db
                        .select()
                        .from(users)
                        .where(eq(users.email, email.toLowerCase()))
                        .limit(1);

                    if (!user || !user.password) return null;

                    const isPasswordValid = await verifyPassword(password, user.password);
                    if (!isPasswordValid) return null;

                    // Temporarily bypassed so users can log in and purchase even if the email verification link fails on Hostinger.
                    // if (!user.emailVerified) {
                    //     throw new Error("EMAIL_NOT_VERIFIED");
                    // }

                    const [vendor] = await db
                        .select({ id: vendors.id, status: vendors.status })
                        .from(vendors)
                        .where(eq(vendors.userId, user.id))
                        .limit(1);

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.image,
                        vendor: vendor ?? null,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    throw error;
                }
            },
        }),
    ],
});
