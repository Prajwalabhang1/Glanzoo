'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ProductFilters() {
    const categories = ['Kurtis', 'Sarees', 'Co-ord Sets', 'Salwar Suits']
    const priceRanges = [
        { label: 'Under ₹1,000', value: '0-1000' },
        { label: '₹1,000 - ₹2,500', value: '1000-2500' },
        { label: '₹2,500 - ₹5,000', value: '2500-5000' },
        { label: 'Above ₹5,000', value: '5000+' },
    ]

    return (
        <Card>
            <CardContent className="p-6 space-y-6">
                {/* Categories */}
                <div>
                    <h3 className="font-semibold mb-3">Categories</h3>
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <label key={category} className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-gray-300" />
                                <span className="text-sm">{category}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div>
                    <h3 className="font-semibold mb-3">Price Range</h3>
                    <div className="space-y-2">
                        {priceRanges.map((range) => (
                            <label key={range.value} className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="price" className="rounded-full border-gray-300" />
                                <span className="text-sm">{range.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Size */}
                <div>
                    <h3 className="font-semibold mb-3">Size</h3>
                    <div className="flex flex-wrap gap-2">
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                            <Badge key={size} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                                {size}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Color */}
                <div>
                    <h3 className="font-semibold mb-3">Color</h3>
                    <div className="flex flex-wrap gap-2">
                        {['Red', 'Blue', 'Green', 'Black', 'White', 'Pink'].map((color) => (
                            <div
                                key={color}
                                className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer hover:border-primary"
                                style={{ backgroundColor: color.toLowerCase() }}
                                title={color}
                            />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
