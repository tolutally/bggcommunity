"use client";

import { useState } from "react";
import { Users, MessageSquare, Hash, Plus, Settings, Megaphone, Heart, Bell, X, Trash2, Pencil, ChevronRight, Check } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ErrorBoundary } from "@/components/ui/error-boundary";

/* ─── Types ─── */
interface Channel {
    id: string;
    name: string;
    description: string;
}

interface Group {
    id: string;
    name: string;
    members: number;
    posts: number;
    desc: string;
    icon: string;
    color: string;
    channels: Channel[];
}

interface Announcement {
    id: string;
    title: string;
    message: string;
    postedAt: string;
}

interface Activity {
    id: string;
    user: string;
    action: string;
    target: string;
    time: string;
}

/* ─── Icon Map ─── */
const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
    Hash, Users, Heart, MessageSquare,
};

const ICON_OPTIONS = [
    { key: "Hash", label: "# Topic", Icon: Hash },
    { key: "Users", label: "People", Icon: Users },
    { key: "Heart", label: "Wellness", Icon: Heart },
    { key: "MessageSquare", label: "Chat", Icon: MessageSquare },
];

const COLOR_OPTIONS = [
    { value: "bg-pink-50 text-pink-600", label: "Pink" },
    { value: "bg-blue-50 text-blue-600", label: "Blue" },
    { value: "bg-emerald-50 text-emerald-600", label: "Emerald" },
    { value: "bg-brand-50 text-brand-600", label: "Brand" },
    { value: "bg-amber-50 text-amber-600", label: "Amber" },
    { value: "bg-purple-50 text-purple-600", label: "Purple" },
];

/* ─── Initial Data ─── */
const INITIAL_GROUPS: Group[] = [
    { id: "g1", name: "Product Design", members: 342, posts: 12, desc: "All things UI/UX, user research, and prototyping.", icon: "Hash", color: "bg-pink-50 text-pink-600", channels: [{ id: "c1", name: "general", description: "General design discussion" }, { id: "c2", name: "portfolio-reviews", description: "Get feedback on your portfolio" }] },
    { id: "g2", name: "Career Support", members: 890, posts: 45, desc: "Resume reviews, interview prep, and job postings.", icon: "Users", color: "bg-blue-50 text-blue-600", channels: [{ id: "c3", name: "general", description: "Career chat" }, { id: "c4", name: "job-postings", description: "Share and find job opportunities" }] },
    { id: "g3", name: "Mental Health & Wellness", members: 210, posts: 8, desc: "A safe space to discuss burnout, balance, and self-care.", icon: "Heart", color: "bg-emerald-50 text-emerald-600", channels: [{ id: "c5", name: "general", description: "Open discussion" }] },
    { id: "g4", name: "General Chat", members: 1205, posts: 156, desc: "The digital watercooler. Random topics welcome!", icon: "MessageSquare", color: "bg-brand-50 text-brand-600", channels: [{ id: "c6", name: "random", description: "Anything goes" }, { id: "c7", name: "introductions", description: "Say hello!" }] },
];

const INITIAL_ACTIVITIES: Activity[] = [
    { id: "a1", user: "Amara O.", action: "joined", target: "Product Design", time: "2m ago" },
    { id: "a2", user: "Sarah J.", action: "posted in", target: "Career Support", time: "15m ago" },
    { id: "a3", user: "Keisha W.", action: "created event", target: "Portfolio Workshop", time: "1h ago" },
];

