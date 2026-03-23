export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, vendors } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth-utils";
import { vendorRegistrationSchema } from "@/lib/validations/vendor";

function cuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("[Vendor Register] Received body:", JSON.stringify(body, null, 2));

        const validatedData = vendorRegistrationSchema.safeParse(body);
        if (!validatedData.success) {
            console.log("[Vendor Register] Validation errors:", JSON.stringify(validatedData.error.errors, null, 2));
            return NextResponse.json({ error: "Validation failed", details: validatedData.error.errors }, { status: 400 });
        }

        const { email, password, name, phone, businessName, businessType, description, contactEmail, contactPhone, businessAddress, gstNumber, panNumber } = validatedData.data;

        // Check if user already exists
        const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase())).limit(1);
        if (existingUser) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

        // Check if business name is taken
        const [existingBusiness] = await db.select({ id: vendors.id }).from(vendors).where(eq(vendors.businessName, businessName)).limit(1);
        if (existingBusiness) return NextResponse.json({ error: "Business name already taken" }, { status: 409 });

        const hashedPassword = await hashPassword(password);

        // Create user, then vendor (sequential — no Prisma transaction needed)
        const userId = cuid();
        await db.insert(users).values({ id: userId, email: email.toLowerCase(), password: hashedPassword, name, phone, role: "VENDOR" });

        const vendorId = cuid();
        await db.insert(vendors).values({
            id: vendorId, userId, businessName, businessType,
            description: description || null, contactEmail: contactEmail.toLowerCase(), contactPhone,
            businessAddress: JSON.stringify(businessAddress), gstNumber: gstNumber || null,
            panNumber: panNumber || null, status: "PENDING", commissionRate: 10.0,
        });

        return NextResponse.json({
            message: "Vendor registration successful. Your account is pending approval.",
            vendor: { id: vendorId, businessName, status: "PENDING" },
        }, { status: 201 });
    } catch (error: unknown) {
        console.error("Vendor registration error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to register vendor' }, { status: 500 });
    }
}
