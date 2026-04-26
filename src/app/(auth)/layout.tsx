"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/member");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950" />
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-accent-400 blur-3xl" />
          <div className="absolute bottom-32 right-8 w-96 h-96 rounded-full bg-brand-500 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xs tracking-wide">BGG</span>
            </div>
            <span className="text-white font-semibold text-lg">Black Girls Gather</span>
          </div>
        </div>

        {/* Quote */}
        <div className="relative z-10 space-y-4">
          <blockquote className="text-white text-2xl font-medium leading-snug">
            &ldquo;A space where Black women gather to grow, lead, and thrive together.&rdquo;
          </blockquote>
          <p className="text-white/60 text-sm leading-relaxed">
            Equipping Black women graduates and entrepreneurs with the tools, strategies, and networks to realize their full potential.
          </p>
        </div>

        {/* Decorative dots */}
        <div className="relative z-10 flex gap-2">
          <div className="w-8 h-1 rounded-full bg-accent-500" />
          <div className="w-3 h-1 rounded-full bg-white/30" />
          <div className="w-3 h-1 rounded-full bg-white/30" />
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-stone-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-800 flex items-center justify-center">
              <span className="text-white font-bold text-xs">BGG</span>
            </div>
            <span className="text-brand-800 font-semibold">Black Girls Gather</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
