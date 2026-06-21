"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/context/SidebarContext";
import { UserProvider } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import FloatingNav from "@/components/layout/FloatingNav";
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    Settings,
    Briefcase,
    Target,
    GraduationCap,
    type LucideIcon,
} from "lucide-react";

type NavItem = { name: string; href: string; icon: LucideIcon; badge?: string | number };
type NavGroup = { title?: string; items: NavItem[] };

function MemberLayoutInner({ children }: { children: React.ReactNode }) {
    const navGroups = useMemo((): NavGroup[] => [
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
                { name: "Cohorts", href: "/member/cohorts", icon: GraduationCap },
            ],
        },
        {
            items: [
                { name: "Settings", href: "/member/settings", icon: Settings },
            ],
        },
    ], []);

    return (
        <div className="min-h-screen bg-stone-50">
            <FloatingNav navGroups={navGroups} moduleType="member" />
            <main className="pt-20 pb-6 md:pl-24 lg:pl-28">
                {children}
            </main>
        </div>
    );
}

export default function MemberLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading, onboardingComplete, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (user?.role === "admin") {
            router.replace("/admin");
            return;
        }

        if (onboardingComplete === false) {
            router.replace("/onboarding");
        }
    }, [isLoading, onboardingComplete, router, user?.role]);

    const canRender = !isLoading && (user?.role === "admin" || onboardingComplete !== false);

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
                <MemberLayoutInner>{children}</MemberLayoutInner>
            </UserProvider>
        </SidebarProvider>
    );
}
