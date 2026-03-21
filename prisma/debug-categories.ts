import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const categories = await prisma.category.findMany({
        where: { parentId: null, active: true },
        include: {
            children: {
                where: { active: true },
                orderBy: { sortOrder: 'asc' },
            },
        },
        orderBy: { sortOrder: 'asc' },
    })

    console.log('Total parent categories:', categories.length)
    categories.forEach(cat => {
        console.log(`  [${cat.id}] ${cat.name} (slug: ${cat.slug}) — ${cat.children.length} children`)
        cat.children.forEach(ch => {
            console.log(`      → ${ch.name} (slug: ${ch.slug}, active: ${ch.active}, parentId: ${ch.parentId})`)
        })
    })
}

main().catch(console.error).finally(() => prisma.$disconnect())
