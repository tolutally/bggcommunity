"use client";

import { useAuth } from "@clerk/nextjs";
import { Calendar, CalendarDays, Check, ChevronLeft, ChevronRight, Clock, Copy, ExternalLink, Link2, List, Loader2, Pencil, Plus, RefreshCw, Trash2, UserCheck, Users, Video, X, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkeletonCard } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { useCursorPagination } from "@/hooks/useCursorPagination";
import {
    createEvent,
    deleteEvent,
    fetchEventDetail,
    fetchEventRsvps,
    fetchEvents,
    getEventPlatformLabel,
    getEventsErrorMessage,
    getEventTypeLabel,
    toggleEventRsvp,
    updateEvent,
    updateEventRecording,
    type EventDetailRecord,
    type EventPlatform,
    type EventRecord,
    type EventRsvpRecord,
    type EventType,
    type EventUpsertInput,
} from "@/lib/events";

const EVENT_TYPES: Array<{ label: string; value: EventType }> = [
    { label: "Workshop", value: "WORKSHOP" },
    { label: "Q&A", value: "QA" },
    { label: "Speaker Series", value: "SPEAKER_SERIES" },
    { label: "Social", value: "SOCIAL" },
    { label: "Hackathon", value: "HACKATHON" },
];

const DURATION_OPTIONS = [30, 45, 60, 90, 120, 180];

