"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { ChevronDown, Search, Menu, X, type LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";
import NotificationsTray from "@/components/notifications/NotificationsTray";

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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    // Flatten nav items for the main nav bar
    const allNavItems = navGroups.flatMap(group => group.items);

    // Separate settings from main nav
    const mainNavItems = allNavItems.filter(item => item.name !== "Settings");
    const settingsItem = allNavItems.find(item => item.name === "Settings");

    const moduleColors = {
        member: "from-brand-700 to-brand-600",
        mentor: "from-emerald-600 to-teal-600",
        admin: "from-rose-600 to-pink-600",
    };

    const moduleLabels = {
        member: "Member",
        mentor: "Mentor",
        admin: "Admin",
    };

    const activeTextColor = {
        member: "text-accent-500",
        mentor: "text-emerald-400",
        admin: "text-rose-400",
    };

    return (
        <>
            {/* Top Header Strip */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16">
                <div className="h-full bg-white/90 backdrop-blur-xl border-b border-stone-200/50 px-4 md:px-6 flex items-center justify-between">
                    {/* Left: Hamburger (mobile) + Logo */}
                    <div className="flex items-center gap-3">
                        {/* Hamburger Menu Button - Mobile Only */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>

                        <Link href={`/${moduleType}`} className="flex items-center gap-3 group">
                            <img
                                src="/BBG-Final-Logo.png"
                                alt="Black Girls Gather"
                                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
                            />
                            <div className="hidden sm:flex flex-col">
                                <span className="font-bold text-stone-900 tracking-tight text-lg leading-tight">
                                    Black Girls Gather
                                </span>
                                <span className={`text-xs font-semibold ${moduleType === 'member' ? 'text-brand-600' : moduleType === 'admin' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {moduleLabels[moduleType]} Portal
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Center: Search (desktop) */}
                    <div className="hidden lg:flex flex-1 max-w-lg mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="w-full pl-11 pr-4 py-2.5 bg-stone-100 border border-stone-200/50 rounded-full text-sm text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 focus:bg-white outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Right: Actions & Profile */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Notifications */}
                        <NotificationsTray />

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

            {/* Floating Left Navigation Bar - Desktop Only */}
            <nav className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-50">
                <div className="bg-stone-900/95 backdrop-blur-xl rounded-2xl px-2 py-3 shadow-2xl shadow-stone-900/30 border border-stone-700/50 flex flex-col items-center gap-1">
                    {mainNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== `/${moduleType}` && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center gap-1 px-3 py-3 rounded-xl transition-all duration-200 group relative",
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
                                    "text-[9px] font-semibold transition-colors hidden sm:block",
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

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Slide-out Menu */}
            <nav className={cn(
                "md:hidden fixed top-16 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-4 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-12 w-12 rounded-full object-cover border-2 border-brand-200"
                        />
                        <div>
                            <p className="font-bold text-stone-900">{user.name}</p>
                            <p className="text-sm text-stone-500">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="py-4 overflow-y-auto h-[calc(100%-140px)]">
                    {navGroups.map((group, groupIdx) => (
                        <div key={groupIdx} className="mb-4">
                            {group.title && (
                                <p className="px-4 text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                                    {group.title}
                                </p>
                            )}
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href || (item.href !== `/${moduleType}` && pathname.startsWith(item.href));

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all",
                                            isActive
                                                ? "bg-brand-100 text-brand-800"
                                                : "text-stone-600 hover:bg-stone-100"
                                        )}
                                    >
                                        <Icon
                                            size={20}
                                            strokeWidth={isActive ? 2 : 1.5}
                                            className={isActive ? "text-brand-600" : "text-stone-400"}
                                        />
                                        <span className={cn("font-medium", isActive && "font-bold")}>
                                            {item.name}
                                        </span>
                                        {item.badge && (
                                            <span className="ml-auto bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-stone-100 bg-white">
                    <button className="w-full py-3 text-rose-600 font-semibold hover:bg-rose-50 rounded-xl transition-colors">
                        Sign Out
                    </button>
                </div>
            </nav>
        </>
    );
}
