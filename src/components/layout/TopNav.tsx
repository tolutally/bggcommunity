"use client";

import { useSidebar } from "@/context/SidebarContext";
import { Menu, Bell, Search } from "lucide-react";

export default function TopNav() {
    const { toggleSidebar } = useSidebar();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-gray-200 dark:border-white/10 bg-white/50 backdrop-blur-lg px-6 dark:bg-black/20">
            <button
                onClick={toggleSidebar}
                className="mr-4 text-gray-500 hover:text-gray-900 md:hidden dark:text-gray-400 dark:hover:text-white"
            >
                <Menu className="h-6 w-6" />
            </button>

            <div className="flex flex-1 items-center justify-between">
                {/* Search Bar (Mock) */}
                <div className="hidden md:flex relative w-96">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-black"></span>
                    </button>
                </div>
            </div>
        </header>
    );
}
