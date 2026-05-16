"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <AuthenticateWithRedirectCallback
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      firstFactorUrl="/sign-in"
      secondFactorUrl="/sign-in"
      signInFallbackRedirectUrl="/member"
      signInForceRedirectUrl="/member"
      signUpFallbackRedirectUrl="/onboarding"
      signUpForceRedirectUrl="/onboarding"
    />
  );
}
