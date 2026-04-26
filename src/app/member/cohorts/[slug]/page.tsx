"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    Calendar,
    CheckCircle,
    Clock,
    ExternalLink,
    FileText,
    Loader2,
    Users,
} from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useQueryInvalidation } from "@/hooks/useQueryInvalidation";
import {
    buildCohortMembersLabel,
    fetchCohortDetail,
    fetchCohortMembers,
    fetchCohortResources,
    fetchCohortSessions,
    getCohortsErrorMessage,
    resolveCohortIdFromSlug,
    toggleCohortSessionRsvp,
    type CohortMemberRecord,
    type CohortRecord,
    type CohortResourceRecord,
    type CohortSessionRecord,
} from "@/lib/cohorts";
import { invalidateQuery } from "@/lib/queryInvalidation";

type CohortTab = "sessions" | "resources" | "members";

function formatTimeRange(value: string, durationMinutes: number) {
    const start = new Date(value);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    return `${start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · ${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} - ${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

export default function MemberCohortPage() {
    const { slug } = useParams<{ slug: string }>();
    const { getToken } = useAuth();
    const { toast } = useToast();

    const [tab, setTab] = useState<CohortTab>("sessions");
    const [cohort, setCohort] = useState<CohortRecord | null>(null);
    const [members, setMembers] = useState<CohortMemberRecord[]>([]);
    const [sessions, setSessions] = useState<CohortSessionRecord[]>([]);
    const [resources, setResources] = useState<CohortResourceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busySessionId, setBusySessionId] = useState<string | null>(null);
    const [mutationError, setMutationError] = useState<string | null>(null);
    const [retryMutation, setRetryMutation] = useState<(() => void) | null>(null);

    const runWithRetry = (message: string, retry: () => void) => {
        setMutationError(message);
        setRetryMutation(() => retry);
    };

    const clearMutationError = () => {
        setMutationError(null);
        setRetryMutation(null);
    };

    const loadCohortPage = useMemo(() => {
        let cancelled = false;

        const run = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const resolved = await resolveCohortIdFromSlug(slug);
                const cohortId = resolved?.id ?? slug;

                const [cohortDetail, cohortMembers, cohortSessions, cohortResources] = await Promise.all([
                    fetchCohortDetail(cohortId),
                    fetchCohortMembers(cohortId),
                    fetchCohortSessions(cohortId, getToken),
                    fetchCohortResources(cohortId),
                ]);

                if (cancelled) {
                    return;
                }

                setCohort(cohortDetail);
                setMembers(cohortMembers);
                setSessions(cohortSessions);
                setResources(cohortResources);
            } catch (loadError) {
                if (!cancelled) {
                    setError(getCohortsErrorMessage(loadError));
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        return {
            run,
            cancel: () => {
                cancelled = true;
            },
        };
    }, [getToken, slug]);

    useEffect(() => {
        void loadCohortPage.run();

        return () => {
            loadCohortPage.cancel();
        };
    }, [loadCohortPage]);

    const cohortInvalidationScopes = useMemo(() => ["cohorts"] as const, []);
    useQueryInvalidation([...cohortInvalidationScopes], async () => {
        await loadCohortPage.run();
    });

    const upcomingSessions = useMemo(
        () => sessions.filter((session) => new Date(session.scheduledAt).getTime() >= Date.now()),
        [sessions],
    );

    const recordedSessions = useMemo(
        () => sessions.filter((session) => Boolean(session.recordingUrl)),
        [sessions],
    );

    const handleSessionRsvp = async (sessionId: string) => {
        if (!cohort || busySessionId === sessionId) {
            return;
        }

        clearMutationError();
        const previousSessions = sessions;
        const currentSession = sessions.find((session) => session.id === sessionId);
        const optimisticRsvp = !(currentSession?.hasRsvp ?? false);
        setSessions((prev) => prev.map((session) => session.id === sessionId ? { ...session, hasRsvp: optimisticRsvp } : session));
        setBusySessionId(sessionId);

        try {
            const rsvped = await toggleCohortSessionRsvp(cohort.id, sessionId, getToken);
            setSessions((prev) => prev.map((session) => session.id === sessionId ? { ...session, hasRsvp: rsvped } : session));
            invalidateQuery("cohorts");
            toast(rsvped ? "RSVP saved" : "RSVP removed");
        } catch (toggleError) {
            setSessions(previousSessions);
            const message = getCohortsErrorMessage(toggleError);
            runWithRetry(message, () => {
                void handleSessionRsvp(sessionId);
            });
            toast(message, "error");
        } finally {
            setBusySessionId(null);
        }
    };

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
                            <p className="text-lg text-stone-500">{cohort.description || "Your cohort workspace for sessions, resources, and members."}</p>
                        </div>

                        <div className="flex items-center gap-3 border-b border-stone-200 pb-2">
                            <button
                                onClick={() => setTab("sessions")}
                                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === "sessions" ? "bg-brand-50 text-brand-700" : "text-stone-500 hover:text-stone-800"}`}
                            >
                                Sessions
                            </button>
                            <button
                                onClick={() => setTab("resources")}
                                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === "resources" ? "bg-brand-50 text-brand-700" : "text-stone-500 hover:text-stone-800"}`}
                            >
                                Resources
                            </button>
                            <button
                                onClick={() => setTab("members")}
                                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === "members" ? "bg-brand-50 text-brand-700" : "text-stone-500 hover:text-stone-800"}`}
                            >
                                Members
                            </button>
                        </div>

                        {mutationError ? (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-center justify-between gap-3">
                                <p className="text-sm text-red-700">{mutationError}</p>
                                {retryMutation ? (
                                    <button
                                        onClick={() => {
                                            clearMutationError();
                                            retryMutation();
                                        }}
                                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                                    >
                                        Retry
                                    </button>
                                ) : null}
                            </div>
                        ) : null}

                        {tab === "sessions" ? (
                            <div className="space-y-6">
                                <section className="space-y-4">
                                    <h2 className="text-xl font-bold text-stone-900">Upcoming Sessions</h2>
                                    {upcomingSessions.length === 0 ? (
                                        <EmptyState icon={Calendar} heading="No upcoming sessions" description="New sessions will appear here once they are scheduled." variant="plain" />
                                    ) : (
                                        <div className="space-y-3">
                                            {upcomingSessions.map((session) => (
                                                <article key={session.id} className="rounded-2xl border border-stone-200 bg-white p-5">
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-stone-900">{session.title}</h3>
                                                            <p className="text-sm text-stone-500 mt-1">{formatTimeRange(session.scheduledAt, session.durationMinutes)}</p>
                                                            <p className="text-sm text-stone-500 mt-1">Host: {session.host}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {session.meetingLink && session.hasRsvp ? (
                                                                <a href={session.meetingLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">
                                                                    Join <ExternalLink size={14} />
                                                                </a>
                                                            ) : null}
                                                            <button
                                                                onClick={() => void handleSessionRsvp(session.id)}
                                                                disabled={busySessionId === session.id}
                                                                className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-brand-300 hover:text-brand-700 disabled:opacity-60"
                                                            >
                                                                {busySessionId === session.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                                {session.hasRsvp ? "Going" : "RSVP"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </article>
                                            ))}
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
                                                <a key={session.id} href={session.recordingUrl ?? "#"} target="_blank" rel="noreferrer" className="rounded-2xl border border-stone-200 bg-white p-4 hover:border-brand-300 transition-colors">
                                                    <p className="font-semibold text-stone-900">{session.title}</p>
                                                    <p className="text-sm text-stone-500 mt-1">{new Date(session.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                                                    <p className="text-sm text-brand-700 mt-2 inline-flex items-center gap-1">Watch recording <ExternalLink size={14} /></p>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>
                        ) : null}

                        {tab === "resources" ? (
                            <div className="space-y-3">
                                {resources.length === 0 ? (
                                    <EmptyState icon={FileText} heading="No resources yet" description="Resources shared with your cohort will appear here." variant="plain" />
                                ) : (
                                    resources.map((resource) => (
                                        <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" className="flex items-start justify-between rounded-2xl border border-stone-200 bg-white p-4 hover:border-brand-300 transition-colors">
                                            <div>
                                                <p className="font-semibold text-stone-900">{resource.title}</p>
                                                {resource.description ? <p className="text-sm text-stone-500 mt-1">{resource.description}</p> : null}
                                            </div>
                                            <ExternalLink size={16} className="text-stone-400" />
                                        </a>
                                    ))
                                )}
                            </div>
                        ) : null}

                        {tab === "members" ? (
                            <div className="space-y-3">
                                {members.length === 0 ? (
                                    <EmptyState icon={Users} heading="No members found" description="Member data for this cohort is not available right now." variant="plain" />
                                ) : (
                                    members.map((member) => (
                                        <article key={member.userId} className="rounded-2xl border border-stone-200 bg-white p-4 flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-stone-900">{buildCohortMembersLabel(member)}</p>
                                                <p className="text-sm text-stone-500">{member.email}</p>
                                            </div>
                                            {member.role ? (
                                                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">{member.role}</span>
                                            ) : null}
                                        </article>
                                    ))
                                )}
                            </div>
                        ) : null}
                    </>
                ) : (
                    <EmptyState icon={Users} heading="Cohort not found" description="We could not find this cohort." variant="plain" />
                )}
            </div>
        </ErrorBoundary>
    );
}
