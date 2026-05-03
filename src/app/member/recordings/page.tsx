"use client";

import { useState, useMemo } from "react";
import { Video, Search, LayoutGrid, List as ListIcon, Clock, Calendar, Play, Loader2, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useEvents, eventTypeLabel, fmtDuration } from "@/hooks/use-events";

function fmtDate(d: string) {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function MemberRecordingsPage() {
    const { events, isLoading } = useEvents();
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [typeFilter, setTypeFilter] = useState<string>("All");

    const recordings = useMemo(() => {
        return events.filter(e => e.recordingUrl);
    }, [events]);

    const types = useMemo(() => {
        const set = new Set(recordings.map(r => eventTypeLabel(r.type)));
        return ["All", ...Array.from(set).sort()];
    }, [recordings]);

    const filtered = useMemo(() => {
        return recordings.filter(r => {
            if (typeFilter !== "All" && eventTypeLabel(r.type) !== typeFilter) return false;
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return r.title.toLowerCase().includes(q) || r.host.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q);
        });
    }, [recordings, searchQuery, typeFilter]);

    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-stone-900">Recordings</h1>
                <p className="text-stone-500 mt-1">Watch past sessions and workshops at your own pace.</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input type="text" placeholder="Search recordings..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
                </div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none">
                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
                    <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"}`}><LayoutGrid size={18} /></button>
                    <button onClick={() => setViewMode("list")} className={`p-2.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"}`}><ListIcon size={18} /></button>
                </div>
            </div>

            {!isLoading && <p className="text-sm text-stone-500 font-medium">{filtered.length} recording{filtered.length !== 1 ? "s" : ""}</p>}

            {isLoading && <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-brand-500" size={28} /></div>}

            {/* Grid View */}
            {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(rec => (
                        <a key={rec.id} href={rec.recordingUrl!} target="_blank" rel="noopener noreferrer" className="group cursor-pointer">
                            <div className="aspect-video bg-stone-800 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-stone-700 transition-colors overflow-hidden relative">
                                <div className="w-14 h-14 bg-stone-700 group-hover:bg-stone-600 rounded-xl flex items-center justify-center transition-colors">
                                    <Video size={28} className="text-stone-400" />
                                </div>
                                <div className="absolute inset-0 bg-brand-800/0 group-hover:bg-brand-800/20 transition-colors flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white/0 group-hover:bg-white/90 rounded-full flex items-center justify-center transition-all scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100">
                                        <Play size={28} className="text-brand-800 ml-1" />
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs font-mono rounded-md">
                                    {fmtDuration(rec.durationMinutes)}
                                </div>
                            </div>
                            <h3 className="font-bold text-stone-900 mb-1 line-clamp-2 group-hover:text-brand-700 transition-colors">{rec.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-stone-400">
                                <span className="flex items-center gap-1"><Calendar size={12} /> {fmtDate(rec.scheduledAt)}</span>
                                <span>{rec.host}</span>
                                <span className="px-2 py-0.5 bg-stone-100 rounded-full text-stone-500 font-medium">{eventTypeLabel(rec.type)}</span>
                            </div>
                        </a>
                    ))}
                </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
                <div className="space-y-3">
                    {filtered.map(rec => (
                        <a key={rec.id} href={rec.recordingUrl!} target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-4 hover:border-brand-200 hover:shadow-md transition-all group">
                            <div className="w-16 h-12 bg-stone-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-stone-700 transition-colors">
                                <Play size={18} className="text-stone-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-stone-900 group-hover:text-brand-700 transition-colors">{rec.title}</h3>
                                <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {fmtDate(rec.scheduledAt)}</span>
                                    <span className="flex items-center gap-1"><Clock size={12} /> {fmtDuration(rec.durationMinutes)}</span>
                                    <span>{rec.host}</span>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-500">{eventTypeLabel(rec.type)}</span>
                            <ExternalLink size={16} className="text-stone-300 group-hover:text-brand-500" />
                        </a>
                    ))}
                </div>
            )}

            {!isLoading && filtered.length === 0 && (
                <EmptyState icon={Video} heading="No recordings found" description={searchQuery || typeFilter !== "All" ? "Try adjusting your filters." : "Recordings will appear here after sessions are completed."} variant="plain" />
            )}
        </div>
        </ErrorBoundary>
    );
}
