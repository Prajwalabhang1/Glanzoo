export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// ─── Utility: build tree from flat list ──────────────────────────────────────
type FlatCategory = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    image: string | null;
    active: boolean;
    sortOrder: number;
    parentId: string | null;
};

type TreeCategory = FlatCategory & { children: TreeCategory[] };

function buildTree(flat: FlatCategory[]): TreeCategory[] {
    const map = new Map<string, TreeCategory>();
    const roots: TreeCategory[] = [];

    for (const cat of flat) {
        map.set(cat.id, { ...cat, children: [] });
    }

    for (const cat of flat) {
        if (cat.parentId && map.has(cat.parentId)) {
            map.get(cat.parentId)!.children.push(map.get(cat.id)!);
        } else {
            roots.push(map.get(cat.id)!);
        }
    }

    return roots;
}

// ─── GET /api/categories ─────────────────────────────────────────────────────
// Public categories API - used for vendor product forms and frontend nav.
// ?flat=true  → flat list (product selectors, vendor forms)
// ?tree=true  → full nested tree (navigation menus)
// Default     → flat list (backwards compatible with most consumers)
// ?active=false → include inactive categories (admin only usage)

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const wantTree = searchParams.get('tree') === 'true';
        const activeOnly = searchParams.get('active') !== 'false'; // Default to active only

        // Always fetch the full flat list — no depth limitation
        const categories = await prisma.category.findMany({
            where: activeOnly ? { active: true } : undefined,
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        });

        if (wantTree) {
            return NextResponse.json(buildTree(categories));
        }

        // Default: flat list
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
