"use client";

import { MessageSquare, Users, Hash, ArrowLeft, Send, Loader2, LogIn, LogOut, Trash2 } from "lucide-react";
import { useState, useCallback } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
    useCommunityGroups, useCommunityGroup,
    useJoinGroup, useLeaveGroup,
    useChannelPosts, useCreatePost, useDeletePost,
    useCreateComment, useDeleteComment,
    fmtPostDate,
} from "@/hooks/use-community";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/context/UserContext";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import type { Post, Comment, Channel } from "@/lib/types";

type View = { kind: "groups" } | { kind: "group"; groupId: string } | { kind: "channel"; groupId: string; channelId: string; channelName: string };

export default function MemberCommunityPage() {
    const [view, setView] = useState<View>({ kind: "groups" });

    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
            {view.kind === "groups" && <GroupsView onSelect={(id) => setView({ kind: "group", groupId: id })} />}
            {view.kind === "group" && <GroupDetailView groupId={view.groupId} onBack={() => setView({ kind: "groups" })} onSelectChannel={(channelId, channelName) => setView({ kind: "channel", groupId: view.groupId, channelId, channelName })} />}
            {view.kind === "channel" && <ChannelView groupId={view.groupId} channelId={view.channelId} channelName={view.channelName} onBack={() => setView({ kind: "group", groupId: view.groupId })} />}
        </div>
        </ErrorBoundary>
    );
}

/* ── Groups List ── */
function GroupsView({ onSelect }: { onSelect: (id: string) => void }) {
    const { groups, isLoading } = useCommunityGroups();

    return (
        <>
            <div>
                <h1 className="text-3xl font-bold text-stone-900">Community</h1>
                <p className="text-stone-500 mt-1">Join groups, participate in discussions, and connect with peers.</p>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-brand-500" size={28} /></div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map(group => (
                    <button key={group.id} onClick={() => onSelect(group.id)} className="bg-white rounded-2xl border border-stone-200 p-6 text-left hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all group">
                        <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 mb-4 group-hover:bg-brand-100 transition-colors">
                            <Users size={22} />
                        </div>
                        <h3 className="font-bold text-stone-900 mb-1 group-hover:text-brand-700 transition-colors">{group.name}</h3>
                        {group.description && <p className="text-sm text-stone-500 line-clamp-2 mb-3">{group.description}</p>}
                        <div className="flex items-center gap-4 text-xs text-stone-400">
                            <span className="flex items-center gap-1"><Users size={12} /> {group.memberCount} members</span>
                            {group.newPostCount > 0 && <span className="flex items-center gap-1 text-brand-600 font-bold"><MessageSquare size={12} /> {group.newPostCount} new</span>}
                        </div>
                    </button>
                ))}
            </div>

            {!isLoading && groups.length === 0 && (
                <EmptyState icon={Users} heading="No groups yet" description="Community groups will appear here once created." variant="plain" />
            )}
        </>
    );
}

