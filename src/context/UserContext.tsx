"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks/use-current-user";
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
    const { user: clerkUser } = useClerkUser();
    const { user: apiUser, isLoading, mutate } = useCurrentUser();

    const role = normalizeRole(apiUser?.role);

    const user: User = {
        name: displayName(apiUser) || clerkUser?.fullName || clerkUser?.primaryEmailAddress?.emailAddress || "User",
        avatar: apiUser?.profile?.avatarUrl || clerkUser?.imageUrl || "",
        email: apiUser?.email || clerkUser?.primaryEmailAddress?.emailAddress || "",
    };

    return (
        <UserContext.Provider value={{ role, user, apiUser, isLoading, refetchUser: mutate }}>
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
