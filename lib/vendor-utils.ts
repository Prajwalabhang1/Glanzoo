/**
 * Vendor Utility Functions
 * Production-grade utilities for vendor management, validation, and commission calculations
 */

// ============================================
// COMMISSION CALCULATIONS
// ============================================

/**
 * Calculate commission amount from total
 * @param amount - Product total amount
 * @param rate - Commission percentage (e.g., 10 for 10%)
 * @returns Commission amount
 */
export function calculateCommission(amount: number, rate: number): number {
    if (amount < 0 || rate < 0 || rate > 100) {
        throw new Error("Invalid amount or commission rate");
    }
    return Number(((amount * rate) / 100).toFixed(2));
}

/**
 * Calculate vendor payout after commission
 * @param amount - Product total amount
 * @param rate - Commission percentage
 * @returns Vendor payout amount (amount - commission)
 */
export function calculateVendorPayout(amount: number, rate: number): number {
    const commission = calculateCommission(amount, rate);
    return Number((amount - commission).toFixed(2));
}

/**
 * Calculate breakdown for vendor sale
 * @param productTotal - Total amount from vendor's products in order
 * @param commissionRate - Commission percentage
 * @returns Object with productTotal, commission, and payout
 */
export function calculateVendorSaleBreakdown(productTotal: number, commissionRate: number) {
    const commissionAmount = calculateCommission(productTotal, commissionRate);
    const vendorPayout = calculateVendorPayout(productTotal, commissionRate);

    return {
        productTotal: Number(productTotal.toFixed(2)),
        commissionRate,
        commissionAmount,
        vendorPayout,
    };
}

// ============================================
// VENDOR STATUS UTILITIES
// ============================================

export type VendorStatus = "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";

/**
 * Check if vendor can manage products
 * @param status - Vendor status
 * @returns true if vendor is approved
 */
export function canVendorManageProducts(status: string): boolean {
    return status === "APPROVED";
}

/**
 * Check if vendor is approved
 * @param status - Vendor status
 * @returns true if status is APPROVED
 */
export function isApprovedVendor(status: string): boolean {
    return status === "APPROVED";
}

/**
 * Check if vendor is pending approval
 * @param status - Vendor status
 * @returns true if status is PENDING
 */
export function isPendingVendor(status: string): boolean {
    return status === "PENDING";
}

/**
 * Format vendor status for display
 * @param status - Vendor status
 * @returns Object with label and color for UI
 */
export function formatVendorStatus(status: string): { label: string; color: string } {
    const statusMap: Record<string, { label: string; color: string }> = {
        PENDING: { label: "Pending Approval", color: "yellow" },
        APPROVED: { label: "Approved", color: "green" },
        SUSPENDED: { label: "Suspended", color: "red" },
        REJECTED: { label: "Rejected", color: "gray" },
    };

    return statusMap[status] || { label: "Unknown", color: "gray" };
}

// ============================================
// PRODUCT APPROVAL STATUS
// ============================================

export type ProductApprovalStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

/**
 * Format product approval status for display
 * @param status - Product approval status
 * @returns Object with label and color
 */
export function formatProductApprovalStatus(status: string): { label: string; color: string } {
    const statusMap: Record<string, { label: string; color: string }> = {
        DRAFT: { label: "Draft", color: "gray" },
        PENDING: { label: "Pending Review", color: "yellow" },
        APPROVED: { label: "Approved", color: "green" },
        REJECTED: { label: "Rejected", color: "red" },
    };

    return statusMap[status] || { label: "Unknown", color: "gray" };
}

/**
 * Check if product is publicly visible
 * @param approvalStatus - Product approval status
 * @param active - Product active flag
 * @returns true if product should be shown on storefront
 */
export function isProductPublic(approvalStatus: string, active: boolean): boolean {
    return approvalStatus === "APPROVED" && active;
}

// ============================================
// DOCUMENT VALIDATION
// ============================================

/**
 * Validate GST number format (India)
 * Format: 22AAAAA0000A1Z5
 * @param gst - GST number string
 * @returns true if valid format
 */
export function validateGSTNumber(gst: string): boolean {
    if (!gst) return false;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst.toUpperCase());
}

/**
 * Validate PAN number format (India)
 * Format: AAAAA0000A
 * @param pan - PAN number string
 * @returns true if valid format
 */
export function validatePAN(pan: string): boolean {
    if (!pan) return false;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
}

/**
 * Validate IFSC code format (India)
 * Format: AAAA0BBBBBB (4 letters, 0, 6 alphanumeric)
 * @param ifsc - IFSC code string
 * @returns true if valid format
 */
export function validateIFSC(ifsc: string): boolean {
    if (!ifsc) return false;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc.toUpperCase());
}

/**
 * Mask account number for display
 * @param accountNumber - Full account number
 * @returns Masked account number (e.g., "XXXX XXXX 1234")
 */
export function maskAccountNumber(accountNumber: string): string {
    if (!accountNumber || accountNumber.length < 4) {
        return "XXXX";
    }
    const lastFour = accountNumber.slice(-4);
    return `XXXX XXXX ${lastFour}`;
}

// ============================================
// PAYOUT STATUS UTILITIES
// ============================================

export type PayoutStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

/**
 * Format payout status for display
 * @param status - Payout status
 * @returns Object with label and color
 */
export function formatPayoutStatus(status: string): { label: string; color: string } {
    const statusMap: Record<string, { label: string; color: string }> = {
        PENDING: { label: "Pending", color: "yellow" },
        PROCESSING: { label: "Processing", color: "blue" },
        COMPLETED: { label: "Completed", color: "green" },
        FAILED: { label: "Failed", color: "red" },
    };

    return statusMap[status] || { label: "Unknown", color: "gray" };
}

// ============================================
// VENDOR METRICS
// ============================================

/**
 * Calculate vendor performance metrics
 * @param sales - Array of vendor sales
 * @returns Metrics object
 */
export function calculateVendorMetrics(sales: Array<{
    productTotal: number;
    commissionAmount: number;
    vendorPayout: number;
    payoutStatus: string;
    createdAt: Date;
}>) {
    const totalSales = sales.reduce((sum, sale) => sum + sale.productTotal, 0);
    const totalCommission = sales.reduce((sum, sale) => sum + sale.commissionAmount, 0);
    const totalPayout = sales.reduce((sum, sale) => sum + sale.vendorPayout, 0);
    const pendingPayout = sales
        .filter(sale => sale.payoutStatus === "PENDING" || sale.payoutStatus === "PROCESSING")
        .reduce((sum, sale) => sum + sale.vendorPayout, 0);

    return {
        totalSales: Number(totalSales.toFixed(2)),
        totalCommission: Number(totalCommission.toFixed(2)),
        totalPayout: Number(totalPayout.toFixed(2)),
        pendingPayout: Number(pendingPayout.toFixed(2)),
        salesCount: sales.length,
        averageOrderValue: sales.length > 0 ? Number((totalSales / sales.length).toFixed(2)) : 0,
    };
}

// ============================================
// SLUG GENERATION
// ============================================

/**
 * Generate URL-friendly slug from business name
 * @param businessName - Business name
 * @returns URL-safe slug
 */
export function generateVendorSlug(businessName: string): string {
    return businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Generate unique SKU for vendor product
 * @param vendorId - Vendor ID
 * @param productName - Product name
 * @returns Unique SKU
 */
export function generateVendorSKU(vendorId: string, productName: string): string {
    const vendorPrefix = vendorId.slice(0, 6).toUpperCase();
    const namePart = productName
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 4)
        .toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `${vendorPrefix}-${namePart}-${random}`;
}
