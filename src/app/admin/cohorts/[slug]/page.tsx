"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Users,
    Calendar,
    Clock,
    CheckCircle2,
    FileText,
    Video,
    Download,
    Search,
    Plus,
    Mail,
    UserPlus,
    BarChart3,
    GraduationCap,
    Pencil,
    Loader2,
    X,
    ExternalLink,
    Link2,
    MessageSquare,
    Unlink,
    Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useToast } from "@/components/ui/toast";
import {
    useAttachCohortSessionRecording,
    useUpdateCohortSession,
    useUpdateCohort,
    usePostAnnouncement,
    useCreateCohortSession,
    useCreateCohortResource,
    useAddCohortMembers,
    useAvailableCohortUsers,
    useRemoveCohortMember,
} from "@/hooks/use-admin-cohorts";
import { useCommunityGroups } from "@/hooks/use-community";
import { apiRequest } from "@/lib/api";
import {
    buildCohortMembersLabel,
    fetchAdminCohortStats,
    fetchAdminCohortGroups,
    fetchCohortDetail,
    fetchCohortMembers,
    fetchCohortResources,
    fetchCohortSessions,
    getCohortsErrorMessage,
    resolveCohortIdFromSlug,
    type AdminCohortStatsRecord,
    type CohortGroupRecord,
    type CohortMemberRecord,
    type CohortRecord,
    type CohortResourceRecord,
    type CohortSessionRecord,
} from "@/lib/cohorts";
import type { AvailableUser } from "@/lib/types";

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

function isSessionUpcoming(session: CohortSessionRecord) {
    return new Date(session.scheduledAt).getTime() >= Date.now();
}

/** Tooltip wrapper — shows a dark label above the child on hover */
function Tip({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="relative group/tip">
            {children}
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium bg-stone-800 text-white rounded-lg whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity z-20">
                {label}
            </span>
        </div>
    );
}