/* ─── Page Component ─── */
export default function AdminCommunityPage() {
    const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);

    // Announcement form
    const [announcementTitle, setAnnouncementTitle] = useState("");
    const [announcementMessage, setAnnouncementMessage] = useState("");
    const [announcementSuccess, setAnnouncementSuccess] = useState(false);

    // Modals
    const [groupModal, setGroupModal] = useState<"create" | "edit" | null>(null);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [channelModal, setChannelModal] = useState<Group | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Group form
    const [groupForm, setGroupForm] = useState({ name: "", desc: "", icon: "Hash", color: COLOR_OPTIONS[0].value });

    /* ─── Announcement Handlers ─── */
    const handlePostAnnouncement = () => {
        if (!announcementTitle.trim() || !announcementMessage.trim()) return;
        const newAnnouncement: Announcement = {
            id: `ann-${Date.now()}`,
            title: announcementTitle.trim(),
            message: announcementMessage.trim(),
            postedAt: new Date().toLocaleString(),
        };
        setAnnouncements(prev => [newAnnouncement, ...prev]);
        setActivities(prev => [{ id: `a-${Date.now()}`, user: "Admin", action: "announced", target: announcementTitle.trim(), time: "just now" }, ...prev]);
        setAnnouncementTitle("");
        setAnnouncementMessage("");
        setAnnouncementSuccess(true);
        setTimeout(() => setAnnouncementSuccess(false), 3000);
    };

    /* ─── Group CRUD ─── */
    const openCreateGroup = () => {
        setGroupForm({ name: "", desc: "", icon: "Hash", color: COLOR_OPTIONS[0].value });
        setEditingGroup(null);
        setGroupModal("create");
    };

    const openEditGroup = (group: Group) => {
        setGroupForm({ name: group.name, desc: group.desc, icon: group.icon, color: group.color });
        setEditingGroup(group);
        setGroupModal("edit");
    };

    const handleSaveGroup = () => {
        if (!groupForm.name.trim() || !groupForm.desc.trim()) return;
        if (groupModal === "create") {
            const newGroup: Group = {
                id: `g-${Date.now()}`,
                name: groupForm.name.trim(),
                desc: groupForm.desc.trim(),
                icon: groupForm.icon,
                color: groupForm.color,
                members: 0,
                posts: 0,
                channels: [{ id: `c-${Date.now()}`, name: "general", description: "General discussion" }],
            };
            setGroups(prev => [...prev, newGroup]);
            setActivities(prev => [{ id: `a-${Date.now()}`, user: "Admin", action: "created group", target: groupForm.name.trim(), time: "just now" }, ...prev]);
        } else if (groupModal === "edit" && editingGroup) {
            setGroups(prev => prev.map(g => g.id === editingGroup.id ? { ...g, name: groupForm.name.trim(), desc: groupForm.desc.trim(), icon: groupForm.icon, color: groupForm.color } : g));
        }
        setGroupModal(null);
        setEditingGroup(null);
    };

    const handleDeleteGroup = (groupId: string) => {
        const group = groups.find(g => g.id === groupId);
        setGroups(prev => prev.filter(g => g.id !== groupId));
        if (group) {
            setActivities(prev => [{ id: `a-${Date.now()}`, user: "Admin", action: "deleted group", target: group.name, time: "just now" }, ...prev]);
        }
        setDeleteConfirm(null);
    };

    /* ─── Channel CRUD ─── */
    const handleAddChannel = (groupId: string, name: string, description: string) => {
        setGroups(prev => prev.map(g => g.id === groupId ? { ...g, channels: [...g.channels, { id: `c-${Date.now()}`, name: name.toLowerCase().replace(/\s+/g, "-"), description }] } : g));
    };

    const handleDeleteChannel = (groupId: string, channelId: string) => {
        setGroups(prev => prev.map(g => g.id === groupId ? { ...g, channels: g.channels.filter(c => c.id !== channelId) } : g));
    };

    const handleEditChannel = (groupId: string, channelId: string, name: string, description: string) => {
        setGroups(prev => prev.map(g => g.id === groupId ? { ...g, channels: g.channels.map(c => c.id === channelId ? { ...c, name: name.toLowerCase().replace(/\s+/g, "-"), description } : c) } : g));
    };

    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-10">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Community Hub</h1>
                    <p className="text-stone-500 mt-1">Manage interest groups, channels, and global announcements.</p>
                </div>
                <div className="bg-white border border-stone-200 rounded-xl px-4 py-2 flex items-center gap-4 shadow-sm">
                    <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map(i => (
                            <img key={i} src={`https://i.pravatar.cc/150?u=${i + 20}`} className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                        ))}
                    </div>
                    <div className="text-xs font-bold text-stone-600">
                        <span className="text-brand-700 text-lg">24</span>
                        <span className="block">Online Now</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
                {/* Main Content: Groups */}
                <div className="flex-1 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-stone-900">Interest Groups <span className="text-stone-400 font-medium text-base ml-2">({groups.length})</span></h2>
                        <button onClick={openCreateGroup} className="text-brand-700 font-bold text-sm hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <Plus size={16} /> New Group
                        </button>
                    </div>

                    {groups.length === 0 && (
                        <div className="bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-12 text-center">
                            <MessageSquare size={40} className="mx-auto text-stone-300 mb-3" />
                            <p className="text-stone-500 font-medium">No groups yet.</p>
                            <button onClick={openCreateGroup} className="mt-3 text-brand-700 font-bold text-sm hover:underline">Create your first group</button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {groups.map(group => (
                            <GroupCard
                                key={group.id}
                                group={group}
                                onEdit={() => openEditGroup(group)}
                                onDelete={() => setDeleteConfirm(group.id)}
                                onManageChannels={() => setChannelModal(group)}
                            />
                        ))}
                    </div>
                </div>

                {/* Sidebar: Announcements + Activity */}
                <div className="w-full xl:w-96 space-y-6">
                    {/* Announcement Form */}
                    <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-xl shadow-stone-900/10">
                        <div className="flex items-center gap-2 mb-4 text-brand-300 font-bold text-sm uppercase tracking-wider">
                            <Megaphone size={16} /> Admin Updates
                        </div>
                        <h3 className="text-xl font-bold mb-2">Make an Announcement</h3>
                        <p className="text-stone-400 text-sm mb-6">This will be pinned to the top of every member&apos;s dashboard.</p>

                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Post Title"
                                value={announcementTitle}
                                onChange={e => setAnnouncementTitle(e.target.value)}
                                className="w-full bg-stone-800 border-none rounded-xl px-4 py-3 text-sm text-white placeholder:text-stone-500 focus:ring-1 focus:ring-brand-500"
                            />
                            <textarea
                                placeholder="Message..."
                                rows={3}
                                value={announcementMessage}
                                onChange={e => setAnnouncementMessage(e.target.value)}
                                className="w-full bg-stone-800 border-none rounded-xl px-4 py-3 text-sm text-white placeholder:text-stone-500 focus:ring-1 focus:ring-brand-500 resize-none"
                            />
                            <button
                                onClick={handlePostAnnouncement}
                                disabled={!announcementTitle.trim() || !announcementMessage.trim()}
                                className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                Post to Community
                            </button>
                            {announcementSuccess && (
                                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium animate-in fade-in">
                                    <Check size={14} /> Announcement posted!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Posted Announcements */}
                    {announcements.length > 0 && (
                        <div className="bg-white border border-stone-200 rounded-3xl p-6">
                            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                                <Megaphone size={16} /> Posted Announcements
                            </h3>
                            <div className="space-y-4 max-h-64 overflow-y-auto">
                                {announcements.map(a => (
                                    <div key={a.id} className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-stone-900 text-sm">{a.title}</h4>
                                            <button onClick={() => setAnnouncements(prev => prev.filter(x => x.id !== a.id))} className="text-stone-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <p className="text-stone-600 text-xs mt-1 line-clamp-2">{a.message}</p>
                                        <p className="text-stone-400 text-xs mt-2">{a.postedAt}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Activity */}
                    <div className="bg-white border border-stone-200 rounded-3xl p-6">
                        <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                            <Bell size={16} /> Recent Activity
                        </h3>
                        <div className="space-y-4 max-h-72 overflow-y-auto">
                            {activities.map(a => (
                                <ActivityItem key={a.id} user={a.user} action={a.action} target={a.target} time={a.time} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Create / Edit Group Modal ─── */}
            {groupModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setGroupModal(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-stone-100">
                            <h2 className="text-xl font-bold text-stone-900">{groupModal === "create" ? "Create New Group" : "Edit Group"}</h2>
                            <button onClick={() => setGroupModal(null)} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1">Group Name</label>
                                <input
                                    type="text"
                                    value={groupForm.name}
                                    onChange={e => setGroupForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Data Science"
                                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1">Description</label>
                                <textarea
                                    value={groupForm.desc}
                                    onChange={e => setGroupForm(f => ({ ...f, desc: e.target.value }))}
                                    placeholder="What is this group about?"
                                    rows={3}
                                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-2">Icon</label>
                                <div className="flex gap-2">
                                    {ICON_OPTIONS.map(opt => (
                                        <button
                                            key={opt.key}
                                            onClick={() => setGroupForm(f => ({ ...f, icon: opt.key }))}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${groupForm.icon === opt.key ? "border-brand-500 bg-brand-50 text-brand-700" : "border-stone-200 text-stone-500 hover:border-stone-300"}`}
                                        >
                                            <opt.Icon size={16} /> {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-2">Color Theme</label>
                                <div className="flex gap-2 flex-wrap">
                                    {COLOR_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setGroupForm(f => ({ ...f, color: opt.value }))}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${opt.value} ${groupForm.color === opt.value ? "ring-2 ring-brand-500 ring-offset-1" : "border-transparent"}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-6 border-t border-stone-100 bg-stone-50">
                            <button onClick={() => setGroupModal(null)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
                            <button
                                onClick={handleSaveGroup}
                                disabled={!groupForm.name.trim() || !groupForm.desc.trim()}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                {groupModal === "create" ? "Create Group" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Delete Confirmation ─── */}
            <ConfirmModal
                open={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleDeleteGroup(deleteConfirm!)}
                title="Delete Group?"
                description="This will remove the group and all its channels. Members won't be deleted."
            />

            {/* ─── Channel Management Modal ─── */}
            {channelModal && (
                <ChannelManagerModal
                    group={channelModal}
                    onClose={() => setChannelModal(null)}
                    onAddChannel={handleAddChannel}
                    onDeleteChannel={handleDeleteChannel}
                    onEditChannel={handleEditChannel}
                />
            )}
        </div>
        </ErrorBoundary>
    );
}

/* ─── Group Card ─── */
function GroupCard({ group, onEdit, onDelete, onManageChannels }: { group: Group; onEdit: () => void; onDelete: () => void; onManageChannels: () => void }) {
    const Icon = ICON_MAP[group.icon] || Hash;
    return (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 hover:border-brand-300 transition-all group/card flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${group.color}`}>
                    <Icon size={24} />
                </div>
                <div className="flex gap-1">
                    <button onClick={onManageChannels} title="Manage Channels" className="p-1.5 rounded-lg text-stone-300 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                        <Hash size={16} />
                    </button>
                    <button onClick={onEdit} title="Edit Group" className="p-1.5 rounded-lg text-stone-300 hover:text-stone-600 hover:bg-stone-100 transition-colors">
                        <Pencil size={16} />
                    </button>
                    <button onClick={onDelete} title="Delete Group" className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <h3 className="text-lg font-bold text-stone-900 mb-1">{group.name}</h3>
            <p className="text-sm text-stone-500 mb-3 flex-1">{group.desc}</p>

            {/* Channels preview */}
            <div className="mb-4">
                <button onClick={onManageChannels} className="flex items-center gap-1 text-xs text-stone-400 hover:text-brand-600 transition-colors font-medium">
                    <Hash size={12} /> {group.channels.length} channel{group.channels.length !== 1 ? "s" : ""} <ChevronRight size={12} />
                </button>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-stone-100 text-xs font-semibold text-stone-500">
                <span>{group.members.toLocaleString()} Members</span>
                <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md">{group.posts} New Posts</span>
            </div>
        </div>
    );
}

/* ─── Channel Manager Modal ─── */
function ChannelManagerModal({ group, onClose, onAddChannel, onDeleteChannel, onEditChannel }: {
    group: Group;
    onClose: () => void;
    onAddChannel: (groupId: string, name: string, description: string) => void;
    onDeleteChannel: (groupId: string, channelId: string) => void;
    onEditChannel: (groupId: string, channelId: string, name: string, description: string) => void;
}) {
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [deleteChannelConfirm, setDeleteChannelConfirm] = useState<string | null>(null);

    const handleAdd = () => {
        if (!newName.trim()) return;
        onAddChannel(group.id, newName.trim(), newDesc.trim());
        setNewName("");
        setNewDesc("");
    };

    const startEdit = (ch: Channel) => {
        setEditingId(ch.id);
        setEditName(ch.name);
        setEditDesc(ch.description);
    };

    const saveEdit = () => {
        if (!editingId || !editName.trim()) return;
        onEditChannel(group.id, editingId, editName.trim(), editDesc.trim());
        setEditingId(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-stone-100">
                    <div>
                        <h2 className="text-xl font-bold text-stone-900">Channels</h2>
                        <p className="text-sm text-stone-500 mt-0.5">{group.name}</p>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {group.channels.length === 0 && (
                        <p className="text-stone-400 text-sm text-center py-6">No channels yet. Add one below.</p>
                    )}
                    {group.channels.map(ch => (
                        <div key={ch.id} className="border border-stone-200 rounded-xl p-4">
                            {editingId === ch.id ? (
                                <div className="space-y-2">
                                    <input
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                                    />
                                    <input
                                        value={editDesc}
                                        onChange={e => setEditDesc(e.target.value)}
                                        placeholder="Description"
                                        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => setEditingId(null)} className="text-xs text-stone-500 hover:text-stone-700 font-medium px-3 py-1.5 rounded-lg hover:bg-stone-100">Cancel</button>
                                        <button onClick={saveEdit} className="text-xs text-white bg-brand-600 hover:bg-brand-500 font-bold px-3 py-1.5 rounded-lg">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-1.5 text-sm font-bold text-stone-900">
                                            <Hash size={14} className="text-stone-400" /> {ch.name}
                                        </div>
                                        {ch.description && <p className="text-xs text-stone-500 mt-0.5 ml-5">{ch.description}</p>}
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => startEdit(ch)} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
                                            <Pencil size={14} />
                                        </button>
                                        {deleteChannelConfirm === ch.id ? (
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => { onDeleteChannel(group.id, ch.id); setDeleteChannelConfirm(null); }} className="text-xs text-white bg-red-600 hover:bg-red-500 font-bold px-2 py-1 rounded-lg">Yes</button>
                                                <button onClick={() => setDeleteChannelConfirm(null)} className="text-xs text-stone-500 font-medium px-2 py-1 rounded-lg hover:bg-stone-100">No</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setDeleteChannelConfirm(ch.id)} className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add New Channel */}
                <div className="border-t border-stone-100 p-6 bg-stone-50 space-y-3">
                    <h4 className="text-sm font-bold text-stone-900">Add Channel</h4>
                    <div className="flex gap-2">
                        <div className="flex-1 space-y-2">
                            <input
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="Channel name"
                                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                                onKeyDown={e => e.key === "Enter" && handleAdd()}
                            />
                            <input
                                value={newDesc}
                                onChange={e => setNewDesc(e.target.value)}
                                placeholder="Description (optional)"
                                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                                onKeyDown={e => e.key === "Enter" && handleAdd()}
                            />
                        </div>
                        <button
                            onClick={handleAdd}
                            disabled={!newName.trim()}
                            className="self-end px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Activity Item ─── */
function ActivityItem({ user, action, target, time }: { user: string; action: string; target: string; time: string }) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-0.5"></div>
            <div>
                <p className="text-stone-700">
                    <span className="font-bold text-stone-900">{user}</span> {action} <span className="font-semibold text-brand-700">{target}</span>
                </p>
                <p className="text-xs text-stone-400">{time}</p>
            </div>
        </div>
    );
}
