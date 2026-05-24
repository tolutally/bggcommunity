"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Users,
    Calendar,
    Clock,
    CheckCircle2,
    MoreHorizontal,
    FileText,
    Video,
    Download,
    Search,
    Plus,
    Mail,
    UserPlus,
    BarChart3,
    GraduationCap,
    Settings,
    Pencil,
    Loader2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useToast } from "@/components/ui/toast";
import {
    useAttachCohortSessionRecording,
    useUpdateCohortSession,
} from "@/hooks/use-admin-cohorts";
import {
    buildCohortMembersLabel,
    fetchAdminCohortStats,
    fetchCohortDetail,
    fetchCohortMembers,
    fetchCohortResources,
    fetchCohortSessions,
    getCohortsErrorMessage,
    resolveCohortIdFromSlug,
    type AdminCohortStatsRecord,
    type CohortMemberRecord,
    type CohortRecord,
    type CohortResourceRecord,
    type CohortSessionRecord,
} from "@/lib/cohorts";

type Tab = "overview" | "members" | "sessions" | "resources";

function progressClass(value: number) {
    if (value >= 100) return "w-full";
    if (value >= 90) return "w-11/12";
    if (value >= 80) return "w-10/12";
    if (value >= 75) return "w-9/12";
    if (value >= 66) return "w-8/12";
    if (value >= 58) return "w-7/12";
    if (value >= 50) return "w-6/12";
    if (value >= 42) return "w-5/12";
    if (value >= 33) return "w-4/12";
    if (value >= 25) return "w-3/12";
    if (value >= 16) return "w-2/12";
    if (value > 0) return "w-1/12";
    return "w-0";
}