const PLATFORM_OPTIONS: Array<{ key: EventPlatform; label: string; color: string }> = [
    { key: "ZOOM", label: "Zoom", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { key: "GOOGLE_MEET", label: "Google Meet", color: "bg-green-50 text-green-700 border-green-200" },
    { key: "OTHER", label: "Other", color: "bg-stone-50 text-stone-600 border-stone-200" },
];

function formatDateLabel(value: string) {
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMonthLabel(value: string) {
    return formatDateLabel(value).split(" ")[0] ?? "";
}

function formatDayLabel(value: string) {
    return formatDateLabel(value).split(" ")[1] ?? "";
}

function formatFullDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatTime(value: string) {
    return new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" });
}

function formatDuration(minutes: number) {
    if (minutes % 60 === 0) {
        const hours = minutes / 60;
        return `${hours} hr${hours === 1 ? "" : "s"}`;
    }

    if (minutes > 60) {
        return `${minutes / 60} hrs`;
    }

    return `${minutes} min`;
}

function getStatus(event: EventRecord | EventDetailRecord) {
    return new Date(event.scheduledAt).getTime() < Date.now() ? "past" : "upcoming";
}

function platformBadge(platform: EventPlatform) {
    return PLATFORM_OPTIONS.find((option) => option.key === platform)?.color ?? "bg-stone-50 text-stone-600 border-stone-200";
}

function toDateInputValue(value: string) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function toTimeInputValue(value: string) {
    const date = new Date(value);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

function buildScheduledAt(date: string, time: string) {
    return new Date(`${date}T${time}:00`).toISOString();
}

function toFormValues(event: EventRecord | EventDetailRecord): EventUpsertInput {
    return {
        title: event.title,
        description: event.description,
        scheduledAt: event.scheduledAt,
        durationMinutes: event.durationMinutes,
        host: event.host,
        type: event.type,
        platform: event.platform,
        meetingLink: "meetingLink" in event ? event.meetingLink : null,
    };
}

export default function AdminEventsPage() {
    const { getToken } = useAuth();
    const { toast } = useToast();
    const [view, setView] = useState<"list" | "calendar">("list");
    const [filterType, setFilterType] = useState<"All" | EventType>("All");
    const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "past">("all");
    const [modal, setModal] = useState<null | "create" | { prefillDate: string } | (EventUpsertInput & { id: string })>(null);
    const [calViewOffset, setCalViewOffset] = useState(0);
    const [detailEventId, setDetailEventId] = useState<string | null>(null);
    const router = useRouter();

    // Auto-open create modal when navigated from dashboard with ?create=true
    useEffect(() => {
        if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("create") === "true") {
            setModal("create");
            router.replace("/admin/events");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const [deleteTarget, setDeleteTarget] = useState<EventRecord | null>(null);
    const [eventDetails, setEventDetails] = useState<Record<string, EventDetailRecord>>({});
    const [eventRsvps, setEventRsvps] = useState<Record<string, EventRsvpRecord[]>>({});
    const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
    const [loadingRsvpsId, setLoadingRsvpsId] = useState<string | null>(null);
    const [busyRsvpId, setBusyRsvpId] = useState<string | null>(null);
    const [rsvpConfirmId, setRsvpConfirmId] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [recordingUrlDraft, setRecordingUrlDraft] = useState("");
    const [recordingError, setRecordingError] = useState<string | null>(null);
    const [isSavingRecording, setIsSavingRecording] = useState(false);
    const hydratedIdsRef = useRef(new Set<string>());

    const paginationQuery = useMemo(() => ({
        type: filterType === "All" ? undefined : filterType,
        status: filterStatus === "all" ? undefined : filterStatus,
        limit: 50,
    }), [filterStatus, filterType]);

    const loadEventsPage = useCallback(
        (query: typeof paginationQuery & { cursor?: string | null }) => fetchEvents(query, getToken),
        [getToken],
    );

    const { items, isLoading, error, hasMore, isLoadingMore, loadMore, reload, setItems } = useCursorPagination({
        query: paginationQuery,
        loadPage: loadEventsPage,
        getErrorMessage: getEventsErrorMessage,
    });

    const loadEventDetail = useCallback(async (eventId: string) => {
        const detail = await fetchEventDetail(eventId, getToken);
        setEventDetails((prev) => ({ ...prev, [eventId]: detail }));
        return detail;
    }, [getToken]);

    const loadEventRsvps = useCallback(async (eventId: string) => {
        const rsvps = await fetchEventRsvps(eventId, getToken);
        setEventRsvps((prev) => ({ ...prev, [eventId]: rsvps }));
        return rsvps;
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

            idsToHydrate.forEach((id) => hydratedIdsRef.current.add(id));

            const results = await Promise.all(idsToHydrate.map(async (eventId) => {
                try {
                    return await fetchEventDetail(eventId, getToken);
                } catch {
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

    const openEventDetail = useCallback(async (eventId: string) => {
        setDetailEventId(eventId);
        setLoadingDetailId(eventId);
        setLoadingRsvpsId(eventId);

        try {
            await Promise.all([loadEventDetail(eventId), loadEventRsvps(eventId)]);
        } catch (loadError) {
            toast(getEventsErrorMessage(loadError), "error");
        } finally {
            setLoadingDetailId((current) => current === eventId ? null : current);
            setLoadingRsvpsId((current) => current === eventId ? null : current);
        }
    }, [loadEventDetail, loadEventRsvps, toast]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);

        try {
            await reload();
        } finally {
            setIsRefreshing(false);
        }
    }, [reload]);

    const handleSave = useCallback(async (data: EventUpsertInput) => {
        setIsSaving(true);

        try {
            if (modal && typeof modal === "object" && "id" in modal) {
                await updateEvent(modal.id, data, getToken);
                toast("Event updated");
                setEventDetails((prev) => modal.id in prev ? { ...prev, [modal.id]: { ...prev[modal.id], ...data } } : prev);
            } else {
                await createEvent(data, getToken);
                toast("Event created");
            }

            setModal(null);
            await reload();
        } catch (saveError) {
            toast(getEventsErrorMessage(saveError), "error");
        } finally {
            setIsSaving(false);
        }
    }, [getToken, modal, reload, toast]);

    const handleDelete = useCallback(async () => {
        if (!deleteTarget) {
            return;
        }

        setIsDeleting(true);

        try {
            await deleteEvent(deleteTarget.id, getToken);
            setItems((prev) => prev.filter((event) => event.id !== deleteTarget.id));
            setEventDetails((prev) => {
                const next = { ...prev };
                delete next[deleteTarget.id];
                return next;
            });
            setEventRsvps((prev) => {
                const next = { ...prev };
                delete next[deleteTarget.id];
                return next;
            });
            if (detailEventId === deleteTarget.id) {
                setDetailEventId(null);
            }
            setDeleteTarget(null);
            toast("Event removed");
        } catch (deleteError) {
            toast(getEventsErrorMessage(deleteError), "error");
        } finally {
            setIsDeleting(false);
        }
    }, [deleteTarget, detailEventId, getToken, setItems, toast]);

    const handleToggleRsvp = useCallback(async (eventId: string) => {
        if (busyRsvpId === eventId) {
            return;
        }

        setBusyRsvpId(eventId);

        try {
            const rsvped = await toggleEventRsvp(eventId, getToken);
            setEventDetails((prev) => prev[eventId] ? { ...prev, [eventId]: { ...prev[eventId], hasRsvp: rsvped } } : prev);
            await Promise.allSettled([
                reload(),
                loadEventDetail(eventId),
                detailEventId === eventId ? loadEventRsvps(eventId) : Promise.resolve([]),
            ]);
            // Re-apply after detail refresh — server may return stale hasRsvp
            setEventDetails((prev) => prev[eventId] ? { ...prev, [eventId]: { ...prev[eventId], hasRsvp: rsvped } } : prev);
            toast(rsvped ? "RSVP confirmed" : "RSVP removed");
        } catch (toggleError) {
            toast(getEventsErrorMessage(toggleError), "error");
        } finally {
            setBusyRsvpId(null);
            setRsvpConfirmId(null);
        }
    }, [busyRsvpId, detailEventId, getToken, loadEventDetail, loadEventRsvps, reload, toast]);

    const copyLink = useCallback((id: string, link: string) => {
        void navigator.clipboard.writeText(link);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    }, []);

    const detailEvent = detailEventId ? eventDetails[detailEventId] ?? items.find((event) => event.id === detailEventId) ?? null : null;

    useEffect(() => {
        setRecordingUrlDraft(detailEvent?.recordingUrl ?? "");
        setRecordingError(null);
    }, [detailEvent?.id, detailEvent?.recordingUrl]);

    const handleSaveRecording = useCallback(async () => {
        if (!detailEvent) {
            return;
        }

        const nextUrl = recordingUrlDraft.trim();

        if (!nextUrl) {
            setRecordingError("Recording URL is required.");
            return;
        }

        if (!/^https?:\/\/.+/i.test(nextUrl)) {
            setRecordingError("Enter a valid recording URL.");
            return;
        }

        setIsSavingRecording(true);
        setRecordingError(null);

        try {
            const updatedEvent = await updateEventRecording(detailEvent.id, nextUrl, getToken);
            setItems((prev) => prev.map((event) => event.id === detailEvent.id ? { ...event, recordingUrl: updatedEvent.recordingUrl } : event));
            setEventDetails((prev) => prev[detailEvent.id] ? { ...prev, [detailEvent.id]: { ...prev[detailEvent.id], recordingUrl: updatedEvent.recordingUrl } } : prev);
            setRecordingUrlDraft(updatedEvent.recordingUrl ?? nextUrl);
            toast("Recording updated");
        } catch (saveError) {
            const message = getEventsErrorMessage(saveError);
            setRecordingError(message);
            toast(message, "error");
        } finally {
            setIsSavingRecording(false);
        }
    }, [detailEvent, getToken, recordingUrlDraft, setItems, toast]);

    const sortedItems = useMemo(() => [...items].sort((left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime()), [items]);
    const myRsvpCount = useMemo(() => Object.values(eventDetails).filter((event) => event.hasRsvp).length, [eventDetails]);
    const upcomingCount = useMemo(() => items.filter((event) => getStatus(event) === "upcoming").length, [items]);
    const pastCount = useMemo(() => items.filter((event) => getStatus(event) === "past").length, [items]);

    const todayDate = new Date();
    const calViewDate = new Date(todayDate.getFullYear(), todayDate.getMonth() + calViewOffset, 1);
    const year = calViewDate.getFullYear();
    const month = calViewDate.getMonth();
    const isCurrentCalMonth = year === todayDate.getFullYear() && month === todayDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const calDays: Array<number | null> = [
        ...Array.from({ length: firstDay }, () => null),
        ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];

    return (
        <ErrorBoundary>
            <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-900">Events</h1>
                        <p className="text-stone-500 mt-1">Schedule and manage community events with live backend data.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => void handleRefresh()} disabled={isRefreshing} className="bg-white border border-stone-200 text-stone-700 px-4 py-2.5 rounded-xl font-bold hover:border-brand-300 hover:text-brand-700 flex items-center gap-2 w-fit disabled:opacity-70 disabled:cursor-not-allowed">
                            {isRefreshing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                            Refresh
                        </button>
                        <div className="flex bg-stone-100 rounded-xl p-1">
                            <button onClick={() => setView("list")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${view === "list" ? "bg-white shadow text-stone-900" : "text-stone-500"}`}><List size={16} /> List</button>
                            <button onClick={() => setView("calendar")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${view === "calendar" ? "bg-white shadow text-stone-900" : "text-stone-500"}`}><CalendarDays size={16} /> Calendar</button>
                        </div>
                        <button onClick={() => setModal("create")} className="bg-brand-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-700 flex items-center gap-2 shadow-lg shadow-brand-800/10">
                            <Plus size={18} /> Create Event
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Loaded events" value={items.length} />
                    <StatCard label="Upcoming" value={upcomingCount} accent="text-brand-700" />
                    <StatCard label="Past" value={pastCount} accent="text-stone-500" />
                    <StatCard label="Your RSVPs" value={myRsvpCount} accent="text-accent-700" />
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Type:</span>
                        {(["All", ...EVENT_TYPES.map((type) => type.value)] as const).map((type) => {
                            const active = filterType === type;
                            const label = type === "All" ? type : getEventTypeLabel(type);
                            return (
                                <button key={type} onClick={() => setFilterType(type)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${active ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{label}</button>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Status:</span>
                        {(["all", "upcoming", "past"] as const).map((status) => (
                            <button key={status} onClick={() => setFilterStatus(status)} className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${filterStatus === status ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{status}</button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        <SkeletonCard lines={4} />
                        <SkeletonCard lines={4} />
                        <SkeletonCard lines={4} />
                    </div>
                ) : error ? (
                    <EmptyState icon={Calendar} heading="Events unavailable" description={error} variant="plain" />
                ) : view === "calendar" ? (
                    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-stone-900">{new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setCalViewOffset((o) => o - 1)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors" aria-label="Previous month"><ChevronLeft size={16} /></button>
                                {calViewOffset !== 0 && (
                                    <button onClick={() => setCalViewOffset(0)} className="px-2.5 py-1 text-xs font-bold text-brand-700 hover:bg-brand-50 rounded-lg transition-colors">Today</button>
                                )}
                                <button onClick={() => setCalViewOffset((o) => o + 1)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors" aria-label="Next month"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="text-[10px] font-bold text-stone-400 uppercase tracking-wider py-2">{day}</div>)}
                            {calDays.map((day, index) => {
                                const dateStr = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
                                const dayEvents = sortedItems.filter((event) => toDateInputValue(event.scheduledAt) === dateStr);
                                const isToday = isCurrentCalMonth && day === todayDate.getDate();

                                return (
                                    <div
                                        key={`${dateStr}-${index}`}
                                        onClick={() => day && setModal({ prefillDate: dateStr })}
                                        className={`group min-h-[80px] border rounded-xl p-1 transition-colors ${day ? "cursor-pointer hover:border-brand-200 hover:bg-brand-50/30" : ""} ${isToday ? "ring-2 ring-brand-300 bg-brand-50/30 border-brand-100" : "border-stone-50"} ${day && !isToday ? "bg-stone-50/50" : ""}`}
                                    >
                                        {day ? (
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-bold ${isToday ? "text-brand-700" : "text-stone-500"}`}>{day}</span>
                                                <Plus size={10} className="text-brand-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        ) : null}
                                        {dayEvents.map((event) => (
                                            <button key={event.id} onClick={(e) => { e.stopPropagation(); void openEventDetail(event.id); }} className="block w-full text-left text-[10px] font-bold text-brand-700 bg-brand-50 rounded px-1 py-0.5 mt-0.5 truncate hover:bg-brand-100 transition-colors">{event.title}</button>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedItems.length === 0 ? (
                            <EmptyState icon={Calendar} heading="No events match your filters" description="Try adjusting your type or status filters." variant="dashed" />
                        ) : null}

                        {sortedItems.map((event) => {
                            const detail = eventDetails[event.id];
                            const hasRsvp = detail?.hasRsvp ?? false;
                            const eventMeetingLink = detail?.meetingLink ?? null;
                            const status = getStatus(event);

                            return (
                                <div key={event.id} className={`bg-white rounded-2xl border p-6 transition-all group ${status === "past" ? "border-stone-100 opacity-70" : "border-stone-200 hover:border-brand-300"}`}>
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 bg-brand-50 rounded-2xl border border-brand-100 group-hover:bg-brand-100 transition-colors">
                                            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">{formatMonthLabel(event.scheduledAt)}</span>
                                            <span className="text-3xl font-bold text-brand-800">{formatDayLabel(event.scheduledAt)}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <StatusBadge label={getEventTypeLabel(event.type)} preset={event.type as never} variant="tag" />
                                                        <StatusBadge label={getEventPlatformLabel(event.platform)} preset={getEventPlatformLabel(event.platform) as never} variant="tag" />
                                                        {status === "past" ? <StatusBadge label="Past" preset="Inactive" variant="tag" /> : null}
                                                        {hasRsvp ? <StatusBadge label="RSVP'd" preset="Active" variant="tag" /> : null}
                                                    </div>
                                                    <h3 className="text-xl font-bold text-stone-900 mb-1 group-hover:text-brand-700 transition-colors cursor-pointer" onClick={() => void openEventDetail(event.id)}>{event.title}</h3>
                                                    {event.description ? <p className="text-sm text-stone-500 mb-2 line-clamp-2">{event.description}</p> : null}
                                                    <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                                                        <span className="flex items-center gap-1.5"><Clock size={16} /> {formatTime(event.scheduledAt)}</span>
                                                        <span className="flex items-center gap-1.5"><Video size={16} /> {formatDuration(event.durationMinutes)}</span>
                                                        <span className="flex items-center gap-1.5"><Users size={16} /> {event.attendeeCount} Attending</span>
                                                        <span className="flex items-center gap-1.5">Host: {event.host}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {status === "upcoming" ? (
                                                        <button onClick={() => setRsvpConfirmId(event.id)} disabled={busyRsvpId === event.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${hasRsvp ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-brand-50 text-brand-700 hover:bg-brand-100"}`}>
                                                            {busyRsvpId === event.id ? <Loader2 size={14} className="animate-spin" /> : hasRsvp ? <><Check size={14} /> RSVP&apos;d</> : <><UserCheck size={14} /> RSVP</>}
                                                        </button>
                                                    ) : null}
                                                    <button onClick={async () => {
                                                        const resolvedDetail = detail ?? await loadEventDetail(event.id).catch(() => null);
                                                        setModal({ id: event.id, ...toFormValues(resolvedDetail ?? event) });
                                                    }} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors" aria-label="Edit event" title="Edit event"><Pencil size={16} /></button>
                                                    <button onClick={() => setDeleteTarget(event)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" aria-label="Delete event" title="Delete event"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {eventMeetingLink ? (
                                        <div className="mt-4 flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
                                            <Link2 size={16} className="text-stone-400 flex-shrink-0" />
                                            <span className="text-sm text-stone-600 truncate flex-1 font-mono">{eventMeetingLink}</span>
                                            <button onClick={() => copyLink(event.id, eventMeetingLink)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied === event.id ? "bg-green-100 text-green-700" : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"}`}>
                                                {copied === event.id ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                                            </button>
                                            <a href={eventMeetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-800 text-white hover:bg-brand-700 transition-colors">
                                                <ExternalLink size={14} /> Join
                                            </a>
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}

                        {hasMore ? (
                            <div className="flex justify-center pt-2">
                                <button onClick={() => void loadMore()} disabled={isLoadingMore} className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-700 hover:border-brand-300 hover:text-brand-700 disabled:opacity-70 disabled:cursor-not-allowed">
                                    {isLoadingMore ? <Loader2 size={16} className="animate-spin" /> : null}
                                    {isLoadingMore ? "Loading more" : "Load more events"}
                                </button>
                            </div>
                        ) : null}
                    </div>
                )}

                {modal !== null ? (
                    <EventFormModal
                        initial={typeof modal === "object" && "id" in modal ? modal : undefined}
                        prefilledDate={typeof modal === "object" && "prefillDate" in modal ? modal.prefillDate : undefined}
                        onClose={() => !isSaving && setModal(null)}
                        onSave={handleSave}
                        saving={isSaving}
                    />
                ) : null}

                {detailEvent ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDetailEventId(null)}>
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col" onClick={(event) => event.stopPropagation()}>
                            <div className="flex items-center justify-between p-6 border-b border-stone-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-brand-50 rounded-xl text-brand-700"><Calendar size={20} /></div>
                                    <h2 className="text-lg font-bold text-stone-900">Event Details</h2>
                                </div>
                                <button onClick={() => setDetailEventId(null)} className="text-stone-400 hover:text-stone-600" aria-label="Close dialog" title="Close dialog"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-5 overflow-y-auto">
                                {loadingDetailId === detailEvent.id || loadingRsvpsId === detailEvent.id ? (
                                    <div className="flex items-center gap-2 text-sm text-stone-500"><Loader2 size={16} className="animate-spin" /> Refreshing backend event detail...</div>
                                ) : null}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <StatusBadge label={getEventTypeLabel(detailEvent.type)} preset={detailEvent.type as never} variant="tag" />
                                    <StatusBadge label={getEventPlatformLabel(detailEvent.platform)} preset={getEventPlatformLabel(detailEvent.platform) as never} variant="tag" />
                                    {getStatus(detailEvent) === "past" ? <StatusBadge label="Past" preset="Inactive" variant="tag" /> : null}
                                    {"hasRsvp" in detailEvent && detailEvent.hasRsvp ? <StatusBadge label="RSVP'd" preset="Active" variant="tag" /> : null}
                                </div>
                                <h3 className="text-2xl font-bold text-stone-900">{detailEvent.title}</h3>
                                {detailEvent.description ? <p className="text-sm text-stone-600 leading-relaxed">{detailEvent.description}</p> : <p className="text-sm text-stone-500">No description has been added for this event yet.</p>}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <InfoRow icon={Calendar} label={formatFullDate(detailEvent.scheduledAt)} />
                                    <InfoRow icon={Clock} label={formatTime(detailEvent.scheduledAt)} />
                                    <InfoRow icon={Video} label={formatDuration(detailEvent.durationMinutes)} />
                                    <InfoRow icon={Users} label={`${detailEvent.attendeeCount} attending`} />
                                </div>
                                <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                                    <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1">Host</p>
                                    <p className="font-semibold text-stone-800">{detailEvent.host}</p>
                                </div>
                                <div className={`rounded-xl p-4 border ${platformBadge(detailEvent.platform)}`}>
                                    <p className="text-xs font-bold uppercase tracking-wide opacity-70 mb-1">Platform</p>
                                    <p className="font-bold">{getEventPlatformLabel(detailEvent.platform)}</p>
                                    {detailEvent.meetingLink ? (
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <button onClick={() => copyLink(detailEvent.id, detailEvent.meetingLink!)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied === detailEvent.id ? "bg-green-100 text-green-700" : "bg-white/80 text-stone-700 hover:bg-white border border-white/70"}`}>
                                                {copied === detailEvent.id ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy link</>}
                                            </button>
                                            <a href={detailEvent.meetingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors">
                                                <ExternalLink size={16} /> Join meeting
                                            </a>
                                        </div>
                                    ) : null}
                                    {detailEvent.recordingUrl ? (
                                        <a href={detailEvent.recordingUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-white/80 text-stone-700 rounded-xl font-bold text-sm hover:bg-white transition-colors border border-white/70">
                                            <ExternalLink size={16} /> Open recording
                                        </a>
                                    ) : null}
                                </div>
                                <div className="bg-white rounded-2xl border border-stone-100 p-4">
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                        <div>
                                            <p className="text-sm font-bold text-stone-900">Recording</p>
                                            <p className="text-xs text-stone-500">Attach or update the event recording without leaving this modal.</p>
                                        </div>
                                        {isSavingRecording ? <Loader2 size={16} className="animate-spin text-stone-400" /> : null}
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <div className="relative flex-1">
                                            <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                            <input
                                                type="url"
                                                value={recordingUrlDraft}
                                                onChange={(event) => setRecordingUrlDraft(event.target.value)}
                                                placeholder="https://youtube.com/watch?v=..."
                                                aria-label="Recording URL"
                                                title="Recording URL"
                                                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 font-mono ${recordingError ? "border-red-300 bg-red-50" : "border-stone-200"}`}
                                            />
                                        </div>
                                        <button onClick={() => void handleSaveRecording()} disabled={isSavingRecording} className="px-4 py-3 rounded-xl text-sm font-bold text-white bg-brand-800 hover:bg-brand-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                            {isSavingRecording ? <Loader2 size={16} className="animate-spin" /> : <Video size={16} />}
                                            {detailEvent.recordingUrl ? "Update Recording" : "Attach Recording"}
                                        </button>
                                    </div>
                                    {recordingError ? <p className="text-red-500 text-xs mt-2">{recordingError}</p> : null}
                                </div>
                                <div className="bg-white rounded-2xl border border-stone-100 p-4">
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                        <div>
                                            <p className="text-sm font-bold text-stone-900">RSVP Report</p>
                                            <p className="text-xs text-stone-500">Live attendee list from the backend.</p>
                                        </div>
                                        {loadingRsvpsId === detailEvent.id ? <Loader2 size={16} className="animate-spin text-stone-400" /> : null}
                                    </div>
                                    {eventRsvps[detailEvent.id]?.length ? (
                                        <div className="space-y-2">
                                            {eventRsvps[detailEvent.id].map((rsvp) => (
                                                <div key={`${rsvp.userId}-${rsvp.createdAt}`} className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 px-3 py-2">
                                                    <div>
                                                        <p className="text-sm font-semibold text-stone-800">{[rsvp.firstName, rsvp.lastName].filter(Boolean).join(" ") || rsvp.email}</p>
                                                        <p className="text-xs text-stone-500">{rsvp.email}</p>
                                                    </div>
                                                    <p className="text-xs text-stone-400">{formatFullDate(rsvp.createdAt)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-stone-500">No RSVP records available for this event yet.</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3 p-6 border-t border-stone-100 bg-stone-50">
                                <button onClick={() => setRsvpConfirmId(detailEvent.id)} disabled={busyRsvpId === detailEvent.id || getStatus(detailEvent) === "past"} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${"hasRsvp" in detailEvent && detailEvent.hasRsvp ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-brand-800 text-white hover:bg-brand-700"}`}>
                                    {busyRsvpId === detailEvent.id ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                                    {"hasRsvp" in detailEvent && detailEvent.hasRsvp ? "Remove RSVP" : "RSVP as Admin"}
                                </button>
                                <button onClick={() => {
                                    setModal({ id: detailEvent.id, ...toFormValues(detailEvent) });
                                    setDetailEventId(null);
                                }} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors flex items-center justify-center gap-2"><Pencil size={16} /> Edit Event</button>
                                <button onClick={() => setDetailEventId(null)} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-white transition-colors">Close</button>
                            </div>
                        </div>
                    </div>
                ) : null}

                <ConfirmModal
                    open={deleteTarget !== null}
                    onClose={() => !isDeleting && setDeleteTarget(null)}
                    onConfirm={() => void handleDelete()}
                    loading={isDeleting}
                    title="Delete Event?"
                    description="This event will be soft-deleted from the backend."
                    icon={Trash2}
                />

                {(() => {
                    const isAlreadyRsvped = rsvpConfirmId ? (eventDetails[rsvpConfirmId]?.hasRsvp ?? false) : false;
                    return (
                        <ConfirmModal
                            open={rsvpConfirmId !== null}
                            onClose={() => busyRsvpId !== rsvpConfirmId && setRsvpConfirmId(null)}
                            onConfirm={() => rsvpConfirmId && void handleToggleRsvp(rsvpConfirmId)}
                            loading={busyRsvpId === rsvpConfirmId}
                            title={isAlreadyRsvped ? "Remove RSVP?" : "Confirm RSVP"}
                            description={isAlreadyRsvped ? "Your RSVP will be removed from this event." : "You'll be added to the attendee list as an admin."}
                            confirmLabel={isAlreadyRsvped ? "Remove" : "RSVP"}
                            variant={isAlreadyRsvped ? "danger" : "primary"}
                            icon={UserCheck}
                        />
                    );
                })()}
            </div>
        </ErrorBoundary>
    );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
    return (
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-sm text-stone-500 font-medium">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${accent ?? "text-stone-900"}`}>{value}</p>
        </div>
    );
}

function InfoRow({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
    return <div className="flex items-center gap-2 text-stone-500"><Icon size={16} className="text-stone-400" /> {label}</div>;
}

function EventFormModal({
    initial,
    prefilledDate,
    onClose,
    onSave,
    saving,
}: {
    initial?: EventUpsertInput & { id: string };
    prefilledDate?: string;
    onClose: () => void;
    onSave: (data: EventUpsertInput) => Promise<void>;
    saving: boolean;
}) {
    const [title, setTitle] = useState(initial?.title ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [date, setDate] = useState(initial ? toDateInputValue(initial.scheduledAt) : (prefilledDate ?? ""));
    const [time, setTime] = useState(initial ? toTimeInputValue(initial.scheduledAt) : "");
    const [durationMinutes, setDurationMinutes] = useState(initial?.durationMinutes ?? 60);
    const [type, setType] = useState<EventType>(initial?.type ?? "WORKSHOP");
    const [host, setHost] = useState(initial?.host ?? "");
    const [platform, setPlatform] = useState<EventPlatform>(initial?.platform ?? "ZOOM");
    const [meetingLink, setMeetingLink] = useState(initial?.meetingLink ?? "");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async () => {
        const nextErrors: Record<string, string> = {};

        if (!title.trim()) nextErrors.title = "Required";
        if (!date) nextErrors.date = "Required";
        if (!time) nextErrors.time = "Required";
        if (!host.trim()) nextErrors.host = "Required";
        if (!meetingLink.trim()) nextErrors.meetingLink = "Required";
        else if (!/^https?:\/\/.+/i.test(meetingLink)) nextErrors.meetingLink = "Enter a valid URL (https://...)";

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        await onSave({
            title: title.trim(),
            description: description.trim() || null,
            scheduledAt: buildScheduledAt(date, time),
            durationMinutes,
            host: host.trim(),
            type,
            platform,
            meetingLink: meetingLink.trim(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => !saving && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-50 rounded-xl text-brand-700"><Calendar size={20} /></div>
                        <h2 className="text-lg font-bold text-stone-900">{initial ? "Edit Event" : "Create Event"}</h2>
                    </div>
                    <button onClick={onClose} disabled={saving} className="text-stone-400 hover:text-stone-600 disabled:opacity-50" aria-label="Close dialog" title="Close dialog"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <Field label="Event Title" error={errors.title}>
                        <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Portfolio Review Session" className={inputClass(errors.title)} />
                    </Field>
                    <Field label="Description" optional>
                        <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What will this event cover? Any prep needed?" rows={3} className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 resize-none" />
                    </Field>
                    <div className="grid grid-cols-3 gap-3">
                        <Field label="Date" error={errors.date}>
                            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="Event date" title="Event date" className={inputClass(errors.date)} />
                        </Field>
                        <Field label="Time" error={errors.time}>
                            <input type="time" value={time} onChange={(event) => setTime(event.target.value)} aria-label="Event time" title="Event time" className={inputClass(errors.time)} />
                        </Field>
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1">Duration</label>
                            <select value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} aria-label="Event duration" title="Event duration" className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 bg-white">
                                {DURATION_OPTIONS.map((option) => <option key={option} value={option}>{formatDuration(option)}</option>)}
                            </select>
                        </div>
                    </div>
                    <Field label="Host" error={errors.host}>
                        <input type="text" value={host} onChange={(event) => setHost(event.target.value)} placeholder="e.g. Sarah Jenkins" className={inputClass(errors.host)} />
                    </Field>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Type</label>
                        <div className="flex gap-2 flex-wrap">
                            {EVENT_TYPES.map((eventType) => (
                                <button key={eventType.value} type="button" onClick={() => setType(eventType.value)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${type === eventType.value ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{eventType.label}</button>
                            ))}
                        </div>
                    </div>
                    <div className="border-t border-stone-100 pt-4 mt-4">
                        <label className="block text-sm font-semibold text-stone-700 mb-2">Meeting Platform</label>
                        <div className="flex gap-2 mb-3 flex-wrap">
                            {PLATFORM_OPTIONS.map((option) => (
                                <button key={option.key} type="button" onClick={() => setPlatform(option.key)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${platform === option.key ? `${option.color} ring-2 ring-offset-1 ring-brand-300` : "bg-white border-stone-200 text-stone-500 hover:bg-stone-50"}`}>
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        <Field label="Meeting Link" error={errors.meetingLink}>
                            <div className="relative">
                                <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                <input type="url" value={meetingLink} onChange={(event) => setMeetingLink(event.target.value)} placeholder="https://zoom.us/j/123456789" className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 font-mono ${errors.meetingLink ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                            </div>
                        </Field>
                    </div>
                </div>
                <div className="flex gap-3 p-6 border-t border-stone-100 bg-stone-50">
                    <button onClick={onClose} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-white transition-colors disabled:opacity-50">Cancel</button>
                    <button onClick={() => void handleSubmit()} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-800 hover:bg-brand-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                        {initial ? "Save Changes" : "Create Event"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Field({ label, optional, error, children }: { label: string; optional?: boolean; error?: string; children: ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">
                {label} {optional ? <span className="text-stone-400 font-normal">(optional)</span> : null}
            </label>
            {children}
            {error ? <p className="text-red-500 text-xs mt-1">{error}</p> : null}
        </div>
    );
}

function inputClass(error?: string) {
    return `w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${error ? "border-red-300 bg-red-50" : "border-stone-200"}`;
}
