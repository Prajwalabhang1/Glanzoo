import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function checkAdmin() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return false;
    return true;
}

export async function GET() {
    if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const collections = await prisma.collection.findMany({
            orderBy: { sortOrder: 'asc' },
            include: { _count: { select: { products: true } } }
        });
        return NextResponse.json({ collections });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await req.json();
        const { name, slug, description, image, banner, featured, type, sortOrder, active } = body;

        const collection = await prisma.collection.create({
            data: { name, slug, description, image, banner, featured, type, sortOrder, active }
        });
        return NextResponse.json({ collection });
    } catch {
        return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
    }
}
