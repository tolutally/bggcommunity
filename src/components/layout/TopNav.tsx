"use client";

import { useSidebar } from "@/context/SidebarContext";
import { useUser } from "@/context/UserContext";
import { Menu, Bell } from "lucide-react";

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
                    <div className="h-8 w-8 bg-purple-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                        BGG
                    </div>
                    <span className="font-semibold text-stone-900">Black Girls Gather</span>
                </div>
            </div>

            {/* Right Interface: Module Badge, Notifs, Profile */}
            <div className="flex items-center gap-4 md:gap-6">
                {/* Module Badge */}
                <div className="hidden md:flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                    <span className="text-xs font-bold text-purple-700 capitalize">
                        {moduleLabels[moduleType]} Portal
                    </span>
                </div>

                {/* Notifications */}
                <button className="relative text-stone-500 hover:text-stone-900 transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>

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
