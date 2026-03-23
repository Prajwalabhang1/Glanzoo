export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { products, vendors, categories, productVariants } from "@/lib/schema";
import { eq, isNotNull, inArray, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import ProductApprovalActions from "@/components/admin/ProductApprovalActions";

export default async function AdminProductApprovalsPage() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") redirect("/");

    const pendingProducts = await db.select().from(products).where(isNotNull(products.vendorId)).orderBy(desc(products.createdAt));
    const filtered = pendingProducts.filter(p => p.approvalStatus === "PENDING" || p.approvalStatus === "REJECTED");
    const productIds = filtered.map(p => p.id);
    const vendorIds = [...new Set(filtered.map(p => p.vendorId).filter(Boolean) as string[])];
    const categoryIds = [...new Set(filtered.map(p => p.categoryId))];

    const [variantRows, vendorRows, categoryRows] = productIds.length > 0 ? await Promise.all([
        db.select({ productId: productVariants.productId, stock: productVariants.stock }).from(productVariants).where(inArray(productVariants.productId, productIds)),
        vendorIds.length > 0 ? db.select({ id: vendors.id, businessName: vendors.businessName }).from(vendors).where(inArray(vendors.id, vendorIds)) : [],
        db.select({ id: categories.id, name: categories.name }).from(categories).where(inArray(categories.id, categoryIds)),
    ]) : [[], [], []];

    const vendorMap = Object.fromEntries(vendorRows.map(v => [v.id, v]));
    const catMap = Object.fromEntries(categoryRows.map(c => [c.id, c]));
    const varStockMap = variantRows.reduce((acc, v) => { acc[v.productId] = (acc[v.productId] || 0) + v.stock; return acc; }, {} as Record<string, number>);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = { PENDING: "bg-yellow-100 text-yellow-800", REJECTED: "bg-red-100 text-red-800" };
        return variants[status] || variants.PENDING;
    };

    return (
        <div className="space-y-6">
            <div><h1 className="text-3xl font-bold text-gray-900">Product Approvals</h1><p className="text-gray-600 mt-1">Review and approve vendor products</p></div>
            <div className="grid gap-4 md:grid-cols-2">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Pending Approval</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{filtered.filter(p => p.approvalStatus === "PENDING").length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{filtered.filter(p => p.approvalStatus === "REJECTED").length}</div></CardContent></Card>
            </div>
            <Card>
                <CardHeader><CardTitle>Products Awaiting Review</CardTitle></CardHeader>
                <CardContent>
                    {filtered.length === 0 ? (<p className="text-center text-gray-500 py-8">No products pending approval</p>) : (
                        <div className="space-y-4">
                            {filtered.map(product => {
                                const images = (() => { try { return JSON.parse(product.images); } catch { return []; } })();
                                const totalStock = varStockMap[product.id] || 0;
                                const vendor = product.vendorId ? vendorMap[product.vendorId] : null;
                                const category = catMap[product.categoryId];
                                return (
                                    <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex gap-4">
                                            <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {images[0] ? <Image src={images[0]} alt={product.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400"><ImageIcon className="w-8 h-8" /></div>}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div><h3 className="font-semibold text-gray-900">{product.name}</h3><p className="text-sm text-gray-600">by {vendor?.businessName || 'N/A'}</p></div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(product.approvalStatus)}`}>{product.approvalStatus}</span>
                                                </div>
                                                <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                                                    <div><span className="text-gray-600">Price:</span><p className="font-medium">₹{Number(product.price).toLocaleString("en-IN")}</p></div>
                                                    <div><span className="text-gray-600">Category:</span><p className="font-medium">{category?.name || 'N/A'}</p></div>
                                                    <div><span className="text-gray-600">Stock:</span><p className="font-medium">{totalStock} units</p></div>
                                                    <div><span className="text-gray-600">SKU:</span><p className="font-medium">{product.slug}</p></div>
                                                </div>
                                                {product.rejectionReason && <div className="bg-red-50 border border-red-200 rounded p-2 mb-3"><p className="text-sm text-red-800"><strong>Rejection Reason:</strong> {product.rejectionReason}</p></div>}
                                                <ProductApprovalActions productId={product.id} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
