"use client";

/* eslint-disable @next/next/no-img-element */

import { useUser } from "@/context/UserContext";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
    MapPin, Building2, Linkedin, Twitter, Globe, Mail, Edit2, Save,
    Camera, User, Lock, CheckCircle,
    Trash2, LogOut, AlertTriangle, Target, Eye, EyeOff, ArrowRight, Check, Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
    deleteOwnAccount,
    fetchCurrentUserProfile,
    getUsersErrorMessage,
    updateCurrentUserProfile,
    updateProfileVisibility,
    uploadCurrentUserAvatar,
} from "@/lib/users";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FormData {
    occupation: string;
    industry: string;
    location: string;
    bio: string;
    website: string;
    linkedin: string;
    twitter: string;
    company: string;
}

interface DevGoal {
    id: number;
    text: string;
    done: boolean;
}

interface FieldErrors {
    occupation?: string;
    location?: string;
    bio?: string;
    website?: string;
    linkedin?: string;
    twitter?: string;
}

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_FORM: FormData = {
    occupation: "Product Designer",
    industry: "EdTech",
    location: "Lagos, Nigeria",
    bio: "Passionate about creating accessible and inclusive user experiences. Currently focusing on educational technology solutions for emerging markets.",
    website: "https://nia-designs.com",
    linkedin: "nia-adebayo",
    twitter: "niadesigns",
    company: "BGG Tech",
};

