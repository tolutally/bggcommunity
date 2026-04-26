"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/context/SidebarContext";
import { UserProvider } from "@/context/UserContext";
import FloatingNav from "@/components/layout/FloatingNav";
import { isOnboardingComplete } from "@/lib/onboarding";
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    Settings,
    Briefcase,
    Target,
} from "lucide-react";

const memberNavGroups = [
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
    const { isLoaded, userId } = useAuth();
    const router = useRouter();
    const [canRender, setCanRender] = useState(false);

    useEffect(() => {
        if (!isLoaded) {
            return;
        }

        if (!userId) {
            setCanRender(true);
            return;
        }

        if (!isOnboardingComplete(userId)) {
            router.replace("/onboarding");
            return;
        }

        setCanRender(true);
    }, [isLoaded, router, userId]);

    if (!canRender) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-stone-50">
                <div className="flex items-center gap-3 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm text-stone-500 shadow-sm">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-brand-700" />
                    Loading your workspace...
                </div>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <UserProvider>
                <div className="min-h-screen bg-stone-50">
                    {/* Navigation (Header + Left Bar) */}
                    <FloatingNav navGroups={memberNavGroups} moduleType="member" />

                    {/* Main Content - with padding for header and left nav (desktop only) */}
                    <main className="pt-20 pb-6 md:pl-24 lg:pl-28">
                        {children}
                    </main>
                </div>
            </UserProvider>
        </SidebarProvider>
    );
}
