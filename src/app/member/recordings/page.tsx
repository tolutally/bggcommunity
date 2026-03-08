"use client";

import { useState, useMemo } from "react";
import { Video, Search, LayoutGrid, List as ListIcon, Clock, Calendar, Play, Filter, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorBoundary } from "@/components/ui/error-boundary";

/* ── Types ── */
interface Recording {
    id: number;
    title: string;
    description: string;
    date: string; // yyyy-mm-dd
    duration: string;
    type: string;
    host: string;
    cohort: string;
    thumbnailUrl: string;
    videoUrl: string;
}

/* ── Mock Data ── */
const MOCK_RECORDINGS: Recording[] = [
    { id: 1, title: "Deep Dive: Systems Thinking", description: "Exploring systems thinking frameworks for product teams — mental models, feedback loops, and leverage points.", date: "2025-10-22", duration: "1:28:34", type: "Workshop", host: "Sarah Jenkins", cohort: "Alpha", thumbnailUrl: "", videoUrl: "https://youtube.com/watch?v=abc123" },
    { id: 2, title: "Guest Speaker: Product at Uber", description: "Amanda shares her journey from IC to leading product for Uber Eats global expansion.", date: "2025-10-20", duration: "58:12", type: "Speaker Series", host: "Amanda Jones", cohort: "Alpha", thumbnailUrl: "", videoUrl: "https://youtube.com/watch?v=def456" },
    { id: 3, title: "Resume Review Circle", description: "Small-group resume reviews with live feedback from hiring managers.", date: "2025-10-18", duration: "43:07", type: "Workshop", host: "Keisha M.", cohort: "Beta", thumbnailUrl: "", videoUrl: "https://youtube.com/watch?v=ghi789" },
    { id: 4, title: "Weekly Office Hours — Week 4", description: "Open Q&A session covering career questions, technical blockers, and general advice.", date: "2025-10-15", duration: "1:02:45", type: "Q&A", host: "Alisha Reid", cohort: "Alpha", thumbnailUrl: "", videoUrl: "https://youtube.com/watch?v=jkl012" },
    { id: 5, title: "Portfolio Presentation Workshop", description: "Hands-on walkthrough of how to structure your case study portfolio for PM roles.", date: "2025-10-12", duration: "1:15:20", type: "Workshop", host: "Dr. Alisha Reid", cohort: "Gamma", thumbnailUrl: "", videoUrl: "https://youtube.com/watch?v=mno345" },
    { id: 6, title: "Data Storytelling Masterclass", description: "Learn to communicate data insights clearly with compelling visual narratives.", date: "2025-10-10", duration: "52:30", type: "Workshop", host: "Chiamaka Nnadi", cohort: "Beta", thumbnailUrl: "", videoUrl: "https://youtube.com/watch?v=pqr678" },
    { id: 7, title: "Networking Happy Hour Recap", description: "Casual mixer — speed networking rounds followed by open conversation.", date: "2025-10-08", duration: "1:32:10", type: "Social", host: "Community Team", cohort: "Alpha", thumbnailUrl: "", videoUrl: "https://youtube.com/watch?v=stu901" },
    { id: 8, title: "Technical Interview Prep", description: "Mock interview practice with real-time feedback on system design and behavioral questions.", date: "2025-10-05", duration: "1:45:00", type: "Workshop", host: "Danielle Robinson", cohort: "Gamma", thumbnailUrl: "", videoUrl: "https://youtube.com/watch?v=vwx234" },
    { id: 9, title: "Weekly Office Hours — Week 3", description: "Open Q&A session — bring your career questions, technical blockers, or just come hang out.", date: "2025-10-01", duration: "55:18", type: "Q&A", host: "Alisha Reid", cohort: "Alpha", thumbnailUrl: "", videoUrl: "https://youtube.com/watch?v=yza567" },
    { id: 10, title: "User Research Methods 101", description: "Introduction to qualitative and quantitative research methods for product teams.", date: "2025-09-28", duration: "1:10:42", type: "Workshop", host: "Fatima Diop", cohort: "Beta", thumbnailUrl: "", videoUrl: "https://youtube.com/watch?v=bcd890" },
    { id: 11, title: "Fireside Chat: Breaking into Tech", description: "Panel discussion with alumni on navigating career transitions into tech roles.", date: "2025-09-25", duration: "1:22:55", type: "Speaker Series", host: "Efe Omoregie", cohort: "Gamma", thumbnailUrl: "", videoUrl: "https://youtube.com/watch?v=efg123" },
    { id: 12, title: "Stakeholder Management Workshop", description: "Practical strategies for managing stakeholder expectations and building alignment.", date: "2025-09-22", duration: "48:33", type: "Workshop", host: "Sarah Jenkins", cohort: "Alpha", thumbnailUrl: "", videoUrl: "https://youtube.com/watch?v=hij456" },
];

const TYPES = ["Workshop", "Q&A", "Speaker Series", "Social"];
const COHORTS = ["Alpha", "Beta", "Gamma"];

