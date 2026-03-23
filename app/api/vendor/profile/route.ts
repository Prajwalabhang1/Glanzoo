export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { vendors, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { vendorProfileUpdateSchema, vendorBankDetailsSchema } from "@/lib/validations/vendor";

async function checkVendorAccess() {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized", status: 401 };
    if (session.user.role !== "VENDOR") return { error: "Forbidden: Vendor access required", status: 403 };
    return { session };
}

export async function GET() {
    try {
        const accessCheck = await checkVendorAccess();
        if ("error" in accessCheck) return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });
        const { session } = accessCheck;
        const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, session.user.id)).limit(1);
        if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
        const [user] = await db.select({ id: users.id, email: users.email, name: users.name, phone: users.phone }).from(users).where(eq(users.id, session.user.id)).limit(1);
        const profile = {
            ...vendor, businessAddress: JSON.parse(vendor.businessAddress), user: user ?? null,
            hasBankDetails: !!vendor.bankDetails,
            bankDetails: vendor.bankDetails ? (() => { try { const d = JSON.parse(vendor.bankDetails!); return { bankName: d.bankName, accountName: d.accountName, maskedAccount: `XXXX${d.accountNumber.slice(-4)}`, ifscCode: d.ifscCode }; } catch { return null; } })() : null,
        };
        return NextResponse.json({ vendor: profile });
    } catch (error) { return NextResponse.json({ error: "Failed to fetch vendor profile" }, { status: 500 }); }
}

export async function PUT(request: Request) {
    try {
        const accessCheck = await checkVendorAccess();
        if ("error" in accessCheck) return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });
        const { session } = accessCheck;
        const body = await request.json();
        const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, session.user.id)).limit(1);
        if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
        const validatedData = vendorProfileUpdateSchema.safeParse(body);
        if (!validatedData.success) return NextResponse.json({ error: "Validation failed", details: validatedData.error.errors }, { status: 400 });
        const d = validatedData.data;
        const updateData: Record<string, any> = {};
        if (d.businessName) updateData.businessName = d.businessName;
        if (d.businessType) updateData.businessType = d.businessType;
        if (d.description !== undefined) updateData.description = d.description;
        if (d.logo !== undefined) updateData.logo = d.logo;
        if (d.banner !== undefined) updateData.banner = d.banner;
        if (d.contactEmail) updateData.contactEmail = d.contactEmail.toLowerCase();
        if (d.contactPhone) updateData.contactPhone = d.contactPhone;
        if (d.businessAddress) updateData.businessAddress = JSON.stringify(d.businessAddress);
        if (d.gstNumber !== undefined) updateData.gstNumber = d.gstNumber || null;
        if (d.panNumber !== undefined) updateData.panNumber = d.panNumber || null;
        await db.update(vendors).set(updateData).where(eq(vendors.id, vendor.id));
        const [updated] = await db.select().from(vendors).where(eq(vendors.id, vendor.id)).limit(1);
        return NextResponse.json({ message: "Profile updated successfully", vendor: { ...updated, businessAddress: JSON.parse(updated.businessAddress) } });
    } catch (error) { return NextResponse.json({ error: "Failed to update vendor profile" }, { status: 500 }); }
}

export async function POST(request: Request) {
    try {
        const accessCheck = await checkVendorAccess();
        if ("error" in accessCheck) return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });
        const { session } = accessCheck;
        const body = await request.json();
        const validatedData = vendorBankDetailsSchema.safeParse(body);
        if (!validatedData.success) return NextResponse.json({ error: "Validation failed", details: validatedData.error.errors }, { status: 400 });
        const { accountNumber, ifscCode, bankName, accountName, accountType } = validatedData.data;
        const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, session.user.id)).limit(1);
        if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
        const bankDetails = JSON.stringify({ accountNumber, ifscCode, bankName, accountName, accountType: accountType || "SAVINGS", updatedAt: new Date().toISOString() });
        await db.update(vendors).set({ bankDetails }).where(eq(vendors.id, vendor.id));
        return NextResponse.json({ message: "Bank details updated successfully" });
    } catch (error) { return NextResponse.json({ error: "Failed to update bank details" }, { status: 500 }); }
}
