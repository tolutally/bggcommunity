"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar, Users, Clock, FolderOpen,
  FileText, Download, Search, Video, Play,
  MapPin, X, ExternalLink, Lock,
} from "lucide-react";
import { useParams } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import {
  useCohort, useCohortMembers, useCohortSessions, useCohortResources,
  fmtCohortDate, fmtSessionMonth, fmtSessionDay, fmtSessionTime, fmtDuration,
} from "@/hooks/use-cohorts";
import { useUser } from "@/context/UserContext";
import type { CohortMember } from "@/lib/types";

export default function MemberCohortPage() {
  const { slug } = useParams();
  const slugStr = slug as string;
  const { cohort, isLoading, error } = useCohort(slugStr);
  const { members } = useCohortMembers(slugStr);
  const { apiUser } = useUser();
  const [activeTab, setActiveTab] = useState("sessions");

  // Check if current user is a member of this cohort
  const isMember = useMemo(() => {
    if (!apiUser?.id || members.length === 0) return true; // default to true while loading
    return members.some((m) => m.id === apiUser.id);
  }, [apiUser?.id, members]);

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-5 w-96 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error || !cohort) {
    return (
      <div className="p-6 md:p-10 max-w-5xl mx-auto">
        <EmptyState
          icon={Users}
          heading="Cohort not found"
          description="This cohort doesn't exist or couldn't be loaded."
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
        {/* Cohort Header */}
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">{cohort.name}</h1>
          {cohort.description && (
            <p className="text-lg text-stone-500">{cohort.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3 text-sm text-stone-400">
            {cohort.startDate && <span>{fmtCohortDate(cohort.startDate)}</span>}
            {cohort.startDate && cohort.endDate && <span>–</span>}
            {cohort.endDate && <span>{fmtCohortDate(cohort.endDate)}</span>}
            <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-lg text-xs font-bold">
              {cohort._count.members} members
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-stone-200">
          <TabButton active={activeTab === "sessions"} onClick={() => setActiveTab("sessions")} label="Sessions" icon={Calendar} />
          <TabButton active={activeTab === "resources"} onClick={() => setActiveTab("resources")} label="Resources" icon={FolderOpen} />
          <TabButton active={activeTab === "members"} onClick={() => setActiveTab("members")} label="Members" icon={Users} />
        </div>

        {/* Tab Content */}
        <div>
          {!isMember ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-stone-400" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">Members Only</h3>
              <p className="text-sm text-stone-500 max-w-md mx-auto">
                You need to be a member of this cohort to view sessions, resources, and other content. Contact an admin to get added.
              </p>
            </div>
          ) : (
            <>
              {activeTab === "sessions" && <SessionsTab slug={slugStr} />}
              {activeTab === "resources" && <ResourcesTab slug={slugStr} />}
              {activeTab === "members" && <MembersTab slug={slugStr} />}
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

/* ── Sessions Tab ── */

function SessionsTab({ slug }: { slug: string }) {
  const { sessions, isLoading, error } = useCohortSessions(slug);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={Calendar} heading="Failed to load sessions" description="Please try again later." />;
  }

  const now = new Date();
  const upcoming = sessions.filter((s) => new Date(s.scheduledAt) >= now);
  const past = sessions.filter((s) => new Date(s.scheduledAt) < now);

  return (
    <div className="space-y-8">
      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-6">
          <h3 className="font-bold text-xl text-stone-900">Upcoming Schedule</h3>
          <div className="space-y-4">
            {upcoming.map((session) => (
              <div
                key={session.id}
                className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex gap-6">
                  <div className="flex flex-col items-center justify-center w-16 h-16 bg-brand-100 text-brand-700 rounded-2xl">
                    <span className="text-xs font-bold uppercase">{fmtSessionMonth(session.scheduledAt)}</span>
                    <span className="text-2xl font-bold">{fmtSessionDay(session.scheduledAt)}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-stone-900">{session.title}</h4>
                    <p className="text-stone-500 flex items-center gap-2">
                      <Clock size={16} /> {fmtSessionTime(session.scheduledAt)} &middot; {fmtDuration(session.durationMinutes)}
                    </p>
                    <p className="text-sm text-stone-400 mt-1">{session._count.rsvps} RSVPs</p>
                  </div>
                </div>
                {session.meetingLink && (
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <ExternalLink size={16} /> Join
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Sessions / Recordings */}
      {past.length > 0 && (
        <div className="space-y-6">
          <h3 className="font-bold text-xl text-stone-900">Past Sessions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {past.map((session) => (
              <div key={session.id} className="group cursor-pointer">
                <div className="aspect-video bg-stone-800 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-stone-700 transition-colors overflow-hidden relative">
                  {session.recordingUrl ? (
                    <a href={session.recordingUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                        <Play size={28} className="text-brand-800 ml-1" />
                      </div>
                    </a>
                  ) : (
                    <div className="w-14 h-14 bg-stone-700 rounded-xl flex items-center justify-center">
                      <Video size={28} className="text-stone-400" />
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-stone-900 group-hover:text-brand-800 transition-colors">{session.title}</h4>
                <p className="text-sm text-stone-500">
                  {fmtCohortDate(session.scheduledAt)} &middot; {fmtDuration(session.durationMinutes)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <EmptyState
          icon={Calendar}
          heading="No sessions yet"
          description="Sessions for this cohort will appear here once scheduled."
          variant="plain"
        />
      )}
    </div>
  );
}

/* ── Resources Tab ── */

function ResourcesTab({ slug }: { slug: string }) {
  const { resources, isLoading, error } = useCohortResources(slug);
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={FolderOpen} heading="Failed to load resources" description="Please try again later." />;
  }

  const filtered = resources.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
        <input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none"
        />
      </div>

      <p className="text-sm text-stone-500 font-medium">
        {filtered.length} resource{filtered.length !== 1 ? "s" : ""}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((resource) => (
          <div
            key={resource.id}
            className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-stone-100 text-stone-600 group-hover:scale-105 transition-transform">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-stone-900 group-hover:text-brand-700 transition-colors truncate">
                  {resource.title}
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  Added {fmtCohortDate(resource.createdAt)}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-800 text-white font-bold text-xs rounded-xl hover:bg-brand-700 transition-colors"
              >
                <ExternalLink size={14} /> Open
              </a>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={FolderOpen}
          heading="No resources found"
          description={searchQuery ? "Try a different search." : "Resources will appear here once added."}
          variant="plain"
        />
      )}
    </div>
  );
}

/* ── Members Tab ── */

function MembersTab({ slug }: { slug: string }) {
  const { members, isLoading, error } = useCohortMembers(slug);
  const [selectedMember, setSelectedMember] = useState<CohortMember | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={Users} heading="Failed to load members" description="Please try again later." />;
  }

  if (members.length === 0) {
    return <EmptyState icon={Users} heading="No members yet" description="Members will appear here once they join." variant="plain" />;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {members.map((member) => {
          const name = member.profile
            ? `${member.profile.firstName} ${member.profile.lastName}`
            : member.email;
          return (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm hover:shadow-lg hover:border-brand-100 transition-all cursor-pointer group flex flex-col items-center text-center relative"
            >
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-brand-100 to-orange-100 group-hover:from-brand-300 group-hover:to-orange-300 transition-colors">
                  <AvatarInitials
                    name={name}
                    src={member.profile?.avatarUrl ?? undefined}
                    size="xl"
                    className="w-full h-full border-2 border-white"
                  />
                </div>
              </div>

              <h3 className="font-bold text-stone-900 text-lg mb-1 group-hover:text-brand-700 transition-colors">
                {name}
              </h3>
              <p className="text-sm font-medium text-stone-600 mb-0.5">
                {member.profile?.jobTitle ?? "Member"}
              </p>
              <p className="text-xs text-stone-400 mt-2">
                Joined {fmtCohortDate(member.joinedAt)}
              </p>
            </div>
          );
        })}
      </div>

      {selectedMember && (
        <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
    </>
  );
}

function MemberDetailModal({ member, onClose }: { member: CohortMember; onClose: () => void }) {
  const name = member.profile
    ? `${member.profile.firstName} ${member.profile.lastName}`
    : member.email;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div onClick={onClose} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-brand-600 to-indigo-700 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
          >
            <X size={20} />
          </button>
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </div>

        <div className="px-8 pb-8 -mt-16 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full p-1.5 bg-white shadow-xl">
              <AvatarInitials
                name={name}
                src={member.profile?.avatarUrl ?? undefined}
                size="xl"
                className="w-full h-full border-2 border-white"
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-stone-900 mb-1">{name}</h2>
          <p className="text-lg font-medium text-brand-700 mb-1">
            {member.profile?.jobTitle ?? "Member"}
          </p>
          <p className="text-stone-500 text-sm mb-4">{member.email}</p>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-bold border border-stone-200">
              Joined {fmtCohortDate(member.joinedAt)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-8 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Helper ── */

function TabButton({ active, onClick, label, icon: Icon }: { active: boolean; onClick: () => void; label: string; icon: React.ElementType }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 pb-4 border-b-2 transition-all px-2 ${active ? "border-brand-800 text-brand-800" : "border-transparent text-stone-500 hover:text-stone-700"}`}
    >
      <Icon size={18} />
      <span className="font-semibold">{label}</span>
    </button>
  );
}
