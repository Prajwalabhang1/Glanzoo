export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { productApprovalSchema } from "@/lib/validations/vendor";

/**
 * POST /api/admin/products/approve
 * Approve or reject products
 */
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden: Admin access required" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { productIds, approvalStatus, rejectionReason } = body;

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return NextResponse.json(
                { error: "Product IDs array is required" },
                { status: 400 }
            );
        }

        // Validate approval data
        const validatedData = productApprovalSchema.safeParse({
            approvalStatus,
            rejectionReason,
        });

        if (!validatedData.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validatedData.error.errors,
                },
                { status: 400 }
            );
        }

        if (
            validatedData.data.approvalStatus === "REJECTED" &&
            !validatedData.data.rejectionReason
        ) {
            return NextResponse.json(
                { error: "Rejection reason is required when rejecting products" },
                { status: 400 }
            );
        }

        const updateData: Record<string, string | Date | number | boolean | null | undefined> = {
            approvalStatus: validatedData.data.approvalStatus,
            approvedBy: session.user.id,
        };

        if (validatedData.data.approvalStatus === "APPROVED") {
            updateData.approvedAt = new Date();
            updateData.active = true; // Make product live
            updateData.rejectionReason = null;
        } else if (validatedData.data.approvalStatus === "REJECTED") {
            updateData.approvedAt = null;
            updateData.active = false; // Hide rejected products
            updateData.rejectionReason = validatedData.data.rejectionReason;
        }

        // Update products
        const result = await prisma.product.updateMany({
            where: {
                id: { in: productIds },
                vendorId: { not: null }, // Only vendor products can be approved
            },
            data: updateData,
        });

        // TODO: Send email notifications to vendors

        return NextResponse.json({
            message: `${result.count} product(s) ${validatedData.data.approvalStatus.toLowerCase()} successfully`,
            count: result.count,
        });
    } catch (error) {
        console.error("Error approving products:", error);
        return NextResponse.json(
            { error: "Failed to approve products" },
            { status: 500 }
        );
    }
}
