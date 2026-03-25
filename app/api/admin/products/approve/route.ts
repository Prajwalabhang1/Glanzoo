/**
 * app/api/admin/products/approve/route.ts — Bulk product approval
 *
 * Fixes:
 *  - N+1 BUG: Was firing one db.update() per product ID in a loop.
 *    Now uses a single inArray bulk update.
 *  - Removed `Record<string, any>` — replaced with typed UpdatePayload.
 *  - productIds validated to be string array (was unchecked).
 *  - Max batch size of 100 to prevent abuse.
 */
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { inArray } from "drizzle-orm";
import { z } from "zod";

const approveSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1).max(100, "Max 100 products per batch"),
  approvalStatus: z.enum(["APPROVED", "REJECTED", "PENDING"]),
  rejectionReason: z.string().optional(),
});

type ProductApprovalUpdate = {
  approvalStatus: "APPROVED" | "REJECTED" | "PENDING";
  approvedBy: string;
  approvedAt: Date | null;
  active?: boolean;
  rejectionReason?: string | null;
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });

    const body = await request.json();
    const parsed = approveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { productIds, approvalStatus, rejectionReason } = parsed.data;

    if (approvalStatus === "REJECTED" && !rejectionReason) {
      return NextResponse.json(
        { error: "Rejection reason is required when rejecting products" },
        { status: 400 }
      );
    }

    // Build typed update payload
    const updateData: ProductApprovalUpdate = {
      approvalStatus,
      approvedBy: session.user.id,
      approvedAt: approvalStatus === "APPROVED" ? new Date() : null,
    };

    if (approvalStatus === "APPROVED") {
      updateData.active = true;
      updateData.rejectionReason = null;
    } else if (approvalStatus === "REJECTED") {
      updateData.active = false;
      updateData.rejectionReason = rejectionReason ?? null;
    }

    // FIX N+1: Single inArray bulk update instead of loop of individual updates
    await db
      .update(products)
      .set(updateData)
      .where(inArray(products.id, productIds));

    return NextResponse.json({
      message: `${productIds.length} product(s) ${approvalStatus.toLowerCase()} successfully`,
      count: productIds.length,
    });
  } catch (error) {
    console.error("[Admin Products Approve] Error:", error);
    return NextResponse.json({ error: "Failed to approve products" }, { status: 500 });
  }
}
