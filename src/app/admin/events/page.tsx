"use client";

import { Calendar, Clock, Users, Plus, X, Pencil, Trash2, CalendarDays, List, Check, UserCheck, Video, Copy, ExternalLink, Link2 } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorBoundary } from "@/components/ui/error-boundary";

type Platform = "zoom" | "google-meet" | "other";

interface EventItem {
    id: number;
    title: string;
    description: string;
    date: string; // yyyy-mm-dd
    time: string;
    duration: string; // e.g. "30 min", "1 hr"
    type: string;
    host: string;
    platform: Platform;
    meetingLink: string;
    attendees: number;
    rsvps: string[];
    status: "upcoming" | "past";
}

const INITIAL_EVENTS: EventItem[] = [
    { id: 1, title: "Weekly Office Hours", description: "Open Q&A session — bring your career questions, technical blockers, or just come hang out.", date: "2025-10-25", time: "16:00", duration: "1 hr", type: "Q&A", host: "Alisha Reid", platform: "zoom", meetingLink: "https://zoom.us/j/123456789", attendees: 42, rsvps: ["You"], status: "upcoming" },
    { id: 2, title: "Product Strategy Workshop", description: "Hands-on session covering product roadmaps, user research synthesis, and stakeholder management.", date: "2025-10-26", time: "14:00", duration: "1.5 hrs", type: "Workshop", host: "Sarah Jenkins", platform: "google-meet", meetingLink: "https://meet.google.com/abc-defg-hij", attendees: 67, rsvps: [], status: "upcoming" },
    { id: 3, title: "Guest Speaker: Product at Uber", description: "Amanda shares her journey from IC to leading product for Uber Eats global expansion.", date: "2025-10-28", time: "13:00", duration: "1 hr", type: "Speaker Series", host: "Amanda Jones", platform: "zoom", meetingLink: "https://zoom.us/j/987654321", attendees: 120, rsvps: ["You"], status: "upcoming" },
    { id: 4, title: "Resume Review Circle", description: "Small-group resume reviews with live feedback from hiring managers.", date: "2025-10-20", time: "11:00", duration: "45 min", type: "Workshop", host: "Keisha M.", platform: "google-meet", meetingLink: "https://meet.google.com/xyz-abcd-efg", attendees: 35, rsvps: [], status: "past" },
    { id: 5, title: "Networking Happy Hour", description: "Casual mixer — speed networking rounds followed by open conversation.", date: "2025-11-02", time: "18:00", duration: "1.5 hrs", type: "Social", host: "Community Team", platform: "zoom", meetingLink: "https://zoom.us/j/111222333", attendees: 55, rsvps: [], status: "upcoming" },
];

