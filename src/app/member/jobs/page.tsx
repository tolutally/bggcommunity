"use client";

import { Briefcase, Search, MapPin, Building2, Clock, ExternalLink, UserCircle, Bookmark, BookmarkCheck } from "lucide-react";
import { useState, useMemo } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";

type ContactRole = "Member" | "Ecosystem Partner" | "Alumni" | "Staff";

interface InternalContact {
    name: string;
    role: ContactRole;
}

interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    type: "Full-time" | "Part-time" | "Contract" | "Internship";
    workMode: "Remote" | "Hybrid" | "On-site";
    url: string;
    postedAt: string;
    contact?: InternalContact;
}

/* Featured jobs — mirrors admin data */
const FEATURED_JOBS: Job[] = [
    { id: 1, title: "Java Developer", company: "CGI", location: "Toronto, ON", type: "Full-time", workMode: "Hybrid", url: "https://example.com/job/1", postedAt: "2 days ago", contact: { name: "Amara Okafor", role: "Member" } },
    { id: 2, title: "Senior Product Manager", company: "Shopify", location: "Remote, Canada", type: "Full-time", workMode: "Remote", url: "https://example.com/job/2", postedAt: "4 days ago", contact: { name: "TechBridge Inc.", role: "Ecosystem Partner" } },
    { id: 4, title: "Data Analyst Intern", company: "Meta", location: "Remote", type: "Internship", workMode: "Remote", url: "https://example.com/job/4", postedAt: "1 week ago", contact: { name: "Keisha Williams", role: "Alumni" } },
];

const WORK_MODES = ["All", "Remote", "Hybrid", "On-site"] as const;
const JOB_TYPES = ["All", "Full-time", "Part-time", "Contract", "Internship"] as const;

export default function MemberJobsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [modeFilter, setModeFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [saved, setSaved] = useState<Set<number>>(new Set());

    const toggleSave = (id: number) => {
        setSaved(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const filtered = useMemo(() => {
        return FEATURED_JOBS.filter(job => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!job.title.toLowerCase().includes(q) && !job.company.toLowerCase().includes(q) && !job.location.toLowerCase().includes(q)) return false;
            }
            if (modeFilter !== "All" && job.workMode !== modeFilter) return false;
            if (typeFilter !== "All" && job.type !== typeFilter) return false;
            return true;
        });
    }, [searchQuery, modeFilter, typeFilter]);

    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-stone-900">Job Board</h1>
                <p className="text-stone-500 mt-1">Featured opportunities from our community and partners.</p>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-4">
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
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Mode:</span>
                        {WORK_MODES.map(m => (
                            <button key={m} onClick={() => setModeFilter(m)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${modeFilter === m ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{m}</button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Type:</span>
                        {JOB_TYPES.map(t => (
                            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${typeFilter === t ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{t}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-stone-500 font-medium">{filtered.length} featured job{filtered.length !== 1 ? "s" : ""}</p>

            {/* Job Listings */}
            <div className="space-y-4">
                {filtered.map(job => (
                    <div key={job.id} className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all group">
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                            {/* Company Logo */}
                            <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 font-bold text-xl flex-shrink-0 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
                                {job.company[0]}
                            </div>

                            {/* Job Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="font-semibold text-stone-700">{job.company}</span>
                                    <span className="text-stone-300">&middot;</span>
                                    <span className="text-sm text-stone-400">{job.postedAt}</span>
                                </div>
                                <h3 className="text-lg font-bold text-stone-900 group-hover:text-brand-700 transition-colors mb-2">{job.title}</h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600">
                                        <MapPin size={12} /> {job.location}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600">
                                        <Clock size={12} /> {job.type}
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${job.workMode === "Remote" ? "bg-green-50 text-green-700 border-green-100" : job.workMode === "Hybrid" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-stone-50 text-stone-600 border-stone-200"}`}>
                                        {job.workMode}
                                    </span>
                                </div>

                                {/* Internal Contact */}
                                {job.contact && (
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <UserCircle size={14} className="text-brand-600" />
                                        <span className="text-xs font-semibold text-brand-700">{job.contact.name}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 font-bold border border-brand-100">{job.contact.role}</span>
                                        {job.contact.role === "Member" || job.contact.role === "Alumni" ? (
                                            <span className="text-[10px] text-stone-400 ml-1">· Can refer</span>
                                        ) : null}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
                                <button onClick={() => toggleSave(job.id)} className={`p-2.5 rounded-xl border transition-colors ${saved.has(job.id) ? "bg-brand-50 text-brand-700 border-brand-200" : "text-stone-400 border-stone-200 hover:bg-stone-50"}`}>
                                    {saved.has(job.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                                </button>
                                <a href={job.url} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm flex items-center gap-2">
                                    Apply <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filtered.length === 0 && (
                <EmptyState
                    icon={Briefcase}
                    heading="No jobs found"
                    description="Try adjusting your search or filters."
                    variant="plain"
                />
            )}
        </div>
        </ErrorBoundary>
    );
}
