import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";

export default async function VendorLayout({ children }: { children: ReactNode }) {
    const session = await auth();

    // Redirect if not authenticated or not a vendor
    if (!session || session.user.role !== "VENDOR") {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Fixed Sidebar */}
            <VendorSidebar />

            {/* Main wrapper — offset by sidebar width (w-72 = 18rem) */}
            <div className="lg:ml-72">
                {/* Sticky Header */}
                <VendorHeader />

                {/* Page Content */}
                <main className="p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
