"use client";

import { SidebarProvider } from "@/context/SidebarContext";
import { UserProvider } from "@/context/UserContext";
import FloatingNav from "@/components/layout/FloatingNav";
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    Settings,
} from "lucide-react";

const memberNavGroups = [
    {
        items: [
            { name: "Dashboard", href: "/member", icon: LayoutDashboard },
        ],
    },
    {
        title: "Community",
        items: [
            { name: "Community", href: "/member/community", icon: MessageSquare },
            { name: "Members", href: "/member/members", icon: Users },
        ],
    },
    {
        title: "Cohorts",
        items: [
            { name: "Cohort Alpha", href: "/member/cohorts/alpha", icon: Users },
            { name: "Cohort Beta", href: "/member/cohorts/beta", icon: Users },
        ],
    },
    {
        items: [
            { name: "Settings", href: "/member/settings", icon: Settings },
        ]
    }
];

export default function MemberLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <UserProvider>
                <div className="min-h-screen bg-stone-50">
                    {/* Navigation (Header + Bottom Bar) */}
                    <FloatingNav navGroups={memberNavGroups} moduleType="member" />

                    {/* Main Content - with padding for header and bottom nav */}
                    <main className="pt-20 pb-28">
                        {children}
                    </main>
                </div>
            </UserProvider>
        </SidebarProvider>
    );
}
