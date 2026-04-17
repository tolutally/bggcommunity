"use client";

import { SidebarProvider } from "@/context/SidebarContext";
import { UserProvider } from "@/context/UserContext";
import { RouteGuard } from "@/context/AuthContext";
import FloatingNav from "@/components/layout/FloatingNav";
import { useCohorts } from "@/hooks/use-cohorts";
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    Settings,
    Briefcase,
    Target,
    GraduationCap,
} from "lucide-react";

const FALLBACK_COHORT_ITEMS = [
    { name: "Cohort Alpha", href: "/member/cohorts/alpha", icon: GraduationCap },
    { name: "Cohort Beta", href: "/member/cohorts/beta", icon: GraduationCap },
];

function MemberNav() {
    const { cohorts } = useCohorts();

    const cohortItems = cohorts.length > 0
        ? cohorts.map((c) => ({
            name: c.name,
            href: `/member/cohorts/${c.slug}`,
            icon: GraduationCap,
        }))
        : FALLBACK_COHORT_ITEMS;

    const navGroups = [
        {
            items: [
                { name: "Dashboard", href: "/member", icon: LayoutDashboard },
                { name: "Jobs", href: "/member/jobs", icon: Briefcase },
                { name: "Dev Plan", href: "/member/devplan", icon: Target },
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
            items: cohortItems,
        },
        {
            items: [
                { name: "Settings", href: "/member/settings", icon: Settings },
            ],
        },
    ];

    return <FloatingNav navGroups={navGroups} moduleType="member" />;
}

export default function MemberLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RouteGuard allowedRoles={["member"]}>
            <SidebarProvider>
                <UserProvider>
                    <div className="min-h-screen bg-stone-50">
                        {/* Navigation (Header + Left Bar) */}
                        <MemberNav />

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
