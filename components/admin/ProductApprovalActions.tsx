"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle } from "lucide-react";

export default function ProductApprovalActions({ productId }: { productId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const handleApprove = async () => {
        if (!confirm("Approve this product? It will go live on the storefront.")) return;

        setLoading(true);
        try {
            const response = await fetch("/api/admin/products/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productIds: [productId],
                    approvalStatus: "APPROVED",
                }),
            });

            if (response.ok) {
                alert("Product approved!");
                router.refresh();
            } else {
                const data = await response.json();
                alert(`Error: ${data.error}`);
            }
        } catch {
            alert("Failed to approve product");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert("Please provide a rejection reason");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/admin/products/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productIds: [productId],
                    approvalStatus: "REJECTED",
                    rejectionReason,
                }),
            });

            if (response.ok) {
                alert("Product rejected");
                setShowRejectForm(false);
                setRejectionReason("");
                router.refresh();
            } else {
                const data = await response.json();
                alert(`Error: ${data.error}`);
            }
        } catch {
            alert("Failed to reject product");
        } finally {
            setLoading(false);
        }
    };

    if (showRejectForm) {
        return (
            <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                <div>
                    <Label>Rejection Reason *</Label>
                    <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why this product is being rejected..."
                        rows={3}
                        className="mt-1"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleReject}
                        disabled={loading}
                        variant="destructive"
                        size="sm"
                    >
                        {loading ? "Rejecting..." : "Confirm Rejection"}
                    </Button>
                    <Button
                        onClick={() => setShowRejectForm(false)}
                        variant="outline"
                        size="sm"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            <Button
                onClick={handleApprove}
                disabled={loading}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
            >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
            </Button>
            <Button
                onClick={() => setShowRejectForm(true)}
                variant="destructive"
                size="sm"
            >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
            </Button>
        </div>
    );
}
