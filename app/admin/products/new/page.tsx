export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';

import { ProductForm } from '@/components/admin/ProductForm';
import { createProduct } from '@/lib/actions/products';

export default async function NewProductPage() {
    const [categories, collections] = await Promise.all([
        prisma.category.findMany({
            where: { active: true },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        }),
        prisma.collection.findMany({
            where: { active: true },
            orderBy: { sortOrder: 'asc' },
            select: { id: true, name: true },
        }),
    ]);

    return (
        <div className="space-y-6 pb-10">
            <ProductForm categories={categories} collections={collections} action={createProduct} />
        </div>
    );
}
