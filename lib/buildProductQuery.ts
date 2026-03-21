import { Prisma } from '@prisma/client'

export interface FilterParams {
    material?: string[]
    category?: string[]
    priceMin?: number
    priceMax?: number
    search?: string
}

/**
 * Build Prisma where clause from filter parameters
 * Used for filtering products by material, category, price, etc.
 */
export function buildProductQuery(filters: FilterParams): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {
        active: true,
    }

    // Material filter (OR condition for multiple materials)
    if (filters.material && filters.material.length > 0) {
        where.material = {
            in: filters.material,
        }
    }

    // Category filter (by slug)
    if (filters.category && filters.category.length > 0) {
        where.category = {
            slug: {
                in: filters.category,
            },
        }
    }

    // Price range filter
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
        where.price = {}
        if (filters.priceMin !== undefined) {
            where.price.gte = filters.priceMin
        }
        if (filters.priceMax !== undefined) {
            where.price.lte = filters.priceMax
        }
    }

    // Search filter (name or description)
    if (filters.search) {
        where.OR = [
            { name: { contains: filters.search } },
            { description: { contains: filters.search } },
        ]
    }

    return where
}

/**
 * Parse filter params from URL search params
 */
export function parseFilterParams(searchParams: URLSearchParams): FilterParams {
    const filters: FilterParams = {}

    const material = searchParams.get('material')
    if (material) {
        filters.material = material.split(',').filter(Boolean)
    }

    const category = searchParams.get('category')
    if (category) {
        filters.category = category.split(',').filter(Boolean)
    }

    const priceMin = searchParams.get('priceMin')
    if (priceMin) {
        filters.priceMin = Number(priceMin)
    }

    const priceMax = searchParams.get('priceMax')
    if (priceMax) {
        filters.priceMax = Number(priceMax)
    }

    const search = searchParams.get('search')
    if (search) {
        filters.search = search
    }

    return filters
}

/**
 * Convert filter params to URL search string
 */
export function filtersToSearchString(filters: FilterParams): string {
    const params = new URLSearchParams()

    if (filters.material && filters.material.length > 0) {
        params.set('material', filters.material.join(','))
    }

    if (filters.category && filters.category.length > 0) {
        params.set('category', filters.category.join(','))
    }

    if (filters.priceMin !== undefined) {
        params.set('priceMin', filters.priceMin.toString())
    }

    if (filters.priceMax !== undefined) {
        params.set('priceMax', filters.priceMax.toString())
    }

    if (filters.search) {
        params.set('search', filters.search)
    }

    return params.toString()
}
