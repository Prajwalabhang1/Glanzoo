import { z } from 'zod';

// ============================================
// VALIDATION SCHEMAS
// ============================================

// User Schemas
export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// Address Schema
export const addressSchema = z.object({
    fullName: z.string().min(2, 'Full name is required'),
    phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
    address: z.string().min(10, 'Address must be at least 10 characters'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
    isDefault: z.boolean().optional(),
});

// Checkout Schema
export const checkoutSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
    address: z.string().min(10, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
});

// Product Schema (Admin)
export const productSchema = z.object({
    slug: z.string().min(1, 'Slug is required'),
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional(),
    price: z.number().positive('Price must be positive'),
    salePrice: z.number().positive().optional(),
    images: z.array(z.string()).min(1, 'At least one image is required'),
    categoryId: z.string().min(1, 'Category is required'),
    variants: z.array(z.object({
        size: z.string(),
        sku: z.string(),
        stock: z.number().int().min(0),
    })),
    freeShipping: z.boolean().optional(),
    featured: z.boolean().optional(),
    fabric: z.string().optional(),
    topLength: z.string().optional(),
    bottomLength: z.string().optional(),
    shippingDays: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDesc: z.string().optional(),
});

// Review Schema
export const reviewSchema = z.object({
    productId: z.string(),
    rating: z.number().int().min(1).max(5),
    title: z.string().optional(),
    comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
});

// Coupon Schema
export const couponSchema = z.object({
    code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
    type: z.enum(['PERCENTAGE', 'FIXED']),
    value: z.number().positive('Value must be positive'),
    minOrder: z.number().positive().optional(),
    maxDiscount: z.number().positive().optional(),
    validFrom: z.string().or(z.date()),
    validUntil: z.string().or(z.date()),
    usageLimit: z.number().int().positive().optional(),
    active: z.boolean().optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
