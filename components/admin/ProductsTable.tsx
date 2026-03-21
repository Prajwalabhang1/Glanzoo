import prisma from '@/lib/prisma'
import { ProductsTableClient } from './ProductsTableClient'

export async function ProductsTable() {
    const products = await prisma.product.findMany({
        include: {
            category: true,
            variants: true,
        },
        orderBy: { createdAt: 'desc' },
    })

    // Serializing dates to pass to client component
    const serializedProducts = products.map(product => ({
        ...product,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        // Convert decimals to numbers if necessary, but Prisma floats are numbers in JS
    }))

    return <ProductsTableClient products={serializedProducts} />
}