function fmtDate(d: string) {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function MemberRecordingsPage() {
    const { user } = useUser();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("All");
    const [selectedCohort, setSelectedCohort] = useState("All");

    const filtered = useMemo(() => {
        return MOCK_RECORDINGS.filter(r => {
            const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = selectedType === "All" || r.type === selectedType;
            const matchesCohort = selectedCohort === "All" || r.cohort === selectedCohort;
            return matchesSearch && matchesType && matchesCohort;
        });
    }, [searchQuery, selectedType, selectedCohort]);

    return (
        <ErrorBoundary>
            <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link href="/member" className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-brand-700 transition-colors mb-3">
                            <ArrowLeft size={16} /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-stone-900">Session Recordings</h1>
                        <p className="text-stone-500 mt-1">Catch up on past sessions, workshops, and speaker events.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-lg text-sm font-bold">
                            {filtered.length} Recording{filtered.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col xl:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-stone-200">
                    <div className="flex flex-col md:flex-row gap-4 flex-1">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search recordings..."
                                className="w-full pl-10 pr-4 py-2 bg-stone-50 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            <select
                                className="bg-stone-50 border border-stone-200 text-stone-700 text-sm rounded-xl focus:ring-brand-500 focus:border-brand-500 block p-2 outline-none cursor-pointer font-medium"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                            >
                                <option value="All">All Types</option>
                                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select
                                className="bg-stone-50 border border-stone-200 text-stone-700 text-sm rounded-xl focus:ring-brand-500 focus:border-brand-500 block p-2 outline-none cursor-pointer font-medium"
                                value={selectedCohort}
                                onChange={(e) => setSelectedCohort(e.target.value)}
                            >
                                <option value="All">All Cohorts</option>
                                {COHORTS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-stone-100 p-1 rounded-xl w-fit self-end xl:self-auto">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-stone-900" : "text-stone-400 hover:text-stone-600"}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-stone-900" : "text-stone-400 hover:text-stone-600"}`}
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>
                </div>

                {/* Grid View */}
                {viewMode === "grid" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filtered.map(recording => (
                            <RecordingGridCard key={recording.id} recording={recording} />
                        ))}
                    </div>
                )}

                {/* List View */}
                {viewMode === "list" && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filtered.map(recording => (
                            <RecordingListRow key={recording.id} recording={recording} />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {filtered.length === 0 && (
                    <EmptyState
                        icon={Video}
                        heading="No recordings found"
                        description="Try adjusting your search or filters."
                    />
                )}
            </div>
        </ErrorBoundary>
    );
}

/* ── Recording Grid Card ── */
function RecordingGridCard({ recording }: { recording: Recording }) {
    return (
        <a href={recording.videoUrl} target="_blank" rel="noopener noreferrer" className="group cursor-pointer block">
            {/* Video Thumbnail */}
            <div className="aspect-video bg-stone-800 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-stone-700 transition-colors overflow-hidden relative">
                <div className="w-14 h-14 bg-stone-700 group-hover:bg-stone-600 rounded-xl flex items-center justify-center transition-colors">
                    <Video size={28} className="text-stone-400" />
                </div>
                {/* Play overlay on hover */}
                <div className="absolute inset-0 bg-brand-800/0 group-hover:bg-brand-800/20 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/0 group-hover:bg-white/90 rounded-full flex items-center justify-center transition-all scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100">
                        <Play size={28} className="text-brand-800 ml-1" />
                    </div>
                </div>
                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded-md text-white text-xs font-medium">
                    {recording.duration}
                </div>
                {/* Type Badge */}
                <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-wide text-white">
                        {recording.type}
                    </span>
                </div>
            </div>
            {/* Recording Info */}
            <h4 className="font-bold text-stone-900 group-hover:text-brand-800 transition-colors line-clamp-2 mb-1">
                {recording.title}
            </h4>
            <p className="text-sm text-stone-500 line-clamp-2 mb-2">{recording.description}</p>
            <div className="flex items-center gap-3 text-xs text-stone-400">
                <span className="flex items-center gap-1"><Calendar size={12} /> {fmtDate(recording.date)}</span>
                <span className="flex items-center gap-1">Host: {recording.host}</span>
            </div>
            <div className="mt-2">
                <span className="inline-flex px-2 py-0.5 bg-stone-100 border border-stone-200 rounded-md text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                    {recording.cohort}
                </span>
            </div>
        </a>
    );
}

/* ── Recording List Row ── */
function RecordingListRow({ recording }: { recording: Recording }) {
    return (
        <a
            href={recording.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col md:flex-row gap-4 bg-white rounded-2xl border border-stone-200 p-4 hover:border-brand-300 hover:shadow-md transition-all group"
        >
            {/* Thumbnail */}
            <div className="flex-shrink-0 w-full md:w-48 aspect-video md:aspect-auto md:h-28 bg-stone-800 rounded-xl flex items-center justify-center relative overflow-hidden group-hover:bg-stone-700 transition-colors">
                <div className="w-10 h-10 bg-stone-700 group-hover:bg-stone-600 rounded-lg flex items-center justify-center transition-colors">
                    <Play size={20} className="text-stone-400 ml-0.5" />
                </div>
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-white text-[11px] font-medium">
                    {recording.duration}
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <StatusBadge label={recording.type} preset={recording.type as any} variant="tag" />
                    <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 rounded-md text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                        {recording.cohort}
                    </span>
                </div>
                <h3 className="text-base font-bold text-stone-900 group-hover:text-brand-800 transition-colors mb-1">
                    {recording.title}
                </h3>
                <p className="text-sm text-stone-500 line-clamp-1 mb-2">{recording.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-stone-400">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {fmtDate(recording.date)}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {recording.duration}</span>
                    <span>Host: {recording.host}</span>
                </div>
            </div>

            {/* Play Button */}
            <div className="flex-shrink-0 flex items-center">
                <span className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl group-hover:bg-brand-700 transition-colors flex items-center gap-2 text-sm">
                    <Play size={16} /> Watch
                </span>
            </div>
        </a>
    );
}
