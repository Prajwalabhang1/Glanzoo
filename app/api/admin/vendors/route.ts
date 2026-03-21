export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Middleware to check admin access
 */
async function checkAdminAccess() {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Unauthorized", status: 401 };
    }

    if (session.user.role !== "ADMIN") {
        return { error: "Forbidden: Admin access required", status: 403 };
    }

    return { session };
}

/**
 * GET /api/admin/vendors
 * Get all vendors with filtering
 */
export async function GET(request: Request) {
    try {
        const accessCheck = await checkAdminAccess();
        if ("error" in accessCheck) {
            return NextResponse.json(
                { error: accessCheck.error },
                { status: accessCheck.status }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const search = searchParams.get("search");

        // Build query
        const where: Prisma.VendorWhereInput = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { businessName: { contains: search, mode: "insensitive" } },
                { contactEmail: { contains: search, mode: "insensitive" } },
            ];
        }

        const vendors = await prisma.vendor.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        createdAt: true,
                    },
                },
                _count: {
                    select: {
                        products: true,
                        sales: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Calculate stats for each vendor
        const vendorsWithStats = await Promise.all(
            vendors.map(async (vendor) => {
                const sales = await prisma.vendorSale.findMany({
                    where: { vendorId: vendor.id },
                    select: {
                        productTotal: true,
                        vendorPayout: true,
                    },
                });

                const totalRevenue = sales.reduce(
                    (sum, sale) => sum + sale.productTotal,
                    0
                );
                const totalPayout = sales.reduce(
                    (sum, sale) => sum + sale.vendorPayout,
                    0
                );

                let parsedAddress;
                try {
                    parsedAddress = JSON.parse(vendor.businessAddress);
                } catch {
                    parsedAddress = { street: "N/A", city: "N/A", state: "N/A", pincode: "N/A" };
                }

                return {
                    ...vendor,
                    businessAddress: parsedAddress,
                    stats: {
                        totalRevenue: Number(totalRevenue.toFixed(2)),
                        totalPayout: Number(totalPayout.toFixed(2)),
                        productCount: vendor._count.products,
                        salesCount: vendor._count.sales,
                    },
                };
            })
        );

        return NextResponse.json({
            vendors: vendorsWithStats,
            total: vendorsWithStats.length,
        });
    } catch (error) {
        console.error("Error fetching vendors:", error);
        return NextResponse.json(
            { error: "Failed to fetch vendors" },
            { status: 500 }
        );
    }
}
