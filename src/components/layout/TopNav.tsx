"use client";

import { useSidebar } from "@/context/SidebarContext";
import { useUser, UserRole } from "@/context/UserContext";
import { Menu, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TopNav() {
    const { toggleSidebar } = useSidebar();
    const { role, setRole, user } = useUser();

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

            {/* Right Interface: Role Switcher, Notifs, Profile */}
            <div className="flex items-center gap-4 md:gap-6">
                {/* Role Switcher */}
                <div className="hidden md:flex items-center gap-1 bg-stone-100 rounded-lg p-1">
                    {(["member", "mentor", "admin"] as UserRole[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRole(r)}
                            className={cn(
                                "px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all",
                                role === r
                                    ? "bg-white text-purple-900 shadow-sm border border-stone-200"
                                    : "text-stone-500 hover:text-stone-700"
                            )}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                {/* Mobile Role Switcher (Simplified) */}
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="md:hidden bg-stone-100 text-stone-600 text-xs font-semibold rounded-md p-2 border-none focus:ring-0"
                >
                    <option value="member">Member</option>
                    <option value="mentor">Mentor</option>
                    <option value="admin">Admin</option>
                </select>

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
                        <span className="text-xs text-stone-500 capitalize">{role}</span>
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
