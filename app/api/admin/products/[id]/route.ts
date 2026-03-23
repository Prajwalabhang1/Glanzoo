import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { products, productVariants, categories } from '@/lib/schema';
import { eq } from 'drizzle-orm';

async function checkAdminAccess() {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized', status: 401 };
    if (session.user.role !== 'ADMIN') return { error: 'Forbidden: Admin access required', status: 403 };
    return null;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const accessError = await checkAdminAccess();
        if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status });
        const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        const [variantRows, [category]] = await Promise.all([
            db.select().from(productVariants).where(eq(productVariants.productId, id)),
            db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1),
        ]);
        return NextResponse.json({ ...product, images: JSON.parse(product.images), tags: product.tags ? JSON.parse(product.tags) : [], variants: variantRows, category: category ?? null });
    } catch (error) { console.error('Error fetching product:', error); return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 }); }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const accessError = await checkAdminAccess();
        if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status });
        const { name, description, price, salePrice, active, fabric, topLength, bottomLength, shippingDays, categoryId, images, tags } = await request.json();
        await db.update(products).set({ name, description, price, salePrice, active, fabric, topLength, bottomLength, shippingDays, categoryId, images: Array.isArray(images) ? JSON.stringify(images) : images, tags: tags ? (Array.isArray(tags) ? JSON.stringify(tags) : tags) : null }).where(eq(products.id, id));
        const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
        const variantRows = await db.select().from(productVariants).where(eq(productVariants.productId, id));
        return NextResponse.json({ message: 'Product updated successfully', product: { ...product, images: JSON.parse(product.images), tags: product.tags ? JSON.parse(product.tags) : [], variants: variantRows } });
    } catch (error) { console.error('Error updating product:', error); return NextResponse.json({ error: 'Failed to update product' }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const accessError = await checkAdminAccess();
        if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status });
        await db.delete(productVariants).where(eq(productVariants.productId, id));
        await db.delete(products).where(eq(products.id, id));
        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) { console.error('Error deleting product:', error); return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 }); }
}
