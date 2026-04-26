"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { Briefcase, Plus, X, Trash2, Pencil, MapPin, Building2, Clock, ExternalLink, Star, Loader2, RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import {
    createJob,
    deleteJob,
    fetchAllJobs,
    getApiErrorMessage,
    getJobTypeLabel,
    getWorkModeLabel,
    toggleFeaturedStatus,
    updateJob,
    type JobRecord,
    type JobType,
    type JobUpsertInput,
    type WorkMode,
} from "@/lib/jobs";

const JOB_TYPES: Array<{ label: string; value: JobType }> = [
    { label: "Full-time", value: "FULL_TIME" },
    { label: "Part-time", value: "PART_TIME" },
    { label: "Contract", value: "CONTRACT" },
    { label: "Internship", value: "INTERNSHIP" },
];

const WORK_MODES: Array<{ label: string; value: WorkMode }> = [
    { label: "Remote", value: "REMOTE" },
    { label: "Hybrid", value: "HYBRID" },
    { label: "On-site", value: "ON_SITE" },
];

export default function AdminJobsPage() {
    const { getToken } = useAuth();
    const { toast } = useToast();
    const [jobs, setJobs] = useState<JobRecord[]>([]);
    const [modal, setModal] = useState<null | "create" | JobRecord>(null);
    const [deleteTarget, setDeleteTarget] = useState<JobRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [busyFeatureId, setBusyFeatureId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadJobs = async (showRefreshing = false) => {
        if (showRefreshing) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }

        setError(null);

        try {
            const items = await fetchAllJobs();
            setJobs(items);
        } catch (loadError) {
            setError(getApiErrorMessage(loadError, "Unable to load jobs right now."));
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        void loadJobs();
    }, []);

    const featured = jobs.filter((job) => job.isFeatured);
    const unfeatured = jobs.filter((job) => !job.isFeatured);

    const handleSave = async (data: JobUpsertInput) => {
        setIsSaving(true);

        try {
            if (modal && typeof modal === "object") {
                await updateJob(modal.id, data, getToken);
                toast("Job updated");
            } else {
                await createJob(data, getToken);
                toast("Job created");
            }

            setModal(null);
            await loadJobs(true);
        } catch (saveError) {
            toast(getApiErrorMessage(saveError, "Unable to save job."), "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) {
            return;
        }

        setIsDeleting(true);

        try {
            await deleteJob(deleteTarget.id, getToken);
            toast("Job removed");
            setDeleteTarget(null);
            await loadJobs(true);
        } catch (deleteError) {
            toast(getApiErrorMessage(deleteError, "Unable to remove job."), "error");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleFeatured = async (job: JobRecord) => {
        if (busyFeatureId === job.id) {
            return;
        }

        setBusyFeatureId(job.id);

        try {
            await toggleFeaturedStatus(job.id, getToken);
            setJobs((prev) => prev.map((item) => item.id === job.id ? { ...item, isFeatured: !item.isFeatured } : item));
            toast(job.isFeatured ? "Job moved to unlisted" : "Job featured");
        } catch (featureError) {
            toast(getApiErrorMessage(featureError, "Unable to update featured status."), "error");
        } finally {
            setBusyFeatureId(null);
        }
    };

    return (
        <ErrorBoundary>
            <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-900">Featured Jobs</h1>
                        <p className="text-stone-500 mt-1">Manage job listings visible to community members.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => void loadJobs(true)} disabled={isRefreshing} className="bg-white border border-stone-200 text-stone-700 px-4 py-2.5 rounded-xl font-bold hover:border-brand-300 hover:text-brand-700 flex items-center gap-2 w-fit disabled:opacity-70 disabled:cursor-not-allowed">
                            {isRefreshing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                            Refresh
                        </button>
                        <button onClick={() => setModal("create")} className="bg-brand-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-700 flex items-center gap-2 shadow-lg shadow-brand-800/10 w-fit">
                            <Plus size={18} /> Add Job
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-stone-100 p-5">
                        <p className="text-sm text-stone-500 font-medium">Total Listings</p>
                        <p className="text-3xl font-bold text-stone-900 mt-1">{jobs.length}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-stone-100 p-5">
                        <p className="text-sm text-stone-500 font-medium">Featured</p>
                        <p className="text-3xl font-bold text-brand-700 mt-1">{featured.length}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-stone-100 p-5">
                        <p className="text-sm text-stone-500 font-medium">Unlisted</p>
                        <p className="text-3xl font-bold text-stone-400 mt-1">{unfeatured.length}</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        <SkeletonCard lines={4} />
                        <SkeletonCard lines={4} />
                        <SkeletonCard lines={4} />
                    </div>
                ) : error ? (
                    <EmptyState icon={Briefcase} heading="Jobs unavailable" description={error} variant="plain" />
                ) : (
                    <>
                        {featured.length > 0 ? (
                            <div>
                                <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Featured ({featured.length})</h2>
                                <div className="space-y-3">
                                    {featured.map((job) => (
                                        <JobRow
                                            key={job.id}
                                            job={job}
                                            isToggling={busyFeatureId === job.id}
                                            onEdit={() => setModal(job)}
                                            onDelete={() => setDeleteTarget(job)}
                                            onToggle={() => void handleToggleFeatured(job)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {unfeatured.length > 0 ? (
                            <div>
                                <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Unlisted ({unfeatured.length})</h2>
                                <div className="space-y-3">
                                    {unfeatured.map((job) => (
                                        <JobRow
                                            key={job.id}
                                            job={job}
                                            isToggling={busyFeatureId === job.id}
                                            onEdit={() => setModal(job)}
                                            onDelete={() => setDeleteTarget(job)}
                                            onToggle={() => void handleToggleFeatured(job)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {jobs.length === 0 ? (
                            <EmptyState icon={Briefcase} heading="No jobs yet" description="Add your first listing." variant="plain" />
                        ) : null}
                    </>
                )}

                {modal !== null ? (
                    <JobFormModal
                        initial={typeof modal === "object" ? modal : undefined}
                        onClose={() => setModal(null)}
                        onSave={handleSave}
                        saving={isSaving}
                    />
                ) : null}

                <ConfirmModal
                    open={deleteTarget !== null}
                    onClose={() => !isDeleting && setDeleteTarget(null)}
                    onConfirm={() => void handleDelete()}
                    loading={isDeleting}
                    title="Remove Job?"
                    description="This listing will be soft-deleted from the backend."
                    icon={Trash2}
                />
            </div>
        </ErrorBoundary>
    );
}

function JobRow({
    job,
    isToggling,
    onEdit,
    onDelete,
    onToggle,
}: {
    job: JobRecord;
    isToggling: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onToggle: () => void;
}) {
    return (
        <div className={`bg-white rounded-2xl border p-5 flex flex-col md:flex-row md:items-center gap-4 transition-all ${job.isFeatured ? "border-brand-200 hover:border-brand-300" : "border-stone-100 opacity-80 hover:opacity-100"}`}>
            <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 font-bold text-lg flex-shrink-0">
                {job.company[0]}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-stone-900">{job.title}</h3>
                    {job.referralAvailable ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-1 text-[10px] font-bold text-brand-700 border border-brand-100">
                            Referral enabled
                        </span>
                    ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-stone-500">
                    <span className="flex items-center gap-1"><Building2 size={14} /> {job.company}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {getJobTypeLabel(job.jobType)}</span>
                    <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-semibold text-stone-600">{getWorkModeLabel(job.workMode)}</span>
                </div>
                {job.referralContact ? (
                    <p className="mt-2 text-xs font-semibold text-brand-700">Referral contact: {job.referralContact}</p>
                ) : null}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={onToggle} disabled={isToggling} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${job.isFeatured ? "bg-brand-50 text-brand-700 hover:bg-brand-100" : "bg-stone-50 text-stone-500 hover:bg-stone-100"}`}>
                    {isToggling ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} className="inline-block mr-1" />}
                    {job.isFeatured ? "Unfeature" : "Feature"}
                </button>
                {job.externalUrl ? (
                    <a href={job.externalUrl} target="_blank" rel="noopener noreferrer" aria-label="Open job posting" title="Open job posting" className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"><ExternalLink size={16} /></a>
                ) : null}
                <button onClick={onEdit} aria-label="Edit job" title="Edit job" className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"><Pencil size={16} /></button>
                <button onClick={onDelete} aria-label="Delete job" title="Delete job" className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
            </div>
        </div>
    );
}

function JobFormModal({
    initial,
    onClose,
    onSave,
    saving,
}: {
    initial?: JobRecord;
    onClose: () => void;
    onSave: (data: JobUpsertInput) => Promise<void>;
    saving: boolean;
}) {
    const [title, setTitle] = useState(initial?.title ?? "");
    const [company, setCompany] = useState(initial?.company ?? "");
    const [location, setLocation] = useState(initial?.location ?? "");
    const [jobType, setJobType] = useState<JobType>(initial?.jobType ?? "FULL_TIME");
    const [workMode, setWorkMode] = useState<WorkMode>(initial?.workMode ?? "REMOTE");
    const [externalUrl, setExternalUrl] = useState(initial?.externalUrl ?? "");
    const [referralContact, setReferralContact] = useState(initial?.referralContact ?? "");
    const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? true);
    const [referralAvailable, setReferralAvailable] = useState(initial?.referralAvailable ?? Boolean(initial?.referralContact));
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async () => {
        const nextErrors: Record<string, string> = {};

        if (!title.trim()) nextErrors.title = "Required";
        if (!company.trim()) nextErrors.company = "Required";
        if (!location.trim()) nextErrors.location = "Required";
        if (externalUrl && !/^https?:\/\/.+/i.test(externalUrl)) nextErrors.externalUrl = "Enter a valid URL";
        if (referralAvailable && !referralContact.trim()) nextErrors.referralContact = "Referral contact is required when referrals are enabled";

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        await onSave({
            title: title.trim(),
            company: company.trim(),
            location: location.trim(),
            jobType,
            workMode,
            externalUrl: externalUrl.trim() || null,
            referralContact: referralAvailable ? referralContact.trim() : null,
            isFeatured,
            referralAvailable,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => !saving && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-50 rounded-xl text-brand-700"><Briefcase size={20} /></div>
                        <h2 className="text-lg font-bold text-stone-900">{initial ? "Edit Job" : "Add Job"}</h2>
                    </div>
                    <button onClick={onClose} disabled={saving} aria-label="Close dialog" title="Close dialog" className="text-stone-400 hover:text-stone-600 disabled:opacity-50"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <Field label="Job Title" error={errors.title}>
                        <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Senior Product Manager" className={inputClass(errors.title)} />
                    </Field>
                    <Field label="Company" error={errors.company}>
                        <input type="text" value={company} onChange={(event) => setCompany(event.target.value)} placeholder="e.g. Shopify" className={inputClass(errors.company)} />
                    </Field>
                    <Field label="Location" error={errors.location}>
                        <input type="text" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Remote, Canada" className={inputClass(errors.location)} />
                    </Field>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Job Type</label>
                        <div className="flex gap-2 flex-wrap">
                            {JOB_TYPES.map((type) => (
                                <button key={type.value} type="button" onClick={() => setJobType(type.value)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${jobType === type.value ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{type.label}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Work Mode</label>
                        <div className="flex gap-2 flex-wrap">
                            {WORK_MODES.map((mode) => (
                                <button key={mode.value} type="button" onClick={() => setWorkMode(mode.value)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${workMode === mode.value ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{mode.label}</button>
                            ))}
                        </div>
                    </div>
                    <Field label="External URL" optional error={errors.externalUrl}>
                        <input type="url" value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} placeholder="https://careers.company.com/job/123" className={inputClass(errors.externalUrl)} />
                    </Field>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <button type="button" onClick={() => setReferralAvailable(!referralAvailable)} className={`w-10 h-6 rounded-full transition-colors relative ${referralAvailable ? "bg-brand-600" : "bg-stone-300"}`}>
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${referralAvailable ? "left-[18px]" : "left-0.5"}`} />
                        </button>
                        <span className="text-sm font-semibold text-stone-700">Referral available</span>
                    </label>
                    {referralAvailable ? (
                        <Field label="Referral Contact" error={errors.referralContact}>
                            <input type="text" value={referralContact} onChange={(event) => setReferralContact(event.target.value)} placeholder="e.g. Amara Okafor" className={inputClass(errors.referralContact)} />
                        </Field>
                    ) : null}
                    <label className="flex items-center gap-3 cursor-pointer">
                        <button type="button" onClick={() => setIsFeatured(!isFeatured)} className={`w-10 h-6 rounded-full transition-colors relative ${isFeatured ? "bg-brand-600" : "bg-stone-300"}`}>
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isFeatured ? "left-[18px]" : "left-0.5"}`} />
                        </button>
                        <span className="text-sm font-semibold text-stone-700">Feature this job</span>
                    </label>
                </div>
                <div className="flex gap-3 p-6 border-t border-stone-100 bg-stone-50">
                    <button onClick={onClose} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-white transition-colors disabled:opacity-50">Cancel</button>
                    <button onClick={() => void handleSubmit()} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-800 hover:bg-brand-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                        {initial ? "Save Changes" : "Add Job"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Field({ label, optional, error, children }: { label: string; optional?: boolean; error?: string; children: ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">
                {label} {optional ? <span className="text-stone-400 font-normal">(optional)</span> : null}
            </label>
            {children}
            {error ? <p className="text-red-500 text-xs mt-1">{error}</p> : null}
        </div>
    );
}

function inputClass(error?: string) {
    return `w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${error ? "border-red-300 bg-red-50" : "border-stone-200"}`;
}