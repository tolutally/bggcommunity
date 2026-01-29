"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "member" | "mentor" | "admin";

interface User {
    name: string;
    avatar: string;
    email: string;
}

interface UserContextType {
    role: UserRole;
    setRole: (role: UserRole) => void;
    user: User;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [role, setRole] = useState<UserRole>("member");

    // Mock user data that might change based on role in a real app
    const user: User = {
        name: "Nia Johnson",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
        email: "nia.johnson@example.com",
    };

    return (
        <UserContext.Provider value={{ role, setRole, user }}>
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
