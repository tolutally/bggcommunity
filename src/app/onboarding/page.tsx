"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    User, Globe, Linkedin, Twitter, Github, Lock, Target,
    ChevronRight, ChevronLeft, Check, Upload, X, Loader2,
    Eye, Camera,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast";

/* ── Types ── */
interface OnboardingData {
    /* Step 1 — Basic Info */
    displayName: string;
    occupation: string;
    industry: string;
    location: string;
    bio: string;
    /* Step 2 — Photo */
    photoUrl: string;
    /* Step 3 — Social Links */
    website: string;
    linkedin: string;
    twitter: string;
    github: string;
    /* Step 4 — Privacy */
    profileVisible: boolean;
    showEmail: boolean;
    showSocials: boolean;
    showLocation: boolean;
    /* Step 5 — Dev Plan */
    devGoalTitle: string;
    milestones: { id: number; text: string; done: boolean }[];
}

const STORAGE_KEY = "bgg_onboarding";
const COMPLETED_KEY = "bgg_onboarding_complete";

const DEFAULT_DATA: OnboardingData = {
    displayName: "",
    occupation: "",
    industry: "",
    location: "",
    bio: "",
    photoUrl: "",
    website: "",
    linkedin: "",
    twitter: "",
    github: "",
    profileVisible: true,
    showEmail: false,
    showSocials: true,
    showLocation: true,
    devGoalTitle: "",
    milestones: [],
};

const STEPS = [
    { label: "Basic Info", icon: User },
    { label: "Photo", icon: Camera },
    { label: "Socials", icon: Globe },
    { label: "Privacy", icon: Lock },
    { label: "Dev Plan", icon: Target },
] as const;

/* ── Persistence helpers ── */
function loadOnboarding(): OnboardingData {
    if (typeof window === "undefined") return DEFAULT_DATA;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? { ...DEFAULT_DATA, ...JSON.parse(raw) } : DEFAULT_DATA;
    } catch {
        return DEFAULT_DATA;
    }
}

