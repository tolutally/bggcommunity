"use client";

/* eslint-disable @next/next/no-img-element */

import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useState } from "react";
import { Check, Moon, Sun, Lock, Trash2, LogOut } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useToast } from "@/components/ui/toast";

export default function MemberSettingsPage() {
    const { user } = useUser();

    /* ── Profile ── */
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState("nia@example.com");
    const [jobTitle, setJobTitle] = useState("Product Designer");
    const [company, setCompany] = useState("Tech Corp");
    const [profileSaved, setProfileSaved] = useState(false);

    const saveProfile = () => { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 2000); };

    /* ── Notifications ── */
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifEvents, setNotifEvents] = useState(true);
    const [notifComments, setNotifComments] = useState(true);
    const [notifJobs, setNotifJobs] = useState(false);
    const [notifSaved, setNotifSaved] = useState(false);

    const saveNotifs = () => { setNotifSaved(true); setTimeout(() => setNotifSaved(false), 2000); };

    /* ── Appearance ── */
    const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

    /* ── Password ── */
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [pwError, setPwError] = useState("");
    const [pwSaved, setPwSaved] = useState(false);

    const savePassword = () => {
        if (!currentPw) { setPwError("Enter current password"); return; }
        if (newPw.length < 8) { setPwError("Min 8 characters"); return; }
        if (newPw !== confirmPw) { setPwError("Passwords don't match"); return; }
        setPwError("");
        setPwSaved(true);
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
        setTimeout(() => setPwSaved(false), 2000);
    };

    /* ── Danger Zone ── */
    const [showDelete, setShowDelete] = useState(false);
    const { logout } = useAuth();
    const { toast } = useToast();
    const deleteAccountMutation = useApiMutation<unknown, undefined>("/auth/account", {
        method: "DELETE",
        onSuccess: () => {
            logout();
        },
        onError: () => {
            toast("Failed to delete account. Please try again.", "error");
        },
    });

    const handleDeleteAccount = async () => {
        setShowDelete(false);
        await deleteAccountMutation.trigger(undefined);
    };

    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-stone-900">Settings</h1>
                <p className="text-stone-500 mt-1">Manage your profile, preferences, and account.</p>
            </div>

            {/* ── Profile Section ── */}
            <section className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                <div className="p-8 border-b border-stone-100 flex items-center gap-6">
                    <img src={user.avatar} className="w-20 h-20 rounded-full border-4 border-white shadow-sm object-cover" alt="Avatar" />
                    <div>
                        <h2 className="text-xl font-bold text-stone-900">{name || user.name}</h2>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-brand-100 text-brand-700 text-xs font-bold rounded-full uppercase tracking-wide">Member</span>
                        <div className="mt-2">
                            <button className="text-brand-700 font-semibold text-sm hover:underline">Change Avatar</button>
                        </div>
                    </div>
                </div>
                <div className="p-8 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FieldInput label="Full Name" value={name} onChange={setName} />
                        <FieldInput label="Email Address" value={email} onChange={setEmail} type="email" />
                        <FieldInput label="Job Title" value={jobTitle} onChange={setJobTitle} />
                        <FieldInput label="Company" value={company} onChange={setCompany} />
                    </div>
                </div>
                <div className="p-6 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-3">
                    {profileSaved && <span className="text-green-600 text-sm font-semibold flex items-center gap-1"><Check size={16} /> Saved</span>}
                    <button onClick={saveProfile} className="bg-brand-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-700 transition-colors text-sm">Save Changes</button>
                </div>
            </section>

            {/* ── Notification Preferences ── */}
            <section className="bg-white rounded-2xl border border-stone-200 p-8">
                <h3 className="font-bold text-lg text-stone-900 mb-6">Notification Preferences</h3>
                <div className="space-y-5">
                    <Toggle label="Weekly email digest" description="Summary of community activity every Monday" checked={notifEmail} onChange={setNotifEmail} />
                    <Toggle label="New event announcements" description="Get notified when new events are scheduled" checked={notifEvents} onChange={setNotifEvents} />
                    <Toggle label="Comments on my posts" description="Replies and reactions to your discussions" checked={notifComments} onChange={setNotifComments} />
                    <Toggle label="New job postings" description="Alerts when featured jobs are added" checked={notifJobs} onChange={setNotifJobs} />
                </div>
                <div className="mt-6 flex items-center justify-end gap-3">
                    {notifSaved && <span className="text-green-600 text-sm font-semibold flex items-center gap-1"><Check size={16} /> Saved</span>}
                    <button onClick={saveNotifs} className="bg-brand-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-700 transition-colors text-sm">Save Preferences</button>
                </div>
            </section>

            {/* ── Appearance ── */}
            <section className="bg-white rounded-2xl border border-stone-200 p-8">
                <h3 className="font-bold text-lg text-stone-900 mb-4">Appearance</h3>
                <p className="text-sm text-stone-500 mb-4">Choose how BGG looks for you.</p>
                <div className="flex gap-3">
                    {([
                        { key: "light" as const, label: "Light", icon: Sun },
                        { key: "dark" as const, label: "Dark", icon: Moon },
                        { key: "system" as const, label: "System", icon: Sun },
                    ]).map(t => (
                        <button key={t.key} onClick={() => setTheme(t.key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${theme === t.key ? "bg-brand-50 text-brand-700 border-brand-200 ring-2 ring-brand-200" : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"}`}>
                            <t.icon size={16} /> {t.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Change Password ── */}
            <section className="bg-white rounded-2xl border border-stone-200 p-8">
                <div className="flex items-center gap-2 mb-6">
                    <Lock size={20} className="text-stone-400" />
                    <h3 className="font-bold text-lg text-stone-900">Change Password</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FieldInput label="Current Password" value={currentPw} onChange={setCurrentPw} type="password" placeholder="••••••••" />
                    <FieldInput label="New Password" value={newPw} onChange={setNewPw} type="password" placeholder="Min 8 characters" />
                    <FieldInput label="Confirm Password" value={confirmPw} onChange={setConfirmPw} type="password" placeholder="Re-enter new password" />
                </div>
                {pwError && <p className="text-red-500 text-sm mt-2 font-medium">{pwError}</p>}
                <div className="mt-4 flex items-center justify-end gap-3">
                    {pwSaved && <span className="text-green-600 text-sm font-semibold flex items-center gap-1"><Check size={16} /> Password Updated</span>}
                    <button onClick={savePassword} className="bg-stone-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-stone-800 transition-colors text-sm">Update Password</button>
                </div>
            </section>

            {/* ── Danger Zone ── */}
            <section className="bg-white rounded-2xl border border-red-200 p-8">
                <h3 className="font-bold text-lg text-red-700 mb-2">Danger Zone</h3>
                <p className="text-sm text-stone-500 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={logout} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors">
                        <LogOut size={16} /> Sign Out
                    </button>
                    <button onClick={() => setShowDelete(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                        <Trash2 size={16} /> Delete Account
                    </button>
                </div>
            </section>

            {/* Delete Confirmation */}
            <ConfirmModal
                open={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={handleDeleteAccount}
                title="Delete Account?"
                description="This will permanently remove your profile, posts, and all data. This cannot be undone."
                icon={Trash2}
            />
        </div>
        </ErrorBoundary>
    );
}

/* ── Reusable Components ── */
function FieldInput({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none transition-all" />
        </div>
    );
}

function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <span className="text-stone-700 font-medium block">{label}</span>
                {description && <span className="text-xs text-stone-500">{description}</span>}
            </div>
            <button onClick={() => onChange(!checked)} className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${checked ? "bg-brand-600" : "bg-stone-300"}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "left-[22px]" : "left-0.5"}`} />
            </button>
        </div>
    );
}
