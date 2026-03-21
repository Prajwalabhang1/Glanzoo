export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// ─── Auth helper ────────────────────────────────────────────────────────────

async function requireAdmin() {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') return null;
    return session;
}

// ─── Utility: collect all descendant IDs for a category ─────────────────────
// Used for circular-reference detection and cascade operations.

async function getDescendantIds(categoryId: string): Promise<string[]> {
    const result: string[] = [];
    const queue = [categoryId];

    while (queue.length > 0) {
        const current = queue.shift()!;
        const children = await prisma.category.findMany({
            where: { parentId: current },
            select: { id: true },
        });
        for (const child of children) {
            result.push(child.id);
            queue.push(child.id);
        }
    }

    return result;
}

// ─── GET /api/admin/categories ───────────────────────────────────────────────
// Returns a flat list of ALL categories (no depth limit).
// The frontend is responsible for building the tree client-side.
// Supports ?public=true for unauthenticated public/storefront access.

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const publicOnly = searchParams.get('public') === 'true';

        if (!publicOnly) {
            const session = await requireAdmin();
            if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const where = publicOnly ? { active: true } : undefined;

        const categories = await prisma.category.findMany({
            where,
            include: {
                _count: { select: { products: true } },
            },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

// ─── POST /api/admin/categories ──────────────────────────────────────────────
// Create a new category. Validates slug uniqueness.

export async function POST(req: NextRequest) {
    try {
        const session = await requireAdmin();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { name, slug, description, icon, image, parentId, active, sortOrder } = body;

        if (!name?.trim() || !slug?.trim()) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
        }

        // Validate slug format
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            return NextResponse.json(
                { error: 'Slug must be lowercase letters, numbers, and hyphens only' },
                { status: 400 }
            );
        }

        // Check slug uniqueness
        const existing = await prisma.category.findUnique({ where: { slug } });
        if (existing) {
            return NextResponse.json({ error: `Slug "${slug}" is already in use` }, { status: 400 });
        }

        // Validate parentId exists
        if (parentId) {
            const parent = await prisma.category.findUnique({ where: { id: parentId } });
            if (!parent) {
                return NextResponse.json({ error: 'Parent category not found' }, { status: 400 });
            }
        }

        const category = await prisma.category.create({
            data: {
                name: name.trim(),
                slug,
                description: description?.trim() || null,
                icon: icon?.trim() || null,
                image: image?.trim() || null,
                parentId: parentId || null,
                active: active !== false,
                sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}

// ─── PATCH /api/admin/categories ─────────────────────────────────────────────
// Update a category. Guards: slug uniqueness, circular hierarchy, cascade deactivation.

export async function PATCH(req: NextRequest) {
    try {
        const session = await requireAdmin();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { id, name, slug, description, icon, image, parentId, active, sortOrder } = body;

        if (!id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }

        // Verify the category exists
        const existing = await prisma.category.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // ── Slug uniqueness check ──────────────────────────────────────────
        if (slug && slug !== existing.slug) {
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
                return NextResponse.json(
                    { error: 'Slug must be lowercase letters, numbers, and hyphens only' },
                    { status: 400 }
                );
            }
            const slugConflict = await prisma.category.findFirst({
                where: { slug, NOT: { id } },
            });
            if (slugConflict) {
                return NextResponse.json(
                    { error: `Slug "${slug}" is already used by "${slugConflict.name}"` },
                    { status: 400 }
                );
            }
        }

        // ── Circular hierarchy check ───────────────────────────────────────
        if (parentId !== undefined && parentId !== null && parentId !== '') {
            if (parentId === id) {
                return NextResponse.json(
                    { error: 'A category cannot be its own parent' },
                    { status: 400 }
                );
            }
            const descendants = await getDescendantIds(id);
            if (descendants.includes(parentId)) {
                return NextResponse.json(
                    { error: 'Cannot set a descendant category as the parent (circular reference)' },
                    { status: 400 }
                );
            }
        }

        // ── Update the category ────────────────────────────────────────────
        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name.trim();
        if (slug !== undefined) updateData.slug = slug;
        if (description !== undefined) updateData.description = description?.trim() || null;
        if (icon !== undefined) updateData.icon = icon?.trim() || null;
        if (image !== undefined) updateData.image = image?.trim() || null;
        if (parentId !== undefined) updateData.parentId = parentId || null;
        if (active !== undefined) updateData.active = active;
        if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

        const category = await prisma.category.update({
            where: { id },
            data: updateData,
        });

        // ── Cascade deactivation to all descendants ────────────────────────
        if (active === false && existing.active === true) {
            const descendants = await getDescendantIds(id);
            if (descendants.length > 0) {
                await prisma.category.updateMany({
                    where: { id: { in: descendants } },
                    data: { active: false },
                });
            }
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

// ─── PATCH /api/admin/categories/reorder ─────────────────────────────────────
// Special endpoint for swapping sort order of two categories.
// Called as PATCH with { action: 'reorder', id, direction: 'up' | 'down' }

// ─── DELETE /api/admin/categories ────────────────────────────────────────────
// Deletes a category after checking for products and children.

export async function DELETE(req: NextRequest) {
    try {
        const session = await requireAdmin();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }

        // Check for products directly assigned
        const productCount = await prisma.product.count({ where: { categoryId: id } });
        if (productCount > 0) {
            return NextResponse.json(
                { error: `Cannot delete: ${productCount} product(s) are assigned to this category. Reassign them first.` },
                { status: 400 }
            );
        }

        // Check for child categories
        const childCount = await prisma.category.count({ where: { parentId: id } });
        if (childCount > 0) {
            return NextResponse.json(
                { error: `Cannot delete: ${childCount} sub-categor${childCount === 1 ? 'y' : 'ies'} exist. Delete them first.` },
                { status: 400 }
            );
        }

        await prisma.category.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
