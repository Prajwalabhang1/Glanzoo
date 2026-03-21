export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Package, Eye, ShoppingCart } from "lucide-react";
import Image from "next/image";

export default async function VendorProductsPage() {
    const session = await auth();

    if (!session || session.user.role !== "VENDOR") {
        redirect("/");
    }

    const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
    });

    if (!vendor) {
        redirect("/vendor/register");
    }

    const products = await prisma.product.findMany({
        where: { vendorId: vendor.id },
        include: {
            category: true,
            variants: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            DRAFT: "bg-gray-100 text-gray-800",
            PENDING: "bg-yellow-100 text-yellow-800",
            APPROVED: "bg-green-100 text-green-800",
            REJECTED: "bg-red-100 text-red-800",
        };
        return colors[status] || colors.DRAFT;
    };

    const stats = {
        total: products.length,
        approved: products.filter((p) => p.approvalStatus === "APPROVED").length,
        pending: products.filter((p) => p.approvalStatus === "PENDING").length,
        rejected: products.filter((p) => p.approvalStatus === "REJECTED").length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-600 mt-1">Manage your product catalog</p>
                </div>
                <Link href="/vendor/products/new">
                    <Button className="bg-gradient-to-r from-orange-500 to-amber-500">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
                <Card>
                    <CardContent className="py-16">
                        <div className="text-center">
                            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
                            <p className="text-gray-600 mb-6">Start by adding your first product to your catalog</p>
                            <Link href="/vendor/products/new">
                                <Button className="bg-gradient-to-r from-orange-500 to-amber-500">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Your First Product
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => {
                        const images = JSON.parse(product.images);
                        const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

                        return (
                            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="relative h-48 bg-gray-100">
                                    {images[0] && (
                                        <Image
                                            src={images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.approvalStatus)}`}>
                                            {product.approvalStatus}
                                        </span>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-lg font-bold text-gray-900">
                                            ₹{product.price.toLocaleString("en-IN")}
                                        </span>
                                        {product.salePrice && (
                                            <span className="text-sm text-gray-500 line-through">
                                                ₹{product.salePrice.toLocaleString("en-IN")}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                        <span className="flex items-center">
                                            <Package className="w-4 h-4 mr-1" />
                                            {totalStock} in stock
                                        </span>
                                        <span className="flex items-center">
                                            <Eye className="w-4 h-4 mr-1" />
                                            {product.views}
                                        </span>
                                        <span className="flex items-center">
                                            <ShoppingCart className="w-4 h-4 mr-1" />
                                            {product.sales}
                                        </span>
                                    </div>
                                    <Link href={`/vendor/products/${product.id}`}>
                                        <Button variant="outline" className="w-full">
                                            Manage Product
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