/* ── Group Detail ── */
function GroupDetailView({ groupId, onBack, onSelectChannel }: { groupId: string; onBack: () => void; onSelectChannel: (channelId: string, channelName: string) => void }) {
    const { group, isLoading, mutate } = useCommunityGroup(groupId);
    const join = useJoinGroup(groupId);
    const leave = useLeaveGroup(groupId);
    const { toast } = useToast();

    const handleJoin = async () => { try { await join.trigger(); mutate(); } catch { toast("Failed to join group", "error"); } };
    const handleLeave = async () => { try { await leave.trigger(); mutate(); } catch { toast("Failed to leave group", "error"); } };

    if (isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-brand-500" size={28} /></div>;
    if (!group) return <EmptyState icon={Users} heading="Group not found" description="This group may have been removed." variant="plain" />;

    return (
        <>
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors">
                <ArrowLeft size={16} /> Back to Groups
            </button>

            <div className="bg-white rounded-3xl border border-stone-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900">{group.name}</h1>
                        {group.description && <p className="text-stone-500 mt-1">{group.description}</p>}
                        <p className="text-sm text-stone-400 mt-2">{group.memberCount} members</p>
                    </div>
                    {group.isMember ? (
                        <button onClick={handleLeave} disabled={leave.isLoading} className="px-5 py-2.5 border-2 border-stone-200 text-stone-600 font-bold rounded-xl hover:border-red-300 hover:text-red-600 transition-colors flex items-center gap-2 self-start disabled:opacity-50">
                            {leave.isLoading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />} Leave
                        </button>
                    ) : (
                        <button onClick={handleJoin} disabled={join.isLoading} className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center gap-2 self-start disabled:opacity-50">
                            {join.isLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />} Join Group
                        </button>
                    )}
                </div>
            </div>

            <div>
                <h2 className="text-lg font-bold text-stone-900 mb-4">Channels</h2>
                {group.channels.length === 0 && <p className="text-sm text-stone-400">No channels yet.</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {group.channels.map(ch => (
                        <button key={ch.id} onClick={() => onSelectChannel(ch.id, ch.name)} className="bg-white rounded-xl border border-stone-200 p-4 text-left hover:border-brand-200 hover:shadow-md transition-all flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500">
                                <Hash size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-stone-900">{ch.name}</p>
                                {ch.description && <p className="text-xs text-stone-400 truncate">{ch.description}</p>}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}

/* ── Channel / Posts View ── */
function ChannelView({ groupId, channelId, channelName, onBack }: { groupId: string; channelId: string; channelName: string; onBack: () => void }) {
    const { posts, isLoading, mutate } = useChannelPosts(groupId, channelId);
    const createPost = useCreatePost(groupId, channelId);
    const { toast } = useToast();
    const { apiUser } = useUser();
    const [newPostBody, setNewPostBody] = useState("");
    const [expandedPost, setExpandedPost] = useState<string | null>(null);

    const handleCreatePost = async () => {
        const body = newPostBody.trim();
        if (!body) return;
        try { await createPost.trigger({ body }); setNewPostBody(""); mutate(); } catch { toast("Failed to create post", "error"); }
    };

    const handleDeletePost = useCallback(async (postId: string) => {
        // We instantiate deletion inline since we need different postId each time
        try {
            const token = await (window as unknown as { __clerk_token?: () => Promise<string> }).__clerk_token?.();
            const url = `${process.env.NEXT_PUBLIC_API_URL}/community/posts/${postId}`;
            const res = await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error();
            mutate();
            toast("Post deleted", "success");
        } catch { toast("Failed to delete post", "error"); }
    }, [mutate, toast]);

    return (
        <>
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors">
                <ArrowLeft size={16} /> Back to Group
            </button>

            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-700"><Hash size={20} /></div>
                <h1 className="text-2xl font-bold text-stone-900">{channelName}</h1>
            </div>

            {/* Compose */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4">
                <textarea value={newPostBody} onChange={e => setNewPostBody(e.target.value)} rows={2} placeholder="Share something with the group..." className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none resize-none mb-3" />
                <div className="flex justify-end">
                    <button onClick={handleCreatePost} disabled={createPost.isLoading || !newPostBody.trim()} className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
                        {createPost.isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Post
                    </button>
                </div>
            </div>

            {isLoading && <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-brand-500" size={28} /></div>}

            {/* Posts */}
            <div className="space-y-4">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} isOwner={post.author.id === apiUser?.id} expanded={expandedPost === post.id} onToggleExpand={() => setExpandedPost(prev => prev === post.id ? null : post.id)} onDelete={() => handleDeletePost(post.id)} groupId={groupId} channelId={channelId} onMutate={mutate} />
                ))}
            </div>

            {!isLoading && posts.length === 0 && (
                <EmptyState icon={MessageSquare} heading="No posts yet" description="Be the first to start a discussion in this channel." variant="plain" />
            )}
        </>
    );
}

/* ── Post Card ── */
function PostCard({ post, isOwner, expanded, onToggleExpand, onDelete, groupId, channelId, onMutate }: {
    post: Post; isOwner: boolean; expanded: boolean; onToggleExpand: () => void; onDelete: () => void; groupId: string; channelId: string; onMutate: () => void;
}) {
    const { toast } = useToast();
    const { apiUser } = useUser();
    const createComment = useCreateComment(post.id);
    const [commentBody, setCommentBody] = useState("");

    const authorName = post.author.profile
        ? `${post.author.profile.firstName ?? ""} ${post.author.profile.lastName ?? ""}`.trim() || "Member"
        : "Member";

    const handleAddComment = async () => {
        const body = commentBody.trim();
        if (!body) return;
        try { await createComment.trigger({ body }); setCommentBody(""); onMutate(); } catch { toast("Failed to add comment", "error"); }
    };

    const isDeleted = post.deletedAt != null || post.body === "[deleted]";

    return (
        <div className={`bg-white rounded-2xl border border-stone-200 p-5 ${isDeleted ? "opacity-60" : ""}`}>
            <div className="flex items-start gap-3 mb-3">
                <AvatarInitials name={isDeleted ? "?" : authorName} src={isDeleted ? undefined : post.author.profile?.avatarUrl} size="sm" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 text-sm">{isDeleted ? "[deleted]" : authorName}</span>
                        <span className="text-xs text-stone-400">{fmtPostDate(post.createdAt)}</span>
                    </div>
                </div>
                {isOwner && !isDeleted && (
                    <button onClick={onDelete} className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete post"><Trash2 size={14} /></button>
                )}
            </div>

            {isDeleted ? (
                <p className="text-sm text-stone-400 italic">[This post has been deleted]</p>
            ) : (
                <>
                    {post.title && <h3 className="font-bold text-stone-900 mb-2">{post.title}</h3>}
                    <p className="text-sm text-stone-700 whitespace-pre-wrap">{post.body}</p>
                </>
            )}

            {/* Comments toggle */}
            <div className="mt-4 pt-3 border-t border-stone-100">
                <button onClick={onToggleExpand} className="text-xs font-semibold text-stone-500 hover:text-brand-700 transition-colors flex items-center gap-1">
                    <MessageSquare size={14} /> {post._count.comments} comment{post._count.comments !== 1 ? "s" : ""}
                </button>

                {expanded && (
                    <div className="mt-3 space-y-3">
                        {/* Inline comment compose */}
                        <div className="flex gap-2">
                            <input type="text" value={commentBody} onChange={e => setCommentBody(e.target.value)} placeholder="Write a comment..." onKeyDown={e => e.key === "Enter" && handleAddComment()} className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
                            <button onClick={handleAddComment} disabled={createComment.isLoading || !commentBody.trim()} className="px-3 py-2 bg-brand-800 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50">
                                {createComment.isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            </button>
                        </div>
                        <p className="text-xs text-stone-400">Comments load inline with post details.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
