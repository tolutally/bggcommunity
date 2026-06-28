"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import {
    Search,
    LayoutGrid,
    List as ListIcon,
    MoreHorizontal,
    Mail,
    UserPlus,
    AlertTriangle,
    Ban,
    UserCheck,
    Trash2,
    Loader2,
    X,
    Briefcase,
    Building2,
    MapPin,
    Calendar,
    Linkedin,
    BadgeCheck,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useCursorPagination } from "@/hooks/useCursorPagination";
import { fetchMembers, getMembersErrorMessage, type MemberRecord } from "@/lib/members";
import {
    useAddMember,
    useSuspendMember,
    useReinstateMember,
    useDeleteMember,
    useSendWarning,
} from "@/hooks/use-admin-users";
import { useToast } from "@/components/ui/toast";

export default function AdminMembersPage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCohort, setSelectedCohort] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);
    const [addForm, setAddForm] = useState({ email: "", firstName: "", lastName: "" });
    const { trigger: addMember, isLoading: isAdding } = useAddMember();
    const { toast } = useToast();

    const paginationQuery = useMemo(() => ({ limit: 30 }), []);
    const {
        items,
        isLoading,
        isLoadingMore,
        hasMore,
        error,
        loadMore,
        reload,
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
        <>
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
                        <button
                            onClick={() => { setAddForm({ email: "", firstName: "", lastName: "" }); setShowAddModal(true); }}
                            className="bg-brand-800 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors flex items-center gap-2"
                        >
                            <UserPlus size={15} /> Add Member
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
                            <MemberGridCard key={member.id} member={member} onRefresh={() => void reload()} onSelect={() => setSelectedMember(member)} />
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
                                        <MemberListRow key={member.id} member={member} onRefresh={() => void reload()} onSelect={() => setSelectedMember(member)} />
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

        {showAddModal ? (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-stone-900">Add Member</h2>
                        <button onClick={() => setShowAddModal(false)} title="Close" aria-label="Close add member dialog" className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Email *</label>
                            <input
                                type="email"
                                value={addForm.email}
                                onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                                className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="member@example.com"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">First Name *</label>
                                <input
                                    type="text"
                                    value={addForm.firstName}
                                    onChange={(e) => setAddForm((f) => ({ ...f, firstName: e.target.value }))}
                                    className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="First"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Last Name *</label>
                                <input
                                    type="text"
                                    value={addForm.lastName}
                                    onChange={(e) => setAddForm((f) => ({ ...f, lastName: e.target.value }))}
                                    className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="Last"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 rounded-xl border border-stone-200 text-sm font-semibold text-stone-700 hover:bg-stone-50">Cancel</button>
                        <button
                            disabled={isAdding || !addForm.email.trim() || !addForm.firstName.trim() || !addForm.lastName.trim()}
                            onClick={async () => {
                                try {
                                    await addMember(addForm);
                                    toast(`${addForm.firstName} added`);
                                    setShowAddModal(false);
                                    void reload();
                                } catch {
                                    toast("Unable to add member", "error");
                                }
                            }}
                            className="flex-1 px-4 py-2 rounded-xl bg-brand-800 text-white text-sm font-bold hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isAdding ? <Loader2 size={14} className="animate-spin" /> : null}
                            Add Member
                        </button>
                    </div>
                </div>
            </div>
        ) : null}

        {selectedMember ? (
            <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} />
        ) : null}
        </>
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

function MemberGridCard({ member, onRefresh, onSelect }: { member: MemberRecord; onRefresh: () => void; onSelect: () => void }) {
    const cohortLabel = member.cohort ?? "Unassigned";
    const emailLabel = member.email ?? "No email";

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } }}
            className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col items-center text-center group hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5 transition-all relative overflow-visible cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
            <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                <AdminMemberActions member={member} onRefresh={onRefresh} />
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

function MemberListRow({ member, onRefresh, onSelect }: { member: MemberRecord; onRefresh: () => void; onSelect: () => void }) {
    const cohortLabel = member.cohort ?? "Unassigned";

    return (
        <tr onClick={onSelect} className="bg-white border-b border-stone-100 hover:bg-stone-50 transition-colors group cursor-pointer">
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
            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                <AdminMemberActions member={member} onRefresh={onRefresh} />
            </td>
        </tr>
    );
}

