"use client";

import { useState, useMemo, useCallback } from "react";
import { Calendar, Clock, Users, X, Check, UserCheck, Video, Copy, ExternalLink, Link2, ArrowLeft, Download, Play, Search, Mail } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";

/* ── Types ── */
type Platform = "zoom" | "google-meet" | "other";

interface RsvpEntry {
    id: number;
    name: string;
    email: string;
    avatar: string;
    cohort: string;
    rsvpDate: string;
    status: "Going" | "Maybe" | "Declined";
    attended?: boolean;
}

interface EventDetail {
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
    status: "upcoming" | "past";
    recordingUrl?: string;
}

/* ── Mock Data ── */
const MOCK_EVENT: EventDetail = {
    id: 1,
    title: "Weekly Office Hours",
    description: "Open Q&A session — bring your career questions, technical blockers, or just come hang out. This is a safe space for all cohort members to discuss challenges and share wins.",
    date: "2025-10-25",
    time: "16:00",
    duration: "1 hr",
    type: "Q&A",
    host: "Alisha Reid",
    platform: "zoom",
    meetingLink: "https://zoom.us/j/123456789",
    attendees: 42,
    status: "upcoming",
    recordingUrl: "",
};

const MOCK_RSVPS: RsvpEntry[] = [
    { id: 1, name: "Amara Okafor", email: "amara.okafor@example.com", avatar: "https://i.pravatar.cc/150?u=10", cohort: "Alpha", rsvpDate: "2025-10-20", status: "Going", attended: true },
    { id: 2, name: "Brianna Sterling", email: "brianna.sterling@example.com", avatar: "https://i.pravatar.cc/150?u=11", cohort: "Alpha", rsvpDate: "2025-10-20", status: "Going", attended: true },
    { id: 3, name: "Chiamaka Nnadi", email: "chiamaka.nnadi@example.com", avatar: "https://i.pravatar.cc/150?u=12", cohort: "Beta", rsvpDate: "2025-10-21", status: "Going", attended: false },
    { id: 4, name: "Danielle Robinson", email: "danielle.robinson@example.com", avatar: "https://i.pravatar.cc/150?u=13", cohort: "Alpha", rsvpDate: "2025-10-21", status: "Maybe" },
    { id: 5, name: "Efe Omoregie", email: "efe.omoregie@example.com", avatar: "https://i.pravatar.cc/150?u=14", cohort: "Gamma", rsvpDate: "2025-10-22", status: "Going", attended: true },
    { id: 6, name: "Fatima Diop", email: "fatima.diop@example.com", avatar: "https://i.pravatar.cc/150?u=15", cohort: "Beta", rsvpDate: "2025-10-22", status: "Declined" },
    { id: 7, name: "Gabrielle Union", email: "gabrielle.union@example.com", avatar: "https://i.pravatar.cc/150?u=16", cohort: "Alpha", rsvpDate: "2025-10-22", status: "Going", attended: true },
    { id: 8, name: "Halan Fenty", email: "halan.fenty@example.com", avatar: "https://i.pravatar.cc/150?u=17", cohort: "Beta", rsvpDate: "2025-10-23", status: "Going", attended: false },
    { id: 9, name: "Imani Lewis", email: "imani.lewis@example.com", avatar: "https://i.pravatar.cc/150?u=18", cohort: "Alpha", rsvpDate: "2025-10-23", status: "Going", attended: true },
    { id: 10, name: "Jasmine Carter", email: "jasmine.carter@example.com", avatar: "https://i.pravatar.cc/150?u=19", cohort: "Gamma", rsvpDate: "2025-10-23", status: "Maybe" },
    { id: 11, name: "Keisha Williams", email: "keisha.williams@example.com", avatar: "https://i.pravatar.cc/150?u=20", cohort: "Alpha", rsvpDate: "2025-10-24", status: "Going" },
    { id: 12, name: "Laila Ali", email: "laila.ali@example.com", avatar: "https://i.pravatar.cc/150?u=21", cohort: "Beta", rsvpDate: "2025-10-24", status: "Going" },
];

const PLATFORMS: Record<Platform, { label: string; color: string }> = {
    zoom: { label: "Zoom", color: "bg-blue-50 text-blue-700 border-blue-200" },
    "google-meet": { label: "Google Meet", color: "bg-green-50 text-green-700 border-green-200" },
    other: { label: "Other", color: "bg-stone-50 text-stone-600 border-stone-200" },
};

