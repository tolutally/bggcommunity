"use client";

import { SidebarProvider } from "@/context/SidebarContext";
import { UserProvider } from "@/context/UserContext";
import { RouteGuard } from "@/context/AuthContext";
import FloatingNav from "@/components/layout/FloatingNav";
import {
    LayoutDashboard,
    BarChart3,
    Users,
    Flag,
    GraduationCap,
    MessageSquare,
    Calendar,
    Settings,
    Briefcase,
} from "lucide-react";

const adminNavGroups = [
    {
        items: [
            { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
            { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        ],
    },
    {
        title: "Management",
        items: [
            { name: "Members", href: "/admin/members", icon: Users },
            { name: "Moderation", href: "/admin/moderation", icon: Flag },
        ]
    },
    {
        items: [
            { name: "Cohorts", href: "/admin/cohorts", icon: GraduationCap },
            { name: "Community", href: "/admin/community", icon: MessageSquare },
            { name: "Events", href: "/admin/events", icon: Calendar },
            { name: "Jobs", href: "/admin/jobs", icon: Briefcase },
        ]
    },
    {
        items: [
            { name: "Settings", href: "/admin/settings", icon: Settings },
        ]
    }
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RouteGuard allowedRoles={["admin"]}>
            <SidebarProvider>
                <UserProvider>
                    <div className="min-h-screen bg-stone-50">
                        {/* Navigation (Header + Left Bar) */}
                        <FloatingNav navGroups={adminNavGroups} moduleType="admin" />

                        {/* Main Content - with padding for header and left nav (desktop only) */}
                        <main className="pt-20 pb-6 md:pl-24 lg:pl-28">
                            {children}
                        </main>
                    </div>
                </UserProvider>
            </SidebarProvider>
        </RouteGuard>
    );
}
