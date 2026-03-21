export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { vendorProfileUpdateSchema, vendorBankDetailsSchema } from "@/lib/validations/vendor";

/**
 * Middleware to check vendor access
 */
async function checkVendorAccess() {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Unauthorized", status: 401 };
    }

    if (session.user.role !== "VENDOR") {
        return { error: "Forbidden: Vendor access required", status: 403 };
    }

    return { session };
}

/**
 * GET /api/vendor/profile
 * Get vendor profile
 */
export async function GET() {
    try {
        const accessCheck = await checkVendorAccess();
        if ("error" in accessCheck) {
            return NextResponse.json(
                { error: accessCheck.error },
                { status: accessCheck.status }
            );
        }

        const { session } = accessCheck;

        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phone: true,
                    },
                },
            },
        });

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor profile not found" },
                { status: 404 }
            );
        }

        // Parse JSON fields
        const profile = {
            ...vendor,
            businessAddress: JSON.parse(vendor.businessAddress),
            // Don't send full bank details - only masked version
            hasBankDetails: !!vendor.bankDetails,
            bankDetails: vendor.bankDetails
                ? (() => {
                    try {
                        const details = JSON.parse(vendor.bankDetails);
                        return {
                            bankName: details.bankName,
                            accountName: details.accountName,
                            maskedAccount: `XXXX${details.accountNumber.slice(-4)}`,
                            ifscCode: details.ifscCode,
                        };
                    } catch {
                        return null;
                    }
                })()
                : null,
        };

        return NextResponse.json({ vendor: profile });
    } catch (error: unknown) {
        console.error("Error fetching vendor profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch vendor profile" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/vendor/profile
 * Update vendor profile
 */
export async function PUT(request: Request) {
    try {
        const accessCheck = await checkVendorAccess();
        if ("error" in accessCheck) {
            return NextResponse.json(
                { error: accessCheck.error },
                { status: accessCheck.status }
            );
        }

        const { session } = accessCheck;
        const body = await request.json();

        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id },
        });

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor profile not found" },
                { status: 404 }
            );
        }

        // Validate update data
        const validatedData = vendorProfileUpdateSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validatedData.error.errors,
                },
                { status: 400 }
            );
        }

        // Prepare update data
        const updateData: Record<string, string | number | boolean | null | undefined> = {};

        if (validatedData.data.businessName) updateData.businessName = validatedData.data.businessName;
        if (validatedData.data.businessType) updateData.businessType = validatedData.data.businessType;
        if (validatedData.data.description !== undefined) updateData.description = validatedData.data.description;
        if (validatedData.data.logo !== undefined) updateData.logo = validatedData.data.logo;
        if (validatedData.data.banner !== undefined) updateData.banner = validatedData.data.banner;
        if (validatedData.data.contactEmail) updateData.contactEmail = validatedData.data.contactEmail.toLowerCase();
        if (validatedData.data.contactPhone) updateData.contactPhone = validatedData.data.contactPhone;
        if (validatedData.data.businessAddress) {
            updateData.businessAddress = JSON.stringify(validatedData.data.businessAddress);
        }
        if (validatedData.data.gstNumber !== undefined) updateData.gstNumber = validatedData.data.gstNumber || null;
        if (validatedData.data.panNumber !== undefined) updateData.panNumber = validatedData.data.panNumber || null;

        // Update vendor
        const updatedVendor = await prisma.vendor.update({
            where: { id: vendor.id },
            data: updateData,
        });

        return NextResponse.json({
            message: "Profile updated successfully",
            vendor: {
                ...updatedVendor,
                businessAddress: JSON.parse(updatedVendor.businessAddress),
            },
        });
    } catch (error: unknown) {
        console.error("Error updating vendor profile:", error);
        return NextResponse.json(
            { error: "Failed to update vendor profile" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/vendor/profile/bank
 * Update bank details (separate endpoint for security)
 */
export async function POST(request: Request) {
    try {
        const accessCheck = await checkVendorAccess();
        if ("error" in accessCheck) {
            return NextResponse.json(
                { error: accessCheck.error },
                { status: accessCheck.status }
            );
        }

        const { session } = accessCheck;
        const body = await request.json();

        // Validate bank details
        const validatedData = vendorBankDetailsSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validatedData.error.errors,
                },
                { status: 400 }
            );
        }

        const { accountNumber, ifscCode, bankName, accountName, accountType } = validatedData.data;

        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id },
        });

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor profile not found" },
                { status: 404 }
            );
        }

        // Store bank details as JSON
        // NOTE: In production, encrypt this data before storing
        const bankDetails = JSON.stringify({
            accountNumber,
            ifscCode,
            bankName,
            accountName,
            accountType: accountType || "SAVINGS",
            updatedAt: new Date().toISOString(),
        });

        await prisma.vendor.update({
            where: { id: vendor.id },
            data: { bankDetails },
        });

        return NextResponse.json({
            message: "Bank details updated successfully",
        });
    } catch (error: unknown) {
        console.error("Error updating bank details:", error);
        return NextResponse.json(
            { error: "Failed to update bank details" },
            { status: 500 }
        );
    }
}
