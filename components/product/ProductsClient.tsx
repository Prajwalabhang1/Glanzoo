'use client';

import { useState, useMemo } from 'react';
import { ProductCard } from '@/components/products/ProductCard';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    images: string;
    categoryId: string;
    category?: {
        name: string;
        slug: string;
    };
    variants?: Array<{
        id: string;
        size: string;
        stock: number;
    }>;
}

interface ProductsClientProps {
    products: Product[];
    initialCategory: string;
    collectionTitle: string;
}

export default function ProductsClient({ products, initialCategory, collectionTitle }: ProductsClientProps) {
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [priceRange, setPriceRange] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('newest');

    // Extract unique categories from products
    const categories = useMemo(() => {
        const uniqueCategories = new Set<string>();
        products.forEach(product => {
            if (product.category?.slug) {
                uniqueCategories.add(product.category.slug);
            }
        });
        return Array.from(uniqueCategories);
    }, [products]);

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let filtered = [...products];

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category?.slug === selectedCategory);
        }

        // Filter by price range
        if (priceRange !== 'all') {
            switch (priceRange) {
                case '0-1000':
                    filtered = filtered.filter(p => p.price < 1000);
                    break;
                case '1000-2500':
                    filtered = filtered.filter(p => p.price >= 1000 && p.price < 2500);
                    break;
                case '2500-5000':
                    filtered = filtered.filter(p => p.price >= 2500 && p.price < 5000);
                    break;
                case '5000+':
                    filtered = filtered.filter(p => p.price >= 5000);
                    break;
            }
        }

        // Sort products
        switch (sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
            default:
                // Already sorted by createdAt desc from server
                break;
        }

        return filtered;
    }, [products, selectedCategory, priceRange, sortBy]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">{collectionTitle}</h1>
                    <p className="text-gray-600">{filteredProducts.length} products</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <h2 className="text-lg font-semibold mb-4">Filters</h2>

                            {/* Category Filter */}
                            {categories.length > 1 && (
                                <div className="mb-6">
                                    <h3 className="font-medium mb-3 text-sm text-gray-700">Category</h3>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category"
                                                value="all"
                                                checked={selectedCategory === 'all'}
                                                onChange={() => setSelectedCategory('all')}
                                                className="rounded-full border-gray-300"
                                            />
                                            <span className="text-sm">All</span>
                                        </label>
                                        {categories.map((cat) => (
                                            <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    value={cat}
                                                    checked={selectedCategory === cat}
                                                    onChange={() => setSelectedCategory(cat)}
                                                    className="rounded-full border-gray-300"
                                                />
                                                <span className="text-sm capitalize">{cat.replace('-', ' ')}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Price Range Filter */}
                            <div className="mb-6">
                                <h3 className="font-medium mb-3 text-sm text-gray-700">Price Range</h3>
                                <div className="space-y-2">
                                    {[
                                        { label: 'All Prices', value: 'all' },
                                        { label: 'Under ₹1,000', value: '0-1000' },
                                        { label: '₹1,000 - ₹2,500', value: '1000-2500' },
                                        { label: '₹2,500 - ₹5,000', value: '2500-5000' },
                                        { label: 'Above ₹5,000', value: '5000+' },
                                    ].map((range) => (
                                        <label key={range.value} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="price"
                                                value={range.value}
                                                checked={priceRange === range.value}
                                                onChange={() => setPriceRange(range.value)}
                                                className="rounded-full border-gray-300"
                                            />
                                            <span className="text-sm">{range.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Sort By */}
                            <div>
                                <h3 className="font-medium mb-3 text-sm text-gray-700">Sort By</h3>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                </select>
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <main className="flex-1">
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow-md">
                                <p className="text-gray-500 text-lg">No products found matching your filters.</p>
                                <button
                                    onClick={() => {
                                        setSelectedCategory('all');
                                        setPriceRange('all');
                                    }}
                                    className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
