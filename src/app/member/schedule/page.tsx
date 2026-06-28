"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
    Calendar, CalendarDays, Clock, Users, List, CheckCircle, UserCheck,
    Video, ExternalLink, MapPin, Search, Loader2,
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useCursorPagination } from "@/hooks/useCursorPagination";
import { useQueryInvalidation } from "@/hooks/useQueryInvalidation";
import { fetchEventDetail, fetchEvents, getEventPlatformLabel, getEventTypeLabel, getEventsErrorMessage, toggleEventRsvp, type EventDetailRecord, type EventRecord, type EventType } from "@/lib/events";
import { invalidateQuery } from "@/lib/queryInvalidation";

type View = "all" | "my-events" | "calendar";

function formatDateLabel(value: string) {
    return new Date(value).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatDay(value: string) {
    return new Date(value).getDate();
}

function formatMonth(value: string) {
    return new Date(value).toLocaleDateString("en-US", { month: "short" }).toUpperCase();
}

function formatTime(value: string) {
    const date = new Date(value);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDuration(minutes: number) {
    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

function getStatus(event: EventRecord): "upcoming" | "past" {
    return new Date(event.scheduledAt).getTime() < Date.now() ? "past" : "upcoming";
}

const TYPE_COLOR: Record<EventType, string> = {
    WORKSHOP: "bg-brand-100 text-brand-700 border-brand-200",
    QA: "bg-blue-100 text-blue-700 border-blue-200",
    SPEAKER_SERIES: "bg-emerald-100 text-emerald-700 border-emerald-200",
    SOCIAL: "bg-amber-100 text-amber-700 border-amber-200",
    HACKATHON: "bg-purple-100 text-purple-700 border-purple-200",
};

const PLATFORM_COLOR: Record<string, string> = {
    Zoom: "bg-blue-50 text-blue-700 border-blue-200",
    "Google Meet": "bg-green-50 text-green-700 border-green-200",
    Other: "bg-stone-50 text-stone-600 border-stone-200",
};

export default function MemberSchedulePage() {
    const { getToken } = useAuth();
    const { toast } = useToast();
    const [view, setView] = useState<View>("all");
    const [filterType, setFilterType] = useState<"All" | EventType>("All");
    const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "past">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [detailEventId, setDetailEventId] = useState<string | null>(null);
    const [eventDetails, setEventDetails] = useState<Record<string, EventDetailRecord>>({});
    const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
    const [busyRsvpId, setBusyRsvpId] = useState<string | null>(null);
    const [rsvpConfirmId, setRsvpConfirmId] = useState<string | null>(null);
    const hydratedIdsRef = useRef(new Set<string>());

    const paginationQuery = useMemo(() => ({
        limit: 20,
        type: filterType === "All" ? undefined : filterType,
        status: filterStatus === "all" ? undefined : filterStatus,
    }), [filterStatus, filterType]);

    const loadEventsPage = useCallback(
        (query: typeof paginationQuery & { cursor?: string | null }) => fetchEvents(query, getToken),
        [getToken],
    );

    const { items, isLoading, isLoadingMore, error, hasMore, loadMore, reload } = useCursorPagination({
        query: paginationQuery,
        loadPage: loadEventsPage,
        getErrorMessage: getEventsErrorMessage,
    });

    const scheduleInvalidationScopes = useMemo(() => ["events"] as const, []);
    useQueryInvalidation([...scheduleInvalidationScopes], async () => {
        await reload();
    });

    const loadEventDetail = useCallback(async (eventId: string) => {
        const detail = await fetchEventDetail(eventId, getToken);
        setEventDetails((prev) => ({ ...prev, [eventId]: detail }));
        return detail;
    }, [getToken]);

    useEffect(() => {
        let cancelled = false;

        async function hydrateLoadedEvents() {
            const idsToHydrate = items
                .map((event) => event.id)
                .filter((eventId) => !hydratedIdsRef.current.has(eventId));

            if (idsToHydrate.length === 0) {
                return;
            }

            // Mark immediately to prevent duplicate requests on concurrent renders
            idsToHydrate.forEach((id) => hydratedIdsRef.current.add(id));

            const results = await Promise.all(idsToHydrate.map(async (eventId) => {
                try {
                    return await fetchEventDetail(eventId, getToken);
                } catch {
                    // Allow retry next time items changes
                    hydratedIdsRef.current.delete(eventId);
                    return null;
                }
            }));

            if (cancelled) {
                return;
            }

            const nextDetails: Record<string, EventDetailRecord> = {};
            results.forEach((detail) => {
                if (detail) {
                    nextDetails[detail.id] = detail;
                }
            });

            if (Object.keys(nextDetails).length > 0) {
                setEventDetails((prev) => ({ ...prev, ...nextDetails }));
            }
        }

        void hydrateLoadedEvents();

        return () => {
            cancelled = true;
        };
    }, [getToken, items]);

    const hasRsvp = useCallback((eventId: string) => Boolean(eventDetails[eventId]?.hasRsvp), [eventDetails]);

    const detailEvent = detailEventId ? eventDetails[detailEventId] ?? items.find((event) => event.id === detailEventId) ?? null : null;

    const filtered = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        let list = items;

        if (view === "my-events") {
            list = list.filter((event) => hasRsvp(event.id));
        }

        if (query) {
            list = list.filter((event) =>
                event.title.toLowerCase().includes(query) ||
                event.host.toLowerCase().includes(query) ||
                (event.description ?? "").toLowerCase().includes(query),
            );
        }

        return [...list].sort((left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime());
    }, [hasRsvp, items, searchQuery, view]);

    const toggleRsvp = useCallback(async (eventId: string) => {
        if (busyRsvpId === eventId) {
            return;
        }

        setBusyRsvpId(eventId);

        try {
            const rsvped = await toggleEventRsvp(eventId, getToken);
            setEventDetails((prev) => {
                const current = prev[eventId];
                return {
                    ...prev,
                    [eventId]: current
                        ? { ...current, hasRsvp: rsvped }
                        : {
                            ...(items.find((event) => event.id === eventId) ?? {
                                id: eventId,
                                title: "Untitled event",
                                description: null,
                                scheduledAt: new Date().toISOString(),
                                durationMinutes: 60,
                                host: "Community Team",
                                type: "WORKSHOP",
                                platform: "OTHER",
                                recordingUrl: null,
                                createdAt: null,
                                attendeeCount: 0,
                            }),
                            hasRsvp: rsvped,
                            meetingLink: null,
                        },
                };
            });
            try {
                await loadEventDetail(eventId);
                // Re-apply after detail refresh — server may return stale hasRsvp
                setEventDetails((prev) => prev[eventId] ? { ...prev, [eventId]: { ...prev[eventId], hasRsvp: rsvped } } : prev);
            } catch {
                // Keep the optimistic RSVP state even if the follow-up detail refresh fails.
            }
            invalidateQuery("events");
            toast(rsvped ? "You're going!" : "RSVP removed");
        } catch (toggleError) {
            toast(getEventsErrorMessage(toggleError), "error");
        } finally {
            setBusyRsvpId(null);
            setRsvpConfirmId(null);
        }
    }, [busyRsvpId, getToken, items, loadEventDetail, toast]);

    const openEventDetail = useCallback(async (eventId: string) => {
        setDetailEventId(eventId);
        setLoadingDetailId(eventId);

        try {
            await loadEventDetail(eventId);
        } catch (detailError) {
            toast(getEventsErrorMessage(detailError), "error");
        } finally {
            setLoadingDetailId((current) => current === eventId ? null : current);
        }
    }, [loadEventDetail, toast]);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const calDays: (number | null)[] = [
        ...Array.from({ length: firstDay }, () => null),
        ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];

    const myCount = items.filter((event) => hasRsvp(event.id)).length;
    const upcomingCount = items.filter((event) => getStatus(event) === "upcoming").length;

    return (
        <ErrorBoundary>
            <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">My Schedule</h1>
                    <p className="text-stone-500 mt-1">{upcomingCount} upcoming events &middot; {myCount} RSVP&apos;d</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input type="text" placeholder="Search events, hosts..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
                    </div>
                    <div className="flex bg-stone-100 p-1 rounded-xl self-start">
                        {([ ["all", "All Events", List], ["my-events", "My Events", UserCheck], ["calendar", "Calendar", CalendarDays] ] as const).map(([key, label, Icon]) => (
                            <button key={key} onClick={() => setView(key)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === key ? "bg-white shadow-sm text-stone-900" : "text-stone-500 hover:text-stone-900"}`}>
                                <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {view !== "calendar" ? (
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Type:</span>
                            {(["All", "WORKSHOP", "QA", "SPEAKER_SERIES", "SOCIAL", "HACKATHON"] as const).map((type) => (
                                <button key={type} onClick={() => setFilterType(type)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${filterType === type ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{type === "All" ? "All" : getEventTypeLabel(type)}</button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Status:</span>
                            {(["all", "upcoming", "past"] as const).map((status) => (
                                <button key={status} onClick={() => setFilterStatus(status)} className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${filterStatus === status ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{status}</button>
                            ))}
                        </div>
                    </div>
                ) : null}

                {isLoading ? (
                    <div className="space-y-4">
                        <SkeletonCard lines={4} />
                        <SkeletonCard lines={4} />
                        <SkeletonCard lines={4} />
                    </div>
                ) : error ? (
                    <EmptyState icon={Calendar} heading="Events unavailable" description={error} />
                ) : view === "calendar" ? (
                    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6">
                        <h3 className="font-bold text-stone-900 mb-4">{new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="text-[10px] font-bold text-stone-400 uppercase tracking-wider py-2">{day}</div>)}
                            {calDays.map((day, index) => {
                                const dateStr = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
                                const dayEvents = items.filter((event) => event.scheduledAt.startsWith(dateStr));
                                const isToday = day === now.getDate() && month === now.getMonth();

                                return (
                                    <div key={index} className={`min-h-[80px] border border-stone-50 rounded-xl p-1 ${day ? "bg-stone-50/50" : ""} ${isToday ? "ring-2 ring-brand-300 bg-brand-50/30" : ""}`}>
                                        {day ? <span className="text-xs font-bold text-stone-500">{day}</span> : null}
                                        {dayEvents.map((event) => (
                                            <button key={event.id} onClick={() => void openEventDetail(event.id)} className={`block w-full text-left text-[10px] font-bold rounded px-1 py-0.5 mt-0.5 truncate transition-colors ${hasRsvp(event.id) ? "text-brand-700 bg-brand-100 hover:bg-brand-200" : "text-stone-600 bg-stone-100 hover:bg-stone-200"}`}>
                                                {hasRsvp(event.id) ? <span className="inline-block w-1.5 h-1.5 bg-accent-500 rounded-full mr-0.5 -translate-y-px" /> : null}
                                                {event.title}
                                            </button>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((event) => {
                            const isRsvped = hasRsvp(event.id);
                            const status = getStatus(event);
                            const platformLabel = getEventPlatformLabel(event.platform);

                            return (
                                <div key={event.id} className="bg-white rounded-2xl border border-stone-200 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all group overflow-hidden">
                                    <div className="flex flex-col md:flex-row">
                                        <div className={`flex-shrink-0 w-full md:w-24 flex md:flex-col items-center justify-center gap-1 p-4 ${status === "past" ? "bg-stone-100" : isRsvped ? "bg-brand-50" : "bg-stone-50"}`}>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{formatMonth(event.scheduledAt)}</span>
                                            <span className={`text-3xl font-bold ${status === "past" ? "text-stone-400" : "text-stone-900"}`}>{formatDay(event.scheduledAt)}</span>
                                            {isRsvped && status === "upcoming" ? <span className="text-[10px] font-bold text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full border border-accent-100">GOING</span> : null}
                                            {status === "past" ? <span className="text-[10px] font-bold text-stone-400 uppercase">Past</span> : null}
                                        </div>

                                        <div className="flex-1 p-5 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${TYPE_COLOR[event.type]}`}>{getEventTypeLabel(event.type)}</span>
                                                <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${PLATFORM_COLOR[platformLabel]}`}>{platformLabel}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-stone-900 group-hover:text-brand-700 transition-colors mb-1 cursor-pointer" onClick={() => void openEventDetail(event.id)}>{event.title}</h3>
                                            <p className="text-sm text-stone-500 line-clamp-1 mb-3">{event.description ?? "No description yet."}</p>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
                                                <span className="flex items-center gap-1.5"><Clock size={14} className="text-stone-400" /> {formatTime(event.scheduledAt)} &middot; {formatDuration(event.durationMinutes)}</span>
                                                <span className="flex items-center gap-1.5"><Users size={14} className="text-stone-400" /> {event.attendeeCount} attendees</span>
                                                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-stone-400" /> {event.host}</span>
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0 flex flex-row md:flex-col items-center gap-2 p-4 border-t md:border-t-0 md:border-l border-stone-100">
                                            {status === "upcoming" ? (
                                                <button onClick={() => setRsvpConfirmId(event.id)} disabled={busyRsvpId === event.id} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 w-full justify-center disabled:opacity-70 disabled:cursor-not-allowed ${isRsvped ? "bg-accent-500 text-white hover:bg-accent-600" : "bg-white border-2 border-stone-200 text-stone-700 hover:border-brand-300 hover:text-brand-700"}`}>
                                                    {busyRsvpId === event.id ? <Loader2 size={16} className="animate-spin" /> : isRsvped ? <CheckCircle size={16} /> : <UserCheck size={16} />}
                                                    {isRsvped ? "RSVP'd" : "RSVP"}
                                                </button>
                                            ) : event.recordingUrl ? (
                                                <a href={event.recordingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-800 text-white rounded-xl font-bold text-xs hover:bg-brand-700 transition-colors">
                                                    <Video size={14} /> Recording
                                                </a>
                                            ) : (
                                                <span className="text-xs font-bold text-stone-400 uppercase">Event ended</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {filtered.length === 0 ? <EmptyState icon={Calendar} heading={view === "my-events" ? "No RSVP'd events" : "No events found"} description={view === "my-events" ? "RSVP to events to see them here." : "Try adjusting your filters."} /> : null}

                        {hasMore && view !== "my-events" ? (
                            <div className="flex justify-center">
                                <button onClick={() => void loadMore()} disabled={isLoadingMore} className="px-5 py-2.5 rounded-xl border border-stone-200 bg-white text-sm font-bold text-stone-700 hover:border-brand-300 hover:text-brand-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
                                    {isLoadingMore ? <Loader2 size={16} className="animate-spin" /> : null}
                                    Load more events
                                </button>
                            </div>
                        ) : null}
                    </div>
                )}

                {detailEvent ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailEventId(null)} />
                        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className={`p-6 ${hasRsvp(detailEvent.id) ? "bg-brand-50" : "bg-stone-50"} rounded-t-3xl border-b border-stone-100`}>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${TYPE_COLOR[detailEvent.type]}`}>{getEventTypeLabel(detailEvent.type)}</span>
                                    {hasRsvp(detailEvent.id) ? <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-accent-100 text-accent-700 border border-accent-200">RSVP&apos;d</span> : null}
                                    {getStatus(detailEvent) === "past" ? <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-stone-100 text-stone-500 border border-stone-200">Past</span> : null}
                                </div>
                                <h2 className="text-2xl font-bold text-stone-900">{detailEvent.title}</h2>
                            </div>
                            <div className="p-6 space-y-5">
                                {loadingDetailId === detailEvent.id ? (
                                    <div className="flex items-center gap-2 text-sm text-stone-500"><Loader2 size={16} className="animate-spin" /> Refreshing event details...</div>
                                ) : null}
                                <p className="text-stone-600 leading-relaxed">{detailEvent.description ?? "No description has been added for this event yet."}</p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-stone-50 rounded-xl p-3"><p className="text-xs text-stone-400 font-bold uppercase mb-1">Date</p><p className="font-semibold text-stone-900">{formatDateLabel(detailEvent.scheduledAt)}</p></div>
                                    <div className="bg-stone-50 rounded-xl p-3"><p className="text-xs text-stone-400 font-bold uppercase mb-1">Time</p><p className="font-semibold text-stone-900">{formatTime(detailEvent.scheduledAt)}</p></div>
                                    <div className="bg-stone-50 rounded-xl p-3"><p className="text-xs text-stone-400 font-bold uppercase mb-1">Duration</p><p className="font-semibold text-stone-900">{formatDuration(detailEvent.durationMinutes)}</p></div>
                                    <div className="bg-stone-50 rounded-xl p-3"><p className="text-xs text-stone-400 font-bold uppercase mb-1">Attendees</p><p className="font-semibold text-stone-900">{detailEvent.attendeeCount}</p></div>
                                </div>
                                <div className="bg-stone-50 rounded-xl p-3"><p className="text-xs text-stone-400 font-bold uppercase mb-1">Host</p><p className="font-semibold text-stone-900">{detailEvent.host}</p></div>
                                <div className={`rounded-xl p-4 border ${PLATFORM_COLOR[getEventPlatformLabel(detailEvent.platform)]}`}>
                                    <p className="text-xs font-bold uppercase mb-1 opacity-70">Platform</p>
                                    <p className="font-bold">{getEventPlatformLabel(detailEvent.platform)}</p>
                                    {("meetingLink" in detailEvent && detailEvent.meetingLink) ? (
                                        <a href={detailEvent.meetingLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors">
                                            <ExternalLink size={16} /> Join meeting
                                        </a>
                                    ) : detailEvent.recordingUrl ? (
                                        <a href={detailEvent.recordingUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors">
                                            <ExternalLink size={16} /> Open recording
                                        </a>
                                    ) : getStatus(detailEvent) === "upcoming" ? (
                                        <p className="text-xs mt-2 opacity-70">Meeting link visibility is controlled by the event detail contract after RSVP.</p>
                                    ) : null}
                                </div>
                                <div className="flex gap-3 pt-2">
                                    {getStatus(detailEvent) === "upcoming" ? (
                                        <button onClick={() => setRsvpConfirmId(detailEvent.id)} disabled={busyRsvpId === detailEvent.id} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${hasRsvp(detailEvent.id) ? "bg-accent-500 text-white hover:bg-accent-600" : "bg-brand-800 text-white hover:bg-brand-700"}`}>
                                            {busyRsvpId === detailEvent.id ? <Loader2 size={16} className="animate-spin" /> : hasRsvp(detailEvent.id) ? <CheckCircle size={16} /> : <UserCheck size={16} />}
                                            {hasRsvp(detailEvent.id) ? "RSVP'd" : "RSVP Now"}
                                        </button>
                                    ) : null}
                                    <button onClick={() => setDetailEventId(null)} className="px-6 py-3 rounded-xl font-bold text-sm border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {(() => {
                const isAlreadyRsvped = rsvpConfirmId ? hasRsvp(rsvpConfirmId) : false;
                return (
                    <ConfirmModal
                        open={rsvpConfirmId !== null}
                        onClose={() => busyRsvpId !== rsvpConfirmId && setRsvpConfirmId(null)}
                        onConfirm={() => rsvpConfirmId && void toggleRsvp(rsvpConfirmId)}
                        loading={busyRsvpId === rsvpConfirmId}
                        title={isAlreadyRsvped ? "Remove RSVP?" : "Confirm RSVP"}
                        description={isAlreadyRsvped ? "Your RSVP will be removed from this event." : "You'll be added to the attendee list for this event."}
                        confirmLabel={isAlreadyRsvped ? "Remove" : "RSVP"}
                        variant={isAlreadyRsvped ? "danger" : "primary"}
                        icon={UserCheck}
                    />
                );
            })()}
        </ErrorBoundary>
    );
}