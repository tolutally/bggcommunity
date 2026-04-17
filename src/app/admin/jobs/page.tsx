"use client";

import { Briefcase, Plus, Search, Star, Trash2, Edit2, ExternalLink, Loader2, Users, X, MapPin, Check, XCircle, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useJobs, fmtJobDate } from "@/hooks/use-jobs";
import { useCreateJob, useUpdateJob, useDeleteJob, useToggleFeatured, useJobReferralRequests, useUpdateReferralStatus } from "@/hooks/use-admin-jobs";
import { useToast } from "@/components/ui/toast";
import type { Job, ReferralRequest, ReferralRequestStatus } from "@/lib/types";

type Tab = "jobs" | "referrals";

export default function AdminJobsPage() {
    const { jobs, isLoading, mutate } = useJobs();
    const { toast } = useToast();
    const [tab, setTab] = useState<Tab>("jobs");
    const [searchQuery, setSearchQuery] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
    const [referralJobId, setReferralJobId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        return jobs.filter(job => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q);
        });
    }, [jobs, searchQuery]);

    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Jobs Management</h1>
                    <p className="text-stone-500 mt-1">Manage job listings and referral requests.</p>
                </div>
                <button onClick={() => { setEditingJob(null); setShowForm(true); }} className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center gap-2 self-start">
                    <Plus size={18} /> Add Job
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
                {(["jobs", "referrals"] as Tab[]).map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors capitalize ${tab === t ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>
                        {t === "jobs" ? "Job Listings" : "Referral Requests"}
                    </button>
                ))}
            </div>

            {tab === "jobs" && (
                <>
                    <div className="bg-white rounded-2xl border border-stone-200 p-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input type="text" placeholder="Search jobs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
                        </div>
                    </div>

                    {isLoading && (
                        <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-brand-500" size={28} /></div>
                    )}

                    <div className="space-y-3">
                        {filtered.map(job => (
                            <AdminJobRow key={job.id} job={job} onEdit={() => { setEditingJob(job); setShowForm(true); }} onDelete={() => setDeletingJobId(job.id)} onViewReferrals={() => { setReferralJobId(job.id); setTab("referrals"); }} onToggleFeatured={mutate} />
                        ))}
                    </div>

                    {!isLoading && filtered.length === 0 && (
                        <EmptyState icon={Briefcase} heading="No jobs" description={searchQuery ? "Try a different search." : "Add a job listing to get started."} variant="plain" />
                    )}
                </>
            )}

            {tab === "referrals" && (
                <ReferralsPanel jobId={referralJobId} jobs={jobs} onSelectJob={setReferralJobId} />
            )}

            {/* Job Form Modal */}
            {showForm && (
                <JobFormModal job={editingJob} onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); mutate(); toast(editingJob ? "Job updated" : "Job created", "success"); }} onError={(msg) => toast(msg, "error")} />
            )}

            {/* Delete Confirm */}
            {deletingJobId && (
                <DeleteJobModal jobId={deletingJobId} onClose={() => setDeletingJobId(null)} onSuccess={() => { setDeletingJobId(null); mutate(); toast("Job deleted", "success"); }} onError={(msg) => toast(msg, "error")} />
            )}
        </div>
        </ErrorBoundary>
    );
}

