"use client";

import { useState, useEffect, use, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft, CheckCircle, XCircle, Clock, AlertTriangle,
    Loader2, Building2, Mail, Phone, MapPin, FileText,
    TrendingUp, Package, IndianRupee, ShieldCheck
} from "lucide-react";
import Link from "next/link";

// Type definitions for the vendor data
interface VendorUser {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    createdAt: string;
}

interface VendorAddress {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
}

interface BankDetails {
    bankName?: string;
    accountName?: string;
    maskedAccount?: string;
    ifscCode?: string;
}

interface VendorMetrics {
    totalRevenue: number;
    totalCommission: number;
    totalPayout: number;
    pendingPayout: number;
    productCount: number;
    salesCount: number;
}

interface VendorData {
    id: string;
    businessName: string;
    businessType: string;
    description: string | null;
    contactEmail: string;
    contactPhone: string;
    businessAddress: VendorAddress;
    gstNumber: string | null;
    panNumber: string | null;
    bankDetails: BankDetails | null;
    status: string;
    approvalNotes: string | null;
    approvedAt: string | null;
    commissionRate: number;
    createdAt: string;
    user: VendorUser;
    metrics: VendorMetrics;
}

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [vendor, setVendor] = useState<VendorData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [approval, setApproval] = useState({
        status: "",
        approvalNotes: "",
        commissionRate: 10,
    });

    const fetchVendor = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/admin/vendors/${id}`);
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to fetch vendor details");
                return;
            }

            setVendor(data.vendor);
            setApproval({
                status: data.vendor.status,
                approvalNotes: data.vendor.approvalNotes || "",
                commissionRate: data.vendor.commissionRate ?? 10,
            });
        } catch (err) {
            console.error("Failed to fetch vendor:", err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchVendor();
    }, [fetchVendor]);

    const handleUpdate = async () => {
        setUpdating(true);
        setSuccessMsg(null);
        setError(null);
        try {
            const response = await fetch(`/api/admin/vendors/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(approval),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMsg(data.message || "Vendor updated successfully!");
                await fetchVendor();
                setTimeout(() => setSuccessMsg(null), 4000);
            } else {
                setError(data.error || "Failed to update vendor");
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setUpdating(false);
        }
    };

    // ── Loading state ──
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <p className="text-sm text-gray-500">Loading vendor details...</p>
            </div>
        );
    }

    // ── Error state ──
    if (error && !vendor) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <AlertTriangle className="w-10 h-10 text-red-400" />
                <p className="text-gray-700 font-medium">{error}</p>
                <div className="flex gap-3">
                    <Button onClick={fetchVendor} variant="outline">Retry</Button>
                    <Link href="/admin/vendors">
                        <Button variant="ghost">← Back to Vendors</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
                <XCircle className="w-10 h-10 text-gray-300" />
                <p className="text-gray-600">Vendor not found</p>
                <Link href="/admin/vendors">
                    <Button variant="outline">← Back to Vendors</Button>
                </Link>
            </div>
        );
    }

    const addr = vendor.businessAddress || {};

    const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
        PENDING: { icon: Clock, color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200" },
        APPROVED: { icon: CheckCircle, color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
        REJECTED: { icon: XCircle, color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
        SUSPENDED: { icon: AlertTriangle, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
    };

    const currentStatus = statusConfig[vendor.status] || statusConfig.PENDING;
    const StatusIcon = currentStatus.icon;

    return (
        <div className="space-y-6 max-w-6xl">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/admin/vendors">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{vendor.businessName}</h1>
                        <p className="text-sm text-gray-500">{vendor.businessType} · Joined {new Date(vendor.user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${currentStatus.color} ${currentStatus.bg} ${currentStatus.border}`}>
                    <StatusIcon className="w-4 h-4" />
                    {vendor.status}
                </span>
            </div>

            {/* ── Success/Error Messages ── */}
            {successMsg && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    {successMsg}
                </div>
            )}
            {error && vendor && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* ── Metrics ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Products", value: vendor.metrics.productCount, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Total Sales", value: vendor.metrics.salesCount, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Revenue", value: `₹${vendor.metrics.totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Commission", value: `₹${vendor.metrics.totalCommission.toLocaleString("en-IN")}`, icon: ShieldCheck, color: "text-orange-600", bg: "bg-orange-50" },
                ].map((metric) => (
                    <Card key={metric.label} className="border-gray-100">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg ${metric.bg} flex items-center justify-center flex-shrink-0`}>
                                    <metric.icon className={`w-5 h-5 ${metric.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">{metric.label}</p>
                                    <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* ── Left Column: Details ── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Business Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                Business Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoItem label="Business Name" value={vendor.businessName} />
                                <InfoItem label="Business Type" value={vendor.businessType} />
                                <InfoItem label="Contact Email" value={vendor.contactEmail} icon={<Mail className="w-3.5 h-3.5 text-gray-400" />} />
                                <InfoItem label="Contact Phone" value={vendor.contactPhone} icon={<Phone className="w-3.5 h-3.5 text-gray-400" />} />
                            </div>
                            {vendor.description && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
                                    <p className="text-sm text-gray-700 leading-relaxed">{vendor.description}</p>
                                </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-0.5">Business Address</p>
                                        <p className="text-sm text-gray-700">
                                            {addr.street || "N/A"}
                                            {addr.city && `, ${addr.city}`}
                                            {addr.state && `, ${addr.state}`}
                                            {addr.pincode && ` - ${addr.pincode}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Compliance Documents */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="w-4 h-4 text-gray-400" />
                                Compliance &amp; Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoItem label="GST Number" value={vendor.gstNumber || "Not provided"} mono />
                                <InfoItem label="PAN Number" value={vendor.panNumber || "Not provided"} mono />
                            </div>
                            {vendor.bankDetails && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs font-medium text-gray-500 mb-3">Bank Details</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InfoItem label="Bank Name" value={vendor.bankDetails.bankName || "N/A"} />
                                        <InfoItem label="Account Holder" value={vendor.bankDetails.accountName || "N/A"} />
                                        <InfoItem label="Account Number" value={vendor.bankDetails.maskedAccount || "N/A"} mono />
                                        <InfoItem label="IFSC Code" value={vendor.bankDetails.ifscCode || "N/A"} mono />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Owner Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Owner Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoItem label="Name" value={vendor.user.name || "N/A"} />
                                <InfoItem label="Email" value={vendor.user.email} icon={<Mail className="w-3.5 h-3.5 text-gray-400" />} />
                                <InfoItem label="Phone" value={vendor.user.phone || "Not provided"} icon={<Phone className="w-3.5 h-3.5 text-gray-400" />} />
                                <InfoItem label="Joined" value={new Date(vendor.user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Right Column: Approval Actions ── */}
                <div className="space-y-6">
                    <Card className="border-2 border-orange-100">
                        <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg">
                            <CardTitle className="text-base font-bold text-gray-900">
                                ⚙️ Approval Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {/* Status Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Status
                                </label>
                                <select
                                    value={approval.status}
                                    onChange={(e) => setApproval({ ...approval, status: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                >
                                    <option value="PENDING">🕐 Pending</option>
                                    <option value="APPROVED">✅ Approved</option>
                                    <option value="REJECTED">❌ Rejected</option>
                                    <option value="SUSPENDED">⚠️ Suspended</option>
                                </select>
                            </div>

                            {/* Commission Rate */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Commission Rate (%)
                                </label>
                                <input
                                    type="number"
                                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                    value={approval.commissionRate}
                                    onChange={(e) =>
                                        setApproval({ ...approval, commissionRate: parseFloat(e.target.value) || 0 })
                                    }
                                    min="0"
                                    max="100"
                                    step="0.5"
                                />
                                <p className="text-xs text-gray-400 mt-1">Applied to all vendor sales</p>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Admin Notes
                                </label>
                                <textarea
                                    value={approval.approvalNotes}
                                    onChange={(e) => setApproval({ ...approval, approvalNotes: e.target.value })}
                                    placeholder="Add notes about this vendor (visible to admin only)..."
                                    rows={4}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
                                />
                            </div>

                            {/* Update Button */}
                            <Button
                                onClick={handleUpdate}
                                disabled={updating}
                                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md"
                            >
                                {updating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Updating...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {vendor.status === "PENDING" && (
                                <>
                                    <Button
                                        onClick={() => {
                                            setApproval({ ...approval, status: "APPROVED" });
                                            setTimeout(() => handleUpdate(), 100);
                                        }}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                                        disabled={updating}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve Vendor
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setApproval({ ...approval, status: "REJECTED" });
                                            setTimeout(() => handleUpdate(), 100);
                                        }}
                                        variant="outline"
                                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                                        disabled={updating}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject Vendor
                                    </Button>
                                </>
                            )}
                            {vendor.status === "APPROVED" && (
                                <Button
                                    onClick={() => {
                                        setApproval({ ...approval, status: "SUSPENDED" });
                                        setTimeout(() => handleUpdate(), 100);
                                    }}
                                    variant="outline"
                                    className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
                                    disabled={updating}
                                >
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Suspend Vendor
                                </Button>
                            )}
                            {(vendor.status === "REJECTED" || vendor.status === "SUSPENDED") && (
                                <Button
                                    onClick={() => {
                                        setApproval({ ...approval, status: "APPROVED" });
                                        setTimeout(() => handleUpdate(), 100);
                                    }}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                    disabled={updating}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Re-Approve Vendor
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Financial Summary */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Financial Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Revenue</span>
                                <span className="font-semibold text-gray-900">₹{vendor.metrics.totalRevenue.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Commission ({vendor.commissionRate}%)</span>
                                <span className="font-semibold text-green-600">₹{vendor.metrics.totalCommission.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                                <span className="text-gray-500">Total Payout</span>
                                <span className="font-semibold text-gray-900">₹{vendor.metrics.totalPayout.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Pending Payout</span>
                                <span className="font-semibold text-yellow-600">₹{vendor.metrics.pendingPayout.toLocaleString("en-IN")}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

/** Reusable info display component */
function InfoItem({
    label,
    value,
    icon,
    mono = false,
}: {
    label: string;
    value: string;
    icon?: React.ReactNode;
    mono?: boolean;
}) {
    return (
        <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
            <div className="flex items-center gap-1.5">
                {icon}
                <p className={`text-sm text-gray-900 ${mono ? "font-mono" : "font-medium"}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}
