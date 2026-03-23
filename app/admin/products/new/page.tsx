export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { categories, collections } from '@/lib/schema';
import { eq, asc } from 'drizzle-orm';
import { ProductForm } from '@/components/admin/ProductForm';
import { createProduct } from '@/lib/actions/products';

export default async function NewProductPage() {
    const [categoryList, collectionList] = await Promise.all([
        db.select().from(categories).where(eq(categories.active, true)).orderBy(asc(categories.sortOrder), asc(categories.name)),
        db.select({ id: collections.id, name: collections.name }).from(collections).where(eq(collections.active, true)).orderBy(asc(collections.sortOrder)),
    ]);

    return (
        <div className="space-y-6 pb-10">
            <ProductForm categories={categoryList} collections={collectionList} action={createProduct} />
        </div>
    );
}
