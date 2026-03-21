'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface SizeChartModalProps {
    isOpen: boolean
    onClose: () => void
    sizeChart: {
        name: string
        category: string
        chartData: string // JSON
    }
}

export function SizeChartModal({ isOpen, onClose, sizeChart }: SizeChartModalProps) {
    let chartData: {
        sizes: string[]
        measurements: Array<{
            label: string
            values: string[]
        }>
    }

    try {
        chartData = JSON.parse(sizeChart.chartData)
    } catch (error) {
        console.error('Error parsing size chart data:', error)
        return null
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-heading font-bold flex items-center gap-2">
                        <span className="text-gradient-vibrant">Size Guide</span>
                        <span className="text-gray-600">· {sizeChart.category}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-6">
                    {/* Size Chart Table */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gradient-to-r from-rose/10 via-coral/10 to-gold/10">
                                    <th className="border border-gray-200 p-3 text-left font-semibold text-gray-800">
                                        Measurement
                                    </th>
                                    {chartData.sizes.map((size, idx) => (
                                        <th
                                            key={idx}
                                            className="border border-gray-200 p-3 text-center font-semibold text-gray-800"
                                        >
                                            {size}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.measurements.map((measurement, idx) => (
                                    <tr
                                        key={idx}
                                        className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                    >
                                        <td className="border border-gray-200 p-3 font-medium text-gray-700">
                                            {measurement.label}
                                        </td>
                                        {measurement.values.map((value, vidx) => (
                                            <td
                                                key={vidx}
                                                className="border border-gray-200 p-3 text-center text-gray-600"
                                            >
                                                {value}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* How to Measure Guide */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="text-xl">📏</span>
                            How to Measure
                        </h4>
                        <ul className="text-sm text-gray-700 space-y-1 ml-6 list-disc">
                            <li>Take measurements over light clothing for accuracy</li>
                            <li>Keep the measuring tape parallel to the floor</li>
                            <li>For best results, have someone help you measure</li>
                            <li>If between sizes, we recommend sizing up for comfort</li>
                        </ul>
                    </div>

                    {/* Additional Tips */}
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-gray-700">
                            <strong>💡 Tip:</strong> All measurements are approximate and may vary by ±1 inch due to fabric
                            stretch and measurement methods.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
