"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { Calendar, Clock, Users, X, Check, UserCheck, Video, Copy, ExternalLink, Link2, ArrowLeft, Download, Play, Search, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useEvent, eventTypeLabel, fmtEventDate, fmtEventTime, fmtDuration, isEventPast, detectPlatform } from "@/hooks/use-events";
import { useEventRsvps, useAttachRecording } from "@/hooks/use-admin-events";
import { useToast } from "@/components/ui/toast";

const PLATFORMS: Record<string, { label: string; color: string }> = {
    zoom: { label: "Zoom", color: "bg-blue-50 text-blue-700 border-blue-200" },
    "google-meet": { label: "Google Meet", color: "bg-green-50 text-green-700 border-green-200" },
    other: { label: "Other", color: "bg-stone-50 text-stone-600 border-stone-200" },
};

function fmtShortDate(d: string) {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AdminEventDetailPage() {
    const params = useParams();
    const eventId = params.id as string;
    const { event, isLoading: eventLoading, error: eventError, mutate: mutateEvent } = useEvent(eventId);
    const { rsvps, isLoading: rsvpsLoading } = useEventRsvps(eventId);
    const { trigger: attachRecording, isLoading: attachingRecording } = useAttachRecording(eventId);
    const { toast } = useToast();

    const [rsvpSearch, setRsvpSearch] = useState("");
    const [copied, setCopied] = useState(false);
    const [recordingInput, setRecordingInput] = useState("");
    const [recordingSaved, setRecordingSaved] = useState(false);

    const filteredRsvps = useMemo(() => {
        if (!rsvps) return [];
        return rsvps.filter(r => {
            const name = r.profile ? `${r.profile.firstName ?? ""} ${r.profile.lastName ?? ""}`.trim() : "";
            const q = rsvpSearch.toLowerCase();
            return !q || name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
        });
    }, [rsvps, rsvpSearch]);

    const stats = useMemo(() => ({
        total: rsvps?.length ?? 0,
    }), [rsvps]);

    const copyLink = useCallback(() => {
        if (!event?.meetingLink) return;
        navigator.clipboard.writeText(event.meetingLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [event?.meetingLink]);

    const saveRecording = async () => {
        const url = recordingInput.trim();
        if (!url) return;
        try {
            await attachRecording({ recordingUrl: url });
            mutateEvent();
            setRecordingSaved(true);
            setRecordingInput("");
            setTimeout(() => setRecordingSaved(false), 2000);
        } catch (err: any) {
            toast(err?.message ?? "Failed to attach recording", "error");
        }
    };

    if (eventLoading || !event) {
        return (
            <div className="flex items-center justify-center py-40">
                <Loader2 className="animate-spin text-brand-500" size={32} />
            </div>
        );
    }

    if (eventError) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-stone-500">
                <p className="font-semibold">Failed to load event</p>
                <Link href="/admin/events" className="mt-4 text-brand-600 hover:underline">Back to Events</Link>
            </div>
        );
    }

    const platform = detectPlatform(event.meetingLink);
    const platformMeta = PLATFORMS[platform] ?? PLATFORMS.other;
    const typeLabel = eventTypeLabel(event.type);
    const past = isEventPast(event.scheduledAt, event.durationMinutes);

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
                                <span className="text-xs font-bold uppercase tracking-wider text-brand-200">{new Date(event.scheduledAt).toLocaleDateString("en-US", { month: "short" })}</span>
                                <span className="text-4xl font-bold">{new Date(event.scheduledAt).getDate()}</span>
                            </div>

                            {/* Event Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <StatusBadge label={typeLabel} preset={typeLabel as any} variant="tag" />
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${platformMeta.color}`}>{platformMeta.label}</span>
                                    {past && <StatusBadge label="Past" preset="Inactive" variant="tag" />}
                                </div>
                                <h1 className="text-3xl font-bold text-stone-900 mb-2">{event.title}</h1>
                                {event.description && <p className="text-stone-600 mb-4 leading-relaxed max-w-2xl">{event.description}</p>}

                                <div className="flex flex-wrap gap-6 text-sm text-stone-500">
                                    <span className="flex items-center gap-2"><Calendar size={16} className="text-stone-400" /> {fmtEventDate(event.scheduledAt)}</span>
                                    <span className="flex items-center gap-2"><Clock size={16} className="text-stone-400" /> {fmtEventTime(event.scheduledAt)}</span>
                                    <span className="flex items-center gap-2"><Video size={16} className="text-stone-400" /> {fmtDuration(event.durationMinutes)}</span>
                                    <span className="flex items-center gap-2"><Users size={16} className="text-stone-400" /> {event._count.rsvps} RSVPs</span>
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-stone-100 p-5">
                        <p className="text-sm text-stone-500 font-medium">Total RSVPs</p>
                        <p className="text-3xl font-bold text-stone-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-green-100 p-5">
                        <p className="text-sm text-green-600 font-medium">Event Count</p>
                        <p className="text-3xl font-bold text-green-700 mt-1">{event._count.rsvps}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-stone-100 p-5">
                        <p className="text-sm text-stone-500 font-medium">Status</p>
                        <p className="text-3xl font-bold text-brand-700 mt-1">{past ? "Past" : "Upcoming"}</p>
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
                                disabled={!recordingInput.trim() || attachingRecording}
                                className="px-5 py-3 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {attachingRecording ? <Loader2 className="animate-spin" size={16} /> : recordingSaved ? <><Check size={16} /> Saved!</> : <>Attach Recording</>}
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
                                    <p className="text-sm text-stone-500">{filteredRsvps.length} of {stats.total} members shown</p>
                                </div>
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
                        </div>
                    </div>

                    {/* RSVP Table */}
                    {rsvpsLoading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-brand-500" size={24} />
                        </div>
                    )}
                    {!rsvpsLoading && filteredRsvps.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-stone-500">
                                <thead className="text-xs text-stone-400 uppercase bg-stone-50 border-b border-stone-100">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Member</th>
                                        <th className="px-6 py-4 font-bold">RSVP Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRsvps.map(rsvp => {
                                        const name = rsvp.profile ? `${rsvp.profile.firstName ?? ""} ${rsvp.profile.lastName ?? ""}`.trim() : rsvp.email;
                                        return (
                                            <tr key={rsvp.id} className="bg-white border-b border-stone-100 hover:bg-stone-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <AvatarInitials name={name} src={rsvp.profile?.avatarUrl ?? undefined} size="md" />
                                                        <div>
                                                            <div className="font-bold text-stone-900">{name}</div>
                                                            <div className="text-xs text-stone-500">{rsvp.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-stone-500 font-medium">
                                                    {fmtShortDate(rsvp.rsvpedAt)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : !rsvpsLoading ? (
                        <div className="p-8">
                            <EmptyState
                                icon={Users}
                                heading="No RSVPs yet"
                                description={rsvpSearch ? "Try adjusting your search." : "No one has RSVP'd to this event yet."}
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        </ErrorBoundary>
    );
}
