"use client";

import { useState, useMemo, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import {
    Calendar, CalendarDays, Clock, Users, List, Check, UserCheck,
    Video, Copy, ExternalLink, MapPin, Filter, Search, CheckCircle,
    Circle, Loader2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useEvents, useRsvpEvent, eventTypeLabel, fmtEventDay, fmtEventMonth, fmtEventDate, fmtEventTime, fmtDuration, isEventPast, detectPlatform } from "@/hooks/use-events";
import type { Event as ApiEvent } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

type Platform = "zoom" | "google-meet" | "other";

const PLATFORM_META: Record<Platform, { label: string; color: string; icon: typeof Video }> = {
    zoom: { label: "Zoom", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Video },
    "google-meet": { label: "Google Meet", color: "bg-green-50 text-green-700 border-green-200", icon: Video },
    other: { label: "Other", color: "bg-stone-50 text-stone-600 border-stone-200", icon: Video },
};

const TYPE_COLOR: Record<string, string> = {
    Workshop: "bg-brand-100 text-brand-700 border-brand-200",
    "Q&A": "bg-blue-100 text-blue-700 border-blue-200",
    "Speaker Series": "bg-emerald-100 text-emerald-700 border-emerald-200",
    Social: "bg-amber-100 text-amber-700 border-amber-200",
    Hackathon: "bg-purple-100 text-purple-700 border-purple-200",
};

const EVENT_TYPES = ["Workshop", "Q&A", "Speaker Series", "Social", "Hackathon"];

/* ------------------------------------------------------------------ */
/*  RSVP Button component                                             */
/* ------------------------------------------------------------------ */

function RsvpButton({ eventId, isRsvped, isPast, className }: { eventId: string; isRsvped: boolean; isPast: boolean; className?: string }) {
    const { trigger, isLoading } = useRsvpEvent(eventId);
    if (isPast) return <span className="text-xs font-bold text-stone-400 uppercase">Event ended</span>;
    return (
        <button
            onClick={(e) => { e.stopPropagation(); trigger(); }}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 justify-center ${isRsvped ? "bg-accent-500 text-white hover:bg-accent-600" : "bg-white border-2 border-stone-200 text-stone-700 hover:border-brand-300 hover:text-brand-700"} ${isLoading ? "opacity-50" : ""} ${className ?? ""}`}
        >
            {isRsvped ? <><CheckCircle size={16} /> RSVP&apos;d</> : <><UserCheck size={16} /> RSVP</>}
        </button>
    );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

type View = "all" | "my-events" | "calendar";

export default function MemberSchedulePage() {
    const { user } = useUser();
    const { events, isLoading, error } = useEvents();
    const [view, setView] = useState<View>("all");
    const [filterType, setFilterType] = useState("All");
    const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "past">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [copied, setCopied] = useState<string | null>(null);
    const [detailEvent, setDetailEvent] = useState<ApiEvent | null>(null);

    /* Copy meeting link */
    const copyLink = useCallback((id: string, link: string) => {
        navigator.clipboard.writeText(link);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    }, []);

    /* Filtered events */
    const filtered = useMemo(() => {
        let list = events;
        // Note: we don't have per-user RSVP status from the list endpoint,
        // so "my-events" filter is deferred until backend supports it.
        if (filterType !== "All") {
            list = list.filter(e => eventTypeLabel(e.type) === filterType);
        }
        if (filterStatus === "upcoming") list = list.filter(e => !isEventPast(e.scheduledAt, e.durationMinutes));
        if (filterStatus === "past") list = list.filter(e => isEventPast(e.scheduledAt, e.durationMinutes));
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(e =>
                e.title.toLowerCase().includes(q) ||
                e.host.toLowerCase().includes(q) ||
                (e.description ?? "").toLowerCase().includes(q)
            );
        }
        return [...list].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    }, [events, view, filterType, filterStatus, searchQuery]);

    /* Calendar helpers */
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const calDays: (number | null)[] = [
        ...Array.from({ length: firstDay }, () => null as null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    /* Stats */
    const upcomingCount = events.filter(e => !isEventPast(e.scheduledAt, e.durationMinutes)).length;

    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-stone-900">My Schedule</h1>
                <p className="text-stone-500 mt-1">{upcomingCount} upcoming events</p>
            </div>

            {/* Search + View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input type="text" placeholder="Search events, hosts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
                </div>
                <div className="flex bg-stone-100 p-1 rounded-xl self-start">
                    {([["all", "All Events", List], ["my-events", "My Events", UserCheck], ["calendar", "Calendar", CalendarDays]] as const).map(([key, label, Icon]) => (
                        <button key={key} onClick={() => setView(key as View)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === key ? "bg-white shadow-sm text-stone-900" : "text-stone-500 hover:text-stone-900"}`}>
                            <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters */}
            {view !== "calendar" && (
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Type:</span>
                        {["All", ...EVENT_TYPES].map(t => (
                            <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${filterType === t ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{t}</button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Status:</span>
                        {(["all", "upcoming", "past"] as const).map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${filterStatus === s ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{s}</button>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading */}
            {isLoading && events.length === 0 && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-brand-500" size={32} />
                </div>
            )}

            {/* Error */}
            {error && events.length === 0 && !isLoading && (
                <div className="text-center py-20">
                    <p className="text-stone-500">Unable to load events. Please try again later.</p>
                </div>
            )}

            {/* Calendar View */}
            {view === "calendar" && !isLoading && (
                <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6">
                    <h3 className="font-bold text-stone-900 mb-4">{new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} className="text-[10px] font-bold text-stone-400 uppercase tracking-wider py-2">{d}</div>)}
                        {calDays.map((day, i) => {
                            const dateStr = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
                            const dayEvents = events.filter(e => {
                                const d = new Date(e.scheduledAt);
                                return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
                            });
                            const isToday = day === now.getDate() && month === now.getMonth();
                            return (
                                <div key={i} className={`min-h-[80px] border border-stone-50 rounded-xl p-1 ${day ? "bg-stone-50/50" : ""} ${isToday ? "ring-2 ring-brand-300 bg-brand-50/30" : ""}`}>
                                    {day && <span className="text-xs font-bold text-stone-500">{day}</span>}
                                    {dayEvents.map(ev => (
                                        <button key={ev.id} onClick={() => setDetailEvent(ev)} className="block w-full text-left text-[10px] font-bold rounded px-1 py-0.5 mt-0.5 truncate transition-colors text-stone-600 bg-stone-100 hover:bg-stone-200">
                                            {ev.title}
                                        </button>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* List View */}
            {view !== "calendar" && !isLoading && (
                <div className="space-y-4">
                    {filtered.map(ev => {
                        const typeLabel = eventTypeLabel(ev.type);
                        const platform = detectPlatform(ev.meetingLink);
                        const past = isEventPast(ev.scheduledAt, ev.durationMinutes);
                        return (
                            <div key={ev.id} className="bg-white rounded-2xl border border-stone-200 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all group overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    {/* Date badge */}
                                    <div className={`flex-shrink-0 w-full md:w-24 flex md:flex-col items-center justify-center gap-1 p-4 ${past ? "bg-stone-100" : "bg-stone-50"}`}>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{fmtEventMonth(ev.scheduledAt)}</span>
                                        <span className={`text-3xl font-bold ${past ? "text-stone-400" : "text-stone-900"}`}>{fmtEventDay(ev.scheduledAt)}</span>
                                        {past && <span className="text-[10px] font-bold text-stone-400 uppercase">Past</span>}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-5 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${TYPE_COLOR[typeLabel] || "bg-stone-100 text-stone-600 border-stone-200"}`}>{typeLabel}</span>
                                            <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${PLATFORM_META[platform].color}`}>{PLATFORM_META[platform].label}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-stone-900 group-hover:text-brand-700 transition-colors mb-1 cursor-pointer" onClick={() => setDetailEvent(ev)}>{ev.title}</h3>
                                        {ev.description && <p className="text-sm text-stone-500 line-clamp-1 mb-3">{ev.description}</p>}
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
                                            <span className="flex items-center gap-1.5"><Clock size={14} className="text-stone-400" /> {fmtEventTime(ev.scheduledAt)} &middot; {fmtDuration(ev.durationMinutes)}</span>
                                            <span className="flex items-center gap-1.5"><Users size={14} className="text-stone-400" /> {ev._count.rsvps} attendees</span>
                                            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-stone-400" /> {ev.host}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex-shrink-0 flex flex-row md:flex-col items-center gap-2 p-4 border-t md:border-t-0 md:border-l border-stone-100">
                                        <RsvpButton eventId={ev.id} isRsvped={false} isPast={past} className="w-full" />
                                        {ev.meetingLink && !past && (
                                            <div className="flex gap-2 w-full">
                                                <a href={ev.meetingLink} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-800 text-white rounded-xl font-bold text-xs hover:bg-brand-700 transition-colors">
                                                    <Video size={14} /> Join
                                                </a>
                                                <button onClick={() => copyLink(ev.id, ev.meetingLink!)} className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs border transition-colors ${copied === ev.id ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"}`}>
                                                    {copied === ev.id ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Link</>}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {!isLoading && filtered.length === 0 && (
                        <EmptyState
                            icon={Calendar}
                            heading={view === "my-events" ? "No RSVP'd events" : "No events found"}
                            description={view === "my-events" ? "RSVP to events to see them here." : "Try adjusting your filters."}
                        />
                    )}
                </div>
            )}

            {/* Event Detail Modal */}
            {detailEvent && (() => {
                const typeLabel = eventTypeLabel(detailEvent.type);
                const platform = detectPlatform(detailEvent.meetingLink);
                const past = isEventPast(detailEvent.scheduledAt, detailEvent.durationMinutes);
                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailEvent(null)} />
                        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="p-6 bg-stone-50 rounded-t-3xl border-b border-stone-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${TYPE_COLOR[typeLabel] || "bg-stone-100 text-stone-600 border-stone-200"}`}>{typeLabel}</span>
                                    {past && <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-stone-100 text-stone-500 border border-stone-200">Past</span>}
                                </div>
                                <h2 className="text-2xl font-bold text-stone-900">{detailEvent.title}</h2>
                            </div>
                            <div className="p-6 space-y-5">
                                {detailEvent.description && <p className="text-stone-600 leading-relaxed">{detailEvent.description}</p>}

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-stone-50 rounded-xl p-3">
                                        <p className="text-xs text-stone-400 font-bold uppercase mb-1">Date</p>
                                        <p className="font-semibold text-stone-900">{fmtEventDate(detailEvent.scheduledAt)}</p>
                                    </div>
                                    <div className="bg-stone-50 rounded-xl p-3">
                                        <p className="text-xs text-stone-400 font-bold uppercase mb-1">Time</p>
                                        <p className="font-semibold text-stone-900">{fmtEventTime(detailEvent.scheduledAt)}</p>
                                    </div>
                                    <div className="bg-stone-50 rounded-xl p-3">
                                        <p className="text-xs text-stone-400 font-bold uppercase mb-1">Duration</p>
                                        <p className="font-semibold text-stone-900">{fmtDuration(detailEvent.durationMinutes)}</p>
                                    </div>
                                    <div className="bg-stone-50 rounded-xl p-3">
                                        <p className="text-xs text-stone-400 font-bold uppercase mb-1">Attendees</p>
                                        <p className="font-semibold text-stone-900">{detailEvent._count.rsvps}</p>
                                    </div>
                                </div>

                                <div className="bg-stone-50 rounded-xl p-3">
                                    <p className="text-xs text-stone-400 font-bold uppercase mb-1">Host</p>
                                    <p className="font-semibold text-stone-900">{detailEvent.host}</p>
                                </div>

                                {/* Meeting Link */}
                                {detailEvent.meetingLink && (
                                    <div className={`rounded-xl p-4 border ${PLATFORM_META[platform].color}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold uppercase mb-1 opacity-70">Meeting Link</p>
                                                <p className="font-bold">{PLATFORM_META[platform].label}</p>
                                            </div>
                                            {!past && (
                                                <div className="flex gap-2">
                                                    <a href={detailEvent.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors">
                                                        <Video size={16} /> Join
                                                    </a>
                                                    <button onClick={() => copyLink(detailEvent.id, detailEvent.meetingLink!)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm border transition-colors ${copied === detailEvent.id ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"}`}>
                                                        {copied === detailEvent.id ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Recording link */}
                                {detailEvent.recordingUrl && (
                                    <a href={detailEvent.recordingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand-700 font-bold hover:text-brand-800">
                                        <Video size={16} /> Watch Recording
                                    </a>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <RsvpButton eventId={detailEvent.id} isRsvped={false} isPast={past} className="flex-1 py-3" />
                                    <button onClick={() => setDetailEvent(null)} className="px-6 py-3 rounded-xl font-bold text-sm border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
        </ErrorBoundary>
    );
}
