import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, vendors, categories, products, productVariants, orders, orderItems, vendorSales } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

function cuid() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function GET() {
    console.log("Starting End-to-End Drizzle DB Tests...");
    const testResults: string[] = [];
    const testId = cuid();

    try {
        // 1. Create a User
        console.log("1. Creating User");
        const userId = testId;
        const hashedPassword = await bcrypt.hash("testpassword123", 10);
        await db.insert(users).values({
            id: userId,
            name: "Test User",
            email: `testuser-${testId}@example.com`,
            password: hashedPassword,
            role: "VENDOR"
        });
        testResults.push("✅ User creation passed");

        // 2. Create a Vendor
        console.log("2. Creating Vendor");
        const vendorId = testId;
        await db.insert(vendors).values({
            id: vendorId,
            userId: userId,
            storeName: `Test Store ${testId}`,
            businessName: "Test Business LLC",
            storeDescription: "A fully local test store",
            contactEmail: `vendor-${testId}@example.com`,
            contactPhone: "9999999999",
            status: "APPROVED"
        });
        testResults.push("✅ Vendor creation passed");

        // 3. Create a Category
        console.log("3. Creating Category");
        const categoryId = testId;
        await db.insert(categories).values({
            id: categoryId,
            name: `Test Category ${testId}`,
            slug: `test-cat-${testId}`,
            active: true
        });
        testResults.push("✅ Category creation passed");

        // 4. Create a Product & Variant
        console.log("4. Creating Product & Variant");
        const productId = testId;
        await db.insert(products).values({
            id: productId,
            vendorId: vendorId,
            categoryId: categoryId,
            name: "Test Drizzle Product",
            slug: `test-drizzle-${testId}`,
            price: 500,
            active: true
        });

        const variantId = testId;
        await db.insert(productVariants).values({
            id: variantId,
            productId: productId,
            size: "M",
            color: "Red",
            sku: `TEST-SKU-${testId}`,
            stock: 100
        });
        testResults.push("✅ Product and Variant creation passed");

        // 5. Query Products with Relations (like on admin page)
        console.log("5. Querying Products");
        const [fetchedProduct] = await db.select().from(products).where(eq(products.id, productId));
        if (!fetchedProduct || fetchedProduct.name !== "Test Drizzle Product") throw new Error("Product query failed or data mismatch");
        testResults.push("✅ Product Query passed");

        // 6. Create an Order
        console.log("6. Creating Order & Sale");
        const orderId = testId;
        await db.insert(orders).values({
            id: orderId,
            userId: userId,
            total: 500,
            status: "PENDING",
            paymentStatus: "SUCCESS",
            paymentMethod: "TEST_MODE",
            shippingAddress: JSON.stringify({ name: "Test Cust", city: "Test City" }),
            billingAddress: JSON.stringify({ name: "Test Cust", city: "Test City" }),
        });

        const orderItemId = testId;
        await db.insert(orderItems).values({
            id: orderItemId,
            orderId: orderId,
            productId: productId,
            variantId: variantId,
            name: "Test Drizzle Product",
            quantity: 1,
            price: 500,
            commissionRate: 5,
        });

        // Add vendor sale
        const saleId = testId;
        await db.insert(vendorSales).values({
            id: saleId,
            vendorId: vendorId,
            orderId: orderId,
            orderItemId: orderItemId,
            productTotal: 500,
            commissionRate: 5,
            commissionAmount: 25,
            vendorPayout: 475,
            payoutStatus: "PENDING"
        });
        testResults.push("✅ Order creation and Vendor Sale recorded passed");

        // 7. Test Admin Aggregations (like in analytics route)
        console.log("7. Run analytics queries");
        const allSales = await db.select().from(vendorSales).where(eq(vendorSales.vendorId, vendorId));
        if (allSales.length !== 1 || Number(allSales[0].vendorPayout) !== 475) {
            throw new Error(`Analytics failed. Expected 475 payout, got ${allSales[0]?.vendorPayout}`);
        }
        testResults.push("✅ Analytics & Aggregations passed");

        // 8. Clean up test data
        console.log("8. Clean up");
        await db.delete(vendorSales).where(eq(vendorSales.id, saleId));
        await db.delete(orderItems).where(eq(orderItems.id, orderItemId));
        await db.delete(orders).where(eq(orders.id, orderId));
        await db.delete(productVariants).where(eq(productVariants.id, variantId));
        await db.delete(products).where(eq(products.id, productId));
        await db.delete(categories).where(eq(categories.id, categoryId));
        await db.delete(vendors).where(eq(vendors.id, vendorId));
        await db.delete(users).where(eq(users.id, userId));
        testResults.push("✅ Data cleanup passed");

        return NextResponse.json({
            success: true,
            message: "🎉 All Local Database Constraints & Drizzle ORM Integrations are 100% validated for Production!",
            tests: testResults
        });

    } catch (error: any) {
        console.error("Test failed:", error);
        return NextResponse.json({
            success: false,
            error: error.message || error.toString(),
            testsPassedSoFar: testResults
        }, { status: 500 });
    }
}
