'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, User, LogOut, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Order {
    id: string
    status: string
    total: number
    createdAt: string
    items: Array<{
        name: string
        quantity: number
        price: number
    }>
    awbCode?: string
}
export const dynamic = 'force-dynamic';

export default function AccountPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/account')
        }
    }, [status, router])

    useEffect(() => {
        if (session?.user) {
            fetchOrders()
        }
    }, [session])

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders')
            if (response.ok) {
                const data = await response.json()
                setOrders(data.orders || [])
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        signOut({ callbackUrl: '/' })
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800'
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800'
            case 'PROCESSING':
                return 'bg-blue-100 text-blue-800'
            case 'SHIPPED':
                return 'bg-purple-100 text-purple-800'
            case 'DELIVERED':
                return 'bg-green-100 text-green-800'
            case 'CANCELLED':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 md:py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl md:text-4xl font-bold mb-8">My Account</h1>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                            <div className="pb-4 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                                        {session.user.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{session.user.name}</p>
                                        <p className="text-sm text-gray-600">{session.user.email}</p>
                                    </div>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                <Link
                                    href="/account"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-50 text-orange-700 font-medium"
                                >
                                    <Package className="w-5 h-5" />
                                    My Orders
                                </Link>
                                <Link
                                    href="/account/profile"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
                                >
                                    <User className="w-5 h-5" />
                                    Profile
                                </Link>
                            </nav>

                            <div className="pt-4 border-t">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 w-full"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-2xl font-bold mb-6">Order History</h2>

                            {orders.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <ShoppingBag className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
                                    <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
                                    <Link href="/products">
                                        <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                                            Browse Products
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Order #{order.id.slice(0, 8).toUpperCase()}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </p>
                                                    {order.awbCode && (
                                                        <a
                                                            href={`https://ithinklogistics.com/track-order?awb=${order.awbCode}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 mt-2"
                                                        >
                                                            <Package className="w-4 h-4 mr-2" />
                                                            Track
                                                        </a>
                                                    )}
                                                </div>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                                        order.status
                                                    )}`}
                                                >
                                                    {order.status}
                                                </span>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                                </p>
                                                <div className="space-y-1">
                                                    {order.items.slice(0, 2).map((item, idx) => (
                                                        <p key={idx} className="text-sm text-gray-800">
                                                            {item.name} × {item.quantity}
                                                        </p>
                                                    ))}
                                                    {order.items.length > 2 && (
                                                        <p className="text-sm text-gray-600">
                                                            +{order.items.length - 2} more
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t">
                                                <div>
                                                    <span className="text-sm text-gray-600">Total: </span>
                                                    <span className="text-lg font-bold">₹{order.total.toLocaleString()}</span>
                                                </div>
                                                <Link href={`/order-confirmation?id=${order.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        View Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
