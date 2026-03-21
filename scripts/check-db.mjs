import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

// Simulate the NEW query from page.tsx
const allCategories = await p.category.findMany({
    where: { active: true },
    select: {
        id: true, name: true, slug: true, parentId: true,
        parent: { select: { name: true, slug: true } },
        _count: { select: { products: { where: { active: true } } } },
    },
    orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
})

const subcategories = allCategories.filter(c => c.parentId !== null && !c.name.startsWith('All '))
const rootCategories = allCategories.filter(c => c.parentId === null && !c.name.startsWith('All ') && c.name !== 'All Products')
const displayCategories = subcategories.length > 0 ? subcategories : rootCategories

console.log(`\nTotal categories in DB: ${allCategories.length}`)
console.log(`Subcategories (non-All): ${subcategories.length}`)
console.log(`Root categories (non-All): ${rootCategories.length}`)
console.log(`\n=== CATEGORIES THAT WILL APPEAR IN FILTER SIDEBAR ===`)
displayCategories.forEach(c => console.log(
    `  "${c.name}" | slug:${c.slug} | group:${c.parent?.name ?? '(root)'} | products:${c._count.products}`
))

await p.$disconnect()
