"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/auth");
      return;
    }
    // Check if onboarding is complete
    const onboardingDone = typeof window !== "undefined" && localStorage.getItem("bgg_onboarding_complete") === "true";
    if (!onboardingDone) {
      router.replace("/onboarding");
      return;
    }
    // Redirect to role-appropriate dashboard
    const home = user?.role === "admin" ? "/admin" : user?.role === "mentor" ? "/mentor" : "/member";
    router.replace(home);
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );
}
