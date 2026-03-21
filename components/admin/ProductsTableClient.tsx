'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Trash2, Plus, Search, Filter } from 'lucide-react';
import { deleteProduct } from '@/lib/actions/products';

interface Product {
    id: string;
    name: string;
    price: number;
    salePrice: number | null;
    images: string;
    category: {
        name: string;
    };
    variants: {
        stock: number;
    }[];
    active: boolean;
    createdAt: Date;
}

interface ProductsTableClientProps {
    products: Product[];
}

export function ProductsTableClient({ products }: ProductsTableClientProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(price);
    };

    const getTotalStock = (variants: { stock: number }[]) => {
        return variants.reduce((acc, curr) => acc + curr.stock, 0);
    };

    const getFirstImage = (imagesString: string) => {
        try {
            const images = JSON.parse(imagesString);
            return Array.isArray(images) && images.length > 0 ? images[0] : '/placeholder.png';
        } catch {
            return '/placeholder.png';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            {/* Header Actions */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                        <Filter className="h-4 w-4" />
                        Filters
                    </button>
                    <Link
                        href="/admin/products/new"
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Link>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                                            <Image
                                                src={getFirstImage(product.images)}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">ID: {product.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {product.category.name}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">
                                        {formatPrice(product.salePrice || product.price)}
                                        {product.salePrice && (
                                            <span className="ml-2 text-xs text-gray-400 line-through">
                                                {formatPrice(product.price)}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-600">
                                        {getTotalStock(product.variants)} units
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {product.active ? 'Active' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/products/${product.id}`}
                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                        <button
                                            onClick={async () => {
                                                if (confirm('Are you sure you want to delete this product?')) {
                                                    const result = await deleteProduct(product.id);
                                                    if (result?.error) {
                                                        alert(result.error);
                                                    } else {
                                                        // Refresh handled by revalidatePath in server action
                                                    }
                                                }
                                            }}
                                            className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination (placeholder) */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredProducts.length}</span> of <span className="font-medium">{filteredProducts.length}</span> results
                </p>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600 disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600 disabled:opacity-50" disabled>Next</button>
                </div>
            </div>
        </div>
    );
}
