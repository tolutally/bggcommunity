"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Settings, X, Box } from "lucide-react";

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Users", href: "/users", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Inventory", href: "/inventory", icon: Box },
];

export default function Sidebar() {
    const { isOpen, closeSidebar } = useSidebar();
    const pathname = usePathname();

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
                    "fixed inset-y-0 left-0 z-50 w-64 transform bg-white/80 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 dark:bg-black/40 shadow-xl transition-transform duration-300 md:static md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-white/10">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                            Nebula App
                        </h1>
                        <button
                            onClick={closeSidebar}
                            className="md:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 space-y-2 px-4 py-6">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => { if (window.innerWidth < 768) closeSidebar() }}
                                    className={cn(
                                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/20"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer User Profile (Mock) */}
                    <div className="p-4 border-t border-gray-200 dark:border-white/10">
                        <div className="flex items-center gap-3 rounded-xl bg-gray-50/50 p-3 backdrop-blur-md dark:bg-white/5">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-red-500" />
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">Admin User</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">admin@nebula.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
