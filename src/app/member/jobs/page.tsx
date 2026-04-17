"use client";

import { Briefcase, Search, MapPin, ExternalLink, Bookmark, BookmarkCheck, Loader2, Send } from "lucide-react";
import { useState, useMemo } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useJobs, useRequestReferral, fmtJobDate } from "@/hooks/use-jobs";
import { useToast } from "@/components/ui/toast";
import type { Job } from "@/lib/types";

export default function MemberJobsPage() {
    const { jobs, isLoading } = useJobs();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [saved, setSaved] = useState<Set<string>>(new Set());
    const [referralJobId, setReferralJobId] = useState<string | null>(null);
    const [referralMsg, setReferralMsg] = useState("");

    const toggleSave = (id: string) => {
        setSaved(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const filtered = useMemo(() => {
        return jobs.filter(job => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return job.title.toLowerCase().includes(q) ||
                job.company.toLowerCase().includes(q) ||
                (job.location ?? "").toLowerCase().includes(q);
        });
    }, [jobs, searchQuery]);

    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-stone-900">Job Board</h1>
                <p className="text-stone-500 mt-1">Featured opportunities from our community and partners.</p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search jobs, companies, locations..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none"
                    />
                </div>
            </div>

            {!isLoading && <p className="text-sm text-stone-500 font-medium">{filtered.length} job{filtered.length !== 1 ? "s" : ""}</p>}

            {isLoading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-brand-500" size={28} />
                </div>
            )}

            <div className="space-y-4">
                {filtered.map(job => (
                    <JobCard
                        key={job.id}
                        job={job}
                        isSaved={saved.has(job.id)}
                        onToggleSave={() => toggleSave(job.id)}
                        onRequestReferral={() => { setReferralJobId(job.id); setReferralMsg(""); }}
                    />
                ))}
            </div>

            {!isLoading && filtered.length === 0 && (
                <EmptyState icon={Briefcase} heading="No jobs found" description={searchQuery ? "Try adjusting your search." : "Check back soon for new opportunities."} variant="plain" />
            )}

            {referralJobId && (
                <ReferralModal
                    jobId={referralJobId}
                    message={referralMsg}
                    onMessageChange={setReferralMsg}
                    onClose={() => setReferralJobId(null)}
                    onSuccess={() => { toast("Referral request sent!", "success"); setReferralJobId(null); }}
                    onError={(msg) => toast(msg, "error")}
                />
            )}
        </div>
        </ErrorBoundary>
    );
}

function JobCard({ job, isSaved, onToggleSave, onRequestReferral }: {
    job: Job; isSaved: boolean; onToggleSave: () => void; onRequestReferral: () => void;
}) {
    return (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all group">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 font-bold text-xl flex-shrink-0 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
                    {job.company[0]}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-stone-700">{job.company}</span>
                        <span className="text-stone-300">&middot;</span>
                        <span className="text-sm text-stone-400">{fmtJobDate(job.createdAt)}</span>
                        {job.isFeatured && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold uppercase">Featured</span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 group-hover:text-brand-700 transition-colors mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {job.location && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600">
                                <MapPin size={12} /> {job.location}
                            </span>
                        )}
                    </div>
                    {job.description && <p className="text-sm text-stone-500 line-clamp-2 mb-2">{job.description}</p>}
                    {job.referralAvailable && (
                        <button onClick={onRequestReferral} className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800 transition-colors">
                            <Send size={12} /> Request Referral
                            {job.referralContact && <span className="text-stone-400 ml-1">via {job.referralContact}</span>}
                        </button>
                    )}
                </div>
                <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
                    <button onClick={onToggleSave} className={`p-2.5 rounded-xl border transition-colors ${isSaved ? "bg-brand-50 text-brand-700 border-brand-200" : "text-stone-400 border-stone-200 hover:bg-stone-50"}`}>
                        {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    </button>
                    <a href={job.externalUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm flex items-center gap-2">
                        Apply <ExternalLink size={14} />
                    </a>
                </div>
            </div>
        </div>
    );
}

function ReferralModal({ jobId, message, onMessageChange, onClose, onSuccess, onError }: {
    jobId: string; message: string; onMessageChange: (v: string) => void;
    onClose: () => void; onSuccess: () => void; onError: (msg: string) => void;
}) {
    const { trigger, isLoading } = useRequestReferral(jobId);

    const handleSubmit = async () => {
        try {
            await trigger({ message: message.trim() || undefined });
            onSuccess();
        } catch {
            onError("Failed to send referral request. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-stone-900">Request Referral</h2>
                <p className="text-sm text-stone-500">Add an optional message to introduce yourself.</p>
                <textarea
                    value={message}
                    onChange={e => onMessageChange(e.target.value)}
                    rows={3}
                    placeholder="Hi, I'm interested in this role..."
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none resize-none"
                />
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-stone-800">Cancel</button>
                    <button onClick={handleSubmit} disabled={isLoading} className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        Send Request
                    </button>
                </div>
            </div>
        </div>
    );
}
