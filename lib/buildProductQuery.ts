// Drizzle-compatible filter helpers (replaces Prisma buildProductQuery)
import { SQL, and, eq, gte, lte, like, inArray, or } from 'drizzle-orm';
import { products } from '@/lib/schema';

export interface FilterParams {
    material?: string[];
    category?: string[];
    priceMin?: number;
    priceMax?: number;
    search?: string;
}

/**
 * Build Drizzle SQL conditions from filter parameters
 */
export function buildProductConditions(filters: FilterParams): SQL | undefined {
    const conditions: SQL[] = [eq(products.active, true)];

    if (filters.material && filters.material.length > 0) {
        if (filters.material.length === 1) conditions.push(eq(products.material, filters.material[0]));
        else conditions.push(inArray(products.material, filters.material));
    }

    if (filters.priceMin !== undefined) conditions.push(gte(products.price, filters.priceMin));
    if (filters.priceMax !== undefined) conditions.push(lte(products.price, filters.priceMax));

    if (filters.search) {
        conditions.push(or(like(products.name, `%${filters.search}%`), like(products.description, `%${filters.search}%`))!);
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
}

/**
 * Parse filter params from URL search params
 */
export function parseFilterParams(searchParams: URLSearchParams): FilterParams {
    const filters: FilterParams = {};
    const material = searchParams.get('material');
    if (material) filters.material = material.split(',').filter(Boolean);
    const category = searchParams.get('category');
    if (category) filters.category = category.split(',').filter(Boolean);
    const priceMin = searchParams.get('priceMin');
    if (priceMin) filters.priceMin = Number(priceMin);
    const priceMax = searchParams.get('priceMax');
    if (priceMax) filters.priceMax = Number(priceMax);
    const search = searchParams.get('search');
    if (search) filters.search = search;
    return filters;
}

/**
 * Convert filter params to URL search string
 */
export function filtersToSearchString(filters: FilterParams): string {
    const params = new URLSearchParams();
    if (filters.material && filters.material.length > 0) params.set('material', filters.material.join(','));
    if (filters.category && filters.category.length > 0) params.set('category', filters.category.join(','));
    if (filters.priceMin !== undefined) params.set('priceMin', filters.priceMin.toString());
    if (filters.priceMax !== undefined) params.set('priceMax', filters.priceMax.toString());
    if (filters.search) params.set('search', filters.search);
    return params.toString();
}