/* ── Admin Job Row ── */
function AdminJobRow({ job, onEdit, onDelete, onViewReferrals, onToggleFeatured }: {
    job: Job; onEdit: () => void; onDelete: () => void; onViewReferrals: () => void; onToggleFeatured: () => void;
}) {
    const toggle = useToggleFeatured(job.id);
    const handleToggle = async () => {
        try { await toggle.trigger(); onToggleFeatured(); } catch { /* ignored */ }
    };

    return (
        <div className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-stone-900">{job.title}</h3>
                    {job.isFeatured && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold uppercase">Featured</span>}
                </div>
                <p className="text-sm text-stone-500">{job.company} {job.location && `· ${job.location}`} · {fmtJobDate(job.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {job.referralAvailable && (
                    <button onClick={onViewReferrals} className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors" title="View referral requests">
                        <Users size={16} />
                    </button>
                )}
                <button onClick={handleToggle} disabled={toggle.isLoading} className={`p-2 rounded-lg border transition-colors ${job.isFeatured ? "bg-amber-50 text-amber-600 border-amber-200" : "text-stone-400 border-stone-200 hover:bg-stone-50"}`} title="Toggle featured">
                    <Star size={16} />
                </button>
                <button onClick={onEdit} className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors" title="Edit">
                    <Edit2 size={16} />
                </button>
                <button onClick={onDelete} className="p-2 rounded-lg border border-stone-200 text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                    <Trash2 size={16} />
                </button>
                <a href={job.externalUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors" title="External link">
                    <ExternalLink size={16} />
                </a>
            </div>
        </div>
    );
}

/* ── Referrals Panel ── */
function ReferralsPanel({ jobId, jobs, onSelectJob }: { jobId: string | null; jobs: Job[]; onSelectJob: (id: string | null) => void; }) {
    const { referrals, isLoading, mutate } = useJobReferralRequests(jobId);
    const { toast } = useToast();
    const referralJobs = jobs.filter(j => j.referralAvailable);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-4">
                <label className="text-sm font-semibold text-stone-700 mb-2 block">Filter by Job</label>
                <select value={jobId ?? ""} onChange={e => onSelectJob(e.target.value || null)} className="w-full md:w-80 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none">
                    <option value="">Select a job...</option>
                    {referralJobs.map(j => <option key={j.id} value={j.id}>{j.title} — {j.company}</option>)}
                </select>
            </div>

            {!jobId && <EmptyState icon={Users} heading="Select a job" description="Choose a job above to view referral requests." variant="plain" />}

            {jobId && isLoading && (
                <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-brand-500" size={28} /></div>
            )}

            {jobId && !isLoading && referrals.length === 0 && (
                <EmptyState icon={Users} heading="No referral requests" description="No one has requested a referral for this job yet." variant="plain" />
            )}

            {referrals.length > 0 && (
                <div className="space-y-3">
                    {referrals.map(r => <ReferralRow key={r.id} referral={r} onStatusChange={() => mutate()} onError={(msg) => toast(msg, "error")} />)}
                </div>
            )}
        </div>
    );
}

/* ── Referral Row ── */
const STATUS_COLORS: Record<ReferralRequestStatus, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    FULFILLED: "bg-green-50 text-green-700 border-green-200",
    DECLINED: "bg-red-50 text-red-700 border-red-200",
};
const STATUS_ICONS: Record<ReferralRequestStatus, React.ReactNode> = {
    PENDING: <Clock size={12} />,
    FULFILLED: <Check size={12} />,
    DECLINED: <XCircle size={12} />,
};

function ReferralRow({ referral, onStatusChange, onError }: { referral: ReferralRequest; onStatusChange: () => void; onError: (msg: string) => void; }) {
    const update = useUpdateReferralStatus(referral.id);

    const handleStatus = async (status: ReferralRequestStatus) => {
        try { await update.trigger({ status }); onStatusChange(); } catch { onError("Failed to update status."); }
    };

    const name = referral.user?.profile
        ? `${referral.user.profile.firstName ?? ""} ${referral.user.profile.lastName ?? ""}`.trim() || referral.user.email
        : referral.user?.email ?? "Unknown";

    return (
        <div className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-900">{name}</p>
                {referral.message && <p className="text-sm text-stone-500 mt-1 line-clamp-2">{referral.message}</p>}
                <p className="text-xs text-stone-400 mt-1">{fmtJobDate(referral.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[referral.status]}`}>
                    {STATUS_ICONS[referral.status]} {referral.status.charAt(0) + referral.status.slice(1).toLowerCase()}
                </span>
                {referral.status === "PENDING" && (
                    <>
                        <button onClick={() => handleStatus("FULFILLED")} disabled={update.isLoading} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">Fulfill</button>
                        <button onClick={() => handleStatus("DECLINED")} disabled={update.isLoading} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">Decline</button>
                    </>
                )}
            </div>
        </div>
    );
}

/* ── Job Form Modal ── */
function JobFormModal({ job, onClose, onSuccess, onError }: {
    job: Job | null; onClose: () => void; onSuccess: () => void; onError: (msg: string) => void;
}) {
    const create = useCreateJob();
    const update = useUpdateJob(job?.id ?? "");
    const isEdit = !!job;
    const mutation = isEdit ? update : create;

    const [form, setForm] = useState({
        title: job?.title ?? "",
        company: job?.company ?? "",
        location: job?.location ?? "",
        description: job?.description ?? "",
        externalUrl: job?.externalUrl ?? "",
        isFeatured: job?.isFeatured ?? false,
        referralAvailable: job?.referralAvailable ?? false,
        referralContact: job?.referralContact ?? "",
    });

    const set = (key: string, val: string | boolean) => setForm(prev => ({ ...prev, [key]: val }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.company.trim() || !form.externalUrl.trim() || !form.description.trim()) {
            onError("Please fill in all required fields."); return;
        }
        try {
            await mutation.trigger({
                title: form.title.trim(),
                company: form.company.trim(),
                location: form.location.trim() || undefined,
                description: form.description.trim(),
                externalUrl: form.externalUrl.trim(),
                isFeatured: form.isFeatured,
                referralAvailable: form.referralAvailable,
                referralContact: form.referralContact.trim() || undefined,
            });
            onSuccess();
        } catch {
            onError(`Failed to ${isEdit ? "update" : "create"} job.`);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-stone-900">{isEdit ? "Edit Job" : "Add Job"}</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field label="Title *" value={form.title} onChange={v => set("title", v)} />
                    <Field label="Company *" value={form.company} onChange={v => set("company", v)} />
                    <Field label="Location" value={form.location} onChange={v => set("location", v)} placeholder="e.g. Toronto, ON" />
                    <div>
                        <label className="text-sm font-semibold text-stone-700 mb-1 block">Description *</label>
                        <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none resize-none" />
                    </div>
                    <Field label="External URL *" value={form.externalUrl} onChange={v => set("externalUrl", v)} placeholder="https://..." />
                    <Field label="Referral Contact" value={form.referralContact} onChange={v => set("referralContact", v)} placeholder="Name or email" />
                    <div className="flex gap-6">
                        <Toggle label="Featured" checked={form.isFeatured} onChange={v => set("isFeatured", v)} />
                        <Toggle label="Referral Available" checked={form.referralAvailable} onChange={v => set("referralAvailable", v)} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-stone-800">Cancel</button>
                        <button type="submit" disabled={mutation.isLoading} className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
                            {mutation.isLoading && <Loader2 size={14} className="animate-spin" />}
                            {isEdit ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; }) {
    return (
        <div>
            <label className="text-sm font-semibold text-stone-700 mb-1 block">{label}</label>
            <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
        </div>
    );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void; }) {
    return (
        <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="w-4 h-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500" />
            <span className="text-sm font-medium text-stone-700">{label}</span>
        </label>
    );
}

/* ── Delete Confirm Modal ── */
function DeleteJobModal({ jobId, onClose, onSuccess, onError }: { jobId: string; onClose: () => void; onSuccess: () => void; onError: (msg: string) => void; }) {
    const del = useDeleteJob(jobId);
    const handleDelete = async () => {
        try { await del.trigger(); onSuccess(); } catch { onError("Failed to delete job."); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-stone-900">Delete Job</h2>
                <p className="text-sm text-stone-500">This action cannot be undone. Are you sure?</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-stone-800">Cancel</button>
                    <button onClick={handleDelete} disabled={del.isLoading} className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
                        {del.isLoading && <Loader2 size={14} className="animate-spin" />} Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
