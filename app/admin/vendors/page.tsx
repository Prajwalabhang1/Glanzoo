export const dynamic = 'force-dynamic';

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

export default async function AdminVendorsPage() {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
        redirect("/");
    }

    // Get all vendors with stats
    const vendors = await prisma.vendor.findMany({
        include: {
            user: {
                select: {
                    email: true,
                    name: true,
                    createdAt: true,
                },
            },
            _count: {
                select: {
                    products: true,
                    sales: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            PENDING: "bg-yellow-100 text-yellow-800",
            APPROVED: "bg-green-100 text-green-800",
            SUSPENDED: "bg-red-100 text-red-800",
            REJECTED: "bg-gray-100 text-gray-800",
        };
        return variants[status] || variants.PENDING;
    };

    const stats = {
        total: vendors.length,
        pending: vendors.filter((v) => v.status === "PENDING").length,
        approved: vendors.filter((v) => v.status === "APPROVED").length,
        suspended: vendors.filter((v) => v.status === "SUSPENDED").length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
                    <p className="text-gray-600 mt-1">Manage and monitor all vendors</p>
                </div>
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500">
                    <Search className="w-4 h-4 mr-2" />
                    Search Vendors
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Vendors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Pending Approval</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
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
                        <CardTitle className="text-sm font-medium text-gray-600">Suspended</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Vendors Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Vendors</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b">
                                <tr className="text-left text-sm text-gray-600">
                                    <th className="pb-3 font-medium">Business Name</th>
                                    <th className="pb-3 font-medium">Contact</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium">Products</th>
                                    <th className="pb-3 font-medium">Sales</th>
                                    <th className="pb-3 font-medium">Joined</th>
                                    <th className="pb-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {vendors.map((vendor) => (
                                    <tr key={vendor.id} className="text-sm">
                                        <td className="py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{vendor.businessName}</p>
                                                <p className="text-xs text-gray-500">{vendor.businessType}</p>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div>
                                                <p className="text-gray-900">{vendor.user.name}</p>
                                                <p className="text-xs text-gray-500">{vendor.user.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(vendor.status)}`}>
                                                {vendor.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-gray-900">{vendor._count.products}</td>
                                        <td className="py-4 text-gray-900">{vendor._count.sales}</td>
                                        <td className="py-4 text-gray-600">
                                            {new Date(vendor.user.createdAt).toLocaleDateString("en-IN")}
                                        </td>
                                        <td className="py-4">
                                            <Link href={`/admin/vendors/${vendor.id}`}>
                                                <Button size="sm" variant="outline">
                                                    View Details
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {vendors.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-gray-500">
                                            No vendors yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
