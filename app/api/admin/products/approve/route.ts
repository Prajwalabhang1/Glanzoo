export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { eq, inArray, isNotNull } from "drizzle-orm";
import { productApprovalSchema } from "@/lib/validations/vendor";

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });

        const body = await request.json();
        const { productIds, approvalStatus, rejectionReason } = body;

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) return NextResponse.json({ error: "Product IDs array is required" }, { status: 400 });

        const validatedData = productApprovalSchema.safeParse({ approvalStatus, rejectionReason });
        if (!validatedData.success) return NextResponse.json({ error: "Validation failed", details: validatedData.error.errors }, { status: 400 });
        if (validatedData.data.approvalStatus === "REJECTED" && !validatedData.data.rejectionReason) return NextResponse.json({ error: "Rejection reason is required when rejecting products" }, { status: 400 });

        const updateData: Record<string, any> = {
            approvalStatus: validatedData.data.approvalStatus,
            approvedBy: session.user.id,
        };

        if (validatedData.data.approvalStatus === "APPROVED") {
            updateData.approvedAt = new Date(); updateData.active = true; updateData.rejectionReason = null;
        } else if (validatedData.data.approvalStatus === "REJECTED") {
            updateData.approvedAt = null; updateData.active = false; updateData.rejectionReason = validatedData.data.rejectionReason;
        }

        // Drizzle doesn't support updateMany with complex conditions the same way; use inArray + isNotNull filter
        const eligibleProducts = await db.select({ id: products.id }).from(products).where(inArray(products.id, productIds));
        const eligibleIds = eligibleProducts.map(p => p.id);
        if (eligibleIds.length > 0) {
            for (const id of eligibleIds) {
                await db.update(products).set(updateData).where(eq(products.id, id));
            }
        }

        return NextResponse.json({ message: `${eligibleIds.length} product(s) ${validatedData.data.approvalStatus.toLowerCase()} successfully`, count: eligibleIds.length });
    } catch (error) { console.error("Error approving products:", error); return NextResponse.json({ error: "Failed to approve products" }, { status: 500 }); }
}