function fmtDate(d: string) {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
function fmtTime(t: string) {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm} EST`;
}
function fmtShortDate(d: string) {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AdminEventDetailPage() {
    const [event, setEvent] = useState<EventDetail>(MOCK_EVENT);
    const [rsvps, setRsvps] = useState<RsvpEntry[]>(MOCK_RSVPS);
    const [rsvpFilter, setRsvpFilter] = useState<"All" | "Going" | "Maybe" | "Declined">("All");
    const [rsvpSearch, setRsvpSearch] = useState("");
    const [copied, setCopied] = useState(false);
    const [recordingInput, setRecordingInput] = useState(event.recordingUrl || "");
    const [recordingSaved, setRecordingSaved] = useState(false);

    const filteredRsvps = useMemo(() => {
        return rsvps.filter(r => {
            const matchesFilter = rsvpFilter === "All" || r.status === rsvpFilter;
            const matchesSearch = r.name.toLowerCase().includes(rsvpSearch.toLowerCase()) ||
                r.email.toLowerCase().includes(rsvpSearch.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [rsvps, rsvpFilter, rsvpSearch]);

    const stats = useMemo(() => ({
        going: rsvps.filter(r => r.status === "Going").length,
        maybe: rsvps.filter(r => r.status === "Maybe").length,
        declined: rsvps.filter(r => r.status === "Declined").length,
        attended: rsvps.filter(r => r.attended).length,
    }), [rsvps]);

    const copyLink = useCallback(() => {
        navigator.clipboard.writeText(event.meetingLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [event.meetingLink]);

    const saveRecording = () => {
        setEvent(prev => ({ ...prev, recordingUrl: recordingInput.trim() }));
        setRecordingSaved(true);
        setTimeout(() => setRecordingSaved(false), 2000);
    };

    const toggleAttendance = (id: number) => {
        setRsvps(prev => prev.map(r => r.id === id ? { ...r, attended: !r.attended } : r));
    };

    const platform = PLATFORMS[event.platform];

    return (
        <ErrorBoundary>
            <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8">
                {/* Back Link */}
                <Link href="/admin/events" className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-brand-700 transition-colors">
                    <ArrowLeft size={16} /> Back to Events
                </Link>

                {/* Event Header */}
                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="p-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Date Badge */}
                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-2xl">
                                <span className="text-xs font-bold uppercase tracking-wider text-brand-200">{new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}</span>
                                <span className="text-4xl font-bold">{new Date(event.date + "T00:00:00").getDate()}</span>
                            </div>

                            {/* Event Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <StatusBadge label={event.type} preset={event.type as any} variant="tag" />
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${platform.color}`}>{platform.label}</span>
                                    {event.status === "past" && <StatusBadge label="Past" preset="Inactive" variant="tag" />}
                                </div>
                                <h1 className="text-3xl font-bold text-stone-900 mb-2">{event.title}</h1>
                                <p className="text-stone-600 mb-4 leading-relaxed max-w-2xl">{event.description}</p>

                                <div className="flex flex-wrap gap-6 text-sm text-stone-500">
                                    <span className="flex items-center gap-2"><Calendar size={16} className="text-stone-400" /> {fmtDate(event.date)}</span>
                                    <span className="flex items-center gap-2"><Clock size={16} className="text-stone-400" /> {fmtTime(event.time)}</span>
                                    <span className="flex items-center gap-2"><Video size={16} className="text-stone-400" /> {event.duration}</span>
                                    <span className="flex items-center gap-2"><Users size={16} className="text-stone-400" /> {stats.going} Going</span>
                                    <span>Host: <strong className="text-stone-700">{event.host}</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meeting Link Bar */}
                    {event.meetingLink && (
                        <div className="flex items-center gap-3 bg-stone-50 px-8 py-4 border-t border-stone-100">
                            <Link2 size={16} className="text-stone-400 flex-shrink-0" />
                            <span className="text-sm text-stone-600 truncate flex-1 font-mono">{event.meetingLink}</span>
                            <button onClick={copyLink} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied ? "bg-green-100 text-green-700" : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"}`}>
                                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                            </button>
                            <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-brand-800 text-white hover:bg-brand-700 transition-colors">
                                <ExternalLink size={14} /> Join
                            </a>
                        </div>
                    )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-stone-100 p-5">
                        <p className="text-sm text-stone-500 font-medium">Total RSVPs</p>
                        <p className="text-3xl font-bold text-stone-900 mt-1">{rsvps.length}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-green-100 p-5">
                        <p className="text-sm text-green-600 font-medium">Going</p>
                        <p className="text-3xl font-bold text-green-700 mt-1">{stats.going}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-amber-100 p-5">
                        <p className="text-sm text-amber-600 font-medium">Maybe</p>
                        <p className="text-3xl font-bold text-amber-700 mt-1">{stats.maybe}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-stone-100 p-5">
                        <p className="text-sm text-stone-500 font-medium">Attended</p>
                        <p className="text-3xl font-bold text-brand-700 mt-1">{stats.attended}</p>
                    </div>
                </div>

                {/* Recording Attachment Section */}
                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><Video size={20} /></div>
                        <div>
                            <h2 className="text-lg font-bold text-stone-900">Session Recording</h2>
                            <p className="text-sm text-stone-500">Attach a YouTube or video URL for this event&apos;s recording.</p>
                        </div>
                    </div>

                    {event.recordingUrl ? (
                        <div className="flex items-center gap-4 bg-stone-50 rounded-xl border border-stone-100 p-4">
                            <div className="w-24 h-16 bg-stone-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Play size={20} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-mono text-stone-600 truncate">{event.recordingUrl}</p>
                                <p className="text-xs text-green-600 font-semibold mt-1">Recording attached</p>
                            </div>
                            <a href={event.recordingUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm flex items-center gap-2">
                                <Play size={14} /> Watch
                            </a>
                            <button onClick={() => { setEvent(prev => ({ ...prev, recordingUrl: "" })); setRecordingInput(""); }} className="px-3 py-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                <input
                                    type="url"
                                    value={recordingInput}
                                    onChange={(e) => setRecordingInput(e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 font-mono"
                                />
                            </div>
                            <button
                                onClick={saveRecording}
                                disabled={!recordingInput.trim()}
                                className="px-5 py-3 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {recordingSaved ? <><Check size={16} /> Saved!</> : <>Attach Recording</>}
                            </button>
                        </div>
                    )}
                </div>

                {/* RSVP Table Section */}
                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-stone-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-50 text-brand-700 rounded-xl"><UserCheck size={20} /></div>
                                <div>
                                    <h2 className="text-lg font-bold text-stone-900">RSVP List</h2>
                                    <p className="text-sm text-stone-500">{filteredRsvps.length} of {rsvps.length} members shown</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="px-4 py-2 bg-stone-100 text-stone-600 font-bold rounded-xl text-sm hover:bg-stone-200 transition-colors flex items-center gap-2">
                                    <Download size={14} /> Export CSV
                                </button>
                                <button className="px-4 py-2 bg-brand-50 text-brand-700 font-bold rounded-xl text-sm hover:bg-brand-100 transition-colors flex items-center gap-2">
                                    <Mail size={14} /> Email All
                                </button>
                            </div>
                        </div>

                        {/* RSVP Toolbar */}
                        <div className="flex flex-col md:flex-row gap-3 mt-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search RSVPs..."
                                    className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                    value={rsvpSearch}
                                    onChange={(e) => setRsvpSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                {(["All", "Going", "Maybe", "Declined"] as const).map(f => (
                                    <button key={f} onClick={() => setRsvpFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${rsvpFilter === f ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
                                        {f} {f !== "All" && <span className="ml-1 opacity-60">({rsvps.filter(r => r.status === f).length})</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RSVP Table */}
                    {filteredRsvps.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-stone-500">
                                <thead className="text-xs text-stone-400 uppercase bg-stone-50 border-b border-stone-100">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Member</th>
                                        <th className="px-6 py-4 font-bold">Cohort</th>
                                        <th className="px-6 py-4 font-bold">RSVP Status</th>
                                        <th className="px-6 py-4 font-bold">RSVP Date</th>
                                        <th className="px-6 py-4 font-bold">Attended</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRsvps.map(rsvp => (
                                        <tr key={rsvp.id} className="bg-white border-b border-stone-100 hover:bg-stone-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <AvatarInitials name={rsvp.name} src={rsvp.avatar} size="md" />
                                                    <div>
                                                        <div className="font-bold text-stone-900">{rsvp.name}</div>
                                                        <div className="text-xs text-stone-500">{rsvp.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-800">
                                                    {rsvp.cohort}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                                    rsvp.status === "Going" ? "bg-green-50 text-green-700 border-green-200" :
                                                    rsvp.status === "Maybe" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                    "bg-stone-50 text-stone-500 border-stone-200"
                                                }`}>
                                                    {rsvp.status === "Going" && <Check size={12} />}
                                                    {rsvp.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-stone-500 font-medium">
                                                {fmtShortDate(rsvp.rsvpDate)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleAttendance(rsvp.id)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                                                        rsvp.attended
                                                            ? "bg-green-100 border-green-200 text-green-700"
                                                            : "bg-white border-stone-200 text-stone-300 hover:border-green-300 hover:text-green-500"
                                                    }`}
                                                >
                                                    <Check size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8">
                            <EmptyState
                                icon={Users}
                                heading="No RSVPs match"
                                description="Try adjusting your search or filter."
                            />
                        </div>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
}
