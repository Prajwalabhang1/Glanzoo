"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Building2, MapPin, FileText, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface VendorProfile {
    id: string;
    businessName: string;
    businessType: string;
    description: string | null;
    contactEmail: string;
    contactPhone: string;
    businessAddress: {
        street: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
    };
    gstNumber: string | null;
    panNumber: string | null;
    status: string;
    commissionRate: number;
    hasBankDetails: boolean;
    bankDetails: {
        bankName: string;
        accountName: string;
        maskedAccount: string;
        ifscCode: string;
    } | null;
    user: {
        id: string;
        name: string | null;
        email: string;
        phone: string | null;
    };
}

export default function VendorProfilePage() {
    useSession();
    const [profile, setProfile] = useState<VendorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [form, setForm] = useState({
        businessName: "",
        description: "",
        contactEmail: "",
        contactPhone: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            setLoading(true);
            const res = await fetch("/api/vendor/profile");
            if (!res.ok) throw new Error("Failed to fetch profile");
            const data = await res.json();
            setProfile(data.vendor);
            setForm({
                businessName: data.vendor.businessName || "",
                description: data.vendor.description || "",
                contactEmail: data.vendor.contactEmail || "",
                contactPhone: data.vendor.contactPhone || "",
                street: data.vendor.businessAddress?.street || "",
                city: data.vendor.businessAddress?.city || "",
                state: data.vendor.businessAddress?.state || "",
                pincode: data.vendor.businessAddress?.pincode || "",
            });
        } catch {
            setError("Failed to load profile");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        try {
            setSaving(true);
            setMessage(null);

            const res = await fetch("/api/vendor/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessName: form.businessName,
                    description: form.description,
                    contactEmail: form.contactEmail,
                    contactPhone: form.contactPhone,
                    businessAddress: {
                        street: form.street,
                        city: form.city,
                        state: form.state,
                        pincode: form.pincode,
                        country: "India",
                    },
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update profile");
            }

            setMessage({ type: "success", text: "Profile updated successfully!" });
            setTimeout(() => setMessage(null), 3000);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
            setMessage({ type: "error", text: errorMessage });
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-gray-500">{error || "Profile not found"}</p>
                <Button onClick={fetchProfile} variant="outline" className="mt-4">Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="text-gray-600 mt-1">Manage your business profile and settings</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${profile.status === "APPROVED" ? "bg-green-100 text-green-800" :
                        profile.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                        }`}>
                        {profile.status}
                    </span>
                    <span className="text-sm text-gray-500">Commission: {profile.commissionRate}%</span>
                </div>
            </div>

            {/* Success / Error Message */}
            {message && (
                <div className={`flex items-center gap-2 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
                    }`}>
                    {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Business Info (Editable) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="w-5 h-5" />
                                Business Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="businessName">Business Name</Label>
                                    <Input
                                        id="businessName"
                                        value={form.businessName}
                                        onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Business Type</Label>
                                    <Input value={profile.businessType} disabled className="bg-gray-50" />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    placeholder="Tell customers about your business..."
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="contactEmail">Contact Email</Label>
                                    <Input
                                        id="contactEmail"
                                        type="email"
                                        value={form.contactEmail}
                                        onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="contactPhone">Contact Phone</Label>
                                    <Input
                                        id="contactPhone"
                                        value={form.contactPhone}
                                        onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Business Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="street">Street Address</Label>
                                <Input
                                    id="street"
                                    value={form.street}
                                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        value={form.state}
                                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="pincode">Pincode</Label>
                                    <Input
                                        id="pincode"
                                        value={form.pincode}
                                        onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Owner Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Account Owner
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-500">Name</p>
                                <p className="font-medium">{profile.user.name || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Email</p>
                                <p className="font-medium">{profile.user.email}</p>
                            </div>
                            {profile.user.phone && (
                                <div>
                                    <p className="text-gray-500">Phone</p>
                                    <p className="font-medium">{profile.user.phone}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Compliance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Compliance Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-500">GST Number</p>
                                <p className="font-medium font-mono">{profile.gstNumber || "Not provided"}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">PAN Number</p>
                                <p className="font-medium font-mono">{profile.panNumber || "Not provided"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bank Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="w-5 h-5" />
                                Bank Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {profile.bankDetails ? (
                                <>
                                    <div>
                                        <p className="text-gray-500">Bank</p>
                                        <p className="font-medium">{profile.bankDetails.bankName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Account Name</p>
                                        <p className="font-medium">{profile.bankDetails.accountName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Account Number</p>
                                        <p className="font-medium font-mono">{profile.bankDetails.maskedAccount}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">IFSC Code</p>
                                        <p className="font-medium font-mono">{profile.bankDetails.ifscCode}</p>
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-500">No bank details on file</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
