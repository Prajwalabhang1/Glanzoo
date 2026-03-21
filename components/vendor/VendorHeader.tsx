"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function VendorHeader() {
    const { data: session } = useSession();

    const getStatusBadge = () => {
        const status = (session?.user as { vendorStatus?: string })?.vendorStatus || "PENDING";

        const badges: Record<string, { label: string; className: string }> = {
            PENDING: { label: "Pending Approval", className: "bg-yellow-100 text-yellow-800" },
            APPROVED: { label: "Approved", className: "bg-green-100 text-green-800" },
            SUSPENDED: { label: "Suspended", className: "bg-red-100 text-red-800" },
            REJECTED: { label: "Rejected", className: "bg-gray-100 text-gray-800" },
        };

        const badge = badges[status] || badges.PENDING;

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                {badge.label}
            </span>
        );
    };

    return (
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 lg:px-8">
            {/* Left side - Status */}
            <div className="flex items-center space-x-4">
                {getStatusBadge()}
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-4">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Button variant="ghost" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium">{session?.user?.name || "Vendor"}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <div className="px-2 py-1.5">
                            <p className="text-sm font-medium">{session?.user?.name}</p>
                            <p className="text-xs text-gray-500">{session?.user?.email}</p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <a href="/vendor/profile" className="cursor-pointer">
                                <User className="w-4 h-4 mr-2" />
                                Profile
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600 cursor-pointer"
                            onClick={() => signOut({ callbackUrl: "/" })}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
