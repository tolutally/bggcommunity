"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Check, AlertCircle, Loader2 } from "lucide-react";
import { useAuth, validateEmail, validatePassword, validateName } from "@/context/AuthContext";

type AuthView = "sign-in" | "sign-up" | "forgot-password" | "reset-sent";

export default function AuthPage() {
    const { isAuthenticated, isLoading, login, signup, loginWithGoogle, forgotPassword } = useAuth();
    const router = useRouter();
    const [view, setView] = useState<AuthView>("sign-in");

    // Redirect if already authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            // Check if onboarding is complete
            const onboardingDone = localStorage.getItem("bgg_onboarding_complete") === "true";
            if (!onboardingDone) {
                router.replace("/onboarding");
                return;
            }
            const redirect = sessionStorage.getItem("bgg_redirect_after_login") || "/member";
            sessionStorage.removeItem("bgg_redirect_after_login");
            router.replace(redirect);
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (isAuthenticated) return null;

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-stone-50">
            {/* Left Panel — Branding */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-accent-500 opacity-15 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-pink-500 opacity-10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-600 opacity-20 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
                    {/* Logo */}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
                                <span className="text-2xl font-black text-white">B</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Black Girls Gather</h2>
                                <p className="text-sm text-brand-200 font-medium">Community Platform</p>
                            </div>
                        </div>
                    </div>

                    {/* Tagline */}
                    <div className="space-y-6">
                        <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                            Learn, grow, and
                            <br />
                            <span className="text-accent-400">thrive together.</span>
                        </h1>
                        <p className="text-lg text-brand-200 max-w-sm leading-relaxed">
                            Join a vibrant community of Black women in tech. Access mentorship, cohort-based programs, and career resources.
                        </p>
                    </div>

                    {/* Social Proof */}
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[10, 11, 12, 13, 14].map(i => (
                                <img key={i} src={`https://i.pravatar.cc/40?u=${i}`} alt="" className="w-10 h-10 rounded-full border-2 border-brand-800" />
                            ))}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">200+ members</p>
                            <p className="text-xs text-brand-300">across 3 active cohorts</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel — Auth Forms */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8 text-center">
                        <div className="inline-flex items-center gap-2.5 mb-4">
                            <div className="w-10 h-10 bg-brand-800 rounded-xl flex items-center justify-center">
                                <span className="text-xl font-black text-white">B</span>
                            </div>
                            <span className="text-xl font-bold text-stone-900">Black Girls Gather</span>
                        </div>
                    </div>

                    {view === "sign-in" && (
                        <SignInForm
                            onLogin={login}
                            onGoogleLogin={loginWithGoogle}
                            onSwitchToSignUp={() => setView("sign-up")}
                            onForgotPassword={() => setView("forgot-password")}
                        />
                    )}
                    {view === "sign-up" && (
                        <SignUpForm
                            onSignup={signup}
                            onGoogleLogin={loginWithGoogle}
                            onSwitchToSignIn={() => setView("sign-in")}
                        />
                    )}
                    {view === "forgot-password" && (
                        <ForgotPasswordForm
                            onSubmit={forgotPassword}
                            onBack={() => setView("sign-in")}
                            onSuccess={() => setView("reset-sent")}
                        />
                    )}
                    {view === "reset-sent" && (
                        <ResetSentConfirmation onBack={() => setView("sign-in")} />
                    )}
                </div>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────
   Sign In Form
   ──────────────────────────────────────────── */
function SignInForm({ onLogin, onGoogleLogin, onSwitchToSignUp, onForgotPassword }: {
    onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    onGoogleLogin: () => Promise<{ success: boolean; error?: string }>;
    onSwitchToSignUp: () => void;
    onForgotPassword: () => void;
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setServerError("");

        const errs: Record<string, string> = {};
        const emailErr = validateEmail(email);
        if (emailErr) errs.email = emailErr;
        if (!password) errs.password = "Password is required";
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setLoading(true);
        const result = await onLogin(email, password);
        setLoading(false);
        if (!result.success) {
            setServerError(result.error || "Login failed. Please try again.");
        }
    };

    const handleGoogle = async () => {
        setServerError("");
        setGoogleLoading(true);
        const result = await onGoogleLogin();
        setGoogleLoading(false);
        if (!result.success) {
            setServerError(result.error || "Google login failed. Please try again.");
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-stone-900 mb-2">Welcome back</h1>
            <p className="text-stone-500 mb-8">Sign in to your BGG account</p>

            {/* Google OAuth Button */}
            <button
                onClick={handleGoogle}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-stone-200 rounded-xl font-semibold text-stone-700 hover:border-stone-300 hover:bg-stone-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {googleLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : (
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                )}
                Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-stone-200" />
            </div>

            {/* Server Error */}
            {serverError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-sm text-red-700 font-medium">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email</label>
                    <div className="relative">
                        <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: "" })); }}
                            placeholder="you@example.com"
                            className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.email ? "border-red-300 bg-red-50" : "border-stone-200"}`}
                            autoComplete="email"
                        />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-semibold text-stone-700">Password</label>
                        <button type="button" onClick={onForgotPassword} className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors">
                            Forgot password?
                        </button>
                    </div>
                    <div className="relative">
                        <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: "" })); }}
                            placeholder="Enter your password"
                            className={`w-full pl-11 pr-12 py-3 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.password ? "border-red-300 bg-red-50" : "border-stone-200"}`}
                            autoComplete="current-password"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full py-3 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-800/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : null}
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </form>

            {/* Test account hint */}
            <div className="mt-4 p-3 bg-stone-100 rounded-xl text-xs text-stone-500">
                <span className="font-semibold text-stone-600">Demo:</span>{" "}
                <span className="font-mono">nia@example.com</span> / <span className="font-mono">password123</span>
                <br />
                <span className="font-mono">admin@bgg.com</span> / <span className="font-mono">admin123</span>
            </div>

            <p className="text-center mt-6 text-sm text-stone-500">
                Don&apos;t have an account?{" "}
                <button onClick={onSwitchToSignUp} className="font-bold text-brand-700 hover:text-brand-900 transition-colors">
                    Sign up
                </button>
            </p>
        </div>
    );
}

/* ────────────────────────────────────────────
   Sign Up Form
   ──────────────────────────────────────────── */
function SignUpForm({ onSignup, onGoogleLogin, onSwitchToSignIn }: {
    onSignup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    onGoogleLogin: () => Promise<{ success: boolean; error?: string }>;
    onSwitchToSignIn: () => void;
}) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // Password strength indicator
    const passwordChecks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
    };
    const strengthScore = Object.values(passwordChecks).filter(Boolean).length;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setServerError("");

        const errs: Record<string, string> = {};
        const nameErr = validateName(name);
        if (nameErr) errs.name = nameErr;
        const emailErr = validateEmail(email);
        if (emailErr) errs.email = emailErr;
        const passErr = validatePassword(password);
        if (passErr) errs.password = passErr;
        if (password !== confirmPassword) errs.confirmPassword = "Passwords don't match";
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setLoading(true);
        const result = await onSignup(name, email, password);
        setLoading(false);
        if (!result.success) {
            setServerError(result.error || "Sign up failed. Please try again.");
        }
    };

    const handleGoogle = async () => {
        setServerError("");
        setGoogleLoading(true);
        const result = await onGoogleLogin();
        setGoogleLoading(false);
        if (!result.success) {
            setServerError(result.error || "Google login failed.");
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-stone-900 mb-2">Create your account</h1>
            <p className="text-stone-500 mb-8">Join the BGG community today</p>

            {/* Google OAuth */}
            <button
                onClick={handleGoogle}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-stone-200 rounded-xl font-semibold text-stone-700 hover:border-stone-300 hover:bg-stone-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {googleLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : (
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                )}
                Sign up with Google
            </button>

            <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-stone-200" />
            </div>

            {serverError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-sm text-red-700 font-medium">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Full Name</label>
                    <div className="relative">
                        <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            value={name}
                            onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: "" })); }}
                            placeholder="Nia Johnson"
                            className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.name ? "border-red-300 bg-red-50" : "border-stone-200"}`}
                            autoComplete="name"
                        />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email</label>
                    <div className="relative">
                        <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: "" })); }}
                            placeholder="you@example.com"
                            className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.email ? "border-red-300 bg-red-50" : "border-stone-200"}`}
                            autoComplete="email"
                        />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Password</label>
                    <div className="relative">
                        <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: "" })); }}
                            placeholder="Create a strong password"
                            className={`w-full pl-11 pr-12 py-3 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.password ? "border-red-300 bg-red-50" : "border-stone-200"}`}
                            autoComplete="new-password"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}

                    {/* Password Strength */}
                    {password.length > 0 && (
                        <div className="mt-2 space-y-2">
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strengthScore ? (strengthScore === 1 ? "bg-red-400" : strengthScore === 2 ? "bg-amber-400" : "bg-green-500") : "bg-stone-200"}`} />
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                                <span className={`flex items-center gap-1 ${passwordChecks.length ? "text-green-600" : "text-stone-400"}`}>
                                    <Check size={10} /> 8+ characters
                                </span>
                                <span className={`flex items-center gap-1 ${passwordChecks.uppercase ? "text-green-600" : "text-stone-400"}`}>
                                    <Check size={10} /> Uppercase letter
                                </span>
                                <span className={`flex items-center gap-1 ${passwordChecks.number ? "text-green-600" : "text-stone-400"}`}>
                                    <Check size={10} /> Number
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Confirm Password</label>
                    <div className="relative">
                        <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={e => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: "" })); }}
                            placeholder="Re-enter your password"
                            className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.confirmPassword ? "border-red-300 bg-red-50" : "border-stone-200"}`}
                            autoComplete="new-password"
                        />
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full py-3 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-800/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : null}
                    {loading ? "Creating account..." : "Create Account"}
                </button>
            </form>

            <p className="text-center mt-6 text-sm text-stone-500">
                Already have an account?{" "}
                <button onClick={onSwitchToSignIn} className="font-bold text-brand-700 hover:text-brand-900 transition-colors">
                    Sign in
                </button>
            </p>
        </div>
    );
}

/* ────────────────────────────────────────────
   Forgot Password Form
   ──────────────────────────────────────────── */
function ForgotPasswordForm({ onSubmit, onBack, onSuccess }: {
    onSubmit: (email: string) => Promise<{ success: boolean; error?: string }>;
    onBack: () => void;
    onSuccess: () => void;
}) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        const emailErr = validateEmail(email);
        if (emailErr) { setError(emailErr); return; }

        setLoading(true);
        const result = await onSubmit(email);
        setLoading(false);
        if (result.success) {
            onSuccess();
        } else {
            setError(result.error || "Something went wrong. Please try again.");
        }
    };

    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-brand-700 transition-colors mb-6">
                <ArrowLeft size={16} /> Back to sign in
            </button>

            <h1 className="text-3xl font-bold text-stone-900 mb-2">Forgot password?</h1>
            <p className="text-stone-500 mb-8">Enter your email and we&apos;ll send you a reset link.</p>

            {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-sm text-red-700 font-medium">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email address</label>
                    <div className="relative">
                        <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(""); }}
                            placeholder="you@example.com"
                            className="w-full pl-11 pr-4 py-3 border border-stone-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300"
                            autoComplete="email"
                            autoFocus
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-800/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : null}
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>
        </div>
    );
}

/* ────────────────────────────────────────────
   Reset Email Sent Confirmation
   ──────────────────────────────────────────── */
function ResetSentConfirmation({ onBack }: { onBack: () => void }) {
    return (
        <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail size={32} className="text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-stone-900 mb-2">Check your email</h1>
            <p className="text-stone-500 mb-2 max-w-xs mx-auto">
                We&apos;ve sent a password reset link to your email address. Click the link to create a new password.
            </p>
            <p className="text-xs text-stone-400 mb-8">
                Didn&apos;t receive it? Check your spam folder or try again.
            </p>

            <button
                onClick={onBack}
                className="w-full py-3 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-800/20"
            >
                Back to Sign In
            </button>
        </div>
    );
}
