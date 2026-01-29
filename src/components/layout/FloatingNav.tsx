"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { Bell, ChevronDown, Search, type LucideIcon } from "lucide-react";
import { useState } from "react";

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

type FloatingNavProps = {
    navGroups: NavGroup[];
    moduleType: "member" | "mentor" | "admin";
};

export default function FloatingNav({ navGroups, moduleType }: FloatingNavProps) {
    const pathname = usePathname();
    const { user } = useUser();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Flatten nav items for the main nav bar
    const allNavItems = navGroups.flatMap(group => group.items);

    // Separate settings from main nav
    const mainNavItems = allNavItems.filter(item => item.name !== "Settings");
    const settingsItem = allNavItems.find(item => item.name === "Settings");

    const moduleColors = {
        member: "from-purple-600 to-indigo-600",
        mentor: "from-emerald-600 to-teal-600",
        admin: "from-rose-600 to-pink-600",
    };

    const moduleLabels = {
        member: "Member",
        mentor: "Mentor",
        admin: "Admin",
    };

    const activeTextColor = {
        member: "text-purple-400",
        mentor: "text-emerald-400",
        admin: "text-rose-400",
    };

    return (
        <>
            {/* Top Header Strip */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16">
                <div className="h-full bg-white/90 backdrop-blur-xl border-b border-stone-200/50 px-4 md:px-6 flex items-center justify-between">
                    {/* Left: Logo */}
                    <Link href={`/${moduleType}`} className="flex items-center gap-3 group">
                        <div className={`h-10 w-10 bg-gradient-to-br ${moduleColors[moduleType]} text-white rounded-xl flex items-center justify-center font-bold text-sm tracking-tighter shadow-lg group-hover:scale-105 transition-transform`}>
                            BGG
                        </div>
                        <div className="hidden sm:flex flex-col">
                            <span className="font-bold text-stone-900 tracking-tight text-lg leading-tight">
                                Black Girls Gather
                            </span>
                            <span className={`text-xs font-semibold ${moduleType === 'member' ? 'text-purple-600' : moduleType === 'admin' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {moduleLabels[moduleType]} Portal
                            </span>
                        </div>
                    </Link>

                    {/* Center: Search (desktop) */}
                    <div className="hidden lg:flex flex-1 max-w-lg mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="w-full pl-11 pr-4 py-2.5 bg-stone-100 border border-stone-200/50 rounded-full text-sm text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 focus:bg-white outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Right: Actions & Profile */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Notifications */}
                        <button className="relative p-2.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 rounded-full transition-all">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-stone-100 transition-all"
                            >
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-stone-100"
                                />
                                <ChevronDown size={14} className={cn("text-stone-400 transition-transform hidden md:block", showProfileMenu && "rotate-180")} />
                            </button>

                            {showProfileMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-stone-100">
                                            <p className="font-bold text-stone-900">{user.name}</p>
                                            <p className="text-sm text-stone-500">{user.email}</p>
                                        </div>
                                        <div className="py-2">
                                            <Link href={`/${moduleType}/profile`} onClick={() => setShowProfileMenu(false)} className="block w-full px-4 py-2.5 text-left text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">View Profile</Link>
                                            {settingsItem && (
                                                <Link href={settingsItem.href} onClick={() => setShowProfileMenu(false)} className="block w-full px-4 py-2.5 text-left text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
                                                    Settings
                                                </Link>
                                            )}
                                            <button className="w-full px-4 py-2.5 text-left text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">Help & Support</button>
                                        </div>
                                        <div className="border-t border-stone-100 pt-2">
                                            <button className="w-full px-4 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors">Sign Out</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Floating Bottom Navigation Bar */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div className="bg-stone-900/95 backdrop-blur-xl rounded-full px-2 py-2 shadow-2xl shadow-stone-900/30 border border-stone-700/50 flex items-center gap-1">
                    {mainNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== `/${moduleType}` && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center gap-1 px-4 md:px-5 py-2.5 rounded-full transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-stone-800"
                                        : "hover:bg-stone-800/50"
                                )}
                            >
                                <Icon
                                    size={20}
                                    strokeWidth={isActive ? 2 : 1.5}
                                    className={cn(
                                        "transition-colors",
                                        isActive ? activeTextColor[moduleType] : "text-stone-400 group-hover:text-stone-200"
                                    )}
                                />
                                <span className={cn(
                                    "text-[10px] font-semibold transition-colors hidden sm:block",
                                    isActive ? activeTextColor[moduleType] : "text-stone-400 group-hover:text-stone-200"
                                )}>
                                    {item.name.split(' ')[0]}
                                </span>

                                {/* Badge */}
                                {item.badge && (
                                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}


                </div>
            </nav>
        </>
    );
}
