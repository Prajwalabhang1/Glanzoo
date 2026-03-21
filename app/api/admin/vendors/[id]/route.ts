import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { vendorApprovalSchema } from "@/lib/validations/vendor";

/**
 * Safely parse JSON string, return null on failure
 */
function safeJsonParse(str: string | null | undefined) {
    if (!str) return null;
    try {
        return JSON.parse(str);
    } catch {
        return null;
    }
}

/**
 * GET /api/admin/vendors/[id]
 * Get detailed vendor information
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;

        const vendor = await prisma.vendor.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phone: true,
                        createdAt: true,
                    },
                },
                products: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        salePrice: true,
                        active: true,
                        approvalStatus: true,
                        images: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: 20,
                },
                sales: {
                    select: {
                        id: true,
                        productTotal: true,
                        commissionRate: true,
                        commissionAmount: true,
                        vendorPayout: true,
                        payoutStatus: true,
                        createdAt: true,
                        order: {
                            select: {
                                id: true,
                                total: true,
                                status: true,
                                createdAt: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
                _count: {
                    select: {
                        products: true,
                        sales: true,
                    },
                },
            },
        });

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 }
            );
        }

        // Parse JSON fields safely
        const businessAddress = safeJsonParse(vendor.businessAddress) || {
            street: "N/A",
            city: "N/A",
            state: "N/A",
            pincode: "N/A",
        };

        const bankDetails = vendor.bankDetails
            ? (() => {
                const details = safeJsonParse(vendor.bankDetails);
                if (!details) return null;
                return {
                    bankName: details.bankName || "N/A",
                    accountName: details.accountName || "N/A",
                    maskedAccount: details.accountNumber
                        ? `XXXX${details.accountNumber.slice(-4)}`
                        : "N/A",
                    ifscCode: details.ifscCode || "N/A",
                };
            })()
            : null;

        // Calculate metrics safely
        const totalRevenue = vendor.sales.reduce(
            (sum, sale) => sum + (sale.productTotal || 0),
            0
        );
        const totalCommission = vendor.sales.reduce(
            (sum, sale) => sum + (sale.commissionAmount || 0),
            0
        );
        const totalPayout = vendor.sales.reduce(
            (sum, sale) => sum + (sale.vendorPayout || 0),
            0
        );
        const pendingPayout = vendor.sales
            .filter(
                (sale) =>
                    sale.payoutStatus === "PENDING" || sale.payoutStatus === "PROCESSING"
            )
            .reduce((sum, sale) => sum + (sale.vendorPayout || 0), 0);

        return NextResponse.json({
            vendor: {
                id: vendor.id,
                userId: vendor.userId,
                businessName: vendor.businessName,
                businessType: vendor.businessType,
                description: vendor.description,
                logo: vendor.logo,
                banner: vendor.banner,
                contactEmail: vendor.contactEmail,
                contactPhone: vendor.contactPhone,
                businessAddress,
                gstNumber: vendor.gstNumber,
                panNumber: vendor.panNumber,
                bankDetails,
                status: vendor.status,
                approvalNotes: vendor.approvalNotes,
                approvedAt: vendor.approvedAt,
                approvedBy: vendor.approvedBy,
                commissionRate: vendor.commissionRate,
                createdAt: vendor.createdAt,
                updatedAt: vendor.updatedAt,
                user: vendor.user,
                products: vendor.products,
                sales: vendor.sales,
                metrics: {
                    totalRevenue: Number(totalRevenue.toFixed(2)),
                    totalCommission: Number(totalCommission.toFixed(2)),
                    totalPayout: Number(totalPayout.toFixed(2)),
                    pendingPayout: Number(pendingPayout.toFixed(2)),
                    productCount: vendor._count.products,
                    salesCount: vendor._count.sales,
                },
            },
        });
    } catch (error) {
        console.error("Error fetching vendor details:", error);
        return NextResponse.json(
            { error: "Failed to fetch vendor details" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/admin/vendors/[id]
 * Update vendor status, commission, notes
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;

        const vendor = await prisma.vendor.findUnique({
            where: { id },
        });

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 }
            );
        }

        const body = await request.json();

        // Validate using approval schema
        const validatedData = vendorApprovalSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validatedData.error.errors,
                },
                { status: 400 }
            );
        }

        const updateData: Record<string, unknown> = {
            status: validatedData.data.status,
        };

        if (validatedData.data.approvalNotes !== undefined) {
            updateData.approvalNotes = validatedData.data.approvalNotes;
        }

        if (validatedData.data.commissionRate !== undefined) {
            updateData.commissionRate = validatedData.data.commissionRate;
        }

        // Set approval dates based on status change
        if (validatedData.data.status === "APPROVED") {
            updateData.approvedAt = new Date();
            updateData.approvedBy = session.user.id;
        } else if (
            validatedData.data.status === "REJECTED" ||
            validatedData.data.status === "SUSPENDED"
        ) {
            updateData.approvedAt = null;
            updateData.approvedBy = null;
        }

        const updatedVendor = await prisma.vendor.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    select: { email: true, name: true },
                },
            },
        });

        return NextResponse.json({
            message: `Vendor ${validatedData.data.status.toLowerCase()} successfully`,
            vendor: updatedVendor,
        });
    } catch (error) {
        console.error("Error updating vendor:", error);
        return NextResponse.json(
            { error: "Failed to update vendor" },
            { status: 500 }
        );
    }
}
