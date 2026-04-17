"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Users, Calendar, Clock, CheckCircle2,
  MoreHorizontal, FileText, Video, Download, Search,
  Plus, Mail, UserPlus, BarChart3, GraduationCap,
  Settings, Pencil,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import {
  useCohort, useCohortMembers, useCohortSessions, useCohortResources,
  fmtCohortDate, cohortStatusLabel, fmtSessionMonth, fmtSessionDay, fmtSessionTime, fmtDuration,
} from "@/hooks/use-cohorts";
import { useCohortStats } from "@/hooks/use-admin-cohorts";

type Tab = "overview" | "members" | "sessions" | "resources";

export default function AdminCohortDetailPage() {
  const { slug } = useParams();
  const slugStr = slug as string;
  const { cohort, isLoading, error } = useCohort(slugStr);
  const { members } = useCohortMembers(slugStr);
  const { sessions } = useCohortSessions(slugStr);
  const { resources } = useCohortResources(slugStr);
  const { stats } = useCohortStats(slugStr);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [memberSearch, setMemberSearch] = useState("");

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-10 w-72 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error || !cohort) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold text-stone-900">Cohort not found</h2>
        <Link href="/admin/cohorts" className="text-brand-600 hover:underline mt-2 inline-block">
          Back to Cohorts
        </Link>
      </div>
    );
  }

  const statusLabel = cohortStatusLabel(cohort.status);
  const upcomingSessions = sessions.filter((s) => new Date(s.scheduledAt) >= new Date());
  const completedSessions = sessions.filter((s) => new Date(s.scheduledAt) < new Date());
  const filteredMembers = members.filter((m) => {
    const name = m.profile ? `${m.profile.firstName} ${m.profile.lastName}` : m.email;
    return name.toLowerCase().includes(memberSearch.toLowerCase());
  });

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "members", label: "Members", count: members.length },
    { key: "sessions", label: "Sessions", count: sessions.length },
    { key: "resources", label: "Resources", count: resources.length },
  ];

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
                <StatusBadge label={statusLabel} preset={statusLabel as any} variant="pill" />
              </div>
              <p className="text-stone-500 text-sm mt-1">
                {cohort.startDate ? fmtCohortDate(cohort.startDate) : "—"} – {cohort.endDate ? fmtCohortDate(cohort.endDate) : "—"}
              </p>
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
                <p className="text-stone-600 text-sm leading-relaxed">
                  {cohort.description || "No description provided."}
                </p>
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
                    upcomingSessions.slice(0, 3).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-brand-100 text-brand-700 rounded-lg">
                            <Video size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-stone-800">{session.title}</p>
                            <p className="text-xs text-stone-500">
                              {fmtCohortDate(session.scheduledAt)} &bull; {fmtSessionTime(session.scheduledAt)}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-stone-500">{session._count.rsvps} RSVPs</span>
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
                  <StatRow icon={Users} label="Members" value={String(cohort._count.members)} />
                  <StatRow icon={Calendar} label="Start" value={cohort.startDate ? fmtCohortDate(cohort.startDate) : "—"} />
                  <StatRow icon={Calendar} label="End" value={cohort.endDate ? fmtCohortDate(cohort.endDate) : "—"} />
                  <StatRow icon={BarChart3} label="Active Rate" value={stats ? `${stats.activeRate}%` : "—"} />
                  <StatRow icon={CheckCircle2} label="Sessions Done" value={String(completedSessions.length)} />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                <h3 className="font-bold text-stone-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-sm font-medium text-stone-700">
                    <Mail size={16} className="text-stone-400" /> Send Announcement
                  </button>
                  <button onClick={() => setActiveTab("sessions")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-sm font-medium text-stone-700">
                    <Plus size={16} className="text-stone-400" /> Schedule Session
                  </button>
                  <button onClick={() => setActiveTab("resources")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-sm font-medium text-stone-700">
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
                      <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Job Title</th>
                      <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Joined</th>
                      <th className="text-right text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredMembers.map((member) => {
                      const name = member.profile
                        ? `${member.profile.firstName} ${member.profile.lastName}`
                        : member.email;
                      return (
                        <tr key={member.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <AvatarInitials name={name} src={member.profile?.avatarUrl ?? undefined} size="sm" />
                              <div>
                                <span className="font-semibold text-stone-900 text-sm">{name}</span>
                                <p className="text-xs text-stone-400">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-stone-600">
                            {member.profile?.jobTitle ?? "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-stone-500">
                            {fmtCohortDate(member.joinedAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
                              <MoreHorizontal size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredMembers.length === 0 && (
              <EmptyState icon={Users} heading="No members found" description="Try a different search." variant="plain" />
            )}
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
                          <p className="text-sm text-stone-500">
                            {fmtCohortDate(session.scheduledAt)} &bull; {fmtSessionTime(session.scheduledAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-stone-500">{session._count.rsvps} RSVPs</span>
                        <StatusBadge label="Upcoming" preset="Upcoming" variant="tag" />
                        <button className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
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
                          <p className="text-sm text-stone-500">
                            {fmtCohortDate(session.scheduledAt)} &bull; {fmtSessionTime(session.scheduledAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-stone-500">{session._count.rsvps} attended</span>
                        <StatusBadge label="Completed" preset="Completed" variant="tag" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sessions.length === 0 && (
              <EmptyState icon={Calendar} heading="No sessions yet" description="Schedule a session for this cohort." variant="plain" />
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
                      <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Date</th>
                      <th className="text-right text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {resources.map((resource) => (
                      <tr key={resource.id} className="hover:bg-stone-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <FileText size={18} className="text-stone-400" />
                            <span className="font-semibold text-stone-900 text-sm">{resource.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-stone-500">
                          {fmtCohortDate(resource.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-stone-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors inline-block"
                          >
                            <Download size={16} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {resources.length === 0 && (
              <EmptyState icon={FileText} heading="No resources yet" description="Upload resources for this cohort." variant="plain" />
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

function StatRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
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
