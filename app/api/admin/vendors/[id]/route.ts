import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { vendors, users, products, vendorSales } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { vendorApprovalSchema } from "@/lib/validations/vendor";

function safeJsonParse(str: string | null | undefined) { if (!str) return null; try { return JSON.parse(str); } catch { return null; } }

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        const { id } = await params;

        const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id)).limit(1);
        if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

        const [user, productRows, salesRows] = await Promise.all([
            db.select({ id: users.id, email: users.email, name: users.name, phone: users.phone, createdAt: users.createdAt }).from(users).where(eq(users.id, vendor.userId)).limit(1).then(r => r[0] ?? null),
            db.select({ id: products.id, name: products.name, price: products.price, salePrice: products.salePrice, active: products.active, approvalStatus: products.approvalStatus, images: products.images, createdAt: products.createdAt }).from(products).where(eq(products.vendorId, id)).orderBy(desc(products.createdAt)).limit(20),
            db.select({ id: vendorSales.id, productTotal: vendorSales.productTotal, commissionRate: vendorSales.commissionRate, commissionAmount: vendorSales.commissionAmount, vendorPayout: vendorSales.vendorPayout, payoutStatus: vendorSales.payoutStatus, createdAt: vendorSales.createdAt }).from(vendorSales).where(eq(vendorSales.vendorId, id)).orderBy(desc(vendorSales.createdAt)),
        ]);

        const businessAddress = safeJsonParse(vendor.businessAddress) || { street: "N/A", city: "N/A", state: "N/A", pincode: "N/A" };
        const bankDetails = vendor.bankDetails ? (() => { const d = safeJsonParse(vendor.bankDetails); if (!d) return null; return { bankName: d.bankName || "N/A", accountName: d.accountName || "N/A", maskedAccount: d.accountNumber ? `XXXX${d.accountNumber.slice(-4)}` : "N/A", ifscCode: d.ifscCode || "N/A" }; })() : null;
        const totalRevenue = salesRows.reduce((s, r) => s + Number(r.productTotal || 0), 0);
        const totalCommission = salesRows.reduce((s, r) => s + Number(r.commissionAmount || 0), 0);
        const totalPayout = salesRows.reduce((s, r) => s + Number(r.vendorPayout || 0), 0);
        const pendingPayout = salesRows.filter(r => r.payoutStatus === "PENDING" || r.payoutStatus === "PROCESSING").reduce((s, r) => s + Number(r.vendorPayout || 0), 0);

        return NextResponse.json({ vendor: { id: vendor.id, userId: vendor.userId, businessName: vendor.businessName, businessType: vendor.businessType, description: vendor.description, logo: vendor.logo, banner: vendor.banner, contactEmail: vendor.contactEmail, contactPhone: vendor.contactPhone, businessAddress, gstNumber: vendor.gstNumber, panNumber: vendor.panNumber, bankDetails, status: vendor.status, approvalNotes: vendor.approvalNotes, approvedAt: vendor.approvedAt, approvedBy: vendor.approvedBy, commissionRate: vendor.commissionRate, createdAt: vendor.createdAt, updatedAt: vendor.updatedAt, user, products: productRows, sales: salesRows, metrics: { totalRevenue: Number(totalRevenue.toFixed(2)), totalCommission: Number(totalCommission.toFixed(2)), totalPayout: Number(totalPayout.toFixed(2)), pendingPayout: Number(pendingPayout.toFixed(2)), productCount: productRows.length, salesCount: salesRows.length } } });
    } catch (error) { console.error("Error fetching vendor details:", error); return NextResponse.json({ error: "Failed to fetch vendor details" }, { status: 500 }); }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        const { id } = await params;
        const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id)).limit(1);
        if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
        const body = await request.json();
        const validatedData = vendorApprovalSchema.safeParse(body);
        if (!validatedData.success) return NextResponse.json({ error: "Validation failed", details: validatedData.error.errors }, { status: 400 });
        const updateData: Record<string, any> = { status: validatedData.data.status };
        if (validatedData.data.approvalNotes !== undefined) updateData.approvalNotes = validatedData.data.approvalNotes;
        if (validatedData.data.commissionRate !== undefined) updateData.commissionRate = validatedData.data.commissionRate;
        if (validatedData.data.status === "APPROVED") { updateData.approvedAt = new Date(); updateData.approvedBy = session.user.id; }
        else if (validatedData.data.status === "REJECTED" || validatedData.data.status === "SUSPENDED") { updateData.approvedAt = null; updateData.approvedBy = null; }
        await db.update(vendors).set(updateData).where(eq(vendors.id, id));
        const [updated] = await db.select().from(vendors).where(eq(vendors.id, id)).limit(1);
        return NextResponse.json({ message: `Vendor ${validatedData.data.status.toLowerCase()} successfully`, vendor: updated });
    } catch (error) { console.error("Error updating vendor:", error); return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 }); }
}