const DEFAULT_GOALS: DevGoal[] = [
    { id: 1, text: "Build Portfolio", done: true },
    { id: 2, text: "10 Coffee Chats", done: true },
    { id: 3, text: "Update Resume", done: true },
    { id: 4, text: "Apply to 5 Jobs", done: false },
    { id: 5, text: "Mock Interview", done: false },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function loadJSON<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function isValidURL(s: string): boolean {
    if (!s) return true;
    try { new URL(s.startsWith("http") ? s : `https://${s}`); return true; } catch { return false; }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MemberProfilePage() {
    const { user } = useUser();
    const { getToken } = useAuth();

    /* --- Profile form --- */
    const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
    const [savedData, setSavedData] = useState<FormData>(DEFAULT_FORM);
    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const { toast } = useToast();
    const [isOpenToWork, setIsOpenToWork] = useState(false);
    const [isProfileVisible, setIsProfileVisible] = useState(true);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    /* --- Avatar --- */
    const [avatarSrc, setAvatarSrc] = useState(user.avatar);
    const fileRef = useRef<HTMLInputElement>(null);

    /* --- Dev Plan (read-only preview) --- */
    const [goals] = useState<DevGoal[]>(() => loadJSON("bgg-goals", DEFAULT_GOALS));

    /* --- Password --- */
    const [showPwSection, setShowPwSection] = useState(false);
    const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
    const [pwError, setPwError] = useState("");
    const [pwSuccess, setPwSuccess] = useState(false);
    const [showPw, setShowPw] = useState(false);

    /* --- Danger zone --- */
    const [deleteModal, setDeleteModal] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadProfile() {
            setIsLoadingProfile(true);
            try {
                const profile = await fetchCurrentUserProfile(getToken);
                if (cancelled) {
                    return;
                }

                const nextForm: FormData = {
                    occupation: profile.occupation || DEFAULT_FORM.occupation,
                    industry: profile.industry || DEFAULT_FORM.industry,
                    location: profile.location || DEFAULT_FORM.location,
                    bio: profile.bio || DEFAULT_FORM.bio,
                    website: profile.website || DEFAULT_FORM.website,
                    linkedin: profile.linkedin || DEFAULT_FORM.linkedin,
                    twitter: profile.twitter || DEFAULT_FORM.twitter,
                    company: profile.company || DEFAULT_FORM.company,
                };

                setFormData(nextForm);
                setSavedData(nextForm);
                setIsOpenToWork(profile.isOpenToWork);
                setIsProfileVisible(profile.profileVisible);
                if (profile.avatarUrl) {
                    setAvatarSrc(profile.avatarUrl);
                }
            } catch (error) {
                if (!cancelled) {
                    toast(getUsersErrorMessage(error), "error");
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingProfile(false);
                }
            }
        }

        void loadProfile();

        return () => {
            cancelled = true;
        };
    }, [getToken, toast]);
    /* --- Handlers --- */

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const validate = (): boolean => {
        const errs: FieldErrors = {};
        if (!formData.occupation.trim()) errs.occupation = "Occupation is required";
        if (!formData.location.trim()) errs.location = "Location is required";
        if (!formData.bio.trim()) errs.bio = "Bio is required";
        else if (formData.bio.length < 20) errs.bio = "Bio must be at least 20 characters";
        if (formData.website && !isValidURL(formData.website)) errs.website = "Enter a valid URL";
        if (formData.linkedin && /\s/.test(formData.linkedin)) errs.linkedin = "No spaces in username";
        if (formData.twitter && /\s/.test(formData.twitter)) errs.twitter = "No spaces in username";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setIsSavingProfile(true);
        try {
            const profile = await updateCurrentUserProfile({
                ...formData,
                isOpenToWork,
            }, getToken);

            const nextForm: FormData = {
                occupation: profile.occupation || formData.occupation,
                industry: profile.industry || formData.industry,
                location: profile.location || formData.location,
                bio: profile.bio || formData.bio,
                website: profile.website || formData.website,
                linkedin: profile.linkedin || formData.linkedin,
                twitter: profile.twitter || formData.twitter,
                company: profile.company || formData.company,
            };

            setFormData(nextForm);
            setSavedData(nextForm);
            setIsOpenToWork(profile.isOpenToWork);
            setIsEditing(false);
            toast("Profile saved");
        } catch (error) {
            toast(getUsersErrorMessage(error), "error");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleCancel = () => {
        setFormData(savedData);
        setErrors({});
        setIsEditing(false);
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingAvatar(true);
        try {
            const uploaded = await uploadCurrentUserAvatar(file, getToken);
            if (uploaded) {
                setAvatarSrc(uploaded);
            }
            toast("Avatar updated");
        } catch (error) {
            toast(getUsersErrorMessage(error), "error");
        } finally {
            setIsUploadingAvatar(false);
            e.target.value = "";
        }
    };

    const handleToggleOpenToWork = async () => {
        const next = !isOpenToWork;
        setIsOpenToWork(next);

        try {
            await updateCurrentUserProfile({ ...formData, isOpenToWork: next }, getToken);
        } catch (error) {
            setIsOpenToWork(!next);
            toast(getUsersErrorMessage(error), "error");
        }
    };

    const handleToggleProfileVisibility = async () => {
        if (isUpdatingPrivacy) {
            return;
        }

        const next = !isProfileVisible;
        setIsProfileVisible(next);
        setIsUpdatingPrivacy(true);

        try {
            await updateProfileVisibility(next, getToken);
            toast(next ? "Profile is now visible" : "Profile is now private");
        } catch (error) {
            setIsProfileVisible(!next);
            toast(getUsersErrorMessage(error), "error");
        } finally {
            setIsUpdatingPrivacy(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeletingAccount(true);
        try {
            await deleteOwnAccount(getToken);
            setDeleteModal(false);
            toast("Account deletion requested");
        } catch (error) {
            toast(getUsersErrorMessage(error), "error");
        } finally {
            setIsDeletingAccount(false);
        }
    };

    const handlePasswordSave = () => {
        setPwError("");
        setPwSuccess(false);
        if (!pw.current) { setPwError("Enter your current password"); return; }
        if (pw.next.length < 8) { setPwError("New password must be at least 8 characters"); return; }
        if (pw.next !== pw.confirm) { setPwError("Passwords do not match"); return; }
        setPwSuccess(true);
        setPw({ current: "", next: "", confirm: "" });
        setTimeout(() => setPwSuccess(false), 3000);
    };

    const doneCount = goals.filter(g => g.done).length;
    const progress = goals.length ? Math.round((doneCount / goals.length) * 100) : 0;
    const progressWidthClass =
        progress >= 100 ? "w-full" :
        progress >= 90 ? "w-11/12" :
        progress >= 75 ? "w-3/4" :
        progress >= 66 ? "w-2/3" :
        progress >= 50 ? "w-1/2" :
        progress >= 33 ? "w-1/3" :
        progress >= 25 ? "w-1/4" :
        progress > 0 ? "w-1/12" : "w-0";

    /* Input helper */
    const inputCls = (field: keyof FieldErrors) =>
        `w-full px-4 py-2.5 border rounded-xl bg-stone-50 focus:ring-2 focus:ring-brand-500/20 focus:bg-white outline-none text-sm transition-all ${errors[field] ? "border-rose-300 bg-rose-50/50" : "border-stone-200"}`;

    return (
        <ErrorBoundary>
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
            {isLoadingProfile ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-8 text-stone-500 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Loading profile...
                </div>
            ) : null}

            {/* Hidden file input for avatar */}
            <input ref={fileRef} type="file" title="Upload profile avatar" aria-label="Upload profile avatar" accept="image/*" className="hidden" onChange={(event) => { void handleAvatarChange(event); }} />

            {/* ========== HEADER / BANNER ========== */}
            <div className="relative">
                <div className="h-48 md:h-64 rounded-3xl overflow-hidden bg-gradient-to-r from-brand-700 to-indigo-900 relative">
                    <img src="https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop" className="w-full h-full object-cover opacity-60 mix-blend-overlay" alt="Cover" />
                </div>

                <div className="relative -mt-20 px-4 md:px-8">
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-200 flex flex-col md:flex-row gap-6 md:items-start">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0 -mt-20 md:-mt-24">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 bg-white shadow-lg">
                                <img src={avatarSrc} alt={user.name} className="w-full h-full rounded-full object-cover bg-stone-100" />
                            </div>
                            <button onClick={() => fileRef.current?.click()} disabled={isUploadingAvatar} className="absolute bottom-2 right-2 bg-brand-800 text-white p-2 rounded-full border-4 border-white shadow-sm hover:bg-brand-700 transition-colors disabled:opacity-70">
                                {isUploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                            </button>
                            {!isEditing && isOpenToWork && (
                                <div className="absolute -bottom-2 md:-bottom-3 inset-x-0 flex justify-center">
                                    <span className="bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white shadow-md">#OpenToWork</span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-4 pt-2">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl font-bold text-stone-900">{user.name}</h1>
                                        <button onClick={() => { void handleToggleOpenToWork(); }} className={`cursor-pointer flex items-center gap-2 px-3 py-1 rounded-full border transition-all select-none ${isOpenToWork ? "bg-green-50 border-green-200 text-green-700" : "bg-stone-50 border-stone-200 text-stone-400 hover:border-stone-300"}`}>
                                            <div className={`w-3 h-3 rounded-full transition-colors ${isOpenToWork ? "bg-green-500" : "bg-stone-300"}`} />
                                            <span className="text-xs font-bold whitespace-nowrap">{isOpenToWork ? "Open to Work" : "Not Open"}</span>
                                        </button>

                                        <button onClick={() => { void handleToggleProfileVisibility(); }} disabled={isUpdatingPrivacy} className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all select-none disabled:opacity-70 ${isProfileVisible ? "bg-brand-50 border-brand-200 text-brand-700" : "bg-stone-50 border-stone-200 text-stone-500"}`}>
                                            {isProfileVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                                            <span className="text-xs font-bold whitespace-nowrap">{isProfileVisible ? "Profile Visible" : "Profile Hidden"}</span>
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2 text-stone-500 font-medium flex-wrap">
                                        {isEditing ? (
                                            <div>
                                                <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} placeholder="Occupation" className={inputCls("occupation")} />
                                                {errors.occupation && <p className="text-xs text-rose-500 mt-1">{errors.occupation}</p>}
                                            </div>
                                        ) : (
                                            <span className="text-brand-700 font-semibold">{formData.occupation}</span>
                                        )}
                                        <span className="text-stone-300 hidden md:inline">&middot;</span>
                                        {isEditing ? (
                                            <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Company" className="px-3 py-1 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:ring-2 focus:ring-brand-500/20 focus:bg-white outline-none transition-all" />
                                        ) : (
                                            <span>{formData.company}</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 mt-3 text-sm text-stone-500 flex-wrap">
                                        <div className="flex items-center gap-1.5 min-w-[120px]">
                                            <MapPin size={16} className="text-stone-400" />
                                            {isEditing ? (
                                                <div className="flex-1">
                                                    <input type="text" title="Location" aria-label="Location" name="location" value={formData.location} onChange={handleChange} className={`${inputCls("location")} !py-1 !text-xs`} />
                                                    {errors.location && <p className="text-xs text-rose-500 mt-0.5">{errors.location}</p>}
                                                </div>
                                            ) : formData.location}
                                        </div>
                                        <div className="flex items-center gap-1.5 min-w-[120px]">
                                            <Building2 size={16} className="text-stone-400" />
                                            {isEditing ? (
                                                <input type="text" title="Industry" aria-label="Industry" name="industry" value={formData.industry} onChange={handleChange} className="px-2 py-1 border border-stone-200 rounded-lg text-xs bg-stone-50 focus:ring-2 focus:ring-brand-500/20 focus:bg-white outline-none w-full" />
                                            ) : formData.industry}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {isEditing ? (
                                        <>
                                            <button onClick={handleCancel} className="px-5 py-2.5 rounded-xl font-bold text-sm border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">Cancel</button>
                                            <button onClick={() => { void handleSave(); }} disabled={isSavingProfile} className="px-5 py-2.5 rounded-xl font-bold text-sm bg-stone-900 text-white hover:bg-stone-800 transition-colors flex items-center gap-2 disabled:opacity-70">{isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save</button>
                                        </>
                                    ) : (
                                        <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 bg-white border text-stone-700 hover:border-brand-200 hover:text-brand-700 hover:bg-brand-50 transition-all shadow-sm"><Edit2 size={18} /> Edit Profile</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========== GRID ========== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* About */}
                    <section className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm">
                        <h2 className="text-xl font-bold text-stone-900 mb-4">About</h2>
                        {isEditing ? (
                            <div>
                                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={5} className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none text-stone-700 leading-relaxed resize-none transition-all ${errors.bio ? "border-rose-300 bg-rose-50/50" : "border-stone-200 bg-stone-50 focus:bg-white"}`} placeholder="Tell us about yourself..." />
                                {errors.bio && <p className="text-xs text-rose-500 mt-1">{errors.bio}</p>}
                                <p className="text-xs text-stone-400 mt-1 text-right">{formData.bio.length} characters</p>
                            </div>
                        ) : (
                            <p className="text-stone-600 leading-relaxed">{formData.bio}</p>
                        )}
                    </section>

                    {/* Dev Plan Preview */}
                    <section className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent-100 text-accent-600 rounded-xl"><Target size={20} /></div>
                                <div>
                                    <h2 className="text-xl font-bold text-stone-900">Development Plan</h2>
                                    <p className="text-sm text-stone-500">{doneCount}/{goals.length} goals completed &middot; {progress}%</p>
                                </div>
                            </div>
                            <Link href="/member/devplan" className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors">
                                View Plan <ArrowRight size={14} />
                            </Link>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-3 bg-stone-100 rounded-full mb-5 overflow-hidden">
                            <div className={`h-full bg-gradient-to-r from-accent-500 to-brand-600 rounded-full transition-all duration-500 ${progressWidthClass}`} />
                        </div>

                        {/* Goals preview (read-only, max 5) */}
                        <div className="space-y-2 mb-4">
                            {goals.slice(0, 5).map(g => (
                                <Link key={g.id} href="/member/devplan" className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:border-brand-200 ${g.done ? "bg-green-50/50 border-green-100" : "bg-white border-stone-100"}`}>
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${g.done ? "bg-accent-500 border-accent-500 text-white" : "border-stone-300"}`}>
                                        {g.done && <Check size={12} />}
                                    </div>
                                    <span className={`flex-1 text-sm font-medium ${g.done ? "line-through text-stone-400" : "text-stone-800"}`}>{g.text}</span>
                                    <ArrowRight size={14} className="text-stone-300" />
                                </Link>
                            ))}
                            {goals.length > 5 && (
                                <p className="text-xs text-stone-400 text-center pt-1">+{goals.length - 5} more goals</p>
                            )}
                        </div>

                        <Link href="/member/devplan" className="flex items-center justify-center gap-2 w-full py-3 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-sm rounded-xl transition-colors border border-brand-100">
                            <Edit2 size={15} /> Open Full Development Plan
                        </Link>
                    </section>

                    {/* Account Info */}
                    <section className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-stone-100 rounded-lg text-stone-600"><Lock size={20} /></div>
                            <h2 className="text-xl font-bold text-stone-900">Account Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Full Name</label>
                                <div className="w-full px-4 py-3.5 bg-stone-50 rounded-xl text-stone-500 font-medium flex items-center gap-3">
                                    <User size={18} className="text-stone-400" /> {user.name}
                                    <Lock size={14} className="ml-auto text-stone-300" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Email</label>
                                <div className="w-full px-4 py-3.5 bg-stone-50 rounded-xl text-stone-500 font-medium flex items-center gap-3">
                                    <Mail size={18} className="text-stone-400" /> {user.email}
                                    <Lock size={14} className="ml-auto text-stone-300" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Change Password */}
                    <section className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm">
                        <button onClick={() => setShowPwSection(!showPwSection)} className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-stone-100 rounded-lg text-stone-600"><Lock size={20} /></div>
                                <h2 className="text-xl font-bold text-stone-900">Change Password</h2>
                            </div>
                            <span className="text-sm font-bold text-brand-600">{showPwSection ? "Hide" : "Show"}</span>
                        </button>

                        {showPwSection && (
                            <div className="mt-6 space-y-4 max-w-md">
                                {(["current", "next", "confirm"] as const).map(field => (
                                    <div key={field}>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">{field === "current" ? "Current Password" : field === "next" ? "New Password" : "Confirm New Password"}</label>
                                        <div className="relative">
                                            <input type={showPw ? "text" : "password"} value={pw[field]} onChange={e => setPw(prev => ({ ...prev, [field]: e.target.value }))} className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 focus:ring-2 focus:ring-brand-500/20 focus:bg-white outline-none text-sm pr-10" placeholder="••••••••" />
                                            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {pwError && <p className="text-sm text-rose-500 font-medium">{pwError}</p>}
                                {pwSuccess && <p className="text-sm text-green-600 font-medium flex items-center gap-1"><CheckCircle size={14} /> Password updated successfully</p>}
                                <button onClick={handlePasswordSave} className="px-6 py-2.5 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors">Update Password</button>
                            </div>
                        )}
                    </section>

                    {/* Danger Zone */}
                    <section className="bg-white rounded-3xl p-8 border border-rose-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-rose-100 rounded-lg text-rose-600"><AlertTriangle size={20} /></div>
                            <h2 className="text-xl font-bold text-stone-900">Danger Zone</h2>
                        </div>
                        <p className="text-sm text-stone-500 mb-4">These actions are irreversible. Please proceed with caution.</p>
                        <div className="flex flex-wrap gap-3">
                            <button className="px-5 py-2.5 border border-stone-200 text-stone-600 rounded-xl font-bold text-sm hover:bg-stone-50 transition-colors flex items-center gap-2"><LogOut size={16} /> Sign Out</button>
                            <button onClick={() => setDeleteModal(true)} className="px-5 py-2.5 border border-rose-200 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-50 transition-colors flex items-center gap-2"><Trash2 size={16} /> Delete Account</button>
                        </div>
                    </section>
                </div>

                {/* Right Column: Socials */}
                <div className="space-y-8">
                    <section className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm">
                        <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2"><Globe size={20} className="text-brand-600" /> Online Presence</h2>
                        <div className="space-y-6">
                            {/* Website */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Website / Portfolio</label>
                                {isEditing ? (
                                    <div>
                                        <input type="url" name="website" value={formData.website} onChange={handleChange} className={inputCls("website")} placeholder="https://yoursite.com" />
                                        {errors.website && <p className="text-xs text-rose-500 mt-1">{errors.website}</p>}
                                    </div>
                                ) : (
                                    <a href={formData.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full px-4 py-3 bg-stone-50 hover:bg-brand-50 border border-stone-100 hover:border-brand-200 rounded-xl transition-all group">
                                        <span className="text-stone-700 font-medium truncate group-hover:text-brand-700">{formData.website.replace("https://", "")}</span>
                                        <Globe size={16} className="text-stone-400 group-hover:text-brand-400" />
                                    </a>
                                )}
                            </div>

                            {/* LinkedIn */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">LinkedIn</label>
                                {isEditing ? (
                                    <div>
                                        <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} className={inputCls("linkedin")} placeholder="username" />
                                        {errors.linkedin && <p className="text-xs text-rose-500 mt-1">{errors.linkedin}</p>}
                                    </div>
                                ) : (
                                    <a href={`https://linkedin.com/in/${formData.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full px-4 py-3 bg-stone-50 hover:bg-blue-50 border border-stone-100 hover:border-blue-200 rounded-xl transition-all group">
                                        <span className="text-stone-700 font-medium truncate group-hover:text-blue-700">/{formData.linkedin}</span>
                                        <Linkedin size={16} className="text-stone-400 group-hover:text-blue-400" />
                                    </a>
                                )}
                            </div>

                            {/* Twitter */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Twitter / X</label>
                                {isEditing ? (
                                    <div>
                                        <input type="text" name="twitter" value={formData.twitter} onChange={handleChange} className={inputCls("twitter")} placeholder="username" />
                                        {errors.twitter && <p className="text-xs text-rose-500 mt-1">{errors.twitter}</p>}
                                    </div>
                                ) : (
                                    <a href={`https://x.com/${formData.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full px-4 py-3 bg-stone-50 hover:bg-stone-100 border border-stone-100 hover:border-stone-300 rounded-xl transition-all group">
                                        <span className="text-stone-700 font-medium truncate group-hover:text-stone-900">@{formData.twitter}</span>
                                        <Twitter size={16} className="text-stone-400 group-hover:text-stone-900" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* ========== DELETE ACCOUNT MODAL ========== */}
            <ConfirmModal
                open={deleteModal}
                onClose={() => { setDeleteModal(false); }}
                onConfirm={() => { void handleDeleteAccount(); }}
                title="Delete Account"
                description="This will permanently delete your account and all associated data. This action cannot be undone."
                confirmLabel="Delete Account"
                icon={AlertTriangle}
                loading={isDeletingAccount}
            />
        </div>
        </ErrorBoundary>
    );
}
