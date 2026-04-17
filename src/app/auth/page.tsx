"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Legacy /auth page â€” redirects to Clerk-powered /sign-in.
 * Kept so bookmarks/links don't break.
 */
export default function AuthPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;
        if (isAuthenticated) {
            router.replace("/member");
        } else {
            router.replace("/sign-in");
        }
    }, [isAuthenticated, isLoading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
    );
}
