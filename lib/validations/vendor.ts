import { z } from "zod";

// ============================================
// VENDOR REGISTRATION SCHEMA
// ============================================

export const vendorRegistrationSchema = z.object({
    // User Account
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),

    // Business Information
    businessName: z.string().min(2, "Business name must be at least 2 characters"),
    businessType: z.enum(["INDIVIDUAL", "COMPANY", "PARTNERSHIP"], {
        errorMap: () => ({ message: "Select a valid business type" }),
    }),
    description: z.string().optional(),

    // Contact Information
    contactEmail: z.string().email("Invalid contact email"),
    contactPhone: z.string().regex(/^[0-9]{10}$/, "Contact phone must be 10 digits"),

    // Business Address
    businessAddress: z.object({
        street: z.string().min(5, "Street address is required"),
        city: z.string().min(2, "City is required"),
        state: z.string().min(2, "State is required"),
        pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be 6 digits"),
        country: z.string().default("India"),
    }),

    // Compliance Documents (optional at registration, can be added later)
    gstNumber: z.string()
        .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST number format")
        .optional()
        .or(z.literal("")),
    panNumber: z.string()
        .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number format")
        .optional()
        .or(z.literal("")),
});

// ============================================
// VENDOR PROFILE UPDATE SCHEMA
// ============================================

export const vendorProfileUpdateSchema = z.object({
    businessName: z.string().min(2).optional(),
    businessType: z.enum(["INDIVIDUAL", "COMPANY", "PARTNERSHIP"]).optional(),
    description: z.string().optional(),
    logo: z.string().url().optional().or(z.literal("")),
    banner: z.string().url().optional().or(z.literal("")),

    contactEmail: z.string().email().optional(),
    contactPhone: z.string().regex(/^[0-9]{10}$/).optional(),

    businessAddress: z.object({
        street: z.string().min(5),
        city: z.string().min(2),
        state: z.string().min(2),
        pincode: z.string().regex(/^[0-9]{6}$/),
        country: z.string(),
    }).optional(),

    gstNumber: z.string()
        .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
        .optional()
        .or(z.literal("")),
    panNumber: z.string()
        .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
        .optional()
        .or(z.literal("")),
});

// ============================================
// BANK DETAILS SCHEMA
// ============================================

export const vendorBankDetailsSchema = z.object({
    accountNumber: z.string().min(9).max(18),
    confirmAccountNumber: z.string().min(9).max(18),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"),
    bankName: z.string().min(2),
    accountName: z.string().min(2),
    accountType: z.enum(["SAVINGS", "CURRENT"]).optional(),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Account numbers do not match",
    path: ["confirmAccountNumber"],
});

// ============================================
// VENDOR PRODUCT CREATION SCHEMA
// ============================================

export const vendorProductSchema = z.object({
    name: z.string().min(3, "Product name must be at least 3 characters"),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
    description: z.string().min(10, "Description must be at least 10 characters").optional(),
    shortDescription: z.string().max(200).optional(),

    price: z.number().positive("Price must be positive"),
    salePrice: z.number().positive().optional(),

    categoryId: z.string().min(1, "Category is required"),

    images: z.array(z.string().url()).min(1, "At least one image is required"),

    variants: z.array(z.object({
        size: z.string().min(1),
        stock: z.number().int().nonnegative(),
        sku: z.string().optional(),
    })).min(1, "At least one variant is required"),

    // Optional fields
    material: z.string().optional(),
    fabricType: z.string().optional(),
    fabric: z.string().optional(),
    topLength: z.string().optional(),
    bottomLength: z.string().optional(),
    careInstructions: z.string().optional(),
    shippingDays: z.string().default("5-7 days"),
    tags: z.array(z.string()).optional(),

    freeShipping: z.boolean().default(true),
    returnEligible: z.boolean().default(true),
});

// ============================================
// VENDOR APPROVAL SCHEMA (Admin)
// ============================================

export const vendorApprovalSchema = z.object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]),
    approvalNotes: z.string().optional(),
    commissionRate: z.number().min(0).max(100).optional(), // Override default commission
});

// ============================================
// PRODUCT APPROVAL SCHEMA (Admin)
// ============================================

export const productApprovalSchema = z.object({
    approvalStatus: z.enum(["APPROVED", "REJECTED"]),
    rejectionReason: z.string().optional(),
});

// Type exports for TypeScript
export type VendorRegistrationInput = z.infer<typeof vendorRegistrationSchema>;
export type VendorProfileUpdateInput = z.infer<typeof vendorProfileUpdateSchema>;
export type VendorBankDetailsInput = z.infer<typeof vendorBankDetailsSchema>;
export type VendorProductInput = z.infer<typeof vendorProductSchema>;
export type VendorApprovalInput = z.infer<typeof vendorApprovalSchema>;
export type ProductApprovalInput = z.infer<typeof productApprovalSchema>;
