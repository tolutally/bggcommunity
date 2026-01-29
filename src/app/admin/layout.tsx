"use client";

import { SidebarProvider } from "@/context/SidebarContext";
import { UserProvider } from "@/context/UserContext";
import FloatingNav from "@/components/layout/FloatingNav";
import {
    LayoutDashboard,
    BarChart3,
    Users,
    Sparkles,
    Flag,
    BookOpen,
    MessageSquare,
    Calendar,
    Settings,
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
            { name: "Mentors", href: "/admin/mentors", icon: Sparkles },
            { name: "Moderation", href: "/admin/moderation", icon: Flag },
        ]
    },
    {
        items: [
            { name: "Programs", href: "/admin/programs", icon: BookOpen },
            { name: "Community", href: "/admin/community", icon: MessageSquare },
            { name: "Events", href: "/admin/events", icon: Calendar },
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
        <SidebarProvider>
            <UserProvider>
                <div className="min-h-screen bg-stone-50">
                    {/* Navigation (Header + Bottom Bar) */}
                    <FloatingNav navGroups={adminNavGroups} moduleType="admin" />

                    {/* Main Content - with padding for header and bottom nav */}
                    <main className="pt-20 pb-28">
                        {children}
                    </main>
                </div>
            </UserProvider>
        </SidebarProvider>
    );
}
