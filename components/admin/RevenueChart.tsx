'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Loader2 } from 'lucide-react'

export function RevenueChart() {
    const [data, setData] = useState<{ day: string, revenue: number }[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/dashboard/stats')
                const json = await res.json()
                const chartData = json.stats.revenue.thirtyDayChart.map((item: { date: string, amount: number }) => ({
                    day: new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                    revenue: item.amount
                }))
                // Show last 7 days or more? Let's show last 10 days for better fit in UI
                setData(chartData.slice(-10))
            } catch { /* silent */ }
            finally { setIsLoading(false) }
        }
        fetchData()
    }, [])

    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Revenue Overview</h2>
                    <p className="text-sm text-gray-500 mt-1">Last 10 days performance</p>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-400" /></div>
            ) : (
                <div className="flex items-end justify-between gap-2 h-64">
                    {data.map((item) => {
                        const height = (item.revenue / maxRevenue) * 100
                        const isMax = item.revenue === maxRevenue && item.revenue > 0

                        return (
                            <div key={item.day} className="flex-1 flex flex-col items-center gap-3">
                                <div className="relative w-full h-full flex items-end group">
                                    <div
                                        className={`w-full rounded-t-lg transition-all duration-500 ease-out relative ${isMax
                                            ? 'bg-gradient-to-t from-orange-600 to-orange-400 shadow-lg shadow-orange-500/20'
                                            : 'bg-gray-100 hover:bg-orange-100 group-hover:bg-orange-200'
                                            }`}
                                        style={{ height: `${Math.max(height, 5)}%` }}
                                    >
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-xl z-20 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                                            ₹{item.revenue.toLocaleString()}
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                    {item.day}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

