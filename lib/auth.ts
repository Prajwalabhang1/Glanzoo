import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
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
                    // Validate input
                    const validatedFields = loginSchema.safeParse(credentials);

                    if (!validatedFields.success) {
                        return null;
                    }

                    const { email, password } = validatedFields.data;

                    // Find user with vendor relation
                    const user = await prisma.user.findUnique({
                        where: { email: email.toLowerCase() },
                        include: { vendor: true },
                    });

                    if (!user || !user.password) {
                        return null;
                    }

                    // Verify password
                    const isPasswordValid = await verifyPassword(password, user.password);

                    if (!isPasswordValid) {
                        return null;
                    }

                    // Block unverified users — frontend should surface this as a message
                    if (!user.emailVerified) {
                        throw new Error("EMAIL_NOT_VERIFIED");
                    }

                    // Return user object (include vendor data for JWT)
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.image,
                        vendor: user.vendor ? { id: user.vendor.id, status: user.vendor.status } : null,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    throw error; // re-throw so NextAuth can surface it
                }
            },
        }),
    ],
});
