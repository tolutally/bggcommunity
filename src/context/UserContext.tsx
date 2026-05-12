"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import type { User as ApiUser } from "@/lib/types";

export type UserRole = "member" | "mentor" | "admin";

interface User {
    name: string;
    avatar: string;
    email: string;
}

interface UserContextType {
    role: UserRole;
    user: User;
    /** Full API user object (null while loading or if unauthenticated) */
    apiUser: ApiUser | null;
    isLoading: boolean;
    /** Re-fetch user data from the API */
    refetchUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/** Map BE uppercase role to FE lowercase */
function normalizeRole(role: string | undefined): UserRole {
    if (!role) return "member";
    const lower = role.toLowerCase();
    if (lower === "admin") return "admin";
    if (lower === "mentor") return "mentor";
    return "member";
}

/** Build display name from profile fields */
function displayName(apiUser: ApiUser | null): string {
    if (!apiUser?.profile) return apiUser?.email ?? "";
    const p = apiUser.profile;
    if (p.displayName) return p.displayName;
    if (p.firstName || p.lastName) return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();
    return apiUser.email;
}

export function UserProvider({ children }: { children: ReactNode }) {
    const { user: authUser, apiUser, isLoading, refetchUser } = useAuth();

    const role = authUser?.role ?? normalizeRole(apiUser?.role);

    const user: User = {
        name: authUser?.name || displayName(apiUser) || "User",
        avatar: authUser?.avatar || apiUser?.profile?.avatarUrl || "",
        email: authUser?.email || apiUser?.email || "",
    };

    return (
        <UserContext.Provider value={{ role, user, apiUser, isLoading, refetchUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
