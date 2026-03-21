"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, X, Plus } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        shortDescription: "",
        price: "",
        salePrice: "",
        categoryId: "",
        images: [""],
        variants: [{ size: "", stock: 0 }],
        material: "",
        fabric: "",
        careInstructions: "",
        tags: "",
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch("/api/categories");
            const data = await response.json();
            setCategories(data.categories || []);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    };

    const handleChange = (field: string, value: string | number) => {
        setFormData((prev) => {
            const updated = { ...prev, [field]: value };
            // Auto-generate slug from name
            if (field === "name" && typeof value === "string") {
                updated.slug = generateSlug(value);
            }
            return updated;
        });
    };

    const addImage = () => {
        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ""],
        }));
    };

    const removeImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const updateImage = (index: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.map((img, i) => (i === index ? value : img)),
        }));
    };

    const addVariant = () => {
        setFormData((prev) => ({
            ...prev,
            variants: [...prev.variants, { size: "", stock: 0 }],
        }));
    };

    const removeVariant = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index),
        }));
    };

    const updateVariant = (index: number, field: string, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            variants: prev.variants.map((v, i) =>
                i === index ? { ...v, [field]: value } : v
            ),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
                images: formData.images.filter((img) => img.trim() !== ""),
                variants: formData.variants.filter((v) => v.size.trim() !== ""),
                tags: formData.tags
                    ? formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
                    : undefined,
            };

            const response = await fetch("/api/vendor/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create product");
            }

            alert("Product created successfully! Pending admin approval.");
            router.push("/vendor/products");
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "An error occurred";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Link href="/vendor/products">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                    <p className="text-gray-600 mt-1">Product will be pending admin approval</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Product Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="slug">URL Slug *</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => handleChange("slug", e.target.value)}
                                placeholder="auto-generated-from-name"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="shortDescription">Short Description</Label>
                            <Textarea
                                id="shortDescription"
                                value={formData.shortDescription}
                                onChange={(e) => handleChange("shortDescription", e.target.value)}
                                rows={2}
                                placeholder="Brief product description"
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Full Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                rows={4}
                                placeholder="Detailed product information"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing & Category */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing & Category</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="price">Price (₹) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => handleChange("price", e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="salePrice">Sale Price (₹)</Label>
                                <Input
                                    id="salePrice"
                                    type="number"
                                    step="0.01"
                                    value={formData.salePrice}
                                    onChange={(e) => handleChange("salePrice", e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={formData.categoryId}
                                onValueChange={(value) => handleChange("categoryId", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Images */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product Images</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {formData.images.map((image, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    placeholder="Image URL"
                                    value={image}
                                    onChange={(e) => updateImage(index, e.target.value)}
                                />
                                {formData.images.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => removeImage(index)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addImage}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Image
                        </Button>
                    </CardContent>
                </Card>

                {/* Variants */}
                <Card>
                    <CardHeader>
                        <CardTitle>Size Variants *</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {formData.variants.map((variant, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    placeholder="Size (e.g., S, M, L, XL)"
                                    value={variant.size}
                                    onChange={(e) => updateVariant(index, "size", e.target.value)}
                                    className="flex-1"
                                />
                                <Input
                                    type="number"
                                    placeholder="Stock"
                                    value={variant.stock}
                                    onChange={(e) =>
                                        updateVariant(index, "stock", parseInt(e.target.value) || 0)
                                    }
                                    className="w-32"
                                />
                                {formData.variants.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => removeVariant(index)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addVariant}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Variant
                        </Button>
                    </CardContent>
                </Card>

                {/* Additional Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="material">Material</Label>
                                <Input
                                    id="material"
                                    value={formData.material}
                                    onChange={(e) => handleChange("material", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="fabric">Fabric</Label>
                                <Input
                                    id="fabric"
                                    value={formData.fabric}
                                    onChange={(e) => handleChange("fabric", e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="careInstructions">Care Instructions</Label>
                            <Textarea
                                id="careInstructions"
                                value={formData.careInstructions}
                                onChange={(e) => handleChange("careInstructions", e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div>
                            <Label htmlFor="tags">Tags (comma separated)</Label>
                            <Input
                                id="tags"
                                value={formData.tags}
                                onChange={(e) => handleChange("tags", e.target.value)}
                                placeholder="trendy, summer, casual"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Link href="/vendor/products">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-orange-500 to-amber-500"
                    >
                        {loading ? "Creating..." : "Create Product"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