export default function AdminCohortDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [memberSearch, setMemberSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cohort, setCohort] = useState<CohortRecord | null>(null);
    const [resolvedCohortId, setResolvedCohortId] = useState<string | null>(null);
    const [members, setMembers] = useState<CohortMemberRecord[]>([]);
    const [sessions, setSessions] = useState<CohortSessionRecord[]>([]);
    const [resources, setResources] = useState<CohortResourceRecord[]>([]);
    const [stats, setStats] = useState<AdminCohortStatsRecord | null>(null);
    const { toast } = useToast();

    const cohortIdForMutations = resolvedCohortId ?? slug;
    const { trigger: updateSession, isLoading: isUpdatingSession } = useUpdateCohortSession(cohortIdForMutations);
    const { trigger: attachSessionRecording, isLoading: isAttachingRecording } = useAttachCohortSessionRecording(cohortIdForMutations);

    useEffect(() => {
        let cancelled = false;

        async function loadPage() {
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

                let cohortStats: AdminCohortStatsRecord | null = null;
                try {
                    cohortStats = await fetchAdminCohortStats(cohortId, getToken);
                } catch {
                    cohortStats = null;
                }

                if (cancelled) {
                    return;
                }

                setCohort(cohortDetail);
                setResolvedCohortId(cohortId);
                setMembers(cohortMembers);
                setSessions(cohortSessions);
                setResources(cohortResources);
                setStats(cohortStats);
            } catch (loadError) {
                if (!cancelled) {
                    setError(getCohortsErrorMessage(loadError));
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadPage();

        return () => {
            cancelled = true;
        };
    }, [getToken, slug]);

    const filteredMembers = useMemo(() => members.filter((member) => {
        const query = memberSearch.trim().toLowerCase();
        if (!query) {
            return true;
        }

        return buildCohortMembersLabel(member).toLowerCase().includes(query) || member.email.toLowerCase().includes(query);
    }), [memberSearch, members]);

    const upcomingSessions = useMemo(
        () => sessions.filter((session) => new Date(session.scheduledAt).getTime() >= Date.now()),
        [sessions],
    );
    const completedSessions = useMemo(
        () => sessions.filter((session) => new Date(session.scheduledAt).getTime() < Date.now() || Boolean(session.recordingUrl)),
        [sessions],
    );

    if (isLoading) {
        return (
            <ErrorBoundary>
                <div className="p-10 max-w-[1400px] mx-auto">
                    <div className="rounded-2xl border border-stone-200 bg-white p-8 text-stone-500 flex items-center gap-2">
                        <Loader2 size={18} className="animate-spin" /> Loading cohort details...
                    </div>
                </div>
            </ErrorBoundary>
        );
    }

    if (error || !cohort) {
        return (
            <ErrorBoundary>
                <div className="p-10 max-w-[1400px] mx-auto">
                    <EmptyState icon={GraduationCap} heading="Cohort unavailable" description={error ?? "Cohort not found."} />
                </div>
            </ErrorBoundary>
        );
    }

    const tabs: { key: Tab; label: string; count?: number }[] = [
        { key: "overview", label: "Overview" },
        { key: "members", label: "Members", count: members.length },
        { key: "sessions", label: "Sessions", count: sessions.length },
        { key: "resources", label: "Resources", count: resources.length },
    ];

    const startDateLabel = cohort.startDate ? new Date(cohort.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD";
    const endDateLabel = cohort.endDate ? new Date(cohort.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD";
    const activeRate = stats?.activeRate ?? cohort.activeRate ?? 0;
    const sessionsDone = stats?.sessionsDone ?? completedSessions.length;
    const memberCount = stats?.memberCount ?? cohort.memberCount ?? members.length;

    const refreshSessions = async () => {
        const latestSessions = await fetchCohortSessions(cohortIdForMutations, getToken);
        setSessions(latestSessions);
    };

    const handleEditSession = async (session: CohortSessionRecord) => {
        const title = window.prompt("Update session title", session.title);
        if (title === null) return;

        const meetingLink = window.prompt("Update meeting link (optional)", session.meetingLink ?? "");
        if (meetingLink === null) return;

        try {
            const response = await updateSession(session.id, {
                title: title.trim() || session.title,
                meetingLink: meetingLink.trim() || undefined,
            });
            if (response?.data) await refreshSessions();
            toast("Session updated");
        } catch {
            toast("Could not update session", "error");
        }
    };

    const handleAttachRecording = async (session: CohortSessionRecord) => {
        const recordingUrl = window.prompt("Paste the YouTube recording URL", session.recordingUrl ?? "");
        if (!recordingUrl || !recordingUrl.trim()) return;

        try {
            const response = await attachSessionRecording(session.id, recordingUrl.trim());
            if (response?.data) await refreshSessions();
            toast("Recording attached");
        } catch {
            toast("Could not attach recording", "error");
        }
    };

    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-6">
            {/* Back + Header */}
            <Link
                href="/admin/cohorts"
                className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-brand-700 transition-colors mb-2"
            >
                <ArrowLeft size={16} /> Back to Cohorts
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-brand-50 text-brand-700 rounded-2xl">
                        <GraduationCap size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl md:text-3xl font-bold text-stone-900">{cohort.name}</h1>
                            {cohort.status ? <StatusBadge label={cohort.status} preset={cohort.status as never} variant="pill" /> : null}
                        </div>
                        <p className="text-stone-500 text-sm mt-1">{cohort.track ?? "General"} Track &bull; {startDateLabel} - {endDateLabel}</p>
                    </div>
                </div>
                <div className="flex gap-2 self-start">
                    <button className="px-4 py-2.5 bg-white border border-stone-200 text-stone-600 rounded-xl font-semibold text-sm hover:bg-stone-50 transition-colors flex items-center gap-2">
                        <Settings size={16} /> Settings
                    </button>
                    <button className="px-4 py-2.5 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors flex items-center gap-2">
                        <UserPlus size={16} /> Add Members
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-stone-200 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-3 text-sm font-semibold transition-colors whitespace-nowrap border-b-2 ${
                            activeTab === tab.key
                                ? "border-brand-600 text-brand-700"
                                : "border-transparent text-stone-500 hover:text-stone-700"
                        }`}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className="ml-2 text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* === Overview Tab === */}
            {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                            <h3 className="font-bold text-stone-900 mb-2">About this Cohort</h3>
                            <p className="text-stone-600 text-sm leading-relaxed">{cohort.description ?? "No description available yet."}</p>
                        </div>

                        {/* Progress */}
                        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-stone-900">Current Phase</h3>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                    cohort.health === "High" ? "bg-emerald-100 text-emerald-700" : cohort.health === "Low" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                                }`}>
                                    {cohort.health ?? "Unknown"} Health
                                </span>
                            </div>
                            <div className="bg-stone-50 rounded-xl p-4">
                                <p className="text-sm font-bold text-stone-800 mb-3">{cohort.phase ?? "In progress"}</p>
                                <div className="w-full bg-stone-200 rounded-full h-2 mb-2">
                                    <div
                                        className={`bg-brand-600 h-2 rounded-full transition-all ${progressClass(activeRate)}`}
                                    ></div>
                                </div>
                                <p className="text-xs text-stone-500">{activeRate}% member activity rate</p>
                            </div>
                        </div>

                        {/* Upcoming Sessions Preview */}
                        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-stone-900">Upcoming Sessions</h3>
                                <button onClick={() => setActiveTab("sessions")} className="text-sm text-brand-600 font-semibold hover:text-brand-800">
                                    View all
                                </button>
                            </div>
                            <div className="space-y-3">
                                {upcomingSessions.length === 0 ? (
                                    <EmptyState
                                        icon={Video}
                                        heading="No upcoming sessions"
                                        description="Schedule a new session for this cohort."
                                        variant="plain"
                                        action={{ label: "Schedule Session", onClick: () => setActiveTab("sessions") }}
                                        className="py-4"
                                    />
                                ) : (
                                    upcomingSessions.map((session) => (
                                        <div key={session.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-brand-100 text-brand-700 rounded-lg">
                                                    <Video size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-stone-800">{session.title}</p>
                                                    <p className="text-xs text-stone-500">{new Date(session.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} &bull; {new Date(session.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium text-stone-500">{session.attendeeCount} RSVPs</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column — Stats */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-5">
                            <h3 className="font-bold text-stone-900">Cohort Stats</h3>
                            <div className="space-y-4">
                                <StatRow icon={Users} label="Members" value={`${memberCount} / ${cohort.maxMembers ?? "-"}`} />
                                <StatRow icon={Calendar} label="Start" value={startDateLabel} />
                                <StatRow icon={Calendar} label="End" value={endDateLabel} />
                                <StatRow icon={Clock} label="Phase" value={cohort.phase ?? "In progress"} />
                                <StatRow icon={BarChart3} label="Active Rate" value={`${activeRate}%`} />
                                <StatRow icon={CheckCircle2} label="Sessions Done" value={`${sessionsDone}`} />
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                            <h3 className="font-bold text-stone-900 mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-sm font-medium text-stone-700">
                                    <Mail size={16} className="text-stone-400" /> Send Announcement
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-sm font-medium text-stone-700">
                                    <Plus size={16} className="text-stone-400" /> Schedule Session
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-sm font-medium text-stone-700">
                                    <FileText size={16} className="text-stone-400" /> Upload Resource
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-sm font-medium text-stone-700">
                                    <UserPlus size={16} className="text-stone-400" /> Add Members
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* === Members Tab === */}
            {activeTab === "members" && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none"
                            />
                        </div>
                        <button className="px-5 py-2.5 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors flex items-center gap-2">
                            <UserPlus size={16} /> Add Members
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px]">
                                <thead>
                                    <tr className="border-b border-stone-100 bg-stone-50">
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Member</th>
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Role</th>
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Status</th>
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Progress</th>
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Joined</th>
                                        <th className="text-right text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {filteredMembers.map((member) => (
                                        <tr key={member.userId} className="hover:bg-stone-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <AvatarInitials name={buildCohortMembersLabel(member)} src={member.avatarUrl ?? undefined} size="sm" />
                                                    <span className="font-semibold text-stone-900 text-sm">{buildCohortMembersLabel(member)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                                    member.role === "FACILITATOR" ? "bg-brand-100 text-brand-700" : "bg-stone-100 text-stone-600"
                                                }`}>
                                                    {member.role ?? "Member"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge label="Active" preset="Active" variant="pill" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 bg-stone-200 rounded-full h-1.5">
                                                        <div className={`bg-brand-600 h-1.5 rounded-full ${progressClass(member.progress ?? 0)}`}></div>
                                                    </div>
                                                    <span className="text-xs font-medium text-stone-600">{member.progress ?? 0}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-500">{member.joinedAt ? new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button title="Open member actions" aria-label="Open member actions" className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredMembers.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-sm text-stone-500">No members found for this search.</td>
                                        </tr>
                                    ) : null}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* === Sessions Tab === */}
            {activeTab === "sessions" && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-stone-900">All Sessions</h3>
                        <button className="px-5 py-2.5 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors flex items-center gap-2">
                            <Plus size={16} /> Schedule Session
                        </button>
                    </div>

                    {upcomingSessions.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Upcoming</p>
                            <div className="space-y-3">
                                {upcomingSessions.map((session) => (
                                    <div key={session.id} className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm flex items-center justify-between hover:border-brand-200 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-brand-50 text-brand-700">
                                                <Video size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-stone-900">{session.title}</h4>
                                                <p className="text-sm text-stone-500">{new Date(session.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} &bull; {new Date(session.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-stone-500">{session.attendeeCount} RSVPs</span>
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase bg-blue-50 text-blue-700">
                                                <StatusBadge label="Upcoming" preset="Upcoming" variant="tag" />
                                            </span>
                                            <button
                                                onClick={() => void handleAttachRecording(session)}
                                                title="Attach recording"
                                                aria-label="Attach recording"
                                                disabled={isAttachingRecording}
                                                className="p-1.5 text-stone-400 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {isAttachingRecording ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                                            </button>
                                            <button
                                                onClick={() => void handleEditSession(session)}
                                                title="Edit session"
                                                aria-label="Edit session"
                                                disabled={isUpdatingSession}
                                                className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <Pencil size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {completedSessions.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Completed</p>
                            <div className="space-y-3">
                                {completedSessions.map((session) => (
                                    <div key={session.id} className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm flex items-center justify-between hover:border-stone-200 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-stone-100 text-stone-500">
                                                <Video size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-stone-900">{session.title}</h4>
                                                <p className="text-sm text-stone-500">{new Date(session.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} &bull; {new Date(session.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-stone-500">{session.attendeeCount} attended</span>
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase bg-stone-100 text-stone-500">
                                                <StatusBadge label="Completed" preset="Completed" variant="tag" />
                                            </span>
                                            <button
                                                onClick={() => void handleAttachRecording(session)}
                                                title="Attach recording"
                                                aria-label="Attach recording"
                                                disabled={isAttachingRecording}
                                                className="p-1.5 text-stone-400 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {isAttachingRecording ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* === Resources Tab === */}
            {activeTab === "resources" && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-stone-900">Resources</h3>
                        <button className="px-5 py-2.5 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors flex items-center gap-2">
                            <Plus size={16} /> Upload Resource
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[500px]">
                                <thead>
                                    <tr className="border-b border-stone-100 bg-stone-50">
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Name</th>
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Type</th>
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Size</th>
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Date</th>
                                        <th className="text-right text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {resources.map((resource) => {
                                        const typeColors: Record<string, string> = {
                                            PDF: "bg-rose-100 text-rose-700",
                                            VIDEO: "bg-blue-100 text-blue-700",
                                            ZIP: "bg-amber-100 text-amber-700",
                                        };
                                        const fileType = resource.type ?? "LINK";
                                        return (
                                            <tr key={resource.id} className="hover:bg-stone-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <FileText size={18} className="text-stone-400" />
                                                        <span className="font-semibold text-stone-900 text-sm">{resource.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${typeColors[fileType] || "bg-stone-100 text-stone-600"}`}>
                                                        {fileType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-stone-500">{resource.size ?? "-"}</td>
                                                <td className="px-6 py-4 text-sm text-stone-500">{resource.createdAt ? new Date(resource.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <a href={resource.url} target="_blank" rel="noreferrer" title="Download resource" aria-label="Download resource" className="p-2 inline-block text-stone-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                                                        <Download size={16} />
                                                    </a>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {resources.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-sm text-stone-500">No resources have been added for this cohort yet.</td>
                                        </tr>
                                    ) : null}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </ErrorBoundary>
    );
}

function StatRow({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-500">
                <Icon size={15} />
                <span className="text-sm">{label}</span>
            </div>
            <span className="text-sm font-semibold text-stone-800">{value}</span>
        </div>
    );
}
