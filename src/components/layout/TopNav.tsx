"use client";

import { useSidebar } from "@/context/SidebarContext";
import { useUser } from "@/context/UserContext";
import { Menu } from "lucide-react";
import NotificationsTray from "@/components/notifications/NotificationsTray";

type TopNavProps = {
    moduleType: "member" | "mentor" | "admin";
};

export default function TopNav({ moduleType }: TopNavProps) {
    const { toggleSidebar } = useSidebar();
    const { user } = useUser();

    const moduleLabels = {
        member: "Member",
        mentor: "Mentor",
        admin: "Admin",
    };

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-stone-200 sticky top-0 z-30">
            {/* Left Interface: Mobile Logo/Toggle */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden text-stone-500 hover:text-stone-900"
                >
                    <Menu className="h-6 w-6" strokeWidth={1.5} />
                </button>
                <div className="md:hidden flex items-center gap-2">
                    <img
                        src="/BBG-Final-Logo.png"
                        alt="Black Girls Gather"
                        className="h-8 w-auto object-contain"
                    />
                    <span className="font-semibold text-stone-900">Black Girls Gather</span>
                </div>
            </div>

            {/* Right Interface: Module Badge, Notifs, Profile */}
            <div className="flex items-center gap-4 md:gap-6">
                {/* Module Badge */}
                <div className="hidden md:flex items-center gap-2 bg-brand-100 px-3 py-1.5 rounded-lg border border-brand-200">
                    <span className="text-xs font-bold text-brand-700 capitalize">
                        {moduleLabels[moduleType]} Portal
                    </span>
                </div>

                {/* Notifications */}
                <NotificationsTray />

                {/* Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-stone-100">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-sm font-semibold text-stone-900">
                            {user.name}
                        </span>
                        <span className="text-xs text-stone-500 capitalize">{moduleLabels[moduleType]}</span>
                    </div>
                    <img
                        src={user.avatar}
                        alt="Profile"
                        className="h-10 w-10 rounded-full object-cover border border-stone-200"
                    />
                </div>
            </div>
        </header>
    );
}