const EVENT_TYPES = ["Workshop", "Q&A", "Speaker Series", "Social", "Hackathon"];
const DURATIONS = ["30 min", "45 min", "1 hr", "1.5 hrs", "2 hrs", "3 hrs"];
const PLATFORMS: { key: Platform; label: string; color: string }[] = [
    { key: "zoom", label: "Zoom", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { key: "google-meet", label: "Google Meet", color: "bg-green-50 text-green-700 border-green-200" },
    { key: "other", label: "Other", color: "bg-stone-50 text-stone-600 border-stone-200" },
];

function fmtDate(d: string) {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function fmtTime(t: string) {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm} EST`;
}
function platformLabel(p: Platform) {
    return PLATFORMS.find(x => x.key === p)?.label ?? "Other";
}
function platformBadge(p: Platform) {
    return PLATFORMS.find(x => x.key === p)?.color ?? "bg-stone-50 text-stone-600 border-stone-200";
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
    const [view, setView] = useState<"list" | "calendar">("list");
    const [modal, setModal] = useState<null | "create" | EventItem>(null);
    const [detailEvent, setDetailEvent] = useState<EventItem | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [filterType, setFilterType] = useState("All");
    const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "past">("all");
    const [copied, setCopied] = useState<number | null>(null);
    let nextId = events.length ? Math.max(...events.map(e => e.id)) + 1 : 1;

    const filtered = useMemo(() => {
        return events.filter(e => {
            if (filterType !== "All" && e.type !== filterType) return false;
            if (filterStatus !== "all" && e.status !== filterStatus) return false;
            return true;
        }).sort((a, b) => a.date.localeCompare(b.date));
    }, [events, filterType, filterStatus]);

    const handleSave = (ev: Omit<EventItem, "id" | "rsvps" | "attendees" | "status">) => {
        if (modal && typeof modal === "object" && "id" in modal) {
            setEvents(prev => prev.map(e => e.id === modal.id ? { ...e, ...ev } : e));
        } else {
            setEvents(prev => [...prev, { ...ev, id: nextId++, rsvps: [], attendees: 0, status: "upcoming" }]);
        }
        setModal(null);
    };

    const handleDelete = () => {
        if (deleteId !== null) setEvents(prev => prev.filter(e => e.id !== deleteId));
        setDeleteId(null);
    };

    const toggleRsvp = (id: number) => {
        setEvents(prev => prev.map(e => {
            if (e.id !== id) return e;
            const has = e.rsvps.includes("You");
            return { ...e, rsvps: has ? e.rsvps.filter(r => r !== "You") : [...e.rsvps, "You"], attendees: has ? e.attendees - 1 : e.attendees + 1 };
        }));
    };

    const copyLink = useCallback((id: number, link: string) => {
        navigator.clipboard.writeText(link);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    }, []);

    // Calendar helpers
    const calendarMonth = new Date();
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const calDays: (number | null)[] = [
        ...Array.from({ length: firstDay }, () => null as null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Events</h1>
                    <p className="text-stone-500 mt-1">Schedule and manage community events.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-stone-100 rounded-xl p-1">
                        <button onClick={() => setView("list")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${view === "list" ? "bg-white shadow text-stone-900" : "text-stone-500"}`}><List size={16} /> List</button>
                        <button onClick={() => setView("calendar")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${view === "calendar" ? "bg-white shadow text-stone-900" : "text-stone-500"}`}><CalendarDays size={16} /> Calendar</button>
                    </div>
                    <button onClick={() => setModal("create")} className="bg-brand-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-700 flex items-center gap-2 shadow-lg shadow-brand-800/10">
                        <Plus size={18} /> Create Event
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
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

            {/* Calendar View */}
            {view === "calendar" && (
                <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6">
                    <h3 className="font-bold text-stone-900 mb-4">{new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} className="text-[10px] font-bold text-stone-400 uppercase tracking-wider py-2">{d}</div>)}
                        {calDays.map((day, i) => {
                            const dateStr = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
                            const dayEvents = events.filter(e => e.date === dateStr);
                            return (
                                <div key={i} className={`min-h-[80px] border border-stone-50 rounded-xl p-1 ${day ? "bg-stone-50/50" : ""} ${day === new Date().getDate() && month === new Date().getMonth() ? "ring-2 ring-brand-300 bg-brand-50/30" : ""}`}>
                                    {day && <span className="text-xs font-bold text-stone-500">{day}</span>}
                                    {dayEvents.map(ev => (
                                        <button key={ev.id} onClick={() => setDetailEvent(ev)} className="block w-full text-left text-[10px] font-bold text-brand-700 bg-brand-50 rounded px-1 py-0.5 mt-0.5 truncate hover:bg-brand-100 transition-colors">{ev.title}</button>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* List View */}
            {view === "list" && (
                <div className="space-y-4">
                    {filtered.length === 0 && (
                        <EmptyState
                            icon={Calendar}
                            heading="No events match your filters"
                            description="Try adjusting your type or status filters."
                            variant="dashed"
                        />
                    )}
                    {filtered.map(event => (
                        <div key={event.id} className={`bg-white rounded-2xl border p-6 transition-all group ${event.status === "past" ? "border-stone-100 opacity-70" : "border-stone-200 hover:border-brand-300"}`}>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 bg-brand-50 rounded-2xl border border-brand-100 group-hover:bg-brand-100 transition-colors">
                                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600">{fmtDate(event.date).split(" ")[0]}</span>
                                    <span className="text-3xl font-bold text-brand-800">{fmtDate(event.date).split(" ")[1]}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <StatusBadge label={event.type} preset={event.type as any} variant="tag" />
                                                <StatusBadge label={platformLabel(event.platform)} preset={platformLabel(event.platform) as any} variant="tag" />
                                                {event.status === "past" && <StatusBadge label="Past" preset="Inactive" variant="tag" />}
                                            </div>
                                            <h3 className="text-xl font-bold text-stone-900 mb-1 group-hover:text-brand-700 transition-colors cursor-pointer" onClick={() => setDetailEvent(event)}>{event.title}</h3>
                                            {event.description && <p className="text-sm text-stone-500 mb-2 line-clamp-2">{event.description}</p>}
                                            <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                                                <span className="flex items-center gap-1.5"><Clock size={16} /> {fmtTime(event.time)}</span>
                                                <span className="flex items-center gap-1.5"><Video size={16} /> {event.duration}</span>
                                                <span className="flex items-center gap-1.5"><Users size={16} /> {event.attendees} Attending</span>
                                                <span className="flex items-center gap-1.5">Host: {event.host}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                            {event.status === "upcoming" && (
                                                <button onClick={() => toggleRsvp(event.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${event.rsvps.includes("You") ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-brand-50 text-brand-700 hover:bg-brand-100"}`}>
                                                    {event.rsvps.includes("You") ? <><Check size={14} /> RSVP&apos;d</> : <><UserCheck size={14} /> RSVP</>}
                                                </button>
                                            )}
                                            <button onClick={() => setModal(event)} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"><Pencil size={16} /></button>
                                            <button onClick={() => setDeleteId(event.id)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Meeting Link Bar */}
                            {event.meetingLink && (
                                <div className="mt-4 flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
                                    <Link2 size={16} className="text-stone-400 flex-shrink-0" />
                                    <span className="text-sm text-stone-600 truncate flex-1 font-mono">{event.meetingLink}</span>
                                    <button onClick={() => copyLink(event.id, event.meetingLink)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied === event.id ? "bg-green-100 text-green-700" : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"}`}>
                                        {copied === event.id ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                                    </button>
                                    <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-800 text-white hover:bg-brand-700 transition-colors">
                                        <ExternalLink size={14} /> Join
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create / Edit Modal */}
            {modal !== null && <EventFormModal initial={typeof modal === "object" ? modal : undefined} onClose={() => setModal(null)} onSave={handleSave} />}

            {/* Event Detail Modal */}
            {detailEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDetailEvent(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-stone-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-50 rounded-xl text-brand-700"><Calendar size={20} /></div>
                                <h2 className="text-lg font-bold text-stone-900">Event Details</h2>
                            </div>
                            <button onClick={() => setDetailEvent(null)} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <StatusBadge label={detailEvent.type} preset={detailEvent.type as any} variant="tag" />
                                <StatusBadge label={platformLabel(detailEvent.platform)} preset={platformLabel(detailEvent.platform) as any} variant="tag" />
                                {detailEvent.status === "past" && <StatusBadge label="Past" preset="Inactive" variant="tag" />}
                            </div>
                            <h3 className="text-2xl font-bold text-stone-900">{detailEvent.title}</h3>
                            {detailEvent.description && <p className="text-sm text-stone-600 leading-relaxed">{detailEvent.description}</p>}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-stone-500"><Calendar size={16} className="text-stone-400" /> {fmtDate(detailEvent.date)}</div>
                                <div className="flex items-center gap-2 text-stone-500"><Clock size={16} className="text-stone-400" /> {fmtTime(detailEvent.time)}</div>
                                <div className="flex items-center gap-2 text-stone-500"><Video size={16} className="text-stone-400" /> {detailEvent.duration}</div>
                                <div className="flex items-center gap-2 text-stone-500"><Users size={16} className="text-stone-400" /> {detailEvent.attendees} Attending</div>
                            </div>
                            <div className="text-sm text-stone-500">Host: <span className="font-semibold text-stone-700">{detailEvent.host}</span></div>
                            {detailEvent.meetingLink && (
                                <div className="flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
                                    <Link2 size={16} className="text-stone-400 flex-shrink-0" />
                                    <span className="text-sm text-stone-600 truncate flex-1 font-mono">{detailEvent.meetingLink}</span>
                                    <button onClick={() => copyLink(detailEvent.id, detailEvent.meetingLink)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied === detailEvent.id ? "bg-green-100 text-green-700" : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"}`}>
                                        {copied === detailEvent.id ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                                    </button>
                                    <a href={detailEvent.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-800 text-white hover:bg-brand-700 transition-colors">
                                        <ExternalLink size={14} /> Join
                                    </a>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 p-6 border-t border-stone-100 bg-stone-50">
                            <button onClick={() => { setDetailEvent(null); setModal(detailEvent); }} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors flex items-center justify-center gap-2"><Pencil size={16} /> Edit Event</button>
                            <button onClick={() => setDetailEvent(null)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-white transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            <ConfirmModal
                open={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Event?"
                description="This event will be permanently removed."
                icon={Trash2}
            />
        </div>
        </ErrorBoundary>
    );
}

/* ── Event Form Modal ── */
function EventFormModal({ initial, onClose, onSave }: { initial?: EventItem; onClose: () => void; onSave: (e: Omit<EventItem, "id" | "rsvps" | "attendees" | "status">) => void }) {
    const [title, setTitle] = useState(initial?.title ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [date, setDate] = useState(initial?.date ?? "");
    const [time, setTime] = useState(initial?.time ?? "");
    const [duration, setDuration] = useState(initial?.duration ?? "1 hr");
    const [type, setType] = useState(initial?.type ?? "Workshop");
    const [host, setHost] = useState(initial?.host ?? "");
    const [platform, setPlatform] = useState<Platform>(initial?.platform ?? "zoom");
    const [meetingLink, setMeetingLink] = useState(initial?.meetingLink ?? "");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = () => {
        const e: Record<string, string> = {};
        if (!title.trim()) e.title = "Required";
        if (!date) e.date = "Required";
        if (!time) e.time = "Required";
        if (!host.trim()) e.host = "Required";
        if (meetingLink && !/^https?:\/\/.+/i.test(meetingLink)) e.meetingLink = "Enter a valid URL (https://...)";
        setErrors(e);
        if (Object.keys(e).length === 0) onSave({ title: title.trim(), description: description.trim(), date, time, duration, type, host: host.trim(), platform, meetingLink: meetingLink.trim() });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-50 rounded-xl text-brand-700"><Calendar size={20} /></div>
                        <h2 className="text-lg font-bold text-stone-900">{initial ? "Edit Event" : "Create Event"}</h2>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Event Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Portfolio Review Session" className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.title ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Description <span className="text-stone-400 font-normal">(optional)</span></label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What will this event cover? Any prep needed?" rows={3} className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 resize-none" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1">Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.date ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1">Time</label>
                            <input type="time" value={time} onChange={e => setTime(e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.time ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                            {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1">Duration</label>
                            <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 bg-white">
                                {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Host</label>
                        <input type="text" value={host} onChange={e => setHost(e.target.value)} placeholder="e.g. Sarah Jenkins" className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.host ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                        {errors.host && <p className="text-red-500 text-xs mt-1">{errors.host}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Type</label>
                        <div className="flex gap-2 flex-wrap">
                            {EVENT_TYPES.map(t => (
                                <button key={t} type="button" onClick={() => setType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${type === t ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{t}</button>
                            ))}
                        </div>
                    </div>

                    {/* Platform & Meeting Link */}
                    <div className="border-t border-stone-100 pt-4 mt-4">
                        <label className="block text-sm font-semibold text-stone-700 mb-2">Meeting Platform</label>
                        <div className="flex gap-2 mb-3">
                            {PLATFORMS.map(p => (
                                <button key={p.key} type="button" onClick={() => setPlatform(p.key)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${platform === p.key ? `${p.color} ring-2 ring-offset-1 ring-brand-300` : "bg-white border-stone-200 text-stone-500 hover:bg-stone-50"}`}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Meeting Link <span className="text-stone-400 font-normal">(paste your Zoom or Google Meet link)</span></label>
                        <div className="relative">
                            <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                            <input type="url" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} placeholder="https://zoom.us/j/123456789" className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 font-mono ${errors.meetingLink ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                        </div>
                        {errors.meetingLink && <p className="text-red-500 text-xs mt-1">{errors.meetingLink}</p>}
                    </div>
                </div>
                <div className="flex gap-3 p-6 border-t border-stone-100 bg-stone-50">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-white transition-colors">Cancel</button>
                    <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-800 hover:bg-brand-700 transition-colors">{initial ? "Save Changes" : "Create Event"}</button>
                </div>
            </div>
        </div>
    );
}
