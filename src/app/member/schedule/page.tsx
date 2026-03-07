"use client";

import { useState, useMemo, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import {
    Calendar, CalendarDays, Clock, Users, List, Check, UserCheck,
    Video, Copy, ExternalLink, MapPin, Filter, Search, CheckCircle,
    Circle,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Platform = "zoom" | "google-meet" | "other";

interface EventItem {
    id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    duration: string;
    type: string;
    host: string;
    platform: Platform;
    meetingLink: string;
    attendees: number;
    rsvped: boolean;
    status: "upcoming" | "past";
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtDate(d: string) {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
function fmtDay(d: string) {
    return new Date(d + "T00:00:00").getDate();
}
function fmtMonth(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short" }).toUpperCase();
}
function fmtTime(t: string) {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm} EST`;
}

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

/* ------------------------------------------------------------------ */
/*  Mock Data (mirrors admin events – read-only for members)           */
/* ------------------------------------------------------------------ */

const INITIAL_EVENTS: EventItem[] = [
    { id: 1, title: "Weekly Office Hours", description: "Open Q&A session — bring your career questions, technical blockers, or just come hang out.", date: "2026-02-24", time: "16:00", duration: "1 hr", type: "Q&A", host: "Alisha Reid", platform: "zoom", meetingLink: "https://zoom.us/j/123456789", attendees: 42, rsvped: true, status: "upcoming" },
    { id: 2, title: "Product Strategy Workshop", description: "Hands-on session covering product roadmaps, user research synthesis, and stakeholder management.", date: "2026-02-25", time: "14:00", duration: "1.5 hrs", type: "Workshop", host: "Sarah Jenkins", platform: "google-meet", meetingLink: "https://meet.google.com/abc-defg-hij", attendees: 67, rsvped: false, status: "upcoming" },
    { id: 3, title: "Guest Speaker: Product at Uber", description: "Amanda shares her journey from IC to leading product for Uber Eats global expansion.", date: "2026-02-26", time: "13:00", duration: "1 hr", type: "Speaker Series", host: "Amanda Jones", platform: "zoom", meetingLink: "https://zoom.us/j/987654321", attendees: 120, rsvped: true, status: "upcoming" },
    { id: 4, title: "Resume Review Circle", description: "Small-group resume reviews with live feedback from hiring managers.", date: "2026-02-20", time: "11:00", duration: "45 min", type: "Workshop", host: "Keisha M.", platform: "google-meet", meetingLink: "https://meet.google.com/xyz-abcd-efg", attendees: 35, rsvped: true, status: "past" },
    { id: 5, title: "Networking Happy Hour", description: "Casual mixer — speed networking rounds followed by open conversation.", date: "2026-03-02", time: "18:00", duration: "1.5 hrs", type: "Social", host: "Community Team", platform: "zoom", meetingLink: "https://zoom.us/j/111222333", attendees: 55, rsvped: false, status: "upcoming" },
    { id: 6, title: "Hackathon Kick-off", description: "48-hour hackathon begins! Form teams, pick challenges, and start building.", date: "2026-03-08", time: "10:00", duration: "2 hrs", type: "Hackathon", host: "BGG Engineering", platform: "zoom", meetingLink: "https://zoom.us/j/444555666", attendees: 80, rsvped: false, status: "upcoming" },
];

const EVENT_TYPES = ["Workshop", "Q&A", "Speaker Series", "Social", "Hackathon"];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

type View = "all" | "my-events" | "calendar";

export default function MemberSchedulePage() {
    const { user } = useUser();
    const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
    const [view, setView] = useState<View>("all");
    const [filterType, setFilterType] = useState("All");
    const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "past">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [copied, setCopied] = useState<number | null>(null);
    const [detailEvent, setDetailEvent] = useState<EventItem | null>(null);

    /* RSVP toggle */
    const toggleRsvp = useCallback((id: number) => {
        setEvents(prev => prev.map(e => {
            if (e.id !== id) return e;
            return { ...e, rsvped: !e.rsvped, attendees: e.rsvped ? e.attendees - 1 : e.attendees + 1 };
        }));
    }, []);

    /* Copy meeting link */
    const copyLink = useCallback((id: number, link: string) => {
        navigator.clipboard.writeText(link);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    }, []);

    /* Filtered events */
    const filtered = useMemo(() => {
        let list = events;
        if (view === "my-events") list = list.filter(e => e.rsvped);
        if (filterType !== "All") list = list.filter(e => e.type === filterType);
        if (filterStatus !== "all") list = list.filter(e => e.status === filterStatus);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(e => e.title.toLowerCase().includes(q) || e.host.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
        }
        return list.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
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
    const myCount = events.filter(e => e.rsvped).length;
    const upcomingCount = events.filter(e => e.status === "upcoming").length;

    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-stone-900">My Schedule</h1>
                <p className="text-stone-500 mt-1">{upcomingCount} upcoming events &middot; {myCount} RSVP&apos;d</p>
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

            {/* Calendar View */}
            {view === "calendar" && (
                <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6">
                    <h3 className="font-bold text-stone-900 mb-4">{new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} className="text-[10px] font-bold text-stone-400 uppercase tracking-wider py-2">{d}</div>)}
                        {calDays.map((day, i) => {
                            const dateStr = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
                            const dayEvents = events.filter(e => e.date === dateStr);
                            const isToday = day === now.getDate() && month === now.getMonth();
                            return (
                                <div key={i} className={`min-h-[80px] border border-stone-50 rounded-xl p-1 ${day ? "bg-stone-50/50" : ""} ${isToday ? "ring-2 ring-brand-300 bg-brand-50/30" : ""}`}>
                                    {day && <span className="text-xs font-bold text-stone-500">{day}</span>}
                                    {dayEvents.map(ev => (
                                        <button key={ev.id} onClick={() => setDetailEvent(ev)} className={`block w-full text-left text-[10px] font-bold rounded px-1 py-0.5 mt-0.5 truncate transition-colors ${ev.rsvped ? "text-brand-700 bg-brand-100 hover:bg-brand-200" : "text-stone-600 bg-stone-100 hover:bg-stone-200"}`}>
                                            {ev.rsvped && <span className="inline-block w-1.5 h-1.5 bg-accent-500 rounded-full mr-0.5 -translate-y-px" />}{ev.title}
                                        </button>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-xs text-stone-500">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-brand-100 border border-brand-200" /> RSVP&apos;d</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-stone-100 border border-stone-200" /> Not RSVP&apos;d</span>
                    </div>
                </div>
            )}

            {/* List View */}
            {view !== "calendar" && (
                <div className="space-y-4">
                    {filtered.map(ev => (
                        <div key={ev.id} className="bg-white rounded-2xl border border-stone-200 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all group overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                {/* Date badge */}
                                <div className={`flex-shrink-0 w-full md:w-24 flex md:flex-col items-center justify-center gap-1 p-4 ${ev.status === "past" ? "bg-stone-100" : ev.rsvped ? "bg-brand-50" : "bg-stone-50"}`}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{fmtMonth(ev.date)}</span>
                                    <span className={`text-3xl font-bold ${ev.status === "past" ? "text-stone-400" : "text-stone-900"}`}>{fmtDay(ev.date)}</span>
                                    {ev.rsvped && ev.status === "upcoming" && <span className="text-[10px] font-bold text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full border border-accent-100">GOING</span>}
                                    {ev.status === "past" && <span className="text-[10px] font-bold text-stone-400 uppercase">Past</span>}
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-5 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${TYPE_COLOR[ev.type] || "bg-stone-100 text-stone-600 border-stone-200"}`}>{ev.type}</span>
                                        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${PLATFORM_META[ev.platform].color}`}>{PLATFORM_META[ev.platform].label}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-stone-900 group-hover:text-brand-700 transition-colors mb-1 cursor-pointer" onClick={() => setDetailEvent(ev)}>{ev.title}</h3>
                                    <p className="text-sm text-stone-500 line-clamp-1 mb-3">{ev.description}</p>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
                                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-stone-400" /> {fmtTime(ev.time)} &middot; {ev.duration}</span>
                                        <span className="flex items-center gap-1.5"><Users size={14} className="text-stone-400" /> {ev.attendees} attendees</span>
                                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-stone-400" /> {ev.host}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0 flex flex-row md:flex-col items-center gap-2 p-4 border-t md:border-t-0 md:border-l border-stone-100">
                                    {ev.status === "upcoming" ? (
                                        <>
                                            <button onClick={() => toggleRsvp(ev.id)} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 w-full justify-center ${ev.rsvped ? "bg-accent-500 text-white hover:bg-accent-600" : "bg-white border-2 border-stone-200 text-stone-700 hover:border-brand-300 hover:text-brand-700"}`}>
                                                {ev.rsvped ? <><CheckCircle size={16} /> RSVP&apos;d</> : <><UserCheck size={16} /> RSVP</>}
                                            </button>
                                            {ev.rsvped && (
                                                <div className="flex gap-2 w-full">
                                                    <a href={ev.meetingLink} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-800 text-white rounded-xl font-bold text-xs hover:bg-brand-700 transition-colors">
                                                        <Video size={14} /> Join
                                                    </a>
                                                    <button onClick={() => copyLink(ev.id, ev.meetingLink)} className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs border transition-colors ${copied === ev.id ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"}`}>
                                                        {copied === ev.id ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Link</>}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-xs font-bold text-stone-400 uppercase">Event ended</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <EmptyState
                            icon={Calendar}
                            heading={view === "my-events" ? "No RSVP'd events" : "No events found"}
                            description={view === "my-events" ? "RSVP to events to see them here." : "Try adjusting your filters."}
                        />
                    )}
                </div>
            )}

            {/* Event Detail Modal */}
            {detailEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailEvent(null)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className={`p-6 ${detailEvent.rsvped ? "bg-brand-50" : "bg-stone-50"} rounded-t-3xl border-b border-stone-100`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${TYPE_COLOR[detailEvent.type] || "bg-stone-100 text-stone-600 border-stone-200"}`}>{detailEvent.type}</span>
                                {detailEvent.rsvped && <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-accent-100 text-accent-700 border border-accent-200">RSVP&apos;d</span>}
                                {detailEvent.status === "past" && <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-stone-100 text-stone-500 border border-stone-200">Past</span>}
                            </div>
                            <h2 className="text-2xl font-bold text-stone-900">{detailEvent.title}</h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <p className="text-stone-600 leading-relaxed">{detailEvent.description}</p>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-stone-50 rounded-xl p-3">
                                    <p className="text-xs text-stone-400 font-bold uppercase mb-1">Date</p>
                                    <p className="font-semibold text-stone-900">{fmtDate(detailEvent.date)}</p>
                                </div>
                                <div className="bg-stone-50 rounded-xl p-3">
                                    <p className="text-xs text-stone-400 font-bold uppercase mb-1">Time</p>
                                    <p className="font-semibold text-stone-900">{fmtTime(detailEvent.time)}</p>
                                </div>
                                <div className="bg-stone-50 rounded-xl p-3">
                                    <p className="text-xs text-stone-400 font-bold uppercase mb-1">Duration</p>
                                    <p className="font-semibold text-stone-900">{detailEvent.duration}</p>
                                </div>
                                <div className="bg-stone-50 rounded-xl p-3">
                                    <p className="text-xs text-stone-400 font-bold uppercase mb-1">Attendees</p>
                                    <p className="font-semibold text-stone-900">{detailEvent.attendees}</p>
                                </div>
                            </div>

                            <div className="bg-stone-50 rounded-xl p-3">
                                <p className="text-xs text-stone-400 font-bold uppercase mb-1">Host</p>
                                <p className="font-semibold text-stone-900">{detailEvent.host}</p>
                            </div>

                            {/* Meeting Link */}
                            <div className={`rounded-xl p-4 border ${PLATFORM_META[detailEvent.platform].color}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase mb-1 opacity-70">Meeting Link</p>
                                        <p className="font-bold">{PLATFORM_META[detailEvent.platform].label}</p>
                                    </div>
                                    {detailEvent.rsvped && (
                                        <div className="flex gap-2">
                                            <a href={detailEvent.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors">
                                                <Video size={16} /> Join
                                            </a>
                                            <button onClick={() => copyLink(detailEvent.id, detailEvent.meetingLink)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm border transition-colors ${copied === detailEvent.id ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"}`}>
                                                {copied === detailEvent.id ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {!detailEvent.rsvped && <p className="text-xs mt-2 opacity-70">RSVP to access the meeting link.</p>}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                {detailEvent.status === "upcoming" && (
                                    <button onClick={() => { toggleRsvp(detailEvent.id); setDetailEvent({ ...detailEvent, rsvped: !detailEvent.rsvped, attendees: detailEvent.rsvped ? detailEvent.attendees - 1 : detailEvent.attendees + 1 }); }} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${detailEvent.rsvped ? "bg-accent-500 text-white hover:bg-accent-600" : "bg-brand-800 text-white hover:bg-brand-700"}`}>
                                        {detailEvent.rsvped ? <><CheckCircle size={16} /> RSVP&apos;d</> : <><UserCheck size={16} /> RSVP Now</>}
                                    </button>
                                )}
                                <button onClick={() => setDetailEvent(null)} className="px-6 py-3 rounded-xl font-bold text-sm border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </ErrorBoundary>
    );
}
