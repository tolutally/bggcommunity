"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
    Bell,
    BellRing,
    Calendar,
    Clock,
    Download,
    ExternalLink,
    FileText,
    Loader2,
    MessageSquare,
    Send,
    Users,
    Video,
    X,
} from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useQueryInvalidation } from "@/hooks/useQueryInvalidation";
import {
    useCommunityGroup,
    usePrivateCommunityGroups,
    useChannelPosts,
    useCreatePost,
    fmtPostDate,
} from "@/hooks/use-community";
import {
    fetchCohortDetail,
    fetchCohortMembers,
    fetchCohortResources,
    fetchCohortSessions,
    buildCohortMembersLabel,
    getCohortsErrorMessage,
    type CohortMemberRecord,
    type CohortRecord,
    type CohortResourceRecord,
    type CohortSessionRecord,
} from "@/lib/cohorts";
import { type QueryScope } from "@/lib/queryInvalidation";
import type { Post } from "@/lib/types";

type CohortTab = "sessions" | "resources" | "members" | "messages";

function formatTimeRange(value: string, durationMinutes: number) {
    const start = new Date(value);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    return `${start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · ${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} – ${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

function authorDisplayName(post: Post): string {
    const p = post.author?.profile;
    if (p) {
        const name = [p.firstName, p.lastName].filter(Boolean).join(" ");
        if (name) return name;
    }
    return "Member";
}

/* ── Cohort messages tab ── */
function CohortMessagesTab({ communityGroupId }: { communityGroupId: string }) {
    const { group, isLoading: groupLoading } = useCommunityGroup(communityGroupId);
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    const { toast } = useToast();

    const channels = group?.channels ?? [];
    const channelId = selectedChannelId ?? channels[0]?.id ?? null;
    const channel = channels.find((c) => c.id === channelId) ?? null;

    const { posts, mutate } = useChannelPosts(communityGroupId, channelId);
    const { trigger, isLoading: isPosting } = useCreatePost(communityGroupId, channelId ?? "");
    const [draft, setDraft] = useState("");

    const handlePost = async () => {
        if (!draft.trim() || !channelId || isPosting) return;
        try {
            await trigger({ body: draft.trim() });
            setDraft("");
            await mutate();
        } catch {
            toast("Could not send message", "error");
        }
    };

    if (groupLoading) {
        return (
            <div className="flex items-center justify-center py-12 gap-2 text-stone-500">
                <Loader2 size={18} className="animate-spin" /> Loading messages...
            </div>
        );
    }

    if (!group || channels.length === 0) {
        return (
            <EmptyState icon={MessageSquare} heading="No messages channel" description="A community channel hasn't been set up for this cohort yet." variant="plain" />
        );
    }

    return (
        <div className="space-y-4">
            {channels.length > 1 && (
                <div className="flex items-center gap-2 flex-wrap">
                    {channels.map((c) => (
                        <button key={c.id} onClick={() => setSelectedChannelId(c.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${c.id === channelId ? "bg-brand-100 text-brand-700" : "text-stone-500 hover:text-stone-800"}`}
                        >
                            # {c.name}
                        </button>
                    ))}
                </div>
            )}
            <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-2">
                <textarea rows={2} value={draft} onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handlePost(); } }}
                    placeholder={`Message #${channel?.name ?? "general"}…`}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm resize-none focus:outline-none focus:border-brand-300"
                />
                <div className="flex justify-end">
                    <button onClick={() => void handlePost()} disabled={isPosting || !draft.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors"
                    >
                        {isPosting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send
                    </button>
                </div>
            </div>
            {posts.length === 0 ? (
                <EmptyState icon={MessageSquare} heading="No messages yet" description="Be the first to send a message to your cohort." variant="plain" />
            ) : (
                <div className="space-y-3">
                    {posts.map((post) => (
                        <div key={post.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold flex-shrink-0">
                                    {authorDisplayName(post)[0]?.toUpperCase() ?? "M"}
                                </div>
                                <span className="text-sm font-semibold text-stone-700">{authorDisplayName(post)}</span>
                                <span className="text-xs text-stone-400">&middot; {fmtPostDate(post.createdAt)}</span>
                            </div>
                            {post.title && <p className="text-sm font-semibold text-stone-900 mb-0.5">{post.title}</p>}
                            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{post.body}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const COHORT_SCOPES: QueryScope[] = ["cohorts"];
const REMINDER_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

function getSessionStartMs(session: CohortSessionRecord) {
    return new Date(session.scheduledAt).getTime();
}
function isSessionUpcoming(session: CohortSessionRecord) {
    return getSessionStartMs(session) >= Date.now();
}
function getMinutesUntil(session: CohortSessionRecord) {
    return Math.round((getSessionStartMs(session) - Date.now()) / 60000);
}

export default function MemberCohortPage() {
    const { slug: cohortId } = useParams<{ slug: string }>();
    const { getToken } = useAuth();
    const { toast } = useToast();

    const getTokenRef = useRef(getToken);
    useEffect(() => { getTokenRef.current = getToken; });

    const [tab, setTab] = useState<CohortTab>("sessions");
    const [cohort, setCohort] = useState<CohortRecord | null>(null);
    const [members, setMembers] = useState<CohortMemberRecord[]>([]);
    const [sessions, setSessions] = useState<CohortSessionRecord[]>([]);
    const [resources, setResources] = useState<CohortResourceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadTick, setReloadTick] = useState(0);

    // Session detail modal
    const [detailSession, setDetailSession] = useState<CohortSessionRecord | null>(null);

    // Track which sessions have reminders scheduled
    const [remindedIds, setRemindedIds] = useState<Set<string>>(new Set());

    // Private groups — used as fallback when backend hasn't synced communityGroupId on the cohort record
    const { groups: privateGroups } = usePrivateCommunityGroups();
    const effectiveCommunityGroupId = useMemo(
        () => cohort?.communityGroupId ?? privateGroups.find((g) => g.cohortId === cohort?.id)?.id ?? null,
        [cohort?.communityGroupId, cohort?.id, privateGroups],
    );

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [cohortDetail, cohortMembers, cohortSessions, cohortResources] = await Promise.all([
                    fetchCohortDetail(cohortId, getTokenRef.current),
                    fetchCohortMembers(cohortId, getTokenRef.current),
                    fetchCohortSessions(cohortId, getTokenRef.current),
                    fetchCohortResources(cohortId, getTokenRef.current),
                ]);
                if (!cancelled) {
                    setCohort(cohortDetail);
                    setMembers(cohortMembers);
                    setSessions(cohortSessions);
                    setResources(cohortResources);
                }
            } catch (loadError) {
                if (!cancelled) setError(getCohortsErrorMessage(loadError));
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        void load();
        return () => { cancelled = true; };
    }, [cohortId, reloadTick]);

    useQueryInvalidation(COHORT_SCOPES, () => { setReloadTick((t) => t + 1); });

    // Request browser notification permission on mount
    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
            void Notification.requestPermission();
        }
    }, []);

    // Schedule 30-min reminders for upcoming sessions
    useEffect(() => {
        if (!sessions.length) return;
        const timers: ReturnType<typeof setTimeout>[] = [];

        sessions.forEach((session) => {
            const startMs = new Date(session.scheduledAt).getTime();
            const reminderMs = startMs - REMINDER_WINDOW_MS;
            const now = Date.now();
            if (startMs <= now) return; // already past

            const delay = Math.max(0, reminderMs - now);

            timers.push(setTimeout(() => {
                // Browser notification
                if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                    new Notification(`Starting in 30 minutes: ${session.title}`, {
                        body: session.meetingLink ? "Click to join the session" : "Open the app to view details",
                        icon: "/favicon.ico",
                    });
                }
                // In-app toast
                toast(`Session starting soon: "${session.title}"`, "info");
            }, delay));
        });

        return () => timers.forEach(clearTimeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessions]);

    const scheduleReminder = (session: CohortSessionRecord) => {
        const startMs = new Date(session.scheduledAt).getTime();
        const now = Date.now();
        if (startMs <= now) return;

        if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "default") {
                void Notification.requestPermission().then((perm) => {
                    if (perm === "granted") scheduleReminder(session);
                });
                return;
            }
            if (Notification.permission === "denied") {
                toast("Enable browser notifications to get reminders", "error");
                return;
            }
        }
        setRemindedIds((prev) => new Set([...prev, session.id]));
        toast(`Reminder set for 30 min before "${session.title}"`, "success");
    };

    const upcomingSessions = useMemo(
        () => sessions.filter(isSessionUpcoming),
        [sessions],
    );
    const recordedSessions = useMemo(
        () => sessions.filter((s) => Boolean(s.recordingUrl)),
        [sessions],
    );

    const tabs: { id: CohortTab; label: string }[] = [
        { id: "sessions", label: "Sessions" },
        { id: "resources", label: "Resources" },
        { id: "members", label: "Members" },
        { id: "messages", label: "Messages" },
    ];

    return (
        <ErrorBoundary>
            <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
                {isLoading ? (
                    <div className="rounded-2xl border border-stone-200 bg-white p-12 flex items-center justify-center gap-2 text-stone-500">
                        <Loader2 size={18} className="animate-spin" /> Loading cohort details...
                    </div>
                ) : error ? (
                    <EmptyState icon={Users} heading="Cohort unavailable" description={error} variant="plain" />
                ) : cohort ? (
                    <>
                        <div>
                            <h1 className="text-3xl font-bold text-stone-900 mb-2">{cohort.name}</h1>
                            <p className="text-lg text-stone-500">
                                {cohort.description || "Your cohort workspace for sessions, resources, and members."}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 border-b border-stone-200 pb-2">
                            {tabs.map(({ id, label }) => (
                                <button key={id} onClick={() => setTab(id)}
                                    className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === id ? "bg-brand-50 text-brand-700" : "text-stone-500 hover:text-stone-800"}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* === Sessions === */}
                        {tab === "sessions" && (
                            <div className="space-y-6">
                                <section className="space-y-4">
                                    <h2 className="text-xl font-bold text-stone-900">Upcoming Sessions</h2>
                                    {upcomingSessions.length === 0 ? (
                                        <EmptyState icon={Calendar} heading="No upcoming sessions" description="New sessions will appear here once they are scheduled." variant="plain" />
                                    ) : (
                                        <div className="space-y-3">
                                            {upcomingSessions.map((session) => {
                                                const minutesUntil = getMinutesUntil(session);
                                                const startingSoon = minutesUntil > 0 && minutesUntil <= 30;
                                                const isReminded = remindedIds.has(session.id);

                                                return (
                                                    <article key={session.id}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() => setDetailSession(session)}
                                                        onKeyDown={(e) => e.key === "Enter" && setDetailSession(session)}
                                                        className={`rounded-2xl border bg-white p-5 cursor-pointer transition-all hover:shadow-md ${startingSoon ? "border-brand-300 ring-1 ring-brand-200" : "border-stone-200 hover:border-brand-200"}`}
                                                    >
                                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="text-lg font-semibold text-stone-900">{session.title}</h3>
                                                                    {startingSoon && (
                                                                        <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 animate-pulse">
                                                                            Starting soon
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-stone-500">{formatTimeRange(session.scheduledAt, session.durationMinutes)}</p>
                                                                {session.host && <p className="text-sm text-stone-400 mt-0.5">Host: {session.host}</p>}
                                                            </div>
                                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                                {session.meetingLink && (
                                                                    <a href={session.meetingLink} target="_blank" rel="noreferrer"
                                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-800 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 transition-colors"
                                                                    >
                                                                        Join <ExternalLink size={14} />
                                                                    </a>
                                                                )}
                                                                <button
                                                                    onClick={() => scheduleReminder(session)}
                                                                    title={isReminded ? "Reminder set" : "Set 30-min reminder"}
                                                                    aria-label={isReminded ? "Reminder set" : "Set 30-min reminder"}
                                                                    className={`p-2 rounded-xl transition-colors ${isReminded ? "bg-brand-100 text-brand-700" : "text-stone-400 hover:text-brand-700 hover:bg-brand-50 border border-stone-200"}`}
                                                                >
                                                                    {isReminded ? <BellRing size={16} /> : <Bell size={16} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </article>
                                                );
                                            })}
                                        </div>
                                    )}
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xl font-bold text-stone-900">Recordings</h2>
                                    {recordedSessions.length === 0 ? (
                                        <EmptyState icon={Clock} heading="No recordings yet" description="Recorded sessions will appear here after they are uploaded." variant="plain" />
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {recordedSessions.map((session) => (
                                                <a key={session.id} href={session.recordingUrl ?? "#"} target="_blank" rel="noreferrer"
                                                    className="rounded-2xl border border-stone-200 bg-white p-4 hover:border-brand-300 transition-colors"
                                                >
                                                    <p className="font-semibold text-stone-900">{session.title}</p>
                                                    <p className="text-sm text-stone-500 mt-1">
                                                        {new Date(session.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                    </p>
                                                    <p className="text-sm text-brand-700 mt-2 inline-flex items-center gap-1">Watch recording <ExternalLink size={14} /></p>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>
                        )}

                        {/* === Resources === */}
                        {tab === "resources" && (
                            <div className="space-y-4">
                                {resources.length === 0 ? (
                                    <EmptyState icon={FileText} heading="No resources yet" description="Resources shared by your cohort facilitator will appear here." variant="plain" />
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {resources.map((resource) => {
                                            const isLink = resource.accessType === "link";
                                            return <a key={resource.id} href={resource.url} target={isLink ? "_blank" : undefined} rel="noopener noreferrer" download={isLink ? undefined : resource.title}
                                                className="rounded-2xl border border-stone-200 bg-white p-4 hover:border-brand-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-stone-100 rounded-xl text-stone-500 flex-shrink-0"><FileText size={18} /></div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-stone-900 truncate">{resource.title}</p>
                                                        {resource.description && <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{resource.description}</p>}
                                                        <p className="text-xs text-brand-700 mt-1.5 inline-flex items-center gap-1">
                                                            {isLink ? <>Open <ExternalLink size={11} /></> : <>Download <Download size={11} /></>}
                                                        </p>
                                                    </div>
                                                </div>
                                            </a>;
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* === Members === */}
                        {tab === "members" && (
                            <div className="space-y-3">
                                {members.length === 0 ? (
                                    <EmptyState icon={Users} heading="No members yet" description="Cohort members will appear here." variant="plain" />
                                ) : (
                                    members.map((member) => (
                                        <div key={member.userId} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4">
                                            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                                                {buildCohortMembersLabel(member)[0]?.toUpperCase() ?? "M"}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-stone-900 truncate">{buildCohortMembersLabel(member)}</p>
                                                <p className="text-xs text-stone-400 truncate">{member.email}</p>
                                            </div>
                                            {member.role && (
                                                <span className="ml-auto flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full bg-brand-100 text-brand-700">{member.role}</span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* === Messages === */}
                        {tab === "messages" && (
                            effectiveCommunityGroupId
                                ? <CohortMessagesTab communityGroupId={effectiveCommunityGroupId} />
                                : <EmptyState icon={MessageSquare} heading="Messages not set up" description="An admin needs to link a community group to this cohort to enable messaging." variant="plain" />
                        )}
                    </>
                ) : null}
            </div>

            {/* Session detail modal */}
            {detailSession && (
                <MemberSessionDetailModal
                    session={detailSession}
                    onClose={() => setDetailSession(null)}
                    onRemind={() => { scheduleReminder(detailSession); }}
                    isReminded={remindedIds.has(detailSession.id)}
                />
            )}
        </ErrorBoundary>
    );
}

// ── Member session detail modal ────────────────────────────────────────

function MemberSessionDetailModal({
    session,
    onClose,
    onRemind,
    isReminded,
}: {
    session: CohortSessionRecord;
    onClose: () => void;
    onRemind: () => void;
    isReminded: boolean;
}) {
    const isUpcoming = isSessionUpcoming(session);
    const minutesUntil = getMinutesUntil(session);
    const startingSoon = isUpcoming && minutesUntil <= 30;
    const platformLabel = session.meetingPlatform === "ZOOM" ? "Zoom" : session.meetingPlatform === "GOOGLE_MEET" ? "Google Meet" : session.meetingPlatform ? "Other" : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-50 rounded-xl text-brand-700"><Video size={20} /></div>
                        <h2 className="text-lg font-bold text-stone-900">Session Details</h2>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600" aria-label="Close"><X size={20} /></button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5 overflow-y-auto">
                    <div className="flex flex-wrap items-center gap-2">
                        {isUpcoming ? (
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${startingSoon ? "bg-brand-100 text-brand-700 animate-pulse" : "bg-emerald-100 text-emerald-700"}`}>
                                {startingSoon ? "Starting soon" : "Upcoming"}
                            </span>
                        ) : (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-500">Completed</span>
                        )}
                        {platformLabel && (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">{platformLabel}</span>
                        )}
                    </div>

                    <h3 className="text-2xl font-bold text-stone-900">{session.title}</h3>
                    {session.description && <p className="text-sm text-stone-600 leading-relaxed">{session.description}</p>}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 bg-stone-50 rounded-xl p-3 border border-stone-100">
                            <Calendar size={15} className="text-stone-400 flex-shrink-0" />
                            <span className="text-sm text-stone-700">{new Date(session.scheduledAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-stone-50 rounded-xl p-3 border border-stone-100">
                            <Clock size={15} className="text-stone-400 flex-shrink-0" />
                            <span className="text-sm text-stone-700">{new Date(session.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-stone-50 rounded-xl p-3 border border-stone-100">
                            <Clock size={15} className="text-stone-400 flex-shrink-0" />
                            <span className="text-sm text-stone-700">{session.durationMinutes} min</span>
                        </div>
                        {session.host && (
                            <div className="flex items-center gap-2 bg-stone-50 rounded-xl p-3 border border-stone-100">
                                <Users size={15} className="text-stone-400 flex-shrink-0" />
                                <span className="text-sm text-stone-700 truncate">{session.host}</span>
                            </div>
                        )}
                    </div>

                    {session.meetingLink && isUpcoming && (
                        <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
                            <p className="text-xs font-bold uppercase tracking-wide text-brand-500 mb-2">{platformLabel ?? "Meeting link"}</p>
                            <a href={session.meetingLink} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors"
                            >
                                <ExternalLink size={16} /> Join session
                            </a>
                        </div>
                    )}

                    {session.recordingUrl && (
                        <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                            <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-2">Recording</p>
                            <a href={session.recordingUrl} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-stone-700 rounded-xl font-semibold text-sm hover:bg-stone-100 transition-colors border border-stone-200"
                            >
                                <Video size={16} /> Watch recording
                            </a>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {isUpcoming && (
                    <div className="flex gap-3 p-6 border-t border-stone-100 bg-stone-50">
                        <button onClick={() => { onRemind(); onClose(); }}
                            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${isReminded ? "bg-brand-100 text-brand-700" : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"}`}
                        >
                            {isReminded ? <BellRing size={16} /> : <Bell size={16} />}
                            {isReminded ? "Reminder set" : "Remind me 30 min before"}
                        </button>
                        {session.meetingLink && (
                            <a href={session.meetingLink} target="_blank" rel="noreferrer"
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-brand-800 text-white hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <ExternalLink size={16} /> Join session
                            </a>
                        )}
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-white transition-colors">Close</button>
                    </div>
                )}
                {!isUpcoming && (
                    <div className="flex gap-3 p-6 border-t border-stone-100 bg-stone-50">
                        <button onClick={onClose} className="flex-1 px-5 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-white transition-colors">Close</button>
                    </div>
                )}
            </div>
        </div>
    );
}
