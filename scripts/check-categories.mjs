import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Check all categories
    const allCats = await prisma.category.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            active: true,
            parentId: true,
            _count: { select: { products: true, children: true } }
        }
    })
    console.log('\n=== ALL CATEGORIES ===')
    console.log(JSON.stringify(allCats, null, 2))

    // Check active products count
    const activeProducts = await prisma.product.count({ where: { active: true } })
    console.log('\n=== ACTIVE PRODUCTS COUNT ===', activeProducts)

    // Check products with categories
    const productsWithCats = await prisma.product.findMany({
        where: { active: true },
        select: { name: true, categoryId: true, category: { select: { name: true, slug: true, active: true } } },
        take: 5
    })
    console.log('\n=== SAMPLE PRODUCTS WITH CATEGORIES ===')
    console.log(JSON.stringify(productsWithCats, null, 2))

    // Simulate the EXACT query from page.tsx
    const filteredCats = await prisma.category.findMany({
        where: {
            active: true,
            NOT: [
                { name: { startsWith: 'All ' } },
                { name: { equals: 'All Products' } },
            ],
            products: { some: { active: true } },
            OR: [
                { parentId: { not: null } },
                { children: { none: {} } },
            ],
        },
        select: {
            id: true,
            name: true,
            slug: true,
            parent: { select: { name: true, slug: true } },
            _count: { select: { products: { where: { active: true } } } },
        },
        orderBy: [{ parent: { name: 'asc' } }, { name: 'asc' }],
    })
    console.log('\n=== FILTERED CATEGORIES (from page.tsx query) ===')
    console.log(JSON.stringify(filteredCats, null, 2))
}

main()
    .catch(e => { console.error('ERROR:', e); process.exit(1) })
    .finally(() => prisma.$disconnect())
