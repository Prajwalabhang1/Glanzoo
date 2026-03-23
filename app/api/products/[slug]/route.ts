import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, categories, productVariants, reviews, vendors } from '@/lib/schema';
import { eq, and, inArray, count, sql, avg } from 'drizzle-orm';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const [category, variants, reviewRows, [vendor]] = await Promise.all([
            db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1),
            db.select().from(productVariants).where(eq(productVariants.productId, product.id)),
            db.select().from(reviews).where(and(eq(reviews.productId, product.id), eq(reviews.approved, true))),
            db.select({ businessName: vendors.businessName }).from(vendors).where(eq(vendors.id, product.vendorId ?? '')).limit(1),
        ]);

        const avgRating = reviewRows.length > 0
            ? reviewRows.reduce((s, r) => s + r.rating, 0) / reviewRows.length
            : 0;

        return NextResponse.json({
            product: {
                ...product,
                images: JSON.parse(product.images),
                category: category[0] ?? null,
                variants,
                reviews: reviewRows,
                vendor: vendor ? { businessName: vendor.businessName } : null,
                rating: { avg: Math.round(avgRating * 10) / 10, count: reviewRows.length },
            },
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body = await request.json();
        const { name, description, price, salePrice, images, categoryId,
            freeShipping, featured, fabric, topLength, bottomLength, shippingDays } = body;

        const updateData: Record<string, unknown> = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price) updateData.price = price;
        if (salePrice !== undefined) updateData.salePrice = salePrice;
        if (images) updateData.images = JSON.stringify(images);
        if (categoryId) updateData.categoryId = categoryId;
        if (freeShipping !== undefined) updateData.freeShipping = freeShipping;
        if (featured !== undefined) updateData.featured = featured;
        if (fabric !== undefined) updateData.fabric = fabric;
        if (topLength !== undefined) updateData.topLength = topLength;
        if (bottomLength !== undefined) updateData.bottomLength = bottomLength;
        if (shippingDays) updateData.shippingDays = shippingDays;

        await db.update(products).set(updateData).where(eq(products.slug, slug));
        const [updated] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
        const variants = await db.select().from(productVariants).where(eq(productVariants.productId, updated.id));

        return NextResponse.json({ product: { ...updated, images: JSON.parse(updated.images), variants } });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const [product] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
        if (product) {
            await db.delete(productVariants).where(eq(productVariants.productId, product.id));
            await db.delete(products).where(eq(products.id, product.id));
        }
        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
