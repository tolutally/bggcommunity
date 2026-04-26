"use client";

import { Users, Plus, Search, Edit2, Trash2, Hash, Loader2, X, Megaphone } from "lucide-react";
import { useState, useMemo } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useCommunityGroups, useCommunityGroup } from "@/hooks/use-community";
import { useCreateGroup, useUpdateGroup, useDeleteGroup, useAddChannel, useAnnounce } from "@/hooks/use-admin-community";
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
                            <GroupRow key={g.id} group={g} onEdit={() => { setEditingGroup(g); setShowGroupForm(true); }} onDelete={() => setDeletingGroupId(g.id)} onAddChannel={() => setChannelGroupId(g.id)} />
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
        </div>
        </ErrorBoundary>
    );
}

/* ── Group Row ── */
function GroupRow({ group, onEdit, onDelete, onAddChannel }: { group: CommunityGroup; onEdit: () => void; onDelete: () => void; onAddChannel: () => void }) {
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
                <button onClick={onAddChannel} className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors" title="Add channel"><Hash size={16} /></button>
                <button onClick={onEdit} className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors" title="Edit"><Edit2 size={16} /></button>
                <button onClick={onDelete} className="p-2 rounded-lg border border-stone-200 text-red-500 hover:bg-red-50 transition-colors" title="Delete"><Trash2 size={16} /></button>
            </div>
        </div>
    );
}

/* ── Group Form Modal ── */
function GroupFormModal({ group, onClose, onSuccess, onError }: { group: CommunityGroup | null; onClose: () => void; onSuccess: () => void; onError: (msg: string) => void }) {
    const create = useCreateGroup();
    const update = useUpdateGroup(group?.id ?? "");
    const isEdit = !!group;
    const mutation = isEdit ? update : create;
    const [name, setName] = useState(group?.name ?? "");
    const [description, setDescription] = useState(group?.description ?? "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { onError("Name is required."); return; }
        try {
            await mutation.trigger({ name: name.trim(), description: description.trim() || undefined });
            onSuccess();
        } catch { onError(`Failed to ${isEdit ? "update" : "create"} group.`); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-stone-900">{isEdit ? "Edit Group" : "New Group"}</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-stone-700 mb-1 block">Name *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-stone-700 mb-1 block">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none resize-none" />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-stone-600">Cancel</button>
                        <button type="submit" disabled={mutation.isLoading} className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
                            {mutation.isLoading && <Loader2 size={14} className="animate-spin" />} {isEdit ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
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