function saveOnboarding(data: OnboardingData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ── Main Page ── */
export default function OnboardingPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [step, setStep] = useState(0);
    const [data, setData] = useState<OnboardingData>(DEFAULT_DATA);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [hydrated, setHydrated] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Hydrate from localStorage
    useEffect(() => {
        setData(loadOnboarding());
        setHydrated(true);
    }, []);

    // Auto-save on data change
    useEffect(() => {
        if (hydrated) saveOnboarding(data);
    }, [data, hydrated]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/auth");
        }
    }, [isLoading, isAuthenticated, router]);

    // Pre-fill name from auth user
    useEffect(() => {
        if (user && !data.displayName && hydrated) {
            setData(prev => ({ ...prev, displayName: prev.displayName || user.name }));
        }
    }, [user, hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

    const update = (patch: Partial<OnboardingData>) => {
        setData(prev => ({ ...prev, ...patch }));
        // Clear errors for changed fields
        const errPatch: Record<string, string> = {};
        Object.keys(patch).forEach(k => { errPatch[k] = ""; });
        setErrors(prev => ({ ...prev, ...errPatch }));
    };

    /* ── Validation per step ── */
    const validateStep = (): boolean => {
        const errs: Record<string, string> = {};
        if (step === 0) {
            if (!data.displayName.trim()) errs.displayName = "Name is required";
            if (!data.occupation.trim()) errs.occupation = "Occupation is required";
        }
        // Steps 1-4 are optional — no hard validation
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const next = () => {
        if (!validateStep()) return;
        if (step < STEPS.length - 1) setStep(step + 1);
    };

    const back = () => {
        if (step > 0) setStep(step - 1);
    };

    const finish = async () => {
        setSubmitting(true);
        // Simulate saving to backend
        await new Promise(r => setTimeout(r, 1000));

        // Persist completed flag + profile data for other pages
        localStorage.setItem(COMPLETED_KEY, "true");
        localStorage.setItem("bgg-profile", JSON.stringify({
            occupation: data.occupation,
            industry: data.industry,
            location: data.location,
            bio: data.bio,
            website: data.website,
            linkedin: data.linkedin,
            twitter: data.twitter,
            company: "",
        }));
        if (data.photoUrl) {
            localStorage.setItem("bgg-avatar", JSON.stringify(data.photoUrl));
        }
        // Save dev plan goals if set
        if (data.devGoalTitle || data.milestones.length > 0) {
            const goals = data.milestones.map((m, i) => ({
                id: m.id || i + 1,
                text: m.text,
                done: m.done,
                details: "",
                status: m.done ? "completed" as const : "not-started" as const,
                evidence: [],
                createdAt: new Date().toISOString().split("T")[0],
            }));
            localStorage.setItem("bgg-goals", JSON.stringify(goals));
            localStorage.setItem("bgg-plan-title", JSON.stringify(data.devGoalTitle));
        }

        setSubmitting(false);
        toast("Welcome to BGG! Your profile is set up.", "success");
        router.push("/member");
    };

    const skipDevPlan = async () => {
        // Mark that they skipped
        localStorage.setItem("bgg_devplan_skipped", "true");
        localStorage.setItem(COMPLETED_KEY, "true");
        // Still save profile data
        localStorage.setItem("bgg-profile", JSON.stringify({
            occupation: data.occupation,
            industry: data.industry,
            location: data.location,
            bio: data.bio,
            website: data.website,
            linkedin: data.linkedin,
            twitter: data.twitter,
            company: "",
        }));
        if (data.photoUrl) {
            localStorage.setItem("bgg-avatar", JSON.stringify(data.photoUrl));
        }
        toast("Welcome to BGG! You can set up your Dev Plan later.", "success");
        router.push("/member");
    };

    if (isLoading || !hydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            {/* Header */}
            <header className="border-b border-stone-200 bg-white">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-brand-800 rounded-xl flex items-center justify-center">
                            <span className="text-lg font-black text-white">B</span>
                        </div>
                        <span className="text-lg font-bold text-stone-900">Set up your profile</span>
                    </div>
                    <span className="text-sm font-semibold text-stone-400">
                        Step {step + 1} of {STEPS.length}
                    </span>
                </div>
            </header>

            {/* Progress bar */}
            <div className="bg-white border-b border-stone-100">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="flex gap-2 py-3">
                        {STEPS.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => { if (i < step || (i <= step)) setStep(i); }}
                                className={`flex-1 group relative`}
                                aria-label={`Step ${i + 1}: ${s.label}`}
                            >
                                <div className={`h-2 rounded-full transition-colors ${
                                    i < step ? "bg-brand-600" : i === step ? "bg-brand-400" : "bg-stone-200"
                                }`} />
                                <span className={`block text-[11px] font-semibold mt-1 transition-colors ${
                                    i <= step ? "text-brand-700" : "text-stone-400"
                                }`}>
                                    {s.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 flex items-start justify-center pt-8 pb-16 px-6">
                <div className="w-full max-w-2xl">
                    {step === 0 && <Step1BasicInfo data={data} errors={errors} update={update} />}
                    {step === 1 && <Step2Photo data={data} update={update} />}
                    {step === 2 && <Step3Socials data={data} errors={errors} update={update} />}
                    {step === 3 && <Step4Privacy data={data} update={update} />}
                    {step === 4 && <Step5DevPlan data={data} update={update} />}
                </div>
            </div>

            {/* Footer Nav */}
            <footer className="sticky bottom-0 bg-white border-t border-stone-200 py-4">
                <div className="max-w-3xl mx-auto px-6 flex items-center justify-between">
                    <button
                        onClick={back}
                        disabled={step === 0}
                        className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} /> Back
                    </button>

                    <div className="flex items-center gap-3">
                        {step === STEPS.length - 1 && (
                            <button
                                onClick={skipDevPlan}
                                className="px-5 py-2.5 text-sm font-semibold text-stone-500 hover:text-stone-700 transition-colors"
                            >
                                Skip for now
                            </button>
                        )}
                        {step < STEPS.length - 1 ? (
                            <button
                                onClick={next}
                                className="flex items-center gap-1.5 px-6 py-2.5 bg-brand-800 text-white text-sm font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-800/20"
                            >
                                Continue <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button
                                onClick={finish}
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-2.5 bg-brand-800 text-white text-sm font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-800/20 disabled:opacity-60"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                {submitting ? "Saving..." : "Complete Setup"}
                            </button>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   Step 1 — Basic Info
   ════════════════════════════════════════════════════════════════════ */
function Step1BasicInfo({ data, errors, update }: {
    data: OnboardingData; errors: Record<string, string>;
    update: (p: Partial<OnboardingData>) => void;
}) {
    const industries = [
        "Software Engineering", "Product Design", "Data Science", "Product Management",
        "DevOps / SRE", "Cybersecurity", "EdTech", "FinTech", "HealthTech", "Other",
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-1">Tell us about yourself</h2>
                <p className="text-stone-500">This helps us personalise your experience and connect you with the right people.</p>
            </div>

            <div className="space-y-5">
                {/* Display Name */}
                <Field label="Display Name" required error={errors.displayName}>
                    <div className="relative">
                        <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            value={data.displayName}
                            onChange={e => update({ displayName: e.target.value })}
                            placeholder="Nia Johnson"
                            className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.displayName ? "border-red-300 bg-red-50" : "border-stone-200"}`}
                        />
                    </div>
                </Field>

                {/* Occupation */}
                <Field label="Occupation / Role" required error={errors.occupation}>
                    <input
                        type="text"
                        value={data.occupation}
                        onChange={e => update({ occupation: e.target.value })}
                        placeholder="e.g. Product Designer, Software Engineer"
                        className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.occupation ? "border-red-300 bg-red-50" : "border-stone-200"}`}
                    />
                </Field>

                {/* Industry */}
                <Field label="Industry">
                    <select
                        value={data.industry}
                        onChange={e => update({ industry: e.target.value })}
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 bg-white"
                    >
                        <option value="">Select an industry</option>
                        {industries.map(ind => (
                            <option key={ind} value={ind}>{ind}</option>
                        ))}
                    </select>
                </Field>

                {/* Location */}
                <Field label="Location">
                    <input
                        type="text"
                        value={data.location}
                        onChange={e => update({ location: e.target.value })}
                        placeholder="e.g. Lagos, Nigeria"
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300"
                    />
                </Field>

                {/* Bio */}
                <Field label="Short Bio" hint="Max 200 characters">
                    <textarea
                        value={data.bio}
                        onChange={e => update({ bio: e.target.value.slice(0, 200) })}
                        placeholder="Tell the community a bit about yourself..."
                        rows={3}
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 resize-none"
                    />
                    <p className="text-xs text-stone-400 mt-1 text-right">{data.bio.length}/200</p>
                </Field>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   Step 2 — Profile Photo
   ════════════════════════════════════════════════════════════════════ */
function Step2Photo({ data, update }: {
    data: OnboardingData;
    update: (p: Partial<OnboardingData>) => void;
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        if (file.size > 5 * 1024 * 1024) return; // 5MB max
        const reader = new FileReader();
        reader.onload = () => {
            update({ photoUrl: reader.result as string });
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-1">Add a profile photo</h2>
                <p className="text-stone-500">Help your cohort members and mentors recognise you. You can always change this later.</p>
            </div>

            <div className="flex flex-col items-center gap-6">
                {/* Preview */}
                <div className="relative group">
                    <div className="w-36 h-36 rounded-3xl overflow-hidden bg-stone-100 border-4 border-white shadow-lg">
                        {data.photoUrl ? (
                            <img src={data.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User size={48} className="text-stone-300" />
                            </div>
                        )}
                    </div>
                    {data.photoUrl && (
                        <button
                            onClick={() => update({ photoUrl: "" })}
                            className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Dropzone */}
                <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`w-full max-w-sm p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all text-center ${
                        dragOver ? "border-brand-400 bg-brand-50" : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                    }`}
                >
                    <Upload size={28} className="mx-auto text-stone-400 mb-3" />
                    <p className="text-sm font-semibold text-stone-700">
                        Drop an image here or <span className="text-brand-600">browse</span>
                    </p>
                    <p className="text-xs text-stone-400 mt-1">PNG, JPG up to 5 MB</p>
                </div>

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                        e.target.value = "";
                    }}
                />

                <p className="text-xs text-stone-400">This step is optional — you can skip and add a photo later.</p>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   Step 3 — Social Links
   ════════════════════════════════════════════════════════════════════ */
function Step3Socials({ data, errors, update }: {
    data: OnboardingData; errors: Record<string, string>;
    update: (p: Partial<OnboardingData>) => void;
}) {
    const socialFields = [
        { key: "website" as const, label: "Personal Website", icon: Globe, placeholder: "https://yoursite.com" },
        { key: "linkedin" as const, label: "LinkedIn", icon: Linkedin, placeholder: "linkedin.com/in/yourname" },
        { key: "twitter" as const, label: "Twitter / X", icon: Twitter, placeholder: "@yourhandle" },
        { key: "github" as const, label: "GitHub", icon: Github, placeholder: "github.com/yourname" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-1">Connect your socials</h2>
                <p className="text-stone-500">Let members find and connect with you across platforms. All fields are optional.</p>
            </div>

            <div className="space-y-4">
                {socialFields.map(({ key, label, icon: Icon, placeholder }) => (
                    <Field key={key} label={label}>
                        <div className="relative">
                            <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                            <input
                                type="text"
                                value={data[key]}
                                onChange={e => update({ [key]: e.target.value })}
                                placeholder={placeholder}
                                className="w-full pl-11 pr-4 py-3 border border-stone-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300"
                            />
                        </div>
                    </Field>
                ))}
            </div>

            <div className="p-4 bg-stone-100 rounded-xl">
                <p className="text-xs text-stone-500">
                    <span className="font-semibold text-stone-600">Tip:</span> Adding your LinkedIn makes it easier for cohort members and mentors to connect with you professionally.
                </p>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   Step 4 — Privacy Toggles
   ════════════════════════════════════════════════════════════════════ */
function Step4Privacy({ data, update }: {
    data: OnboardingData;
    update: (p: Partial<OnboardingData>) => void;
}) {
    const toggles = [
        { key: "profileVisible" as const, label: "Public profile", desc: "Other members can find and view your profile in the directory", icon: Eye },
        { key: "showEmail" as const, label: "Show email address", desc: "Display your email on your profile card", icon: Lock },
        { key: "showSocials" as const, label: "Show social links", desc: "Display your website and social media links on your profile", icon: Globe },
        { key: "showLocation" as const, label: "Show location", desc: "Display your city / country on your profile card", icon: User },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-1">Privacy settings</h2>
                <p className="text-stone-500">Control what other members can see on your profile. You can change these anytime in Settings.</p>
            </div>

            <div className="space-y-3">
                {toggles.map(({ key, label, desc, icon: Icon }) => (
                    <label
                        key={key}
                        className="flex items-start gap-4 p-4 bg-white border border-stone-200 rounded-xl hover:border-stone-300 transition-colors cursor-pointer"
                    >
                        <div className="pt-0.5">
                            <Icon size={20} className="text-stone-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-stone-800">{label}</p>
                            <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
                        </div>
                        <div className="flex-shrink-0">
                            <ToggleSwitch
                                checked={data[key]}
                                onChange={v => update({ [key]: v })}
                            />
                        </div>
                    </label>
                ))}
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700">
                    <span className="font-semibold">Note:</span> Your name and avatar are always visible to members in your cohort, regardless of these settings.
                </p>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   Step 5 — Optional Dev Plan
   ════════════════════════════════════════════════════════════════════ */
function Step5DevPlan({ data, update }: {
    data: OnboardingData;
    update: (p: Partial<OnboardingData>) => void;
}) {
    const [newMilestone, setNewMilestone] = useState("");

    const addMilestone = () => {
        const text = newMilestone.trim();
        if (!text) return;
        update({
            milestones: [
                ...data.milestones,
                { id: Date.now(), text, done: false },
            ],
        });
        setNewMilestone("");
    };

    const removeMilestone = (id: number) => {
        update({ milestones: data.milestones.filter(m => m.id !== id) });
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-1">Set your development goal</h2>
                <p className="text-stone-500">
                    Create a personal development plan to track your growth. This is <span className="font-semibold">optional</span> — you can skip and set it up later from your dashboard.
                </p>
            </div>

            {/* Goal Title */}
            <Field label="Goal Title" hint="What do you want to achieve in this cohort?">
                <div className="relative">
                    <Target size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                        type="text"
                        value={data.devGoalTitle}
                        onChange={e => update({ devGoalTitle: e.target.value })}
                        placeholder="e.g. Land a Product Design role by Q2 2026"
                        className="w-full pl-11 pr-4 py-3 border border-stone-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300"
                    />
                </div>
            </Field>

            {/* Milestones */}
            <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Milestones</label>

                {data.milestones.length > 0 && (
                    <ul className="space-y-2 mb-4">
                        {data.milestones.map((m, i) => (
                            <li key={m.id} className="flex items-center gap-3 px-4 py-3 bg-white border border-stone-200 rounded-xl group">
                                <span className="w-6 h-6 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {i + 1}
                                </span>
                                <span className="flex-1 text-sm text-stone-700">{m.text}</span>
                                <button
                                    onClick={() => removeMilestone(m.id)}
                                    className="text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X size={16} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {data.milestones.length < 8 && (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMilestone}
                            onChange={e => setNewMilestone(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addMilestone(); } }}
                            placeholder="Add a milestone..."
                            className="flex-1 px-4 py-3 border border-stone-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300"
                        />
                        <button
                            onClick={addMilestone}
                            disabled={!newMilestone.trim()}
                            className="px-4 py-3 bg-brand-800 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Add
                        </button>
                    </div>
                )}

                {data.milestones.length === 0 && (
                    <p className="text-xs text-stone-400 mt-2">
                        Add up to 8 milestones to break your goal into actionable steps.
                    </p>
                )}
            </div>

            {/* Example */}
            {data.milestones.length === 0 && !data.devGoalTitle && (
                <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl">
                    <p className="text-xs font-semibold text-brand-700 mb-2">Example dev plan:</p>
                    <p className="text-xs text-brand-600 font-medium">&quot;Land a Product Design role by Q2 2026&quot;</p>
                    <ul className="mt-2 space-y-1">
                        {["Build Portfolio", "10 Coffee Chats", "Update Resume", "Apply to 5 Jobs", "Mock Interview"].map(ex => (
                            <li key={ex} className="text-xs text-brand-500 flex items-center gap-1.5">
                                <Check size={10} /> {ex}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   Reusable Field + Toggle
   ════════════════════════════════════════════════════════════════════ */
function Field({ label, required, hint, error, children }: {
    label: string; required?: boolean; hint?: string; error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex items-baseline justify-between mb-1.5">
                <label className="text-sm font-semibold text-stone-700">
                    {label}
                    {required && <span className="text-red-400 ml-0.5">*</span>}
                </label>
                {hint && <span className="text-xs text-stone-400">{hint}</span>}
            </div>
            {children}
            {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
        </div>
    );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                checked ? "bg-brand-600" : "bg-stone-300"
            }`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                checked ? "translate-x-6" : "translate-x-1"
            }`} />
        </button>
    );
}
