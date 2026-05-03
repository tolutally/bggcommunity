"use client";

import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
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
      <div className="hidden lg:flex lg:w-[48%] flex-col justify-between p-12 xl:p-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950" />
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-12 left-12 h-64 w-64 rounded-full bg-accent-400/70 blur-3xl" />
          <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-brand-400/60 blur-3xl" />
          <div className="absolute inset-x-10 top-1/3 h-px bg-white/15" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="rounded-[1.4rem] bg-white/10 px-4 py-3 backdrop-blur-sm ring-1 ring-white/15 shadow-2xl">
            <Image
              src="/BBG-Final-Logo.png"
              alt="Black Girls Gather"
              width={132}
              height={48}
              className="h-9 w-auto"
              priority
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-200/90">Community Platform</p>
            <p className="mt-1 text-lg font-semibold text-white">Black Girls Gather</p>
          </div>
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[34rem]">
            <div className="relative mx-auto flex min-h-[25rem] items-center justify-center overflow-hidden rounded-[2rem] border border-white/15 bg-white/8 px-10 py-12 shadow-[0_28px_80px_rgba(15,8,28,0.42)] backdrop-blur-md">
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
              <div className="absolute -left-10 top-10 h-28 w-28 rounded-full border border-white/20" />
              <div className="absolute -right-8 bottom-8 h-24 w-24 rounded-full bg-accent-400/20 blur-2xl" />
              <Image
                src="/BBG-Final-Logo.png"
                alt="Black Girls Gather logo"
                width={540}
                height={220}
                className="relative z-10 h-auto w-full max-w-[28rem] drop-shadow-[0_18px_28px_rgba(0,0,0,0.22)]"
                priority
              />
            </div>

            <div className="mx-auto mt-8 max-w-[30rem] text-center">
              <p className="text-5xl leading-none text-accent-300/80">&ldquo;</p>
              <blockquote className="-mt-5 text-balance text-[2rem] font-medium leading-[1.25] text-white">
                A space where Black women gather to grow, lead, and thrive together.
              </blockquote>
              <p className="mt-4 text-sm leading-7 text-white/68">
                Equipping graduates and entrepreneurs with the network, accountability, and opportunities needed to build momentum together.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative dots */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <div className="h-1 w-10 rounded-full bg-accent-500" />
            <div className="h-1 w-4 rounded-full bg-white/35" />
            <div className="h-1 w-4 rounded-full bg-white/35" />
          </div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/50">Gather. Learn. Lead.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-stone-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Image
              src="/BBG-Final-Logo.png"
              alt="Black Girls Gather"
              width={140}
              height={52}
              className="h-10 w-auto"
              priority
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
