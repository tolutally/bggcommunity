"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import { useSignIn } from "@clerk/nextjs";

type Step = "email" | "reset" | "done";

export default function ForgotPasswordPage() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    setLoading(true);
    setError("");

    try {
      const { error: createError } = await signIn.create({ identifier: email });
      if (createError) {
        setError(createError.message ?? "Unable to start reset flow. Please try again.");
        return;
      }

      const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
      if (sendError) {
        setError(sendError.message ?? "Something went wrong. Please try again.");
        return;
      }

      setStep("reset");
    } catch (err: unknown) {
      const eErr = err as { message?: string };
      setError(eErr.message ?? "Unable to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({
        code,
      });

      if (verifyError) {
        setError(verifyError.message ?? "Invalid verification code.");
        return;
      }

      const { error: submitError } = await signIn.resetPasswordEmailCode.submitPassword({
        password: newPassword,
      });

      if (submitError) {
        setError(submitError.message ?? "Could not update password.");
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize();
      }

      setStep("done");
      setTimeout(() => {
        router.replace("/member");
      }, 600);
    } catch (err: unknown) {
      const eErr = err as { message?: string };
      setError(eErr.message ?? "Could not reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!signIn || !email) return;

    setResending(true);
    setError("");

    try {
      await signIn.create({ identifier: email });
      const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
      if (sendError) {
        setError(sendError.message ?? "Unable to resend code.");
      }
    } catch (err: unknown) {
      const eErr = err as { message?: string };
      setError(eErr.message ?? "Unable to resend code.");
    } finally {
      setResending(false);
    }
  };

  if (step === "done") {
    return (
      <div className="w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Password updated</h1>
        <p className="text-stone-500 text-sm leading-relaxed mb-8">
          Your password has been reset successfully. Redirecting you now...
        </p>
        <Link
          href="/member"
          className="inline-flex items-center gap-2 text-sm text-brand-700 hover:text-brand-900 font-semibold transition-colors"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setError("");
          }}
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Reset your password</h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            Enter the code sent to <span className="font-medium text-stone-700">{email}</span> and choose a new password.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-stone-700 mb-1.5">
              Verification code
            </label>
            <input
              id="code"
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 text-sm text-center tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-stone-700 mb-1.5">
              New password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700 mb-1.5">
              Confirm new password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                Reset password
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-stone-500">
          Didn&apos;t get a code?{" "}
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resending}
            className="text-brand-700 hover:text-brand-900 font-semibold transition-colors disabled:opacity-60"
          >
            {resending ? "Resending..." : "Resend code"}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Link
        href="/sign-in"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Forgot your password?</h1>
        <p className="text-stone-500 text-sm leading-relaxed">
          Enter your email address and we&apos;ll send you a reset code.
        </p>
      </div>

      <form onSubmit={handleSendCode} className="space-y-4">
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

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-800 hover:bg-brand-900 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Send reset code
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
