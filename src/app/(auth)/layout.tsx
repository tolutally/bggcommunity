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
      <div className="hidden lg:flex lg:w-[48%] flex-col justify-between relative overflow-hidden bg-brand-950">

        {/* Full-panel background photo */}
        <Image
          src="/black-woman-sign-in.jpg"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />

        {/* Dark base tint so photo blends into brand palette */}
        <div className="absolute inset-0 bg-brand-950/45" />

        {/* Top gradient — keeps logo readable */}
        <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-brand-950/90 via-brand-950/50 to-transparent" />

        {/* Bottom gradient — keeps quote readable */}
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-brand-950/95 via-brand-950/70 to-transparent" />

        {/* Logo */}
        <div className="relative z-10 p-12 xl:p-14 flex items-center gap-4">
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

        {/* Quote — anchored to bottom */}
        <div className="relative z-10 p-12 xl:p-14 space-y-4">
          <p className="text-4xl leading-none text-accent-400/80">&ldquo;</p>
          <blockquote className="-mt-3 text-balance text-[1.65rem] font-semibold leading-snug text-white">
            A space where Black women gather to grow, lead, and thrive together.
          </blockquote>
          <p className="text-sm leading-7 text-white/65 max-w-[30rem]">
            Equipping graduates and entrepreneurs with the network, accountability, and opportunities needed to build momentum together.
          </p>
          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              <div className="h-1 w-10 rounded-full bg-accent-500" />
              <div className="h-1 w-4 rounded-full bg-white/35" />
              <div className="h-1 w-4 rounded-full bg-white/35" />
            </div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">Gather. Learn. Lead.</p>
          </div>
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