export default function AdminCohortDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const { getToken } = useAuth();
    const getTokenRef = useRef(getToken);
    useEffect(() => { getTokenRef.current = getToken; });

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
    const [cohortGroups, setCohortGroups] = useState<CohortGroupRecord[]>([]);
    const { toast } = useToast();

    // Quick-action modal visibility
    const [showAnnounceModal, setShowAnnounceModal] = useState(false);
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [showAddMembersModal, setShowAddMembersModal] = useState(false);

    // Cohort edit
    const [showEditCohortModal, setShowEditCohortModal] = useState(false);

    // Community group link/unlink
    const [showLinkGroupModal, setShowLinkGroupModal] = useState(false);

    // Session detail / edit
    const [detailSession, setDetailSession] = useState<CohortSessionRecord | null>(null);
    const [editSession, setEditSession] = useState<CohortSessionRecord | null>(null);

    const cohortIdForMutations = resolvedCohortId ?? slug;
    const { trigger: attachSessionRecording } = useAttachCohortSessionRecording(cohortIdForMutations);
    const { trigger: removeMember, isLoading: isRemovingMember } = useRemoveCohortMember(cohortIdForMutations);
    const [removeMemberTarget, setRemoveMemberTarget] = useState<CohortMemberRecord | null>(null);

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
                    fetchCohortSessions(cohortId, getTokenRef.current),
                    fetchCohortResources(cohortId),
                ]);

                let cohortStats: AdminCohortStatsRecord | null = null;
                try {
                    cohortStats = await fetchAdminCohortStats(cohortId, getTokenRef.current);
                } catch {
                    cohortStats = null;
                }

                let groups: CohortGroupRecord[] = [];
                try {
                    groups = await fetchAdminCohortGroups(cohortId, getTokenRef.current);
                } catch {
                    groups = [];
                }

                if (cancelled) return;
                setCohort(cohortDetail);
                setResolvedCohortId(cohortId);
                setMembers(cohortMembers);
                setSessions(cohortSessions);
                setResources(cohortResources);
                setStats(cohortStats);
                setCohortGroups(groups);
            } catch (loadError) {
                if (!cancelled) setError(getCohortsErrorMessage(loadError));
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        void loadPage();
        return () => { cancelled = true; };
    }, [slug]);

    const filteredMembers = useMemo(() => members.filter((member) => {
        const query = memberSearch.trim().toLowerCase();
        if (!query) return true;
        return buildCohortMembersLabel(member).toLowerCase().includes(query) || member.email.toLowerCase().includes(query);
    }), [memberSearch, members]);

    const upcomingSessions = useMemo(
        () => sessions.filter((s) => new Date(s.scheduledAt).getTime() >= Date.now()),
        [sessions],
    );
    const completedSessions = useMemo(
        () => sessions.filter((s) => new Date(s.scheduledAt).getTime() < Date.now() || Boolean(s.recordingUrl)),
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
        const latest = await fetchCohortSessions(cohortIdForMutations, getTokenRef.current);
        setSessions(latest);
    };
    const refreshResources = async () => {
        const latest = await fetchCohortResources(cohortIdForMutations);
        setResources(latest);
    };
    const refreshMembers = async () => {
        const latest = await fetchCohortMembers(cohortIdForMutations);
        setMembers(latest);
    };
    const refreshGroups = async () => {
        const latest = await fetchAdminCohortGroups(cohortIdForMutations, getTokenRef.current);
        setCohortGroups(latest);
    };

    const handleRemoveMember = async (userId: string) => {
        try {
            await removeMember(userId);
            setMembers((prev) => prev.filter((m) => m.userId !== userId));
            setRemoveMemberTarget(null);
            toast("Member removed from cohort");
        } catch {
            toast("Could not remove member", "error");
        }
    };

    const handleAttachRecording = async (session: CohortSessionRecord, recordingUrl: string) => {
        try {
            const response = await attachSessionRecording(session.id, recordingUrl.trim());
            if (response?.data) {
                await refreshSessions();
                // Update detailSession if it's the same session
                if (detailSession?.id === session.id) {
                    setDetailSession((prev) => prev ? { ...prev, recordingUrl: recordingUrl.trim() } : prev);
                }
            }
            toast("Recording attached");
        } catch {
            toast("Could not attach recording", "error");
        }
    };

    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-6">
            <Link href="/admin/cohorts" className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-brand-700 transition-colors mb-2">
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
                    <button onClick={() => setShowEditCohortModal(true)} className="px-4 py-2.5 bg-white border border-stone-200 text-stone-600 rounded-xl font-semibold text-sm hover:bg-stone-50 transition-colors flex items-center gap-2">
                        <Pencil size={16} /> Edit Cohort
                    </button>
                    <button onClick={() => setShowAddMembersModal(true)} className="px-4 py-2.5 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors flex items-center gap-2">
                        <UserPlus size={16} /> Add Members
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-stone-200 overflow-x-auto">
                {tabs.map((tab) => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-3 text-sm font-semibold transition-colors whitespace-nowrap border-b-2 ${
                            activeTab === tab.key ? "border-brand-600 text-brand-700" : "border-transparent text-stone-500 hover:text-stone-700"
                        }`}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className="ml-2 text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{tab.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* === Overview Tab === */}
            {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                            <h3 className="font-bold text-stone-900 mb-2">About this Cohort</h3>
                            <p className="text-stone-600 text-sm leading-relaxed">{cohort.description ?? "No description available yet."}</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-stone-900">Current Phase</h3>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                    cohort.health === "High" ? "bg-emerald-100 text-emerald-700" : cohort.health === "Low" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                                }`}>{cohort.health ?? "Unknown"} Health</span>
                            </div>
                            <div className="bg-stone-50 rounded-xl p-4">
                                <p className="text-sm font-bold text-stone-800 mb-3">{cohort.phase ?? "In progress"}</p>
                                <div className="w-full bg-stone-200 rounded-full h-2 mb-2">
                                    <div className={`bg-brand-600 h-2 rounded-full transition-all ${progressClass(activeRate)}`} />
                                </div>
                                <p className="text-xs text-stone-500">{activeRate}% member activity rate</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-stone-900">Upcoming Sessions</h3>
                                <button onClick={() => setActiveTab("sessions")} className="text-sm text-brand-600 font-semibold hover:text-brand-800">View all</button>
                            </div>
                            <div className="space-y-3">
                                {upcomingSessions.length === 0 ? (
                                    <EmptyState icon={Video} heading="No upcoming sessions" description="Schedule a new session for this cohort." variant="plain" action={{ label: "Schedule Session", onClick: () => setShowSessionModal(true) }} className="py-4" />
                                ) : (
                                    upcomingSessions.map((session) => (
                                        <button key={session.id} onClick={() => setDetailSession(session)} className="w-full flex items-center justify-between p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-brand-100 text-brand-700 rounded-lg"><Video size={16} /></div>
                                                <div>
                                                    <p className="text-sm font-semibold text-stone-800">{session.title}</p>
                                                    <p className="text-xs text-stone-500">{new Date(session.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} &bull; {new Date(session.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium text-stone-500">{session.attendeeCount} RSVPs</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

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

                        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={16} className="text-stone-400" />
                                    <h3 className="font-bold text-stone-900">Community Groups</h3>
                                    {cohortGroups.length > 0 && (
                                        <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{cohortGroups.length}</span>
                                    )}
                                </div>
                            </div>
                            {cohortGroups.length > 0 ? (
                                <div className="space-y-2">
                                    {cohortGroups.map((group) => (
                                        <CohortGroupRow
                                            key={group.id}
                                            group={group}
                                            onUnlinked={async () => {
                                                setCohort((prev) => prev ? { ...prev, communityGroupId: null } : prev);
                                                await refreshGroups();
                                                toast("Group unlinked — it is now public again");
                                            }}
                                        />
                                    ))}
                                    <button onClick={() => setShowLinkGroupModal(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-stone-200 text-stone-500 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 text-xs font-semibold transition-colors mt-1">
                                        <Link2 size={13} /> Link Another Group
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 p-3 bg-stone-50 border border-dashed border-stone-200 rounded-xl">
                                        <MessageSquare size={14} className="text-stone-300 flex-shrink-0" />
                                        <p className="text-xs text-stone-400">No group linked</p>
                                    </div>
                                    <p className="text-xs text-stone-500">Link a community group to enable messaging for this cohort&apos;s members.</p>
                                    <button onClick={() => setShowLinkGroupModal(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-brand-800 text-white text-xs font-bold hover:bg-brand-700 transition-colors">
                                        <Link2 size={13} /> Link a Group
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                            <h3 className="font-bold text-stone-900 mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <button onClick={() => setShowAnnounceModal(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-sm font-medium text-stone-700">
                                    <Mail size={16} className="text-stone-400" /> Send Announcement
                                </button>
                                <button onClick={() => setShowSessionModal(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-sm font-medium text-stone-700">
                                    <Plus size={16} className="text-stone-400" /> Schedule Session
                                </button>
                                <button onClick={() => setShowResourceModal(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-sm font-medium text-stone-700">
                                    <FileText size={16} className="text-stone-400" /> Upload Resource
                                </button>
                                <button onClick={() => setShowAddMembersModal(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-sm font-medium text-stone-700">
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
                            <input type="text" placeholder="Search members..." value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
                        </div>
                        <button onClick={() => setShowAddMembersModal(true)} className="px-5 py-2.5 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors flex items-center gap-2">
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
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${member.role === "FACILITATOR" ? "bg-brand-100 text-brand-700" : "bg-stone-100 text-stone-600"}`}>{member.role ?? "Member"}</span>
                                            </td>
                                            <td className="px-6 py-4"><StatusBadge label="Active" preset="Active" variant="pill" /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 bg-stone-200 rounded-full h-1.5">
                                                        <div className={`bg-brand-600 h-1.5 rounded-full ${progressClass(member.progress ?? 0)}`} />
                                                    </div>
                                                    <span className="text-xs font-medium text-stone-600">{member.progress ?? 0}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-500">{member.joinedAt ? new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setRemoveMemberTarget(member)}
                                                    title="Remove member"
                                                    aria-label="Remove member"
                                                    className="p-1.5 text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredMembers.length === 0 && (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-stone-500">No members found.</td></tr>
                                    )}
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
                        <button onClick={() => setShowSessionModal(true)} className="px-5 py-2.5 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors flex items-center gap-2">
                            <Plus size={16} /> Schedule Session
                        </button>
                    </div>

                    {upcomingSessions.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Upcoming</p>
                            <div className="space-y-3">
                                {upcomingSessions.map((session) => (
                                    <SessionRow key={session.id} session={session} variant="upcoming"
                                        onView={() => setDetailSession(session)}
                                        onEdit={() => setEditSession(session)}
                                        onAttachRecording={(url) => void handleAttachRecording(session, url)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {completedSessions.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Completed</p>
                            <div className="space-y-3">
                                {completedSessions.map((session) => (
                                    <SessionRow key={session.id} session={session} variant="completed"
                                        onView={() => setDetailSession(session)}
                                        onEdit={() => setEditSession(session)}
                                        onAttachRecording={(url) => void handleAttachRecording(session, url)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {sessions.length === 0 && (
                        <EmptyState icon={Video} heading="No sessions yet" description="Schedule the first session for this cohort." action={{ label: "Schedule Session", onClick: () => setShowSessionModal(true) }} />
                    )}
                </div>
            )}

            {/* === Resources Tab === */}
            {activeTab === "resources" && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-stone-900">Resources</h3>
                        <button onClick={() => setShowResourceModal(true)} className="px-5 py-2.5 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors flex items-center gap-2">
                            <Plus size={16} /> Upload Resource
                        </button>
                    </div>
                    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[500px]">
                                <thead>
                                    <tr className="border-b border-stone-100 bg-stone-50">
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Name</th>
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Access</th>
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Date</th>
                                        <th className="text-right text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {resources.map((resource) => {
                                        const isLink = resource.accessType === "link";
                                        const activateResource = () => {
                                            if (isLink) {
                                                window.open(resource.url, "_blank", "noopener,noreferrer");
                                                return;
                                            }
                                            const anchor = document.createElement("a");
                                            anchor.href = resource.url;
                                            anchor.download = resource.title;
                                            anchor.rel = "noopener noreferrer";
                                            anchor.click();
                                        };
                                        return (
                                            <tr
                                                key={resource.id}
                                                role="link"
                                                tabIndex={0}
                                                aria-label={`${isLink ? "Open" : "Download"} ${resource.title}`}
                                                onClick={activateResource}
                                                onKeyDown={(event) => {
                                                    if (event.key === "Enter" || event.key === " ") {
                                                        event.preventDefault();
                                                        activateResource();
                                                    }
                                                }}
                                                className="cursor-pointer hover:bg-stone-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <FileText size={18} className="text-stone-400" />
                                                        <span className="font-semibold text-stone-900 text-sm">{resource.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-stone-100 text-stone-600">{isLink ? "LINK" : "DOWNLOAD"}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-stone-500">{new Date(resource.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <a href={resource.url} target={isLink ? "_blank" : undefined} download={isLink ? undefined : resource.title} rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} title={isLink ? "Open resource" : "Download resource"} aria-label={`${isLink ? "Open" : "Download"} ${resource.title}`} className="p-2 inline-block text-stone-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                                                        {isLink ? <ExternalLink size={16} /> : <Download size={16} />}
                                                    </a>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {resources.length === 0 && (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-stone-500">No resources added yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* ── Modals ── */}
        {showLinkGroupModal && cohort && (
            <LinkGroupModal
                cohortId={cohortIdForMutations}
                onClose={() => setShowLinkGroupModal(false)}
                onLinked={async (groupId: string) => {
                    setCohort((prev) => prev ? { ...prev, communityGroupId: groupId } : prev);
                    setShowLinkGroupModal(false);
                    await refreshGroups();
                    toast("Group linked — members can now message each other");
                }}
            />
        )}
        {showEditCohortModal && cohort && (
            <EditCohortModal
                cohort={cohort}
                cohortId={cohortIdForMutations}
                onClose={() => setShowEditCohortModal(false)}
                onSaved={async (updated) => {
                    setCohort(updated);
                    setShowEditCohortModal(false);
                }}
            />
        )}
        {showAnnounceModal && (
            <AnnouncementModal cohortId={cohortIdForMutations} onClose={() => setShowAnnounceModal(false)} onSuccess={() => setShowAnnounceModal(false)} />
        )}
        {showSessionModal && (
            <ScheduleSessionModal cohortId={cohortIdForMutations} onClose={() => setShowSessionModal(false)} onSuccess={async () => { setShowSessionModal(false); await refreshSessions(); }} />
        )}
        {showResourceModal && (
            <UploadResourceModal cohortId={cohortIdForMutations} onClose={() => setShowResourceModal(false)} onSuccess={async () => { setShowResourceModal(false); await refreshResources(); }} />
        )}
        {showAddMembersModal && (
            <AddMembersModal cohortId={cohortIdForMutations} onClose={() => setShowAddMembersModal(false)} onSuccess={async () => { setShowAddMembersModal(false); await refreshMembers(); }} />
        )}
        {removeMemberTarget && (
            <RemoveMemberModal
                member={removeMemberTarget}
                isLoading={isRemovingMember}
                onConfirm={() => void handleRemoveMember(removeMemberTarget.userId)}
                onClose={() => setRemoveMemberTarget(null)}
            />
        )}
        {detailSession && (
            <AdminSessionDetailModal
                session={detailSession}
                cohortId={cohortIdForMutations}
                onClose={() => setDetailSession(null)}
                onEdit={(session) => { setDetailSession(null); setEditSession(session); }}
                onRecordingUpdated={async (url) => {
                    await handleAttachRecording(detailSession, url);
                }}
            />
        )}
        {editSession && (
            <EditSessionModal
                session={editSession}
                cohortId={cohortIdForMutations}
                onClose={() => setEditSession(null)}
                onSaved={async () => { setEditSession(null); await refreshSessions(); }}
            />
        )}
        </ErrorBoundary>
    );
}

// ── Session row (used in sessions tab) ────────────────────────────────

function SessionRow({
    session,
    variant,
    onView,
    onEdit,
    onAttachRecording,
}: {
    session: CohortSessionRecord;
    variant: "upcoming" | "completed";
    onView: () => void;
    onEdit: () => void;
    onAttachRecording: (url: string) => void;
}) {
    const handleAttachClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = window.prompt("Paste the recording URL", session.recordingUrl ?? "");
        if (url && url.trim()) onAttachRecording(url.trim());
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onView}
            onKeyDown={(e) => e.key === "Enter" && onView()}
            className={`bg-white rounded-2xl border p-5 shadow-sm flex items-center justify-between cursor-pointer transition-colors ${
                variant === "upcoming" ? "border-stone-100 hover:border-brand-200" : "border-stone-100 hover:border-stone-200"
            }`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${variant === "upcoming" ? "bg-brand-50 text-brand-700" : "bg-stone-100 text-stone-500"}`}>
                    <Video size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-stone-900">{session.title}</h4>
                    <p className="text-sm text-stone-500">
                        {new Date(session.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} &bull; {new Date(session.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        &nbsp;&mdash;&nbsp;{session.durationMinutes} min
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <span className="text-sm font-medium text-stone-500">
                    {variant === "upcoming" ? `${session.attendeeCount} RSVPs` : `${session.attendeeCount} attended`}
                </span>
                <StatusBadge label={variant === "upcoming" ? "Upcoming" : "Completed"} preset={variant === "upcoming" ? "Upcoming" : "Completed"} variant="tag" />
                <Tip label={session.recordingUrl ? "Update recording" : "Attach recording"}>
                    <button onClick={handleAttachClick} aria-label={session.recordingUrl ? "Update recording" : "Attach recording"}
                        className="p-1.5 text-stone-400 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                    >
                        <Download size={15} />
                    </button>
                </Tip>
                <Tip label="Edit session">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} aria-label="Edit session"
                        className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                        <Pencil size={15} />
                    </button>
                </Tip>
            </div>
        </div>
    );
}

// ── Shared modal layout ────────────────────────────────────────────────

const labelClass = "block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5";
const inputClass = "w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none transition-colors";
const errorClass = "text-xs text-rose-600 mt-1";

function ModalOverlay({ children }: { children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                {children}
            </div>
        </div>
    );
}

// ── Admin session detail modal ─────────────────────────────────────────

function AdminSessionDetailModal({
    session,
    cohortId,
    onClose,
    onEdit,
    onRecordingUpdated,
}: {
    session: CohortSessionRecord;
    cohortId: string;
    onClose: () => void;
    onEdit: (session: CohortSessionRecord) => void;
    onRecordingUpdated: (url: string) => Promise<void>;
}) {
    const { trigger: attachRecording, isLoading: isAttaching } = useAttachCohortSessionRecording(cohortId);
    const { toast } = useToast();
    const [recordingDraft, setRecordingDraft] = useState(session.recordingUrl ?? "");
    const [recordingError, setRecordingError] = useState<string | null>(null);

    const isUpcoming = isSessionUpcoming(session);

    const platformLabel = session.meetingPlatform === "ZOOM" ? "Zoom" : session.meetingPlatform === "GOOGLE_MEET" ? "Google Meet" : session.meetingPlatform ? "Other" : null;

    const handleSaveRecording = async () => {
        if (!recordingDraft.trim()) { setRecordingError("Enter a recording URL"); return; }
        try { new URL(recordingDraft.trim()); } catch { setRecordingError("Enter a valid URL (include https://)"); return; }
        setRecordingError(null);
        try {
            await attachRecording(session.id, recordingDraft.trim());
            await onRecordingUpdated(recordingDraft.trim());
            toast("Recording saved");
        } catch {
            toast("Could not save recording", "error");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
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
                    <div className="flex items-center gap-2 flex-wrap">
                        {isUpcoming ? <StatusBadge label="Upcoming" preset="Upcoming" variant="tag" /> : <StatusBadge label="Completed" preset="Completed" variant="tag" />}
                        {platformLabel ? <StatusBadge label={platformLabel} preset={platformLabel as never} variant="tag" /> : null}
                    </div>
                    <h3 className="text-2xl font-bold text-stone-900">{session.title}</h3>
                    {session.description ? <p className="text-sm text-stone-600 leading-relaxed">{session.description}</p> : null}

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <InfoBox icon={Calendar} label={new Date(session.scheduledAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} />
                        <InfoBox icon={Clock} label={new Date(session.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} />
                        <InfoBox icon={Clock} label={`${session.durationMinutes} min`} />
                        <InfoBox icon={Users} label={`${session.attendeeCount} RSVPs`} />
                    </div>

                    {session.host && (
                        <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                            <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1">Host</p>
                            <p className="font-semibold text-stone-800">{session.host}</p>
                        </div>
                    )}

                    {session.meetingLink && (
                        <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
                            <p className="text-xs font-bold uppercase tracking-wide text-brand-500 mb-2">{platformLabel ?? "Meeting link"}</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors">
                                    <ExternalLink size={16} /> Join meeting
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Inline recording attach */}
                    <div className="bg-white rounded-2xl border border-stone-100 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-sm font-bold text-stone-900">Recording</p>
                                <p className="text-xs text-stone-500">Attach or update the session recording.</p>
                            </div>
                            {isAttaching ? <Loader2 size={16} className="animate-spin text-stone-400" /> : null}
                        </div>
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                                <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                <input type="url" value={recordingDraft} onChange={(e) => setRecordingDraft(e.target.value)} placeholder="https://youtube.com/watch?v=..." aria-label="Recording URL"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${recordingError ? "border-rose-300 bg-rose-50" : "border-stone-200"}`}
                                />
                            </div>
                            <button onClick={() => void handleSaveRecording()} disabled={isAttaching}
                                className="px-4 py-3 rounded-xl text-sm font-bold text-white bg-brand-800 hover:bg-brand-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                            >
                                {isAttaching ? <Loader2 size={16} className="animate-spin" /> : <Video size={16} />}
                                {session.recordingUrl ? "Update" : "Attach"}
                            </button>
                        </div>
                        {recordingError ? <p className="text-rose-500 text-xs mt-2">{recordingError}</p> : null}
                        {session.recordingUrl ? (
                            <a href={session.recordingUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand-700 font-semibold hover:underline">
                                <ExternalLink size={14} /> View current recording
                            </a>
                        ) : null}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-stone-100 bg-stone-50">
                    <button onClick={() => onEdit(session)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors flex items-center justify-center gap-2">
                        <Pencil size={16} /> Edit Session
                    </button>
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-white transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
}

// ── Edit session modal ─────────────────────────────────────────────────

function EditSessionModal({
    session,
    cohortId,
    onClose,
    onSaved,
}: {
    session: CohortSessionRecord;
    cohortId: string;
    onClose: () => void;
    onSaved: () => Promise<void>;
}) {
    const { trigger, isLoading } = useUpdateCohortSession(cohortId);
    const { toast } = useToast();

    // Convert ISO to datetime-local value
    const toLocalInput = (iso: string) => {
        const d = new Date(iso);
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const [title, setTitle] = useState(session.title);
    const [scheduledAt, setScheduledAt] = useState(toLocalInput(session.scheduledAt));
    const [durationMinutes, setDurationMinutes] = useState(String(session.durationMinutes));
    const [description, setDescription] = useState(session.description ?? "");
    const [meetingPlatform, setMeetingPlatform] = useState<"ZOOM" | "GOOGLE_MEET" | "OTHER" | "">(
        (session.meetingPlatform as "ZOOM" | "GOOGLE_MEET" | "OTHER" | "") ?? "",
    );
    const [meetingLink, setMeetingLink] = useState(session.meetingLink ?? "");
    const [errors, setErrors] = useState<{ title?: string; scheduledAt?: string; durationMinutes?: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: typeof errors = {};
        if (!title.trim()) errs.title = "Title is required";
        if (!scheduledAt) errs.scheduledAt = "Date and time is required";
        const dur = parseInt(durationMinutes, 10);
        if (!durationMinutes || isNaN(dur) || dur < 1 || dur > 480) errs.durationMinutes = "Duration must be 1–480 minutes";
        if (Object.keys(errs).length) { setErrors(errs); return; }

        try {
            await trigger(session.id, {
                title: title.trim(),
                scheduledAt: new Date(scheduledAt).toISOString(),
                durationMinutes: dur,
                description: description.trim() || undefined,
                meetingPlatform: meetingPlatform || undefined,
                meetingLink: meetingLink.trim() || undefined,
            });
            toast("Session updated");
            await onSaved();
        } catch {
            toast("Could not update session", "error");
        }
    };

    return (
        <ModalOverlay>
            <div className="bg-brand-800 text-white px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3"><Video size={20} /><h2 className="text-lg font-bold">Edit Session</h2></div>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                    <label className={labelClass}>Title <span className="text-rose-500">*</span></label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
                    {errors.title && <p className={errorClass}>{errors.title}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Date & Time <span className="text-rose-500">*</span></label>
                        <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className={inputClass} />
                        {errors.scheduledAt && <p className={errorClass}>{errors.scheduledAt}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Duration (min) <span className="text-rose-500">*</span></label>
                        <input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} min={1} max={480} className={inputClass} />
                        {errors.durationMinutes && <p className={errorClass}>{errors.durationMinutes}</p>}
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Platform</label>
                        <select value={meetingPlatform} onChange={(e) => setMeetingPlatform(e.target.value as typeof meetingPlatform)} className={inputClass}>
                            <option value="">Select platform</option>
                            <option value="ZOOM">Zoom</option>
                            <option value="GOOGLE_MEET">Google Meet</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Meeting Link</label>
                        <input type="url" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://" className={inputClass} />
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-800 transition-colors">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-5 py-2.5 bg-brand-800 text-white text-sm font-bold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                        {isLoading && <Loader2 size={14} className="animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </form>
        </ModalOverlay>
    );
}

// ── Announcement Modal ─────────────────────────────────────────────────

function AnnouncementModal({ cohortId, onClose, onSuccess }: { cohortId: string; onClose: () => void; onSuccess: () => void }) {
    const { trigger, isLoading } = usePostAnnouncement(cohortId);
    const { toast } = useToast();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [errors, setErrors] = useState<{ title?: string; body?: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: typeof errors = {};
        if (!title.trim()) errs.title = "Title is required";
        if (!body.trim()) errs.body = "Message body is required";
        if (Object.keys(errs).length) { setErrors(errs); return; }
        try {
            await trigger({ title: title.trim(), body: body.trim() });
            toast("Announcement sent to all cohort members");
            onSuccess();
        } catch {
            toast("Failed to send announcement", "error");
        }
    };

    return (
        <ModalOverlay>
            <div className="bg-brand-800 text-white px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3"><Mail size={20} /><h2 className="text-lg font-bold">Send Announcement</h2></div>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4">
                <div>
                    <label className={labelClass}>Title <span className="text-rose-500">*</span></label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Important update for cohort members" className={inputClass} />
                    {errors.title && <p className={errorClass}>{errors.title}</p>}
                </div>
                <div>
                    <label className={labelClass}>Message <span className="text-rose-500">*</span></label>
                    <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your announcement here..." rows={5} maxLength={5000} className={`${inputClass} resize-none`} />
                    <div className="flex justify-between mt-1">
                        {errors.body ? <p className={errorClass}>{errors.body}</p> : <span />}
                        <span className="text-xs text-stone-400">{body.length}/5000</span>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-800 transition-colors">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-5 py-2.5 bg-brand-800 text-white text-sm font-bold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                        {isLoading && <Loader2 size={14} className="animate-spin" />} Send Announcement
                    </button>
                </div>
            </form>
        </ModalOverlay>
    );
}

// ── Schedule Session Modal ─────────────────────────────────────────────

function ScheduleSessionModal({ cohortId, onClose, onSuccess }: { cohortId: string; onClose: () => void; onSuccess: () => Promise<void> }) {
    const { trigger, isLoading } = useCreateCohortSession(cohortId);
    const { toast } = useToast();
    const [title, setTitle] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [durationMinutes, setDurationMinutes] = useState("60");
    const [description, setDescription] = useState("");
    const [meetingPlatform, setMeetingPlatform] = useState<"ZOOM" | "GOOGLE_MEET" | "OTHER" | "">("");
    const [meetingLink, setMeetingLink] = useState("");
    const [errors, setErrors] = useState<{ title?: string; scheduledAt?: string; durationMinutes?: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: typeof errors = {};
        if (!title.trim()) errs.title = "Title is required";
        if (!scheduledAt) errs.scheduledAt = "Date and time is required";
        const dur = parseInt(durationMinutes, 10);
        if (!durationMinutes || isNaN(dur) || dur < 1 || dur > 480) errs.durationMinutes = "Duration must be 1–480 minutes";
        if (Object.keys(errs).length) { setErrors(errs); return; }
        try {
            await trigger({ title: title.trim(), scheduledAt: new Date(scheduledAt).toISOString(), durationMinutes: dur, description: description.trim() || undefined, meetingPlatform: meetingPlatform || undefined, meetingLink: meetingLink.trim() || undefined });
            toast("Session scheduled");
            await onSuccess();
        } catch {
            toast("Failed to schedule session", "error");
        }
    };

    return (
        <ModalOverlay>
            <div className="bg-brand-800 text-white px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3"><Video size={20} /><h2 className="text-lg font-bold">Schedule Session</h2></div>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                    <label className={labelClass}>Title <span className="text-rose-500">*</span></label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Week 3 — Frontend Fundamentals" className={inputClass} />
                    {errors.title && <p className={errorClass}>{errors.title}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Date & Time <span className="text-rose-500">*</span></label>
                        <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className={inputClass} />
                        {errors.scheduledAt && <p className={errorClass}>{errors.scheduledAt}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Duration (min) <span className="text-rose-500">*</span></label>
                        <input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} min={1} max={480} className={inputClass} />
                        {errors.durationMinutes && <p className={errorClass}>{errors.durationMinutes}</p>}
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will be covered?" rows={3} className={`${inputClass} resize-none`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Platform</label>
                        <select value={meetingPlatform} onChange={(e) => setMeetingPlatform(e.target.value as typeof meetingPlatform)} className={inputClass}>
                            <option value="">Select platform</option>
                            <option value="ZOOM">Zoom</option>
                            <option value="GOOGLE_MEET">Google Meet</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Meeting Link</label>
                        <input type="url" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://" className={inputClass} />
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-800 transition-colors">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-5 py-2.5 bg-brand-800 text-white text-sm font-bold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                        {isLoading && <Loader2 size={14} className="animate-spin" />} Schedule Session
                    </button>
                </div>
            </form>
        </ModalOverlay>
    );
}

// ── Upload Resource Modal ──────────────────────────────────────────────

function UploadResourceModal({ cohortId, onClose, onSuccess }: { cohortId: string; onClose: () => void; onSuccess: () => Promise<void> }) {
    const { trigger, isLoading } = useCreateCohortResource(cohortId);
    const { toast } = useToast();
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");
    const [accessType, setAccessType] = useState<"link" | "download">("link");
    const [errors, setErrors] = useState<{ title?: string; url?: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: typeof errors = {};
        if (!title.trim()) errs.title = "Title is required";
        if (!url.trim()) { errs.url = "URL is required"; } else { try { new URL(url.trim()); } catch { errs.url = "Enter a valid URL (include https://)"; } }
        if (Object.keys(errs).length) { setErrors(errs); return; }
        try {
            await trigger({ title: title.trim(), url: url.trim(), description: description.trim() || undefined, accessType });
            toast("Resource added");
            await onSuccess();
        } catch {
            toast("Failed to add resource", "error");
        }
    };

    return (
        <ModalOverlay>
            <div className="bg-brand-800 text-white px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3"><FileText size={20} /><h2 className="text-lg font-bold">Upload Resource</h2></div>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4">
                <div>
                    <label className={labelClass}>Title <span className="text-rose-500">*</span></label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Week 1 Slides" className={inputClass} />
                    {errors.title && <p className={errorClass}>{errors.title}</p>}
                </div>
                <div>
                    <label className={labelClass}>URL <span className="text-rose-500">*</span></label>
                    <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://drive.google.com/..." className={inputClass} />
                    {errors.url && <p className={errorClass}>{errors.url}</p>}
                </div>
                <div>
                    <label className={labelClass}>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." rows={3} className={`${inputClass} resize-none`} />
                </div>
                <div>
                    <label className={labelClass}>Access</label>
                    <select value={accessType} onChange={(e) => setAccessType(e.target.value as "link" | "download")} className={inputClass}>
                        <option value="link">Open link in a new tab</option>
                        <option value="download">Download file</option>
                    </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-800 transition-colors">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-5 py-2.5 bg-brand-800 text-white text-sm font-bold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                        {isLoading && <Loader2 size={14} className="animate-spin" />} Add Resource
                    </button>
                </div>
            </form>
        </ModalOverlay>
    );
}

// ── Add Members Modal ──────────────────────────────────────────────────

function AddMembersModal({ cohortId, onClose, onSuccess }: { cohortId: string; onClose: () => void; onSuccess: () => Promise<void> }) {
    const { trigger, isLoading } = useAddCohortMembers(cohortId);
    const { users, isLoading: isLoadingUsers } = useAvailableCohortUsers(cohortId);
    const { toast } = useToast();
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const filteredUsers = search.trim() ? users.filter((u) => {
        const q = search.toLowerCase();
        const name = [u.profile?.firstName, u.profile?.lastName].filter(Boolean).join(" ").toLowerCase();
        return name.includes(q) || u.email.toLowerCase().includes(q);
    }) : users;

    const toggleUser = (userId: string) => setSelectedIds((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]);
    const getUserLabel = (u: AvailableUser) => [u.profile?.firstName, u.profile?.lastName].filter(Boolean).join(" ").trim() || u.email;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedIds.length === 0) { setSubmitError("Select at least one member to add"); return; }
        setSubmitError(null);
        try {
            await trigger({ userIds: selectedIds });
            toast(`${selectedIds.length} member${selectedIds.length > 1 ? "s" : ""} added to cohort`);
            await onSuccess();
        } catch {
            toast("Failed to add members", "error");
        }
    };

    return (
        <ModalOverlay>
            <div className="bg-brand-800 text-white px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3"><UserPlus size={20} /><h2 className="text-lg font-bold">Add Members</h2></div>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col">
                <div className="p-6 pb-3 border-b border-stone-100">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-colors" />
                    </div>
                    {selectedIds.length > 0 && <p className="text-xs text-brand-700 font-semibold mt-2">{selectedIds.length} selected</p>}
                </div>
                <div className="overflow-y-auto max-h-72">
                    {isLoadingUsers ? (
                        <div className="flex items-center justify-center py-8 text-stone-400 gap-2 text-sm"><Loader2 size={16} className="animate-spin" /> Loading users...</div>
                    ) : filteredUsers.length === 0 ? (
                        <p className="text-center text-sm text-stone-400 py-8">{users.length === 0 ? "All platform users are already in this cohort." : "No users match your search."}</p>
                    ) : (
                        filteredUsers.map((u) => (
                            <label key={u.id} className="flex items-center gap-3 px-6 py-3 hover:bg-stone-50 cursor-pointer transition-colors">
                                <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleUser(u.id)} className="w-4 h-4 accent-brand-700 rounded" />
                                <AvatarInitials name={getUserLabel(u)} size="sm" />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-stone-900 truncate">{getUserLabel(u)}</p>
                                    <p className="text-xs text-stone-400 truncate">{u.email}</p>
                                </div>
                            </label>
                        ))
                    )}
                </div>
                <div className="px-6 pb-6 pt-4 border-t border-stone-100">
                    {submitError && <p className={`${errorClass} mb-3`}>{submitError}</p>}
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-800 transition-colors">Cancel</button>
                        <button type="submit" disabled={isLoading || selectedIds.length === 0} className="px-5 py-2.5 bg-brand-800 text-white text-sm font-bold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                            {isLoading && <Loader2 size={14} className="animate-spin" />}
                            Add {selectedIds.length > 0 ? `${selectedIds.length} ` : ""}Member{selectedIds.length !== 1 ? "s" : ""}
                        </button>
                    </div>
                </div>
            </form>
        </ModalOverlay>
    );
}

// ── Edit cohort modal ──────────────────────────────────────────────────

const COHORT_STATUSES = ["Active", "Upcoming", "Completed", "Archived"] as const;

function EditCohortModal({
    cohort,
    cohortId,
    onClose,
    onSaved,
}: {
    cohort: CohortRecord;
    cohortId: string;
    onClose: () => void;
    onSaved: (updated: CohortRecord) => Promise<void>;
}) {
    const { trigger, isLoading } = useUpdateCohort(cohortId);
    const { toast } = useToast();

    const toDateInput = (iso: string | null) => {
        if (!iso) return "";
        return iso.split("T")[0] ?? "";
    };

    const [name, setName] = useState(cohort.name);
    const [track, setTrack] = useState(cohort.track ?? "");
    const [description, setDescription] = useState(cohort.description ?? "");
    const [status, setStatus] = useState(cohort.status ?? "Active");
    const [startDate, setStartDate] = useState(toDateInput(cohort.startDate));
    const [endDate, setEndDate] = useState(toDateInput(cohort.endDate));
    const [errors, setErrors] = useState<{ name?: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setErrors({ name: "Name is required" }); return; }
        setErrors({});
        try {
            await trigger({
                name: name.trim(),
                ...(track.trim() ? { track: track.trim() } : {}),
                description: description.trim() || undefined,
                status: status || undefined,
                startDate: startDate ? new Date(startDate).toISOString() : undefined,
                endDate: endDate ? new Date(endDate).toISOString() : undefined,
            });
            await onSaved({
                ...cohort,
                name: name.trim(),
                track: track.trim() || cohort.track,
                description: description.trim() || null,
                status: status || cohort.status,
                startDate: startDate ? new Date(startDate).toISOString() : cohort.startDate,
                endDate: endDate ? new Date(endDate).toISOString() : cohort.endDate,
            });
            toast("Cohort updated");
        } catch {
            toast("Failed to update cohort", "error");
        }
    };

    return (
        <ModalOverlay>
            <div className="bg-brand-800 text-white px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3"><GraduationCap size={20} /><h2 className="text-lg font-bold">Edit Cohort</h2></div>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                    <label className={labelClass}>Name <span className="text-rose-500">*</span></label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                    {errors.name && <p className={errorClass}>{errors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Track</label>
                        <input type="text" value={track} onChange={(e) => setTrack(e.target.value)} placeholder="e.g. Engineering, Design" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                            {COHORT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Start Date</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>End Date</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-800 transition-colors">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-5 py-2.5 bg-brand-800 text-white text-sm font-bold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                        {isLoading && <Loader2 size={14} className="animate-spin" />} Save Changes
                    </button>
                </div>
            </form>
        </ModalOverlay>
    );
}

// ── Cohort group row (in the linked groups list) ───────────────────────

function CohortGroupRow({ group, onUnlinked }: { group: CohortGroupRecord; onUnlinked: () => Promise<void> }) {
    const { getToken } = useAuth();
    const { toast } = useToast();
    const [confirm, setConfirm] = useState(false);
    const [isUnlinking, setIsUnlinking] = useState(false);

    const handleUnlink = async () => {
        setIsUnlinking(true);
        try {
            const token = await getToken();
            await apiRequest(`/admin/community/groups/${group.id}/cohorts`, {
                method: "DELETE",
                getToken: () => Promise.resolve(token),
            });
            await onUnlinked();
        } catch {
            toast("Could not unlink group", "error");
            setIsUnlinking(false);
        }
    };

    return (
        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
            <Link2 size={14} className="text-emerald-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-900 truncate">{group.name}</p>
                <p className="text-xs text-stone-500">{group.memberCount} members &middot; {group.channelCount} channels</p>
            </div>
            {confirm ? (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => void handleUnlink()} disabled={isUnlinking}
                        className="px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-lg hover:bg-rose-700 disabled:opacity-50 flex items-center gap-1 transition-colors">
                        {isUnlinking ? <Loader2 size={10} className="animate-spin" /> : <Unlink size={10} />} Unlink
                    </button>
                    <button onClick={() => setConfirm(false)} className="text-[10px] font-semibold text-stone-500 hover:text-stone-700 transition-colors">Cancel</button>
                </div>
            ) : (
                <Tip label="Unlink group">
                    <button onClick={() => setConfirm(true)} aria-label="Unlink group"
                        className="p-1.5 text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0">
                        <Unlink size={13} />
                    </button>
                </Tip>
            )}
        </div>
    );
}

// ── Link group modal ───────────────────────────────────────────────────

function LinkGroupModal({
    cohortId,
    onClose,
    onLinked,
}: {
    cohortId: string;
    onClose: () => void;
    onLinked: (groupId: string) => Promise<void>;
}) {
    const { getToken } = useAuth();
    const { toast } = useToast();
    const { groups, isLoading } = useCommunityGroups();
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const available = useMemo(
        () => groups.filter(g => !g.cohortId && !g.isDefault),
        [groups],
    );
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return q ? available.filter(g => g.name.toLowerCase().includes(q)) : available;
    }, [available, search]);

    const handleLink = async () => {
        if (!selectedGroupId) return;
        setSubmitting(true);
        try {
            const token = await getToken();
            const result = await apiRequest<{ success: true; data: { added: number; total: number } }>(
                `/admin/community/groups/${selectedGroupId}/cohorts`,
                { method: "POST", body: { cohortId }, getToken: () => Promise.resolve(token) },
            );
            const { added, total } = (result as { data: { added: number; total: number } }).data;
            toast(`Group linked — ${added} of ${total} members added`);
            await onLinked(selectedGroupId);
        } catch {
            toast("Could not link group", "error");
            setSubmitting(false);
        }
    };

    return (
        <ModalOverlay>
            <div className="bg-brand-800 text-white px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3"><Link2 size={20} /><h2 className="text-lg font-bold">Link Community Group</h2></div>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] flex flex-col">
                <p className="text-sm text-stone-500">Select a public group to link to this cohort. It will become private and all cohort members will be added.</p>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search groups..." className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-colors" />
                </div>
                <div className="overflow-y-auto flex-1 space-y-2 min-h-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8 text-stone-400 gap-2 text-sm"><Loader2 size={16} className="animate-spin" /> Loading groups...</div>
                    ) : filtered.length === 0 ? (
                        <p className="text-center text-sm text-stone-400 py-8">{available.length === 0 ? "No unlinked groups available." : "No groups match your search."}</p>
                    ) : (
                        filtered.map(g => (
                            <button
                                key={g.id}
                                onClick={() => setSelectedGroupId(prev => prev === g.id ? null : g.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${selectedGroupId === g.id ? "border-brand-400 bg-brand-50" : "border-stone-200 hover:border-stone-300 bg-white"}`}
                            >
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selectedGroupId === g.id ? "bg-brand-800 border-brand-800" : "border-stone-300"}`}>
                                    {selectedGroupId === g.id && <span className="text-white text-[10px] font-bold">✓</span>}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-stone-900 truncate">{g.name}</p>
                                    <p className="text-xs text-stone-400">{g._count?.members ?? g.memberCount ?? 0} members &middot; {g.newPostCount} new posts</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-stone-100">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-800 transition-colors">Cancel</button>
                    <button onClick={() => void handleLink()} disabled={!selectedGroupId || submitting} className="px-5 py-2.5 bg-brand-800 text-white text-sm font-bold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                        {submitting && <Loader2 size={14} className="animate-spin" />}
                        <Link2 size={14} /> Link Group
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
}

// ── Remove Member Modal ────────────────────────────────────────────────

function RemoveMemberModal({ member, isLoading, onConfirm, onClose }: { member: CohortMemberRecord; isLoading: boolean; onConfirm: () => void; onClose: () => void }) {
    const name = buildCohortMembersLabel(member);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-stone-900">Remove Member</h2>
                        <p className="text-sm text-stone-500 mt-1">
                            Remove <span className="font-semibold text-stone-700">{name}</span> from this cohort? This cannot be undone.
                        </p>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="p-2 rounded-lg hover:bg-stone-100 flex-shrink-0"><X size={18} /></button>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-stone-800 transition-colors">Cancel</button>
                    <button onClick={onConfirm} disabled={isLoading} className="px-5 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
                        {isLoading && <Loader2 size={14} className="animate-spin" />}
                        <Trash2 size={14} /> Remove
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Helpers ────────────────────────────────────────────────────────────

function StatRow({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-500"><Icon size={15} /><span className="text-sm">{label}</span></div>
            <span className="text-sm font-semibold text-stone-800">{value}</span>
        </div>
    );
}

function InfoBox({ icon: Icon, label }: { icon: typeof Calendar; label: string }) {
    return (
        <div className="flex items-center gap-2 bg-stone-50 rounded-xl p-3 border border-stone-100">
            <Icon size={15} className="text-stone-400 flex-shrink-0" />
            <span className="text-sm text-stone-700">{label}</span>
        </div>
    );
}
