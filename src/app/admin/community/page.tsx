"use client";

import { Users, Plus, Search, Edit2, Trash2, Hash, Loader2, X, Megaphone, UserPlus, Check, ChevronRight, ChevronLeft, MoreVertical, AlertTriangle } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { useState, useMemo, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useCommunityGroups } from "@/hooks/use-community";
import { useCreateGroup, useUpdateGroup, useDeleteGroup, useAddChannel, useAnnounce, useAvailableGroupUsers, useGroupMembers, useRemoveGroupMember, useDeleteChannel } from "@/hooks/use-admin-community";
import { useCommunityGroup } from "@/hooks/use-community";
import { useAdminUsers } from "@/hooks/use-admin-users";
import { useCohorts } from "@/hooks/use-cohorts";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import type { CommunityGroup } from "@/lib/types";

type Tab = "groups" | "announcements";

export default function AdminCommunityPage() {
    const { groups, isLoading, mutate } = useCommunityGroups();
    const { toast } = useToast();
    const [tab, setTab] = useState<Tab>("groups");
    const [searchQuery, setSearchQuery] = useState("");
    const [showGroupForm, setShowGroupForm] = useState(false);
    const [editingGroup, setEditingGroup] = useState<CommunityGroup | null>(null);
    const [deletingGroup, setDeletingGroup] = useState<CommunityGroup | null>(null);
    const [channelGroup, setChannelGroup] = useState<CommunityGroup | null>(null);
    const [manageMembersGroup, setManageMembersGroup] = useState<CommunityGroup | null>(null);

    const filtered = useMemo(() => {
        return groups.filter(g => {
            if (!searchQuery) return true;
            return g.name.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [groups, searchQuery]);

    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Community Management</h1>
                    <p className="text-stone-500 mt-1">Manage groups, channels, and announcements.</p>
                </div>
                <button onClick={() => { setEditingGroup(null); setShowGroupForm(true); }} className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center gap-2 self-start">
                    <Plus size={18} /> New Group
                </button>
            </div>

            <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
                {(["groups", "announcements"] as Tab[]).map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors capitalize ${tab === t ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>
                        {t}
                    </button>
                ))}
            </div>

            {tab === "groups" && (
                <>
                    <div className="bg-white rounded-2xl border border-stone-200 p-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input type="text" placeholder="Search groups..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
                        </div>
                    </div>

                    {isLoading && <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-brand-500" size={28} /></div>}

                    <div className="space-y-3">
                        {filtered.map(g => (
                            <GroupRow key={g.id} group={g} onEdit={() => { setEditingGroup(g); setShowGroupForm(true); }} onDelete={() => setDeletingGroup(g)} onManageChannels={() => setChannelGroup(g)} onManageMembers={() => setManageMembersGroup(g)} />
                        ))}
                    </div>

                    {!isLoading && filtered.length === 0 && (
                        <EmptyState icon={Users} heading="No groups" description="Create a community group to get started." variant="plain" />
                    )}
                </>
            )}

            {tab === "announcements" && <AnnouncementForm groups={groups} />}

            {showGroupForm && (
                <GroupFormModal group={editingGroup} onClose={() => setShowGroupForm(false)} onSuccess={() => { setShowGroupForm(false); mutate(); toast(editingGroup ? "Group updated" : "Group created", "success"); }} onError={(msg) => toast(msg, "error")} />
            )}

            {deletingGroup && (
                <DeleteGroupModal groupId={deletingGroup.id} groupName={deletingGroup.name} onClose={() => setDeletingGroup(null)} onSuccess={() => { setDeletingGroup(null); mutate(); toast("Group deleted", "success"); }} onError={(msg) => toast(msg, "error")} />
            )}

            {channelGroup && (
                <ManageChannelsModal group={channelGroup} onClose={() => setChannelGroup(null)} onError={(msg) => toast(msg, "error")} />
            )}

            {manageMembersGroup && (
                <ManageMembersModal group={manageMembersGroup} onClose={() => setManageMembersGroup(null)} onSuccess={() => { setManageMembersGroup(null); mutate(); toast("Members updated", "success"); }} onError={(msg) => toast(msg, "error")} />
            )}
        </div>
        </ErrorBoundary>
    );
}

/* ── Group Row (a.k.a. GroupCard) ── */
function GroupRow({ group, onEdit, onDelete, onManageChannels, onManageMembers }: { group: CommunityGroup; onEdit: () => void; onDelete: () => void; onManageChannels: () => void; onManageMembers: () => void }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [menuOpen]);

    return (
        <div className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 flex-shrink-0">
                <Users size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-stone-900">{group.name}</h3>
                    {group.cohortId && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">Cohort Private</span>
                    )}
                </div>
                {group.description && <p className="text-sm text-stone-500 line-clamp-1">{group.description}</p>}
                <p className="text-xs text-stone-400 mt-1">{group.memberCount} members · {group.newPostCount} new posts</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <Tooltip label="Manage Members">
                    <button onClick={onManageMembers} className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-colors"><UserPlus size={16} /></button>
                </Tooltip>
                <Tooltip label="Manage Channels">
                    <button onClick={onManageChannels} className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors"><Hash size={16} /></button>
                </Tooltip>
                <div ref={menuRef} className="relative">
                    <Tooltip label="More options">
                        <button onClick={() => setMenuOpen(prev => !prev)} aria-label="Group actions" aria-haspopup="menu" aria-expanded={menuOpen} className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors"><MoreVertical size={16} /></button>
                    </Tooltip>
                    {menuOpen && (
                        <div role="menu" className="absolute right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-10 py-1 min-w-[160px]">
                            <button role="menuitem" onClick={() => { setMenuOpen(false); onEdit(); }} className="w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2 transition-colors">
                                <Edit2 size={14} /> Edit group
                            </button>
                            <button role="menuitem" onClick={() => { setMenuOpen(false); onDelete(); }} className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                                <Trash2 size={14} /> Delete group
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Group Form Modal (2-step for create, 1-step for edit) ── */
function GroupFormModal({ group, onClose, onSuccess, onError }: { group: CommunityGroup | null; onClose: () => void; onSuccess: () => void; onError: (msg: string) => void }) {
    const { getToken } = useAuth();
    const create = useCreateGroup();
    const update = useUpdateGroup(group?.id ?? "");
    const isEdit = !!group;
    const mutation = isEdit ? update : create;
    const [step, setStep] = useState<1 | 2>(1);
    const [name, setName] = useState(group?.name ?? "");
    const [description, setDescription] = useState(group?.description ?? "");
    const [nameError, setNameError] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleNext = () => {
        if (!name.trim()) { setNameError("Name is required."); return; }
        setNameError("");
        setStep(2);
    };

    const handleSubmit = async () => {
        if (isEdit) {
            if (!name.trim()) { onError("Name is required."); return; }
            try { await update.trigger({ name: name.trim(), description: description.trim() || undefined }); onSuccess(); } catch { onError("Failed to update group."); }
            return;
        }
        setSubmitting(true);
        try {
            const result = await create.trigger({ name: name.trim(), description: description.trim() || undefined });
            const groupId = (result as { data?: { id?: string } })?.data?.id;
            if (groupId) {
                const token = await getToken();
                const getT = () => Promise.resolve(token);
                if (selectedUserIds.length > 0) {
                    await apiRequest(`/admin/community/groups/${groupId}/members`, { method: "POST", body: { userIds: selectedUserIds }, getToken: getT });
                }
                if (selectedCohortId) {
                    await apiRequest(`/admin/community/groups/${groupId}/cohorts`, { method: "POST", body: { cohortId: selectedCohortId }, getToken: getT });
                }
            }
            onSuccess();
        } catch { onError("Failed to create group."); setSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-stone-100">
                    <div>
                        <h2 className="text-lg font-bold text-stone-900">{isEdit ? "Edit Group" : step === 1 ? "New Group" : "Add Members"}</h2>
                        {!isEdit && <p className="text-xs text-stone-400 mt-0.5">Step {step} of 2</p>}
                    </div>
                    <button onClick={onClose} aria-label="Close" className="p-2 rounded-lg hover:bg-stone-100"><X size={18} /></button>
                </div>

                {/* Step indicators (create only) */}
                {!isEdit && (
                    <div className="flex px-6 pt-4 gap-2">
                        {[1, 2].map(s => (
                            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${step >= s ? "bg-brand-800" : "bg-stone-100"}`} />
                        ))}
                    </div>
                )}

                {/* Step 1: Name + Description */}
                {step === 1 && (
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-stone-700 mb-1 block">Name *</label>
                            <input type="text" value={name} onChange={e => { setName(e.target.value); setNameError(""); }} className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none ${nameError ? "border-red-300 bg-red-50" : "border-stone-200"}`} placeholder="e.g. Alumni Network" />
                            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-stone-700 mb-1 block">Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none resize-none" placeholder="What is this group for?" />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-stone-600">Cancel</button>
                            {isEdit ? (
                                <button onClick={handleSubmit} disabled={mutation.isLoading} className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
                                    {mutation.isLoading && <Loader2 size={14} className="animate-spin" />} Update
                                </button>
                            ) : (
                                <button onClick={handleNext} className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm flex items-center gap-2">
                                    Next <ChevronRight size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Member / Cohort picker */}
                {step === 2 && !isEdit && (
                    <div className="p-6 space-y-4">
                        <MemberPickerPanel
                            selectedUserIds={selectedUserIds}
                            selectedCohortId={selectedCohortId}
                            onToggleUser={id => setSelectedUserIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                            onSelectCohort={id => setSelectedCohortId(id)}
                        />
                        <div className="flex justify-between gap-3 pt-2">
                            <button onClick={() => setStep(1)} className="px-4 py-2.5 text-sm font-semibold text-stone-600 flex items-center gap-1.5 hover:bg-stone-100 rounded-xl transition-colors">
                                <ChevronLeft size={16} /> Back
                            </button>
                            <button onClick={handleSubmit} disabled={submitting} className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
                                {submitting && <Loader2 size={14} className="animate-spin" />} Create Group
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Member Picker Panel (shared between create flow and manage modal) ── */
function MemberPickerPanel({
    groupId, selectedUserIds, selectedCohortId, onToggleUser, onSelectCohort,
}: {
    groupId?: string;
    selectedUserIds: string[];
    selectedCohortId: string | null;
    onToggleUser: (id: string) => void;
    onSelectCohort: (id: string | null) => void;
}) {
    const [pickerTab, setPickerTab] = useState<"members" | "cohorts">("members");
    const [search, setSearch] = useState("");
    const { users: allUsers, isLoading: allUsersLoading } = useAdminUsers();
    const { users: availableUsers, isLoading: availableLoading } = useAvailableGroupUsers(groupId ?? null);
    const users = groupId ? availableUsers : allUsers;
    const usersLoading = groupId ? availableLoading : allUsersLoading;
    const { cohorts, isLoading: cohortsLoading } = useCohorts();

    const filteredUsers = useMemo(() => {
        const q = search.toLowerCase();
        return users.filter(u => {
            const name = `${u.profile?.firstName ?? ""} ${u.profile?.lastName ?? ""}`.toLowerCase();
            return name.includes(q) || u.email.toLowerCase().includes(q);
        });
    }, [users, search]);

    const filteredCohorts = useMemo(() => {
        const q = search.toLowerCase();
        return cohorts.filter(c => c.name.toLowerCase().includes(q));
    }, [cohorts, search]);

    const totalSelected = selectedUserIds.length + (selectedCohortId ? 1 : 0);

    return (
        <div className="space-y-3">
            {/* Tab switcher */}
            <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
                {(["members", "cohorts"] as const).map(t => (
                    <button key={t} onClick={() => { setPickerTab(t); setSearch(""); }} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors capitalize ${pickerTab === t ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>{t}</button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
                <input type="text" placeholder={pickerTab === "members" ? "Search by name or email..." : "Search cohorts..."} value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
            </div>

            {/* List */}
            <div className="max-h-52 overflow-y-auto space-y-1 rounded-xl border border-stone-100 bg-stone-50 p-1">
                {pickerTab === "members" && (
                    usersLoading ? (
                        <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-stone-400" /></div>
                    ) : filteredUsers.length === 0 ? (
                        <p className="text-center text-xs text-stone-400 py-6">No members found</p>
                    ) : filteredUsers.map(u => {
                        const checked = selectedUserIds.includes(u.id);
                        const displayName = u.profile ? `${u.profile.firstName} ${u.profile.lastName}` : u.email;
                        return (
                            <button key={u.id} onClick={() => onToggleUser(u.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${checked ? "bg-brand-50 text-brand-900" : "hover:bg-white text-stone-700"}`}>
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? "bg-brand-800 border-brand-800" : "border-stone-300"}`}>
                                    {checked && <Check size={12} className="text-white" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold truncate">{displayName}</p>
                                    <p className="text-xs text-stone-400 truncate">{u.email}</p>
                                </div>
                            </button>
                        );
                    })
                )}
                {pickerTab === "cohorts" && (
                    cohortsLoading ? (
                        <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-stone-400" /></div>
                    ) : filteredCohorts.length === 0 ? (
                        <p className="text-center text-xs text-stone-400 py-6">No cohorts found</p>
                    ) : filteredCohorts.map(c => {
                        const selected = selectedCohortId === c.id;
                        return (
                            <button key={c.id} onClick={() => onSelectCohort(selected ? null : c.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${selected ? "bg-brand-50 text-brand-900" : "hover:bg-white text-stone-700"}`}>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected ? "bg-brand-800 border-brand-800" : "border-stone-300"}`}>
                                    {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold truncate">{c.name}</p>
                                    <p className="text-xs text-stone-400">{c._count.members} members · {c.status}</p>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            {/* Selection summary */}
            {totalSelected > 0 && (
                <p className="text-xs font-semibold text-brand-700 bg-brand-50 rounded-lg px-3 py-2">
                    {selectedUserIds.length > 0 && `${selectedUserIds.length} member${selectedUserIds.length > 1 ? "s" : ""}`}
                    {selectedUserIds.length > 0 && selectedCohortId && " · "}
                    {selectedCohortId && "1 cohort"} selected
                </p>
            )}
        </div>
    );
}

/* ── Manage Members Modal (two-tab: current members + add members) ── */
function ManageMembersModal({ group, onClose, onSuccess, onError }: { group: CommunityGroup; onClose: () => void; onSuccess: () => void; onError: (msg: string) => void }) {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState<"current" | "add">("current");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const { members, isLoading: membersLoading, mutate: mutateMembers } = useGroupMembers(group.id);

    const handleSave = async () => {
        if (selectedUserIds.length === 0 && !selectedCohortId) { onClose(); return; }
        setSubmitting(true);
        try {
            const token = await getToken();
            const getT = () => Promise.resolve(token);
            if (selectedUserIds.length > 0) {
                await apiRequest(`/admin/community/groups/${group.id}/members`, { method: "POST", body: { userIds: selectedUserIds }, getToken: getT });
            }
            if (selectedCohortId) {
                await apiRequest(`/admin/community/groups/${group.id}/cohorts`, { method: "POST", body: { cohortId: selectedCohortId }, getToken: getT });
            }
            onSuccess();
        } catch { onError("Failed to update members."); setSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-stone-100">
                    <div>
                        <h2 className="text-lg font-bold text-stone-900">Manage Members</h2>
                        <p className="text-xs text-stone-400 mt-0.5">{group.name} · {group.memberCount ?? 0} members</p>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="p-2 rounded-lg hover:bg-stone-100"><X size={18} /></button>
                </div>

                {/* Tab switcher */}
                <div className="flex gap-1 bg-stone-100 p-1 mx-6 mt-4 rounded-xl">
                    <button onClick={() => setActiveTab("current")} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeTab === "current" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>Current Members</button>
                    <button onClick={() => setActiveTab("add")} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeTab === "add" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>Add Members</button>
                </div>

                <div className="p-6 space-y-4">
                    {activeTab === "current" && (
                        <>
                            <div className="max-h-64 overflow-y-auto space-y-1 rounded-xl border border-stone-100 bg-stone-50 p-1">
                                {membersLoading ? (
                                    <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-stone-400" /></div>
                                ) : members.length === 0 ? (
                                    <p className="text-center text-xs text-stone-400 py-8">No members yet</p>
                                ) : members.map(m => (
                                    <MemberRow key={m.id} member={m} groupId={group.id} onRemoved={() => mutateMembers()} onError={onError} />
                                ))}
                            </div>
                            <div className="flex justify-end">
                                <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-stone-600">Close</button>
                            </div>
                        </>
                    )}

                    {activeTab === "add" && (
                        <>
                            <MemberPickerPanel
                                groupId={group.id}
                                selectedUserIds={selectedUserIds}
                                selectedCohortId={selectedCohortId}
                                onToggleUser={id => setSelectedUserIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                                onSelectCohort={id => setSelectedCohortId(id)}
                            />
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-stone-600">Cancel</button>
                                <button onClick={handleSave} disabled={submitting} className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
                                    {submitting && <Loader2 size={14} className="animate-spin" />}
                                    <UserPlus size={14} /> Add to Group
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function MemberRow({ member, groupId, onRemoved, onError }: { member: { id: string; email: string; profile: { firstName: string; lastName: string; avatarUrl: string | null } | null }; groupId: string; onRemoved: () => void; onError: (msg: string) => void }) {
    const remove = useRemoveGroupMember(groupId, member.id);
    const displayName = member.profile ? `${member.profile.firstName} ${member.profile.lastName}` : member.email;
    const initials = member.profile ? `${member.profile.firstName[0] ?? ""}${member.profile.lastName[0] ?? ""}`.toUpperCase() : member.email[0]?.toUpperCase() ?? "?";

    const handleRemove = async () => {
        try { await remove.trigger(); onRemoved(); } catch { onError("Failed to remove member."); }
    };

    return (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white transition-colors">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{initials}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800 truncate">{displayName}</p>
                <p className="text-xs text-stone-400 truncate">{member.email}</p>
            </div>
            <button onClick={handleRemove} disabled={remove.isLoading} aria-label="Remove member" className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 flex-shrink-0">
                {remove.isLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
        </div>
    );
}

/* ── Delete Group Modal ── */
function DeleteGroupModal({ groupId, groupName, onClose, onSuccess, onError }: { groupId: string; groupName: string; onClose: () => void; onSuccess: () => void; onError: (msg: string) => void }) {
    const del = useDeleteGroup(groupId);
    const handleDelete = async () => { try { await del.trigger(); onSuccess(); } catch { onError("Failed to delete group."); } };

    return (
        <ConfirmModal
            open
            onClose={onClose}
            onConfirm={handleDelete}
            title={`Delete "${groupName}"?`}
            description="This permanently deletes the group along with all of its channels and posts, and removes it for every member. This action cannot be undone."
            confirmLabel="Delete Group"
            variant="danger"
            icon={AlertTriangle}
            loading={del.isLoading}
        />
    );
}

/* ── Manage Channels Modal (list existing + add new) ── */
function ManageChannelsModal({ group, onClose, onError }: { group: CommunityGroup; onClose: () => void; onError: (msg: string) => void }) {
    const { group: groupDetail, mutate: mutateGroup } = useCommunityGroup(group.id);
    const addChannel = useAddChannel(group.id);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const { toast } = useToast();

    const handleAddChannel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { onError("Channel name is required."); return; }
        try {
            await addChannel.trigger({ name: name.trim(), description: description.trim() || undefined });
            setName(""); setDescription("");
            mutateGroup();
            toast("Channel added", "success");
        } catch { onError("Failed to add channel."); }
    };

    const channels = groupDetail?.channels ?? [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-stone-100">
                    <div>
                        <h2 className="text-lg font-bold text-stone-900">Manage Channels</h2>
                        <p className="text-xs text-stone-400 mt-0.5">{group.name} · {channels.length} channel{channels.length !== 1 ? "s" : ""}</p>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="p-2 rounded-lg hover:bg-stone-100"><X size={18} /></button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Existing channels list */}
                    <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Channels</p>
                        <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
                            {!groupDetail ? (
                                <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-stone-400" /></div>
                            ) : channels.length === 0 ? (
                                <p className="text-center text-xs text-stone-400 py-6">No channels yet — add one below</p>
                            ) : channels.map(ch => (
                                <ChannelRow
                                    key={ch.id}
                                    channel={ch}
                                    groupId={group.id}
                                    confirmingDelete={confirmDeleteId === ch.id}
                                    onRequestDelete={() => setConfirmDeleteId(ch.id)}
                                    onCancelDelete={() => setConfirmDeleteId(null)}
                                    onDeleted={() => { setConfirmDeleteId(null); mutateGroup(); }}
                                    onError={onError}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-stone-100" />

                    {/* Add channel form */}
                    <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Add Channel</p>
                        <form onSubmit={handleAddChannel} className="space-y-3">
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Channel name *" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-stone-600">Close</button>
                                <button type="submit" disabled={addChannel.isLoading} className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
                                    {addChannel.isLoading && <Loader2 size={14} className="animate-spin" />}
                                    <Plus size={14} /> Add Channel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChannelRow({ channel, groupId, confirmingDelete, onRequestDelete, onCancelDelete, onDeleted, onError }: { channel: { id: string; name: string; description: string | null }; groupId: string; confirmingDelete: boolean; onRequestDelete: () => void; onCancelDelete: () => void; onDeleted: () => void; onError: (msg: string) => void }) {
    const del = useDeleteChannel(groupId, channel.id);

    const handleDelete = async () => {
        try { await del.trigger(); onDeleted(); } catch { onError("Failed to delete channel."); }
    };

    return (
        <>
            <div className="px-3 py-3.5 border-b border-stone-200 last:border-b-0">
                <div className="flex items-center gap-2">
                    <Hash size={14} className="text-stone-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stone-800 truncate">{channel.name}</p>
                        {channel.description && <p className="text-xs text-stone-400 truncate">{channel.description}</p>}
                    </div>
                    <button onClick={onRequestDelete} aria-label="Delete channel" className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {confirmingDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancelDelete}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-stone-900">Delete Channel</h2>
                        <p className="text-sm text-stone-500">Delete <span className="font-semibold text-stone-700">#{channel.name}</span>? This will remove all posts and comments inside. This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={onCancelDelete} className="px-4 py-2 text-sm font-semibold text-stone-600">Cancel</button>
                            <button onClick={handleDelete} disabled={del.isLoading} className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
                                {del.isLoading && <Loader2 size={14} className="animate-spin" />} Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/* ── Announcement Form ── */
function AnnouncementForm({ groups }: { groups: CommunityGroup[] }) {
    const announce = useAnnounce();
    const { toast } = useToast();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [groupId, setGroupId] = useState("");

    const targetGroup = groups.find(g => g.id === groupId);
    const memberCount = (group: CommunityGroup) => group.memberCount ?? group._count?.members ?? 0;
    const cohortLinkedCount = groups.filter(g => g.cohortId).length;
    const totalMembers = groups.reduce((sum, g) => sum + memberCount(g), 0);

    const recipientSummary = targetGroup
        ? `Goes to ${memberCount(targetGroup)} member${memberCount(targetGroup) === 1 ? "" : "s"} in "${targetGroup.name}"${targetGroup.cohortId ? " (cohort-linked group)" : ""}.`
        : `Goes to all ${groups.length} group${groups.length === 1 ? "" : "s"}${cohortLinkedCount ? ` (${cohortLinkedCount} cohort-linked)` : ""} \u00b7 ${totalMembers} member${totalMembers === 1 ? "" : "s"} total.`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !body.trim()) { toast("Title and body are required", "error"); return; }
        try {
            await announce.trigger({ title: title.trim(), body: body.trim(), groupId: groupId || undefined });
            setTitle(""); setBody(""); setGroupId("");
            toast("Announcement sent!", "success");
        } catch { toast("Failed to send announcement", "error"); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-brand-50 text-brand-700 rounded-lg"><Megaphone size={20} /></div>
                    <h2 className="text-lg font-bold text-stone-900">Send Announcement</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-stone-700 mb-1 block">Title *</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-stone-700 mb-1 block">Body *</label>
                        <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none resize-none" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-stone-700 mb-1 block">Target Group (optional)</label>
                        <select value={groupId} onChange={e => setGroupId(e.target.value)} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none">
                            <option value="">All groups</option>
                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                        <p className="text-xs text-stone-500 mt-1.5">{recipientSummary}</p>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={announce.isLoading} className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
                            {announce.isLoading ? <Loader2 size={14} className="animate-spin" /> : <Megaphone size={14} />} Send
                        </button>
                    </div>
                </form>
            </div>

            {/* Live Preview */}
            <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Preview</p>
                <div className={`rounded-2xl border p-6 transition-all ${title.trim() || body.trim() ? "bg-white border-stone-200 shadow-sm" : "bg-stone-50 border-dashed border-stone-200"}`}>
                    {!title.trim() && !body.trim() ? (
                        <div className="text-center py-8">
                            <Megaphone size={32} className="mx-auto text-stone-300 mb-3" />
                            <p className="text-sm text-stone-400">Start typing to see a live preview</p>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-2 bg-brand-50 text-brand-700 rounded-lg flex-shrink-0"><Megaphone size={18} /></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">Announcement</span>
                                        {targetGroup && <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">{targetGroup.name}</span>}
                                        {!groupId && <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">All Groups</span>}
                                    </div>
                                    <h3 className="font-bold text-stone-900 text-lg leading-tight">{title || "Untitled"}</h3>
                                </div>
                            </div>
                            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">{body || "No body text yet..."}</p>
                            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                                <span className="text-xs text-stone-400">Just now</span>
                                <span className="text-xs text-stone-400">Admin</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
