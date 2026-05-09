"use client";

import React, { createContext, useContext, useEffect, useCallback, useRef, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    useAuth as useClerkAuth,
    useUser as useClerkUser,
} from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ApiError, apiClient } from "@/lib/api";
import {
    ONBOARDING_LOCAL_STATE_EVENT,
    clearLocalOnboardingFallback,
    loadLocalOnboardingStatus,
    loadPendingOnboardingSync,
    markOnboardingFallbackComplete,
    markOnboardingSynced,
    savePendingOnboardingSync,
} from "@/lib/onboarding";
import {
    completeCurrentUserOnboarding,
    getUsersErrorMessage,
    updateCurrentUserProfile,
    updateProfileVisibility,
    uploadCurrentUserAvatar,
} from "@/lib/users";

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
    onboardingComplete: boolean | null;
    onboardingPendingSync: boolean;
    onboardingStatusSource: "api" | "fallback" | null;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_INTENT_STORAGE_KEY = "bgg_auth_intent";
const MEMBER_REQUIRED_REDIRECT = "/sign-in?memberRequired=1";

/* ── Validation helpers (kept for any remaining consumers) ── */
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

/* ── Map BE uppercase role to FE lowercase ── */
/* ── Allowed admin emails (comma-separated env var, empty = no restriction) ── */
const ADMIN_WHITELIST: Set<string> = new Set(
    (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
);

function normalizeRole(role: string | undefined, email?: string): UserRole {
    if (!role) return "member";
    const lower = role.toLowerCase();
    if (lower === "admin") {
        // If a whitelist is configured, the email must be on it
        if (ADMIN_WHITELIST.size > 0 && (!email || !ADMIN_WHITELIST.has(email.toLowerCase()))) {
            return "member";
        }
        return "admin";
    }
    if (lower === "mentor") return "mentor";
    return "member";
}

/* ── Provider ── */
export function AuthProvider({ children }: { children: ReactNode }) {
    const { isSignedIn, isLoaded: clerkLoaded, signOut, getToken, userId } = useClerkAuth();
    const { user: clerkUser } = useClerkUser();
    const { user: apiUser, error: apiUserError, isLoading: apiLoading, mutate: mutateCurrentUser } = useCurrentUser();
    const [localStateVersion, setLocalStateVersion] = useState(0);
    const syncInFlightRef = useRef<string | null>(null);
    const memberRedirectInFlightRef = useRef(false);

    const isLoading = !clerkLoaded || (isSignedIn && apiLoading);
    const localOnboardingStatus = userId ? loadLocalOnboardingStatus(userId) : {
        completed: false,
        source: "fallback" as const,
        completedAt: null,
        pendingSync: false,
        lastSyncError: null,
    };

    useEffect(() => {
        const handleStateChange = () => {
            setLocalStateVersion((current) => current + 1);
        };

        window.addEventListener(ONBOARDING_LOCAL_STATE_EVENT, handleStateChange);
        return () => window.removeEventListener(ONBOARDING_LOCAL_STATE_EVENT, handleStateChange);
    }, []);

    useEffect(() => {
        void localStateVersion;
    }, [localStateVersion]);

    // Build AuthUser from Clerk + API data
    const user: AuthUser | null = isSignedIn
        ? {
              id: apiUser?.id ?? clerkUser?.id ?? "",
              name: apiUser?.profile
                  ? (apiUser.profile.displayName ??
                    `${apiUser.profile.firstName ?? ""} ${apiUser.profile.lastName ?? ""}`.trim())
                  : clerkUser?.fullName ?? clerkUser?.primaryEmailAddress?.emailAddress ?? "",
              email: apiUser?.email ?? clerkUser?.primaryEmailAddress?.emailAddress ?? "",
              avatar: apiUser?.profile?.avatarUrl ?? clerkUser?.imageUrl ?? "",
              role: normalizeRole(apiUser?.role, apiUser?.email ?? clerkUser?.primaryEmailAddress?.emailAddress),
          }
        : null;

    const logout = useCallback(async () => {
        try {
            const token = await getToken();
            await apiClient("/auth/logout", { method: "POST", token });
        } catch {
            // Backend logout is best-effort
        }
        await signOut();
    }, [getToken, signOut]);

    const onboardingComplete = apiLoading
        ? null
        : apiUser
          ? (apiUser.onboardingComplete || localOnboardingStatus.completed)
          : isSignedIn
            ? localOnboardingStatus.completed
            : null;
    const onboardingPendingSync = localOnboardingStatus.pendingSync;
    const onboardingStatusSource = onboardingComplete
        ? (apiUser?.onboardingComplete ? "api" : localOnboardingStatus.source)
        : null;

    useEffect(() => {
        if (!clerkLoaded || apiLoading) {
            return;
        }

        if (!isSignedIn) {
            memberRedirectInFlightRef.current = false;
            return;
        }

        if (apiUser || !(apiUserError instanceof ApiError) || apiUserError.status !== 401) {
            return;
        }

        if (typeof window === "undefined") {
            return;
        }

        const authIntent = window.sessionStorage.getItem(AUTH_INTENT_STORAGE_KEY);
        if (authIntent !== "sign-in" || memberRedirectInFlightRef.current) {
            return;
        }

        memberRedirectInFlightRef.current = true;
        window.sessionStorage.removeItem(AUTH_INTENT_STORAGE_KEY);

        void signOut({ redirectUrl: MEMBER_REQUIRED_REDIRECT });
    }, [apiLoading, apiUser, apiUserError, clerkLoaded, isSignedIn, signOut]);

    useEffect(() => {
        if (!userId || !isSignedIn || apiLoading) {
            return;
        }

        if (apiUser?.onboardingComplete) {
            const pendingSync = loadPendingOnboardingSync(userId);
            clearLocalOnboardingFallback(userId);
            if (pendingSync) {
                markOnboardingSynced(userId, pendingSync.draft);
            }
            return;
        }

        const pendingSync = loadPendingOnboardingSync(userId);
        if (!localOnboardingStatus.pendingSync || !pendingSync || syncInFlightRef.current === userId) {
            return;
        }

        let cancelled = false;
        syncInFlightRef.current = userId;

        const syncPendingOnboarding = async () => {
            try {
                await updateCurrentUserProfile({
                    occupation: pendingSync.draft.profile.occupation,
                    industry: pendingSync.draft.profile.industry,
                    location: pendingSync.draft.profile.location,
                    bio: pendingSync.draft.profile.bio,
                    website: pendingSync.draft.profile.website,
                    linkedin: pendingSync.draft.profile.linkedin,
                    twitter: pendingSync.draft.profile.twitter,
                    company: pendingSync.draft.profile.company,
                    isOpenToWork: pendingSync.draft.privacy.openToWork,
                }, getToken);
                await updateProfileVisibility(pendingSync.draft.privacy.profileVisible, getToken);

                if (pendingSync.draft.avatarSrc.startsWith("data:")) {
                    const avatarResponse = await fetch(pendingSync.draft.avatarSrc);
                    const avatarBlob = await avatarResponse.blob();
                    const avatarFile = new File([avatarBlob], "onboarding-avatar", { type: avatarBlob.type || "image/png" });
                    await uploadCurrentUserAvatar(avatarFile, getToken);
                }

                await completeCurrentUserOnboarding(getToken);
                markOnboardingSynced(userId, pendingSync.draft);
                await mutateCurrentUser();
            } catch (error) {
                const message = getUsersErrorMessage(error);
                savePendingOnboardingSync(userId, pendingSync.draft, message);
                markOnboardingFallbackComplete(userId, pendingSync.draft, message);
            } finally {
                if (!cancelled) {
                    syncInFlightRef.current = null;
                    setLocalStateVersion((current) => current + 1);
                }
            }
        };

        void syncPendingOnboarding();

        return () => {
            cancelled = true;
        };
    }, [apiLoading, apiUser?.onboardingComplete, getToken, isSignedIn, localOnboardingStatus.pendingSync, mutateCurrentUser, userId, localStateVersion]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!isSignedIn,
                isLoading,
                onboardingComplete,
                onboardingPendingSync,
                onboardingStatusSource,
                logout,
            }}
        >
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

export function RouteGuard({ children, allowedRoles, redirectTo = "/sign-in" }: RouteGuardProps) {
    const { user, isAuthenticated, isLoading, onboardingComplete } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            if (typeof window !== "undefined") {
                sessionStorage.setItem("bgg_redirect_after_login", pathname);
            }
            router.replace(redirectTo);
            return;
        }

        // Onboarding is only required for members.
        if (user?.role === "member" && onboardingComplete === false && !pathname.startsWith("/onboarding")) {
            router.replace("/onboarding");
            return;
        }

        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            const roleHome = user.role === "admin" ? "/admin" : user.role === "mentor" ? "/mentor" : "/member";
            router.replace(roleHome);
        }
    }, [isAuthenticated, isLoading, user, allowedRoles, router, pathname, redirectTo, onboardingComplete]);

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
