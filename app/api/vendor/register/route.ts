export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-utils";
import { vendorRegistrationSchema } from "@/lib/validations/vendor";

/**
 * POST /api/vendor/register
 * Register a new vendor account
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("[Vendor Register] Received body:", JSON.stringify(body, null, 2));

        // Validate input
        const validatedData = vendorRegistrationSchema.safeParse(body);

        if (!validatedData.success) {
            console.log("[Vendor Register] Validation errors:", JSON.stringify(validatedData.error.errors, null, 2));
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validatedData.error.errors,
                },
                { status: 400 }
            );
        }

        const {
            email,
            password,
            name,
            phone,
            businessName,
            businessType,
            description,
            contactEmail,
            contactPhone,
            businessAddress,
            gstNumber,
            panNumber,
        } = validatedData.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 409 }
            );
        }

        // Check if business name is taken
        const existingBusiness = await prisma.vendor.findFirst({
            where: { businessName },
        });

        if (existingBusiness) {
            return NextResponse.json(
                { error: "Business name already taken" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user and vendor in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user with VENDOR role
            const user = await tx.user.create({
                data: {
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    name,
                    phone,
                    role: "VENDOR",
                },
            });

            // Create vendor profile
            const vendor = await tx.vendor.create({
                data: {
                    userId: user.id,
                    businessName,
                    businessType,
                    description: description || null,
                    contactEmail: contactEmail.toLowerCase(),
                    contactPhone,
                    businessAddress: JSON.stringify(businessAddress),
                    gstNumber: gstNumber || null,
                    panNumber: panNumber || null,
                    status: "PENDING", // Requires admin approval
                    commissionRate: 10.0, // Default 10%
                },
            });

            return { user, vendor };
        });

        return NextResponse.json(
            {
                message: "Vendor registration successful. Your account is pending approval.",
                vendor: {
                    id: result.vendor.id,
                    businessName: result.vendor.businessName,
                    status: result.vendor.status,
                },
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error("Vendor registration error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to register vendor';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
