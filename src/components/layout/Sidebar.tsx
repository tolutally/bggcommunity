"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useUser, UserRole } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    MessageSquare,
    GraduationCap,
    Users,
    Calendar,
    Sparkles,
    FolderOpen,
    BarChart3,
    Settings,
    X,
    Flag,
    BookOpen,
    type LucideIcon
} from "lucide-react";

type NavItem = {
    name: string;
    href: string;
    icon: LucideIcon;
    badge?: string | number;
};

type NavGroup = {
    title?: string;
    items: NavItem[];
};

export default function Sidebar() {
    const { isOpen, closeSidebar } = useSidebar();
    const { role } = useUser();
    const pathname = usePathname();

    const mentorNavGroups: NavGroup[] = [
        {
            items: [
                { name: "Dashboard", href: "/", icon: LayoutDashboard },
            ],
        },
        {
            title: "My Program",
            items: [
                { name: "Sessions", href: "/sessions", icon: Calendar },
                { name: "Mentees", href: "/mentors", icon: Sparkles },
                { name: "Resources", href: "/resources", icon: FolderOpen },
            ]
        },
        {
            title: "Community",
            items: [
                { name: "General Community", href: "/community/general", icon: MessageSquare },
                { name: "Alumni Network", href: "/community/alumni", icon: GraduationCap },
            ],
        },
        {
            title: "Cohorts",
            items: [
                { name: "Cohort Alpha", href: "/cohorts/alpha", icon: Users },
                { name: "Cohort Beta", href: "/cohorts/beta", icon: Users },
            ],
        },
        {
            items: [
                { name: "Settings", href: "/settings", icon: Settings },
            ]
        }
    ];

    const memberNavGroups: NavGroup[] = [
        {
            items: [
                { name: "Dashboard", href: "/", icon: LayoutDashboard },
            ],
        },
        {
            title: "My Program",
            items: [
                { name: "My Schedule", href: "/sessions", icon: Calendar },
                { name: "My Mentors", href: "/mentors", icon: Sparkles },
                { name: "Resources", href: "/resources", icon: FolderOpen },
            ]
        },
        {
            title: "Community",
            items: [
                { name: "General Community", href: "/community/general", icon: MessageSquare },
                { name: "Alumni Network", href: "/community/alumni", icon: GraduationCap },
            ],
        },
        {
            title: "Cohorts",
            items: [
                { name: "Cohort Alpha", href: "/cohorts/alpha", icon: Users },
                { name: "Cohort Beta", href: "/cohorts/beta", icon: Users },
            ],
        },
        {
            items: [
                { name: "Settings", href: "/settings", icon: Settings },
            ]
        }
    ];

    const adminNavGroups: NavGroup[] = [
        {
            items: [
                { name: "Dashboard", href: "/", icon: LayoutDashboard },
                { name: "Analytics", href: "/analytics", icon: BarChart3 },
            ],
        },
        {
            title: "Management",
            items: [
                { name: "Members", href: "/members", icon: Users },
                { name: "Mentors", href: "/mentors", icon: Sparkles },
                { name: "Moderation", href: "/moderation", icon: Flag },
            ]
        },
        {
            items: [
                { name: "Programs", href: "/programs", icon: BookOpen }, // Assuming BookOpen is imported or needs to be
                { name: "Community", href: "/community/general", icon: MessageSquare },
                { name: "Events", href: "/events", icon: Calendar },
            ]
        },
        {
            title: "Cohorts",
            items: [
                { name: "Cohort Alpha", href: "/cohorts/alpha", icon: Users },
                { name: "Cohort Beta", href: "/cohorts/beta", icon: Users },
            ],
        },
        {
            items: [
                { name: "Settings", href: "/settings", icon: Settings },
            ]
        }
    ];

    let navGroups = memberNavGroups;
    if (role === 'mentor') navGroups = mentorNavGroups;
    if (role === 'admin') navGroups = adminNavGroups;

    const activeClass = "bg-purple-50 text-purple-900";
    const inactiveClass = "text-stone-500 hover:bg-stone-50 hover:text-stone-900";

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={closeSidebar}
            />

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-stone-200 bg-white h-full transition-transform duration-300 md:translate-x-0 md:static flex",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-6 flex-1 overflow-y-auto">
                    {/* Logo */}
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-purple-900 text-white rounded-xl flex items-center justify-center font-bold text-lg tracking-tighter">
                                BGG
                            </div>
                            <span className="font-semibold text-lg tracking-tight text-stone-900">
                                Black Girls Gather
                            </span>
                        </div>
                        <button
                            onClick={closeSidebar}
                            className="md:hidden text-stone-500 hover:text-stone-900"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-6">
                        {navGroups.map((group, idx) => (
                            <div key={idx}>
                                {group.title && (
                                    <h3 className="px-4 text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                                        {group.title}
                                    </h3>
                                )}
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => {
                                                    if (window.innerWidth < 768) closeSidebar();
                                                }}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200",
                                                    isActive ? activeClass : inactiveClass
                                                )}
                                            >
                                                <Icon size={20} strokeWidth={1.5} />
                                                <span className="text-sm font-medium">{item.name}</span>
                                                {item.badge && (
                                                    <span className="ml-auto bg-rose-100 text-rose-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>
                {/* Footer (optional version info can go here) */}
            </aside>
        </>
    );
}