function AdminMemberActions({ member, onRefresh }: { member: MemberRecord; onRefresh: () => void }) {
    const [open, setOpen] = useState(false);
    const [showWarn, setShowWarn] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [warnMsg, setWarnMsg] = useState("");
    const ref = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const { trigger: suspend, isLoading: suspending } = useSuspendMember(member.id);
    const { trigger: reinstate, isLoading: reinstating } = useReinstateMember(member.id);
    const { trigger: deleteMember, isLoading: deleting } = useDeleteMember(member.id);
    const { trigger: sendWarning, isLoading: warning } = useSendWarning(member.id);

    const isSuspended = member.status.toLowerCase().includes("suspend");
    const busy = suspending || reinstating || deleting || warning;

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const doSuspend = async () => {
        setOpen(false);
        try { await suspend(); toast(`${member.name} suspended`); onRefresh(); }
        catch { toast("Unable to suspend member", "error"); }
    };

    const doReinstate = async () => {
        setOpen(false);
        try { await reinstate(); toast(`${member.name} reinstated`); onRefresh(); }
        catch { toast("Unable to reinstate member", "error"); }
    };

    const doDelete = async () => {
        setShowDelete(false);
        try { await deleteMember(); toast(`${member.name} removed`); onRefresh(); }
        catch { toast("Unable to remove member", "error"); }
    };

    const doWarn = async () => {
        if (!warnMsg.trim()) return;
        setShowWarn(false);
        try { await sendWarning({ message: warnMsg.trim() }); toast(`Warning sent to ${member.name}`); setWarnMsg(""); }
        catch { toast("Unable to send warning", "error"); }
    };

    return (
        <>
            <div ref={ref} className="relative inline-block">
                <button
                    onClick={() => setOpen((v) => !v)}
                    disabled={busy}
                    title="Member actions"
                    className="text-stone-400 hover:text-brand-700 transition-colors p-1.5 hover:bg-brand-50 rounded-lg disabled:opacity-40"
                >
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <MoreHorizontal size={18} />}
                </button>

                {open ? (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl border border-stone-200 shadow-lg z-20 py-1">
                        <button
                            onClick={() => { setOpen(false); setShowWarn(true); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                            <AlertTriangle size={14} className="text-amber-500" /> Send Warning
                        </button>
                        {isSuspended ? (
                            <button
                                onClick={() => void doReinstate()}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                            >
                                <UserCheck size={14} /> Reinstate Account
                            </button>
                        ) : (
                            <button
                                onClick={() => void doSuspend()}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                            >
                                <Ban size={14} /> Suspend Account
                            </button>
                        )}
                        <div className="border-t border-stone-100 my-1" />
                        <button
                            onClick={() => { setOpen(false); setShowDelete(true); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={14} /> Remove Account
                        </button>
                    </div>
                ) : null}
            </div>

            {showWarn ? (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
                        <h2 className="text-lg font-bold text-stone-900">Send Warning to {member.name}</h2>
                        <textarea
                            value={warnMsg}
                            onChange={(e) => setWarnMsg(e.target.value)}
                            rows={4}
                            placeholder="Describe the policy violation or behaviour concern…"
                            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setShowWarn(false)} className="flex-1 px-4 py-2 rounded-xl border border-stone-200 text-sm font-semibold text-stone-700 hover:bg-stone-50">Cancel</button>
                            <button
                                disabled={!warnMsg.trim() || warning}
                                onClick={() => void doWarn()}
                                className="flex-1 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {warning ? <Loader2 size={14} className="animate-spin" /> : null}
                                Send Warning
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            <ConfirmModal
                open={showDelete}
                title="Remove Member"
                description={`This will permanently remove ${member.name}'s account. This action cannot be undone.`}
                confirmLabel="Remove"
                variant="danger"
                onConfirm={() => void doDelete()}
                onClose={() => setShowDelete(false)}
                loading={deleting}
            />
        </>
    );
}

function MemberDetailModal({ member, onClose }: { member: MemberRecord; onClose: () => void }) {
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    const details: { icon: typeof Mail; label: string; value: string | null }[] = [
        { icon: Mail, label: "Email", value: member.email },
        { icon: Briefcase, label: "Occupation", value: member.occupation },
        { icon: Building2, label: "Industry", value: member.industry },
        { icon: MapPin, label: "Location", value: member.location },
        { icon: BadgeCheck, label: "Cohort", value: member.cohort ?? "Unassigned" },
        { icon: Calendar, label: "Joined", value: member.joinedLabel },
    ];

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative p-6 border-b border-stone-100">
                    <button
                        onClick={onClose}
                        title="Close"
                        aria-label="Close member details"
                        className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-3">
                            <AvatarInitials name={member.name} src={member.avatarUrl ?? undefined} size="xl" className="border-4 border-stone-50 shadow-sm" />
                            <span className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-white ${statusDotClass(member.status)}`} />
                        </div>
                        <h2 className="text-xl font-bold text-stone-900">{member.name}</h2>
                        <div className="flex flex-wrap justify-center items-center gap-2 mt-2">
                            <StatusBadge label={member.status} preset={member.status as never} />
                            {member.isOpenToWork ? (
                                <span className="px-2 py-0.5 rounded-md text-xs font-bold border bg-green-50 text-green-700 border-green-200">
                                    Open to work
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {member.bio ? (
                        <div>
                            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">About</h3>
                            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{member.bio}</p>
                        </div>
                    ) : null}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {details.map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-start gap-3">
                                <span className="mt-0.5 text-stone-400">
                                    <Icon size={16} />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</p>
                                    <p className="text-sm font-medium text-stone-800 break-words">{value ?? "—"}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {member.linkedinUrl ? (
                        <a
                            href={member.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 text-sm font-semibold text-stone-700 hover:border-brand-300 hover:text-brand-700 transition-colors"
                        >
                            <Linkedin size={15} /> View LinkedIn
                        </a>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
