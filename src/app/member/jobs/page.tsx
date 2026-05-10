"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Briefcase, Search, MapPin, Clock, ExternalLink, Bookmark, BookmarkCheck, Loader2, Send } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { fetchJobs, getApiErrorMessage, getJobTypeLabel, getWorkModeLabel, requestJobReferral, type JobRecord, type JobType, type WorkMode } from "@/lib/jobs";

const WORK_MODES: Array<{ label: string; value?: WorkMode }> = [
    { label: "All" },
    { label: "Remote", value: "REMOTE" },
    { label: "Hybrid", value: "HYBRID" },
    { label: "On-site", value: "ON_SITE" },
];

const JOB_TYPES: Array<{ label: string; value?: JobType }> = [
    { label: "All" },
    { label: "Full-time", value: "FULL_TIME" },
    { label: "Part-time", value: "PART_TIME" },
    { label: "Contract", value: "CONTRACT" },
    { label: "Internship", value: "INTERNSHIP" },
];

export default function MemberJobsPage() {
    const { getToken } = useAuth();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [modeFilter, setModeFilter] = useState<WorkMode | undefined>(undefined);
    const [typeFilter, setTypeFilter] = useState<JobType | undefined>(undefined);
    const [saved, setSaved] = useState<Set<string>>(new Set());
    const [referralRequested, setReferralRequested] = useState<Set<string>>(new Set());
    const [jobs, setJobs] = useState<JobRecord[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isRequestingReferral, setIsRequestingReferral] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadInitialJobs() {
            setIsLoading(true);
            setError(null);

            try {
                const page = await fetchJobs({ isFeatured: true, limit: 20 });

                if (cancelled) {
                    return;
                }

                setJobs(page.items);
                setNextCursor(page.nextCursor);
            } catch (loadError) {
                if (cancelled) {
                    return;
                }

                setError(getApiErrorMessage(loadError, "Unable to load jobs right now."));
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadInitialJobs();

        return () => {
            cancelled = true;
        };
    }, []);

    const filtered = useMemo(() => {
        return jobs.filter((job) => {
            const query = searchQuery.trim().toLowerCase();

            if (query) {
                const matchesQuery =
                    job.title.toLowerCase().includes(query) ||
                    job.company.toLowerCase().includes(query) ||
                    job.location.toLowerCase().includes(query) ||
                    (job.description ?? "").toLowerCase().includes(query);

                if (!matchesQuery) {
                    return false;
                }
            }

            if (modeFilter && job.workMode !== modeFilter) {
                return false;
            }

            if (typeFilter && job.jobType !== typeFilter) {
                return false;
            }

            return true;
        });
    }, [jobs, modeFilter, searchQuery, typeFilter]);

    const toggleSave = (id: string) => {
        setSaved((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const loadMore = async () => {
        if (!nextCursor || isLoadingMore) {
            return;
        }

        setIsLoadingMore(true);

        try {
            const page = await fetchJobs({ isFeatured: true, limit: 20, cursor: nextCursor });
            setJobs((prev) => {
                const existingIds = new Set(prev.map((item) => item.id));
                const nextItems = page.items.filter((item) => !existingIds.has(item.id));
                return [...prev, ...nextItems];
            });
            setNextCursor(page.nextCursor);
        } catch (loadError) {
            toast(getApiErrorMessage(loadError, "Unable to load more jobs."), "error");
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleReferralRequest = async (job: JobRecord) => {
        if (!job.referralAvailable || referralRequested.has(job.id) || isRequestingReferral === job.id) {
            return;
        }

        setIsRequestingReferral(job.id);

        try {
            await requestJobReferral(job.id, getToken);
            setReferralRequested((prev) => new Set(prev).add(job.id));
            toast("Referral request sent");
        } catch (requestError) {
            toast(getApiErrorMessage(requestError, "Unable to request referral."), "error");
        } finally {
            setIsRequestingReferral(null);
        }
    };

    return (
        <ErrorBoundary>
            <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Job Board</h1>
                    <p className="text-stone-500 mt-1">Featured opportunities from our community and partners.</p>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search jobs, companies, locations..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none"
                        />
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Mode:</span>
                            {WORK_MODES.map((mode) => (
                                <button
                                    key={mode.label}
                                    onClick={() => setModeFilter(mode.value)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${modeFilter === mode.value ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Type:</span>
                            {JOB_TYPES.map((type) => (
                                <button
                                    key={type.label}
                                    onClick={() => setTypeFilter(type.value)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${typeFilter === type.value ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
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
                        <p className="text-sm text-stone-500 font-medium">{filtered.length} featured job{filtered.length !== 1 ? "s" : ""}</p>

                        <div className="space-y-4">
                            {filtered.map((job) => {
                                const isSaved = saved.has(job.id);
                                const referralSent = referralRequested.has(job.id);
                                const isReferralPending = isRequestingReferral === job.id;

                                return (
                                    <div key={job.id} className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all group">
                                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 font-bold text-xl flex-shrink-0 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
                                                {job.company[0]}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="font-semibold text-stone-700">{job.company}</span>
                                                    <span className="text-stone-300">&middot;</span>
                                                    <span className="text-sm text-stone-400">{job.postedAtLabel}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-stone-900 group-hover:text-brand-700 transition-colors mb-2">{job.title}</h3>
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600">
                                                        <MapPin size={12} /> {job.location}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600">
                                                        <Clock size={12} /> {getJobTypeLabel(job.jobType)}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${job.workMode === "REMOTE" ? "bg-green-50 text-green-700 border-green-100" : job.workMode === "HYBRID" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-stone-50 text-stone-600 border-stone-200"}`}>
                                                        {getWorkModeLabel(job.workMode)}
                                                    </span>
                                                    {job.referralAvailable ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-brand-50 text-brand-700 border-brand-100">
                                                            Referral available
                                                        </span>
                                                    ) : null}
                                                </div>
                                                {job.description ? (
                                                    <p className="text-sm leading-6 text-stone-500 line-clamp-3">{job.description}</p>
                                                ) : null}
                                            </div>

                                            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
                                                <button
                                                    onClick={() => toggleSave(job.id)}
                                                    aria-label={isSaved ? "Unsave job" : "Save job"}
                                                    title={isSaved ? "Unsave job" : "Save job"}
                                                    className={`p-2.5 rounded-xl border transition-colors ${isSaved ? "bg-brand-50 text-brand-700 border-brand-200" : "text-stone-400 border-stone-200 hover:bg-stone-50"}`}
                                                >
                                                    {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => job.referralAvailable ? void handleReferralRequest(job) : undefined}
                                                    disabled={!job.referralAvailable || referralSent || isReferralPending}
                                                    title={!job.referralAvailable ? "No referral available for this job" : referralSent ? "Referral already requested" : "Seek a referral"}
                                                    className={`px-5 py-2.5 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 border ${
                                                        !job.referralAvailable
                                                            ? "bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed"
                                                            : referralSent
                                                            ? "bg-brand-50 text-brand-700 border-brand-200 cursor-default"
                                                            : "bg-white text-brand-700 border-brand-200 hover:bg-brand-50"
                                                    }`}
                                                >
                                                    {isReferralPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                                    {referralSent ? "Referral requested" : "Seek referral"}
                                                </button>
                                                {job.externalUrl ? (
                                                    <a href={job.externalUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm flex items-center gap-2">
                                                        Apply <ExternalLink size={14} />
                                                    </a>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filtered.length === 0 ? (
                            <EmptyState icon={Briefcase} heading="No jobs found" description="Try adjusting your search or filters." variant="plain" />
                        ) : null}

                        {nextCursor ? (
                            <div className="flex justify-center">
                                <button
                                    onClick={() => void loadMore()}
                                    disabled={isLoadingMore}
                                    className="px-5 py-2.5 rounded-xl border border-stone-200 bg-white text-sm font-bold text-stone-700 hover:border-brand-300 hover:text-brand-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isLoadingMore ? <Loader2 size={16} className="animate-spin" /> : null}
                                    Load more
                                </button>
                            </div>
                        ) : null}
                    </>
                )}
            </div>
        </ErrorBoundary>
    );
}