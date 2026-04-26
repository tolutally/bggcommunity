"use client";

import { useMemo, useState } from "react";
import {
    Search,
    LayoutGrid,
    List as ListIcon,
    MoreHorizontal,
    Mail,
    Eye,
    Send,
    Ban,
    Loader2,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useCursorPagination } from "@/hooks/useCursorPagination";
import { fetchMembers, getMembersErrorMessage, type MemberRecord } from "@/lib/members";

export default function AdminMembersPage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCohort, setSelectedCohort] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");

    const paginationQuery = useMemo(() => ({ limit: 30 }), []);
    const {
        items,
        isLoading,
        isLoadingMore,
        hasMore,
        error,
        loadMore,
    } = useCursorPagination<MemberRecord, typeof paginationQuery>({
        query: paginationQuery,
        loadPage: fetchMembers,
        getErrorMessage: getMembersErrorMessage,
    });

    const cohortOptions = useMemo(() => {
        const set = new Set<string>();
        items.forEach((member) => {
            if (member.cohort) {
                set.add(member.cohort);
            }
        });
        return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
    }, [items]);

    const statusOptions = useMemo(() => {
        const set = new Set<string>();
        items.forEach((member) => set.add(member.status || "Active"));
        return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
    }, [items]);

    const filteredMembers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return items.filter((member) => {
            const matchesSearch =
                member.name.toLowerCase().includes(query) ||
                (member.email ?? "").toLowerCase().includes(query) ||
                (member.occupation ?? "").toLowerCase().includes(query);

            const matchesCohort = selectedCohort === "All" || (member.cohort ?? "Unassigned") === selectedCohort;
            const matchesStatus = selectedStatus === "All" || (member.status || "Active") === selectedStatus;

            return matchesSearch && matchesCohort && matchesStatus;
        });
    }, [items, searchQuery, selectedCohort, selectedStatus]);

    return (
        <ErrorBoundary>
            <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-900">Community Members</h1>
                        <p className="text-stone-500 mt-1">Manage access, review member status, and monitor member activity.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-lg text-sm font-bold">
                            {filteredMembers.length} Members
                        </span>
                        <button className="bg-stone-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors">
                            Export CSV
                        </button>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-stone-200">
                    <div className="flex flex-col md:flex-row gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input
                                type="text"
                                title="Search members"
                                placeholder="Search by name, email, or role..."
                                className="w-full pl-10 pr-4 py-2 bg-stone-50 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            <select
                                title="Filter by cohort"
                                className="bg-stone-50 border border-stone-200 text-stone-700 text-sm rounded-xl focus:ring-brand-500 focus:border-brand-500 block p-2 outline-none cursor-pointer font-medium"
                                value={selectedCohort}
                                onChange={(event) => setSelectedCohort(event.target.value)}
                            >
                                {cohortOptions.map((cohort) => (
                                    <option key={cohort} value={cohort}>{cohort === "All" ? "All Cohorts" : cohort}</option>
                                ))}
                            </select>

                            <select
                                title="Filter by status"
                                className="bg-stone-50 border border-stone-200 text-stone-700 text-sm rounded-xl focus:ring-brand-500 focus:border-brand-500 block p-2 outline-none cursor-pointer font-medium"
                                value={selectedStatus}
                                onChange={(event) => setSelectedStatus(event.target.value)}
                            >
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>{status === "All" ? "All Statuses" : status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex bg-stone-100 p-1 rounded-xl w-fit self-end xl:self-auto">
                        <button
                            onClick={() => setViewMode("grid")}
                            title="Grid view"
                            aria-label="Switch to grid view"
                            className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-stone-900" : "text-stone-400 hover:text-stone-600"}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            title="List view"
                            aria-label="Switch to list view"
                            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-stone-900" : "text-stone-400 hover:text-stone-600"}`}
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="rounded-2xl border border-stone-200 bg-white p-8 text-stone-500 flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" /> Loading members...
                    </div>
                ) : error ? (
                    <EmptyState icon={Search} heading="Members unavailable" description={error} />
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filteredMembers.map((member) => (
                            <MemberGridCard key={member.id} member={member} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-stone-500">
                                <thead className="text-xs text-stone-400 uppercase bg-stone-50 border-b border-stone-100">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Member</th>
                                        <th className="px-6 py-4 font-bold">Cohort</th>
                                        <th className="px-6 py-4 font-bold">Status</th>
                                        <th className="px-6 py-4 font-bold">Location</th>
                                        <th className="px-6 py-4 font-bold">Joined</th>
                                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMembers.map((member) => (
                                        <MemberListRow key={member.id} member={member} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!isLoading && filteredMembers.length === 0 ? (
                    <EmptyState
                        icon={Search}
                        heading="No members found"
                        description="Try adjusting your search or filters."
                    />
                ) : null}

                {hasMore ? (
                    <div className="flex justify-center">
                        <button
                            onClick={() => void loadMore()}
                            disabled={isLoadingMore}
                            className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-semibold text-stone-700 hover:border-brand-300 hover:text-brand-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
                            Load more members
                        </button>
                    </div>
                ) : null}
            </div>
        </ErrorBoundary>
    );
}

function statusDotClass(status: string) {
    const normalized = status.toLowerCase();
    if (normalized.includes("active") || normalized.includes("open")) {
        return "bg-green-500";
    }
    if (normalized.includes("leave") || normalized.includes("pending")) {
        return "bg-yellow-500";
    }
    return "bg-stone-400";
}

function MemberGridCard({ member }: { member: MemberRecord }) {
    const cohortLabel = member.cohort ?? "Unassigned";
    const emailLabel = member.email ?? "No email";

    return (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col items-center text-center group hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5 transition-all cursor-pointer relative overflow-visible">
            <div className="absolute top-4 right-4 z-10">
                <button className="text-stone-300 hover:text-stone-600 transition-colors p-1 rounded-lg hover:bg-stone-100" title="Member actions">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className="relative mb-4">
                <AvatarInitials name={member.name} src={member.avatarUrl ?? undefined} size="xl" className="border-4 border-stone-50 shadow-sm group-hover:scale-105 transition-transform duration-300" />
                <span className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-white ${statusDotClass(member.status)}`} />
            </div>

            <h3 className="text-lg font-bold text-stone-900 mb-1">{member.name}</h3>
            <p className="text-sm text-stone-500 mb-3 flex items-center gap-1">
                <Mail size={12} /> {emailLabel}
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-4 w-full">
                <span className="px-2 py-1 bg-stone-50 border border-stone-100 rounded-md text-xs font-semibold text-stone-600">
                    {cohortLabel}
                </span>
                <span className="px-2 py-1 rounded-md text-xs font-bold border bg-stone-50 text-stone-600 border-stone-200">
                    {member.status}
                </span>
            </div>

            <div className="w-full mt-auto pt-4 border-t border-stone-100 flex justify-between items-center px-2">
                <div className="flex flex-col items-start">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Joined</span>
                    <span className="text-sm font-bold text-stone-900">{member.joinedLabel}</span>
                </div>
                <span className="text-xs text-stone-400">{member.location ?? "Unknown"}</span>
            </div>
        </div>
    );
}

function MemberListRow({ member }: { member: MemberRecord }) {
    const cohortLabel = member.cohort ?? "Unassigned";

    return (
        <tr className="bg-white border-b border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer group">
            <td className="px-6 py-4 flex items-center gap-3">
                <AvatarInitials name={member.name} src={member.avatarUrl ?? undefined} size="md" />
                <div>
                    <div className="font-bold text-stone-900">{member.name}</div>
                    <div className="text-xs text-stone-500">{member.email ?? "No email"}</div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-800">
                    {cohortLabel}
                </span>
            </td>
            <td className="px-6 py-4">
                <StatusBadge label={member.status} preset={member.status as never} />
            </td>
            <td className="px-6 py-4 text-stone-500 font-medium">
                {member.location ?? "Unknown"}
            </td>
            <td className="px-6 py-4 text-stone-500 font-medium">
                {member.joinedLabel}
            </td>
            <td className="px-6 py-4 text-right">
                <div className="relative inline-block">
                    <button className="text-stone-400 hover:text-brand-700 transition-colors p-2 hover:bg-brand-50 rounded-full" title="Member actions">
                        <MoreHorizontal size={18} />
                    </button>
                    <div className="sr-only">View profile, send email, and deactivate actions are available in the row menu.</div>
                    <div className="hidden">
                        <Eye size={15} />
                        <Send size={15} />
                        <Ban size={15} />
                    </div>
                </div>
            </td>
        </tr>
    );
}
