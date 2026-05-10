"use client";

import { Users, Plus, Search, Edit2, Trash2, Hash, Loader2, X, Megaphone, UserPlus, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useCommunityGroups } from "@/hooks/use-community";
import { useCreateGroup, useUpdateGroup, useDeleteGroup, useAddChannel, useAnnounce } from "@/hooks/use-admin-community";
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
    const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);
    const [channelGroupId, setChannelGroupId] = useState<string | null>(null);
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
                            <GroupRow key={g.id} group={g} onEdit={() => { setEditingGroup(g); setShowGroupForm(true); }} onDelete={() => setDeletingGroupId(g.id)} onAddChannel={() => setChannelGroupId(g.id)} onManageMembers={() => setManageMembersGroup(g)} />
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

            {deletingGroupId && (
                <DeleteGroupModal groupId={deletingGroupId} onClose={() => setDeletingGroupId(null)} onSuccess={() => { setDeletingGroupId(null); mutate(); toast("Group deleted", "success"); }} onError={(msg) => toast(msg, "error")} />
            )}

            {channelGroupId && (
                <AddChannelModal groupId={channelGroupId} onClose={() => setChannelGroupId(null)} onSuccess={() => { setChannelGroupId(null); toast("Channel added", "success"); }} onError={(msg) => toast(msg, "error")} />
            )}

            {manageMembersGroup && (
                <ManageMembersModal group={manageMembersGroup} onClose={() => setManageMembersGroup(null)} onSuccess={() => { setManageMembersGroup(null); mutate(); toast("Members updated", "success"); }} onError={(msg) => toast(msg, "error")} />
            )}
        </div>
        </ErrorBoundary>
    );
}

/* ── Group Row ── */
function GroupRow({ group, onEdit, onDelete, onAddChannel, onManageMembers }: { group: CommunityGroup; onEdit: () => void; onDelete: () => void; onAddChannel: () => void; onManageMembers: () => void }) {
    return (
        <div className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 flex-shrink-0">
                <Users size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-stone-900">{group.name}</h3>
                {group.description && <p className="text-sm text-stone-500 line-clamp-1">{group.description}</p>}
                <p className="text-xs text-stone-400 mt-1">{group.memberCount} members · {group.newPostCount} new posts</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={onManageMembers} className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-colors" title="Manage members"><UserPlus size={16} /></button>
                <button onClick={onAddChannel} className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors" title="Add channel"><Hash size={16} /></button>
                <button onClick={onEdit} className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors" title="Edit"><Edit2 size={16} /></button>
                <button onClick={onDelete} className="p-2 rounded-lg border border-stone-200 text-red-500 hover:bg-red-50 transition-colors" title="Delete"><Trash2 size={16} /></button>
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
    const [selectedCohortIds, setSelectedCohortIds] = useState<string[]>([]);
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
                for (const cohortId of selectedCohortIds) {
                    await apiRequest(`/admin/community/groups/${groupId}/cohorts`, { method: "POST", body: { cohortId }, getToken: getT });
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
                            selectedCohortIds={selectedCohortIds}
                            onToggleUser={id => setSelectedUserIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                            onToggleCohort={id => setSelectedCohortIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
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
    selectedUserIds, selectedCohortIds, onToggleUser, onToggleCohort,
}: {
    selectedUserIds: string[];
    selectedCohortIds: string[];
    onToggleUser: (id: string) => void;
    onToggleCohort: (id: string) => void;
}) {
    const [pickerTab, setPickerTab] = useState<"members" | "cohorts">("members");
    const [search, setSearch] = useState("");
    const { users, isLoading: usersLoading } = useAdminUsers();
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

    const totalSelected = selectedUserIds.length + selectedCohortIds.length;

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
                        const checked = selectedCohortIds.includes(c.id);
                        return (
                            <button key={c.id} onClick={() => onToggleCohort(c.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${checked ? "bg-brand-50 text-brand-900" : "hover:bg-white text-stone-700"}`}>
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? "bg-brand-800 border-brand-800" : "border-stone-300"}`}>
                                    {checked && <Check size={12} className="text-white" />}
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
                    {selectedUserIds.length > 0 && selectedCohortIds.length > 0 && " · "}
                    {selectedCohortIds.length > 0 && `${selectedCohortIds.length} cohort${selectedCohortIds.length > 1 ? "s" : ""}`} selected
                </p>
            )}
        </div>
    );
}

/* ── Manage Members Modal (post-creation) ── */
function ManageMembersModal({ group, onClose, onSuccess, onError }: { group: CommunityGroup; onClose: () => void; onSuccess: () => void; onError: (msg: string) => void }) {
    const { getToken } = useAuth();
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [selectedCohortIds, setSelectedCohortIds] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const handleSave = async () => {
        if (selectedUserIds.length === 0 && selectedCohortIds.length === 0) { onClose(); return; }
        setSubmitting(true);
        try {
            const token = await getToken();
            const getT = () => Promise.resolve(token);
            if (selectedUserIds.length > 0) {
                await apiRequest(`/admin/community/groups/${group.id}/members`, { method: "POST", body: { userIds: selectedUserIds }, getToken: getT });
            }
            for (const cohortId of selectedCohortIds) {
                await apiRequest(`/admin/community/groups/${group.id}/cohorts`, { method: "POST", body: { cohortId }, getToken: getT });
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
                        <p className="text-xs text-stone-400 mt-0.5">{group.name}</p>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="p-2 rounded-lg hover:bg-stone-100"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                        <Users size={14} className="text-amber-600 flex-shrink-0" />
                        <p className="text-xs text-amber-700 font-medium">This is a gated group. Only admins can add members or cohorts.</p>
                    </div>
                    <MemberPickerPanel
                        selectedUserIds={selectedUserIds}
                        selectedCohortIds={selectedCohortIds}
                        onToggleUser={id => setSelectedUserIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                        onToggleCohort={id => setSelectedCohortIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-stone-600">Cancel</button>
                        <button onClick={handleSave} disabled={submitting} className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
                            {submitting && <Loader2 size={14} className="animate-spin" />}
                            <UserPlus size={14} /> Add to Group
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Delete Group Modal ── */
function DeleteGroupModal({ groupId, onClose, onSuccess, onError }: { groupId: string; onClose: () => void; onSuccess: () => void; onError: (msg: string) => void }) {
    const del = useDeleteGroup(groupId);
    const handleDelete = async () => { try { await del.trigger(); onSuccess(); } catch { onError("Failed to delete group."); } };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-stone-900">Delete Group</h2>
                <p className="text-sm text-stone-500">This will remove the group and all its channels. This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-stone-600">Cancel</button>
                    <button onClick={handleDelete} disabled={del.isLoading} className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
                        {del.isLoading && <Loader2 size={14} className="animate-spin" />} Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Add Channel Modal ── */
function AddChannelModal({ groupId, onClose, onSuccess, onError }: { groupId: string; onClose: () => void; onSuccess: () => void; onError: (msg: string) => void }) {
    const addChannel = useAddChannel(groupId);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { onError("Channel name is required."); return; }
        try { await addChannel.trigger({ name: name.trim(), description: description.trim() || undefined }); onSuccess(); } catch { onError("Failed to add channel."); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-stone-900">Add Channel</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-stone-700 mb-1 block">Name *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. general" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-stone-700 mb-1 block">Description</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-stone-600">Cancel</button>
                        <button type="submit" disabled={addChannel.isLoading} className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
                            {addChannel.isLoading && <Loader2 size={14} className="animate-spin" />} Add Channel
                        </button>
                    </div>
                </form>
            </div>
        </div>
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
