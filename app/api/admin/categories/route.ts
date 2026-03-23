export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories, products } from '@/lib/schema';
import { eq, asc, and, count, ne, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';

function cuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

async function requireAdmin() {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') return null;
    return session;
}

async function getDescendantIds(categoryId: string): Promise<string[]> {
    const result: string[] = [];
    const queue = [categoryId];
    while (queue.length > 0) {
        const current = queue.shift()!;
        const children = await db.select({ id: categories.id }).from(categories).where(eq(categories.parentId, current));
        for (const child of children) { result.push(child.id); queue.push(child.id); }
    }
    return result;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const publicOnly = searchParams.get('public') === 'true';
        if (!publicOnly) {
            const session = await requireAdmin();
            if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const rows = await db.select().from(categories)
            .where(publicOnly ? eq(categories.active, true) : undefined)
            .orderBy(asc(categories.sortOrder), asc(categories.name));
        // Add product count for each category
        const withCount = await Promise.all(rows.map(async (cat) => {
            const [{ productCount }] = await db.select({ productCount: count() }).from(products).where(eq(products.categoryId, cat.id));
            return { ...cat, _count: { products: productCount } };
        }));
        return NextResponse.json(withCount);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await requireAdmin();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { name, slug, description, icon, image, parentId, active, sortOrder } = await req.json();
        if (!name?.trim() || !slug?.trim()) return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return NextResponse.json({ error: 'Slug must be lowercase letters, numbers, and hyphens only' }, { status: 400 });
        const [existing] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug)).limit(1);
        if (existing) return NextResponse.json({ error: `Slug "${slug}" is already in use` }, { status: 400 });
        if (parentId) {
            const [parent] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, parentId)).limit(1);
            if (!parent) return NextResponse.json({ error: 'Parent category not found' }, { status: 400 });
        }
        const id = cuid();
        await db.insert(categories).values({ id, name: name.trim(), slug, description: description?.trim() || null, icon: icon?.trim() || null, image: image?.trim() || null, parentId: parentId || null, active: active !== false, sortOrder: typeof sortOrder === 'number' ? sortOrder : 0 });
        const [category] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await requireAdmin();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { id, name, slug, description, icon, image, parentId, active, sortOrder } = await req.json();
        if (!id) return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        const [existing] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
        if (!existing) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        if (slug && slug !== existing.slug) {
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return NextResponse.json({ error: 'Slug must be lowercase letters, numbers, and hyphens only' }, { status: 400 });
            const [conflict] = await db.select({ id: categories.id, name: categories.name }).from(categories).where(and(eq(categories.slug, slug), ne(categories.id, id))).limit(1);
            if (conflict) return NextResponse.json({ error: `Slug "${slug}" is already used by "${conflict.name}"` }, { status: 400 });
        }
        if (parentId && parentId !== null && parentId !== '') {
            if (parentId === id) return NextResponse.json({ error: 'A category cannot be its own parent' }, { status: 400 });
            const descendants = await getDescendantIds(id);
            if (descendants.includes(parentId)) return NextResponse.json({ error: 'Cannot set a descendant category as the parent (circular reference)' }, { status: 400 });
        }
        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name.trim();
        if (slug !== undefined) updateData.slug = slug;
        if (description !== undefined) updateData.description = description?.trim() || null;
        if (icon !== undefined) updateData.icon = icon?.trim() || null;
        if (image !== undefined) updateData.image = image?.trim() || null;
        if (parentId !== undefined) updateData.parentId = parentId || null;
        if (active !== undefined) updateData.active = active;
        if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
        await db.update(categories).set(updateData).where(eq(categories.id, id));
        if (active === false && existing.active === true) {
            const descendants = await getDescendantIds(id);
            if (descendants.length > 0) await db.update(categories).set({ active: false }).where(inArray(categories.id, descendants));
        }
        const [updated] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await requireAdmin();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        const [{ productCount }] = await db.select({ productCount: count() }).from(products).where(eq(products.categoryId, id));
        if (productCount > 0) return NextResponse.json({ error: `Cannot delete: ${productCount} product(s) are assigned to this category. Reassign them first.` }, { status: 400 });
        const [{ childCount }] = await db.select({ childCount: count() }).from(categories).where(eq(categories.parentId, id));
        if (childCount > 0) return NextResponse.json({ error: `Cannot delete: ${childCount} sub-categor${childCount === 1 ? 'y' : 'ies'} exist. Delete them first.` }, { status: 400 });
        await db.delete(categories).where(eq(categories.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
