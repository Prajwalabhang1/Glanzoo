export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { vendors, products, productVariants, categories } from "@/lib/schema";
import { eq, desc, inArray } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Package, Eye, ShoppingCart } from "lucide-react";
import Image from "next/image";

export default async function VendorProductsPage() {
    const session = await auth();
    if (!session || session.user.role !== "VENDOR") redirect("/");

    const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, session.user.id)).limit(1);
    if (!vendor) redirect("/vendor/register");

    const productRows = await db.select().from(products).where(eq(products.vendorId, vendor.id)).orderBy(desc(products.createdAt));
    const productIds = productRows.map(p => p.id);
    const categoryIds = [...new Set(productRows.map(p => p.categoryId))];

    const [variantRows, categoryRows] = productIds.length > 0 ? await Promise.all([
        db.select({ productId: productVariants.productId, stock: productVariants.stock }).from(productVariants).where(inArray(productVariants.productId, productIds)),
        db.select({ id: categories.id, name: categories.name }).from(categories).where(inArray(categories.id, categoryIds)),
    ]) : [[], []];

    const stockMap = variantRows.reduce((acc, v) => { acc[v.productId] = (acc[v.productId] || 0) + v.stock; return acc; }, {} as Record<string, number>);
    const catMap = Object.fromEntries(categoryRows.map(c => [c.id, c]));

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = { DRAFT: "bg-gray-100 text-gray-800", PENDING: "bg-yellow-100 text-yellow-800", APPROVED: "bg-green-100 text-green-800", REJECTED: "bg-red-100 text-red-800" };
        return colors[status] || colors.DRAFT;
    };

    const stats = { total: productRows.length, approved: productRows.filter(p => p.approvalStatus === "APPROVED").length, pending: productRows.filter(p => p.approvalStatus === "PENDING").length, rejected: productRows.filter(p => p.approvalStatus === "REJECTED").length };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-3xl font-bold text-gray-900">Products</h1><p className="text-gray-600 mt-1">Manage your product catalog</p></div>
                <Link href="/vendor/products/new"><Button className="bg-gradient-to-r from-orange-500 to-amber-500"><Plus className="w-4 h-4 mr-2" />Add Product</Button></Link>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
                {[{ label: 'Total Products', value: stats.total, color: '' }, { label: 'Approved', value: stats.approved, color: 'text-green-600' }, { label: 'Pending', value: stats.pending, color: 'text-yellow-600' }, { label: 'Rejected', value: stats.rejected, color: 'text-red-600' }].map(s => (
                    <Card key={s.label}><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">{s.label}</CardTitle></CardHeader><CardContent><div className={`text-2xl font-bold ${s.color}`}>{s.value}</div></CardContent></Card>
                ))}
            </div>
            {productRows.length === 0 ? (
                <Card><CardContent className="py-16"><div className="text-center"><Package className="w-16 h-16 mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3><p className="text-gray-600 mb-6">Start by adding your first product to your catalog</p><Link href="/vendor/products/new"><Button className="bg-gradient-to-r from-orange-500 to-amber-500"><Plus className="w-4 h-4 mr-2" />Add Your First Product</Button></Link></div></CardContent></Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {productRows.map(product => {
                        const images = (() => { try { return JSON.parse(product.images); } catch { return []; } })();
                        return (
                            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="relative h-48 bg-gray-100">
                                    {images[0] && <Image src={images[0]} alt={product.name} fill className="object-cover" />}
                                    <div className="absolute top-2 right-2"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.approvalStatus)}`}>{product.approvalStatus}</span></div>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-lg font-bold text-gray-900">₹{Number(product.price).toLocaleString("en-IN")}</span>
                                        {product.salePrice && <span className="text-sm text-gray-500 line-through">₹{Number(product.salePrice).toLocaleString("en-IN")}</span>}
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                        <span className="flex items-center"><Package className="w-4 h-4 mr-1" />{stockMap[product.id] || 0} in stock</span>
                                        <span className="flex items-center"><Eye className="w-4 h-4 mr-1" />{product.views || 0}</span>
                                        <span className="flex items-center"><ShoppingCart className="w-4 h-4 mr-1" />{product.sales || 0}</span>
                                    </div>
                                    <Link href={`/vendor/products/${product.id}`}><Button variant="outline" className="w-full">Manage Product</Button></Link>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
