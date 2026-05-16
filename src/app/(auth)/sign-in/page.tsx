"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useSignIn } from "@clerk/nextjs/legacy";
import { useToast } from "@/components/ui/toast";

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

type OAuthStrategy = "oauth_google";

const AUTH_INTENT_STORAGE_KEY = "bgg_auth_intent";
const AUTH_INTENT_STARTED_AT_KEY = "bgg_auth_intent_started_at";
const MEMBER_REQUIRED_MESSAGE = "No member account was found for this sign-in. Please sign up first.";
const ADMIN_EMAIL_WHITELIST = new Set(
  (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);

function getPostSignInDestination(emailAddress: string) {
  return ADMIN_EMAIL_WHITELIST.has(emailAddress.trim().toLowerCase()) ? "/admin" : "/member";
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="w-full" />}>
      <SignInPageInner />
    </Suspense>
  );
}

function SignInPageInner() {
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);
  const [error, setError] = useState("");
  const [awaitingEmailCode, setAwaitingEmailCode] = useState(false);

  const getEmailCodeHint = useCallback((attempt: unknown) => {
    const signInAttempt = attempt as {
      supportedSecondFactors?: Array<{ strategy?: string; safeIdentifier?: string }>;
    };
    const factor = signInAttempt.supportedSecondFactors?.find((item) => item.strategy === "email_code");

    if (factor?.safeIdentifier) {
      return `Enter the verification code sent to ${factor.safeIdentifier}.`;
    }

    return "Enter the verification code sent to your email to finish signing in.";
  }, []);

  const [verificationHint, setVerificationHint] = useState(
    "Enter the verification code sent to your email to finish signing in.",
  );

  const finalizeSuccessfulSignIn = useCallback(async (createdSessionId: string | null | undefined) => {
    if (!createdSessionId) {
      setError("Sign in could not be completed. Please try again.");
      return;
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(AUTH_INTENT_STORAGE_KEY);
      window.sessionStorage.removeItem(AUTH_INTENT_STARTED_AT_KEY);
    }

    await setActive({ session: createdSessionId });
    router.replace(getPostSignInDestination(email));
  }, [email, router, setActive]);

  const sendEmailCodeForPendingSignIn = useCallback(async (attempt: unknown) => {
    const signInAttempt = attempt as {
      supportedSecondFactors?: Array<{ strategy?: string }>;
      prepareSecondFactor?: (params: { strategy: "email_code" }) => Promise<unknown>;
      mfa?: {
        sendEmailCode?: () => Promise<unknown>;
      };
    };

    const supportsEmailCode = signInAttempt.supportedSecondFactors?.some((factor) => factor.strategy === "email_code");

    if (!supportsEmailCode) {
      throw new Error("This account does not have email code verification enabled.");
    }

    if (typeof signInAttempt.prepareSecondFactor === "function") {
      await signInAttempt.prepareSecondFactor({ strategy: "email_code" });
      return;
    }

    if (typeof signInAttempt.mfa?.sendEmailCode === "function") {
      await signInAttempt.mfa.sendEmailCode();
      return;
    }

    throw new Error("Could not initiate email verification for this sign-in attempt.");
  }, []);

  const enterVerificationStep = useCallback(async (attempt: unknown) => {
    await sendEmailCodeForPendingSignIn(attempt);
    setVerificationHint(getEmailCodeHint(attempt));
    setVerificationCode("");
    setAwaitingEmailCode(true);
  }, [getEmailCodeHint, sendEmailCodeForPendingSignIn]);

  useEffect(() => {
    if (searchParams.get("memberRequired") !== "1") {
      return;
    }

    setError(MEMBER_REQUIRED_MESSAGE);
    toast(MEMBER_REQUIRED_MESSAGE, "error");

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(AUTH_INTENT_STORAGE_KEY);
      window.sessionStorage.removeItem(AUTH_INTENT_STARTED_AT_KEY);
    }
  }, [searchParams, toast]);

  useEffect(() => {
    if (!signIn || awaitingEmailCode) {
      return;
    }

    if (signIn.status !== "needs_client_trust" && signIn.status !== "needs_second_factor") {
      return;
    }

    void enterVerificationStep(signIn);
  }, [awaitingEmailCode, enterVerificationStep, signIn]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    setLoading(true);
    setError("");

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(AUTH_INTENT_STORAGE_KEY, "sign-in");
      window.sessionStorage.setItem(AUTH_INTENT_STARTED_AT_KEY, String(Date.now()));
    }

    try {
      // Use Clerk's classic API: create with password strategy returns a result with createdSessionId
      const result = await signIn.create({
        strategy: "password",
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await finalizeSuccessfulSignIn(result.createdSessionId);
        return;
      }

      if (result.status === "needs_client_trust" || result.status === "needs_second_factor") {
        await enterVerificationStep(result);
        return;
      }

      setError("Sign in could not be completed. Please try again.");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message: string }>; message?: string };
      const message = clerkErr.errors?.[0]?.message ?? clerkErr.message ?? "Sign in failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    const trimmedCode = verificationCode.trim();
    if (!trimmedCode) {
      setError("Enter the verification code sent to your email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const attempt = signIn as {
        attemptSecondFactor?: (params: { strategy: "email_code"; code: string }) => Promise<{
          status: string;
          createdSessionId?: string | null;
        }>;
        mfa?: {
          verifyEmailCode?: (params: { code: string }) => Promise<{
            status: string;
            createdSessionId?: string | null;
          }>;
        };
      };

      let verificationResult: { status: string; createdSessionId?: string | null } | null = null;

      if (typeof attempt.attemptSecondFactor === "function") {
        verificationResult = await attempt.attemptSecondFactor({
          strategy: "email_code",
          code: trimmedCode,
        });
      } else if (typeof attempt.mfa?.verifyEmailCode === "function") {
        verificationResult = await attempt.mfa.verifyEmailCode({ code: trimmedCode });
      } else {
        setError("Verification is not available right now. Please restart sign in.");
        return;
      }

      if (verificationResult?.status === "complete") {
        await finalizeSuccessfulSignIn(verificationResult.createdSessionId);
        return;
      }

      setError("Verification did not complete. Request a new code and try again.");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message: string }>; message?: string };
      const message = clerkErr.errors?.[0]?.message ?? clerkErr.message ?? "Verification failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmailCode = async () => {
    if (!signIn) return;

    setResendingCode(true);
    setError("");

    try {
      await sendEmailCodeForPendingSignIn(signIn);
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message: string }>; message?: string };
      const message = clerkErr.errors?.[0]?.message ?? clerkErr.message ?? "Unable to resend code. Please try again.";
      setError(message);
    } finally {
      setResendingCode(false);
    }
  };

  const restartSignIn = async () => {
    setError("");
    setVerificationCode("");
    setAwaitingEmailCode(false);
    setVerificationHint("Enter the verification code sent to your email to finish signing in.");

    const attempt = signIn as { reset?: () => Promise<unknown> | void } | undefined;
    if (typeof attempt?.reset === "function") {
      await attempt.reset();
    }
  };

  const handleSocialSignIn = async (strategy: OAuthStrategy) => {
    if (!signIn) return;

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(AUTH_INTENT_STORAGE_KEY, "sign-in");
      window.sessionStorage.setItem(AUTH_INTENT_STARTED_AT_KEY, String(Date.now()));
    }

    await signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: `${window.location.origin}/sso-callback`,
      redirectUrlComplete: `${window.location.origin}/member`,
    });
  };

  if (awaitingEmailCode) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => {
            void restartSignIn();
          }}
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Start over
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Verify your sign in</h1>
          <p className="text-stone-500 text-sm leading-relaxed">{verificationHint}</p>
        </div>

        <form onSubmit={handleVerifyEmailCode} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-stone-700 mb-1.5">
              Verification code
            </label>
            <input
              id="verificationCode"
              type="text"
              required
              maxLength={6}
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value)}
              placeholder="000000"
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 text-sm text-center tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-800 hover:bg-brand-900 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Verify and continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-stone-500">
          Didn&apos;t get a code?{" "}
          <button
            type="button"
            onClick={handleResendEmailCode}
            disabled={resendingCode}
            className="text-brand-700 hover:text-brand-900 font-semibold transition-colors disabled:opacity-60"
          >
            {resendingCode ? "Resending..." : "Resend code"}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Welcome back</h1>
        <p className="text-stone-500 text-sm">Sign in to your BGG account to continue.</p>
      </div>

      {/* Social sign-in buttons */}
      <div className="space-y-3 mb-6">
        <button
          onClick={() => handleSocialSignIn("oauth_google")}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition-colors text-sm font-medium text-stone-700 shadow-sm"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-stone-200" />
        <span className="text-xs text-stone-400 font-medium">or continue with email</span>
        <div className="flex-1 h-px bg-stone-200" />
      </div>

      {/* Email/password form */}
      <form onSubmit={handleEmailSignIn} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-brand-600 hover:text-brand-800 font-medium transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-800 hover:bg-brand-900 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-brand-700 hover:text-brand-900 font-semibold transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
}