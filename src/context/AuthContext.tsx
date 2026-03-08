"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

/* ── Types ── */
export type UserRole = "member" | "mentor" | "admin";

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: UserRole;
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
    forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
    resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ── Storage key ── */
const AUTH_STORAGE_KEY = "bgg_auth_user";

/* ── Mock user database ── */
const MOCK_USERS: Record<string, { password: string; user: AuthUser }> = {
    "nia@example.com": {
        password: "password123",
        user: { id: "1", name: "Nia Johnson", email: "nia@example.com", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d", role: "member" },
    },
    "admin@bgg.com": {
        password: "admin123",
        user: { id: "2", name: "Admin User", email: "admin@bgg.com", avatar: "https://i.pravatar.cc/150?u=admin", role: "admin" },
    },
    "mentor@bgg.com": {
        password: "mentor123",
        user: { id: "3", name: "Dr. Alisha Reid", email: "mentor@bgg.com", avatar: "https://i.pravatar.cc/150?u=mentor", role: "mentor" },
    },
};

/* ── Validation helpers ── */
export function validateEmail(email: string): string | null {
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address";
    return null;
}

export function validatePassword(password: string): string | null {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain a number";
    return null;
}

export function validateName(name: string): string | null {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    return null;
}

/* ── Provider ── */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(AUTH_STORAGE_KEY);
            if (stored) {
                setUser(JSON.parse(stored));
            }
        } catch {
            // ignore parse errors
        }
        setIsLoading(false);
    }, []);

    const persistUser = useCallback((u: AuthUser | null) => {
        setUser(u);
        if (u) {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        // Simulate network delay
        await new Promise(r => setTimeout(r, 800));
        const entry = MOCK_USERS[email.toLowerCase().trim()];
        if (!entry || entry.password !== password) {
            return { success: false, error: "Invalid email or password" };
        }
        persistUser(entry.user);
        return { success: true };
    }, [persistUser]);

    const signup = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        await new Promise(r => setTimeout(r, 1000));
        const key = email.toLowerCase().trim();
        if (MOCK_USERS[key]) {
            return { success: false, error: "An account with this email already exists" };
        }
        // Create new user
        const newUser: AuthUser = {
            id: String(Date.now()),
            name: name.trim(),
            email: key,
            avatar: `https://i.pravatar.cc/150?u=${key}`,
            role: "member",
        };
        // Add to mock DB for session
        MOCK_USERS[key] = { password, user: newUser };
        persistUser(newUser);
        return { success: true };
    }, [persistUser]);

    const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        await new Promise(r => setTimeout(r, 1200));
        // Simulate Google OAuth — auto-login as mock member
        const googleUser: AuthUser = {
            id: "google-1",
            name: "Nia Johnson",
            email: "nia.google@example.com",
            avatar: "https://i.pravatar.cc/150?u=google-nia",
            role: "member",
        };
        persistUser(googleUser);
        return { success: true };
    }, [persistUser]);

    const forgotPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
        await new Promise(r => setTimeout(r, 800));
        // Always succeed (don't reveal whether email exists)
        return { success: true };
    }, []);

    const resetPassword = useCallback(async (_token: string, _password: string): Promise<{ success: boolean; error?: string }> => {
        await new Promise(r => setTimeout(r, 800));
        return { success: true };
    }, []);

    const logout = useCallback(() => {
        persistUser(null);
    }, [persistUser]);

    const setRole = useCallback((role: UserRole) => {
        if (user) {
            persistUser({ ...user, role });
        }
    }, [user, persistUser]);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            signup,
            loginWithGoogle,
            forgotPassword,
            resetPassword,
            logout,
            setRole,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

/* ── Route Guard Component ── */
interface RouteGuardProps {
    children: ReactNode;
    allowedRoles?: UserRole[];
    redirectTo?: string;
}

export function RouteGuard({ children, allowedRoles, redirectTo = "/auth" }: RouteGuardProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            // Save intended destination for post-login redirect
            if (typeof window !== "undefined") {
                sessionStorage.setItem("bgg_redirect_after_login", pathname);
            }
            router.replace(redirectTo);
            return;
        }

        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            // Redirect to appropriate dashboard based on role
            const roleHome = user.role === "admin" ? "/admin" : user.role === "mentor" ? "/mentor" : "/member";
            router.replace(roleHome);
        }
    }, [isAuthenticated, isLoading, user, allowedRoles, router, pathname, redirectTo]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-stone-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;
    if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

    return <>{children}</>;
}
