import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    // Check if user is authenticated and is admin
    if (!session?.user) {
        redirect('/login?callbackUrl=/admin')
    }

    // Check if user has admin role
    const userRole = session.user.role
    if (userRole !== 'ADMIN') {
        redirect('/')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Fixed Sidebar */}
            <AdminSidebar />

            {/* Main wrapper — offset by sidebar width (w-72 = 18rem) */}
            <div className="lg:ml-72">
                {/* Sticky Header — sits inside the offset wrapper */}
                <AdminHeader user={session.user} />

                {/* Page Content */}
                <main className="p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
