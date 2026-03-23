export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories } from '@/lib/schema';
import { eq, asc } from 'drizzle-orm';

type FlatCategory = {
    id: string; name: string; slug: string;
    description: string | null; icon: string | null;
    image: string | null; active: boolean;
    sortOrder: number; parentId: string | null;
};
type TreeCategory = FlatCategory & { children: TreeCategory[] };

function buildTree(flat: FlatCategory[]): TreeCategory[] {
    const map = new Map<string, TreeCategory>();
    const roots: TreeCategory[] = [];
    for (const cat of flat) map.set(cat.id, { ...cat, children: [] });
    for (const cat of flat) {
        if (cat.parentId && map.has(cat.parentId)) {
            map.get(cat.parentId)!.children.push(map.get(cat.id)!);
        } else {
            roots.push(map.get(cat.id)!);
        }
    }
    return roots;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const wantTree = searchParams.get('tree') === 'true';
        const activeOnly = searchParams.get('active') !== 'false';

        const rows = await db.select({
            id: categories.id, name: categories.name, slug: categories.slug,
            description: categories.description, icon: categories.icon,
            image: categories.image, active: categories.active,
            sortOrder: categories.sortOrder, parentId: categories.parentId,
        }).from(categories)
            .where(activeOnly ? eq(categories.active, true) : undefined)
            .orderBy(asc(categories.sortOrder), asc(categories.name));

        if (wantTree) return NextResponse.json(buildTree(rows));
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
