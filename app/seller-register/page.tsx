"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, ArrowLeft, CheckCircle } from "lucide-react";

export default function SellerRegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        // User Account
        email: "",
        password: "",
        name: "",
        phone: "",
        // Business Information
        businessName: "",
        businessType: "INDIVIDUAL",
        description: "",
        contactEmail: "",
        contactPhone: "",
        // Business Address
        street: "",
        city: "",
        state: "",
        pincode: "",
        // Optional Documents
        gstNumber: "",
        panNumber: "",
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Build the payload — exclude flat address fields, use nested businessAddress instead
            const { street, city, state, pincode, ...rest } = formData;
            const payload = {
                ...rest,
                businessAddress: {
                    street,
                    city,
                    state,
                    pincode,
                    country: "India",
                },
            };

            const response = await fetch("/api/vendor/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                // Show specific validation errors if available
                if (data.details && Array.isArray(data.details)) {
                    const messages = data.details.map(
                        (d: { path?: string[]; message: string }) => `${d.path?.join(".") || "Field"}: ${d.message}`
                    );
                    throw new Error(messages.join("\n"));
                }
                throw new Error(data.error || "Registration failed");
            }

            setSuccess(true);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred. Please try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl">Registration Successful!</CardTitle>
                        <CardDescription className="text-base">
                            Your seller application has been submitted
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-sm text-amber-900">
                                <strong>What&apos;s next?</strong>
                            </p>
                            <ul className="text-sm text-amber-800 mt-2 space-y-1 list-disc list-inside">
                                <li>Our team will review your application</li>
                                <li>You&apos;ll receive an email once approved</li>
                                <li>Approval typically takes 1-2 business days</li>
                                <li>Once approved, login and start adding products</li>
                            </ul>
                        </div>
                        <Button
                            onClick={() => router.push("/login")}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500"
                        >
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                            <Store className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Become a Seller</h1>
                    <p className="text-gray-600 mt-2">Start selling your products on Glanzoo</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s
                                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                                    : "bg-gray-200 text-gray-500"
                                    }`}
                            >
                                {s}
                            </div>
                            {s < 3 && (
                                <div
                                    className={`w-16 h-1 ${step > s ? "bg-amber-500" : "bg-gray-200"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {step === 1 && "Account Information"}
                                {step === 2 && "Business Details"}
                                {step === 3 && "Business Address & Documents"}
                            </CardTitle>
                            <CardDescription>
                                {step === 1 && "Create your seller account"}
                                {step === 2 && "Tell us about your business"}
                                {step === 3 && "Complete your profile"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm whitespace-pre-line">
                                    {error}
                                </div>
                            )}

                            {/* Step 1: Account */}
                            {step === 1 && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => handleChange("name", e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone *</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="10 digits"
                                                value={formData.phone}
                                                onChange={(e) => handleChange("phone", e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange("email", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="password">Password *</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Min 8 characters"
                                            value={formData.password}
                                            onChange={(e) => handleChange("password", e.target.value)}
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            {/* Step 2: Business */}
                            {step === 2 && (
                                <>
                                    <div>
                                        <Label htmlFor="businessName">Business Name *</Label>
                                        <Input
                                            id="businessName"
                                            value={formData.businessName}
                                            onChange={(e) => handleChange("businessName", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="businessType">Business Type *</Label>
                                        <Select
                                            value={formData.businessType}
                                            onValueChange={(value) => handleChange("businessType", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                                                <SelectItem value="COMPANY">Company</SelectItem>
                                                <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Business Description</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => handleChange("description", e.target.value)}
                                            placeholder="Tell us about your products and business"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="contactEmail">Contact Email *</Label>
                                            <Input
                                                id="contactEmail"
                                                type="email"
                                                value={formData.contactEmail}
                                                onChange={(e) => handleChange("contactEmail", e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="contactPhone">Contact Phone *</Label>
                                            <Input
                                                id="contactPhone"
                                                type="tel"
                                                value={formData.contactPhone}
                                                onChange={(e) => handleChange("contactPhone", e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 3: Address & Documents */}
                            {step === 3 && (
                                <>
                                    <div>
                                        <Label htmlFor="street">Street Address *</Label>
                                        <Input
                                            id="street"
                                            value={formData.street}
                                            onChange={(e) => handleChange("street", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="city">City *</Label>
                                            <Input
                                                id="city"
                                                value={formData.city}
                                                onChange={(e) => handleChange("city", e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="state">State *</Label>
                                            <Input
                                                id="state"
                                                value={formData.state}
                                                onChange={(e) => handleChange("state", e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="pincode">Pincode *</Label>
                                            <Input
                                                id="pincode"
                                                placeholder="6 digits"
                                                value={formData.pincode}
                                                onChange={(e) => handleChange("pincode", e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="border-t pt-4">
                                        <p className="text-sm font-medium mb-3">Optional Documents (can be added later)</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="gstNumber">GST Number</Label>
                                                <Input
                                                    id="gstNumber"
                                                    placeholder="22AAAAA0000A1Z5"
                                                    value={formData.gstNumber}
                                                    onChange={(e) => handleChange("gstNumber", e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="panNumber">PAN Number</Label>
                                                <Input
                                                    id="panNumber"
                                                    placeholder="AAAAA0000A"
                                                    value={formData.panNumber}
                                                    onChange={(e) => handleChange("panNumber", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between pt-4 border-t">
                                {step > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep(step - 1)}
                                    >
                                        Previous
                                    </Button>
                                )}
                                {step < 3 ? (
                                    <Button
                                        type="button"
                                        onClick={() => setStep(step + 1)}
                                        className="ml-auto bg-gradient-to-r from-orange-500 to-amber-500"
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="ml-auto bg-gradient-to-r from-orange-500 to-amber-500"
                                    >
                                        {loading ? "Submitting..." : "Submit Application"}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account?{" "}
                    <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
