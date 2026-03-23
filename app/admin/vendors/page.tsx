export const dynamic = 'force-dynamic';

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { vendors, users, products, vendorSales } from "@/lib/schema";
import { eq, desc, count, inArray } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

export default async function AdminVendorsPage() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") redirect("/");

    const vendorRows = await db.select().from(vendors).orderBy(desc(vendors.createdAt));
    const vendorIds = vendorRows.map(v => v.id);
    const userIds = vendorRows.map(v => v.userId);

    const [userRows, productCountRows, salesCountRows] = await Promise.all([
        db.select({ id: users.id, email: users.email, name: users.name, createdAt: users.createdAt }).from(users).where(inArray(users.id, userIds)),
        vendorIds.length > 0 ? db.select({ vendorId: products.vendorId, cnt: count() }).from(products).where(inArray(products.vendorId, vendorIds)).groupBy(products.vendorId) : [],
        vendorIds.length > 0 ? db.select({ vendorId: vendorSales.vendorId, cnt: count() }).from(vendorSales).where(inArray(vendorSales.vendorId, vendorIds)).groupBy(vendorSales.vendorId) : [],
    ]);

    const userMap = Object.fromEntries(userRows.map(u => [u.id, u]));
    const productCountMap = Object.fromEntries(productCountRows.map((r: any) => [r.vendorId, r.cnt]));
    const salesCountMap = Object.fromEntries(salesCountRows.map((r: any) => [r.vendorId, r.cnt]));

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = { PENDING: "bg-yellow-100 text-yellow-800", APPROVED: "bg-green-100 text-green-800", SUSPENDED: "bg-red-100 text-red-800", REJECTED: "bg-gray-100 text-gray-800" };
        return variants[status] || variants.PENDING;
    };

    const stats = { total: vendorRows.length, pending: vendorRows.filter(v => v.status === "PENDING").length, approved: vendorRows.filter(v => v.status === "APPROVED").length, suspended: vendorRows.filter(v => v.status === "SUSPENDED").length };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1><p className="text-gray-600 mt-1">Manage and monitor all vendors</p></div>
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500"><Search className="w-4 h-4 mr-2" />Search Vendors</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
                {[{ label: 'Total Vendors', value: stats.total, color: '' }, { label: 'Pending Approval', value: stats.pending, color: 'text-yellow-600' }, { label: 'Approved', value: stats.approved, color: 'text-green-600' }, { label: 'Suspended', value: stats.suspended, color: 'text-red-600' }].map(s => (
                    <Card key={s.label}><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">{s.label}</CardTitle></CardHeader><CardContent><div className={`text-2xl font-bold ${s.color}`}>{s.value}</div></CardContent></Card>
                ))}
            </div>
            <Card>
                <CardHeader><CardTitle>All Vendors</CardTitle></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b"><tr className="text-left text-sm text-gray-600">{['Business Name', 'Contact', 'Status', 'Products', 'Sales', 'Joined', 'Actions'].map(h => <th key={h} className="pb-3 font-medium">{h}</th>)}</tr></thead>
                            <tbody className="divide-y">
                                {vendorRows.map(vendor => {
                                    const user = userMap[vendor.userId];
                                    return (
                                        <tr key={vendor.id} className="text-sm">
                                            <td className="py-4"><div><p className="font-medium text-gray-900">{vendor.businessName}</p><p className="text-xs text-gray-500">{vendor.businessType}</p></div></td>
                                            <td className="py-4"><div><p className="text-gray-900">{user?.name || 'N/A'}</p><p className="text-xs text-gray-500">{user?.email || 'N/A'}</p></div></td>
                                            <td className="py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(vendor.status)}`}>{vendor.status}</span></td>
                                            <td className="py-4 text-gray-900">{productCountMap[vendor.id] || 0}</td>
                                            <td className="py-4 text-gray-900">{salesCountMap[vendor.id] || 0}</td>
                                            <td className="py-4 text-gray-600">{user ? new Date(user.createdAt).toLocaleDateString("en-IN") : 'N/A'}</td>
                                            <td className="py-4"><Link href={`/admin/vendors/${vendor.id}`}><Button size="sm" variant="outline">View Details</Button></Link></td>
                                        </tr>
                                    );
                                })}
                                {vendorRows.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-gray-500">No vendors yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
