"use client";

import { useState, useMemo } from "react";
import { Hash, Loader2, MessageSquare, Send, Users, Globe, Lock } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import {
    useCommunityGroups,
    useCommunityGroup,
    useChannelPosts,
    usePostComments,
    useCreatePost,
    useCreateComment,
    fmtPostDate,
} from "@/hooks/use-community";
import type { CommunityGroup, Post, Comment } from "@/lib/types";

type Tab = "general" | "my-groups";

/* ── Helpers ── */
function authorName(post: Post | Comment): string {
    const p = (post as Post).author?.profile ?? (post as Comment).author?.profile;
    if (p) return `${p.firstName} ${p.lastName}`;
    return "Member";
}

/* ── Single post card with inline reply ── */
function PostItem({ post }: { post: Post }) {
    const [draft, setDraft] = useState("");
    const [optimisticComments, setOptimisticComments] = useState<Comment[]>([]);
    const { comments: fetchedComments, mutate: mutateComments } = usePostComments(post.id);
    const { trigger, isLoading } = useCreateComment(post.id);
    const { toast } = useToast();

    const comments = useMemo(() => {
        const byId = new Map<string, Comment>();
        fetchedComments.forEach((comment) => byId.set(comment.id, comment));
        optimisticComments.forEach((comment) => byId.set(comment.id, comment));
        return Array.from(byId.values()).sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
    }, [fetchedComments, optimisticComments]);

    const handleReply = async () => {
        const body = draft.trim();
        if (!body || isLoading) return;
        try {
            const res = await trigger({ body });
            if (res?.data) {
                setOptimisticComments((prev) => [...prev, res.data]);
                await mutateComments();
            }
            setDraft("");
            toast("Reply posted");
        } catch {
            toast("Could not post reply", "error");
        }
    };

    return (
        <article className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold flex-shrink-0">
                    {authorName(post)[0]}
                </div>
                <span className="text-sm font-semibold text-stone-700">{authorName(post)}</span>
                <span className="text-xs text-stone-400">&middot; {fmtPostDate(post.createdAt)}</span>
            </div>
            {post.title && <h3 className="text-base font-bold text-stone-900 mb-1">{post.title}</h3>}
            <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">{post.body}</p>

            {comments.length > 0 && (
                <div className="mt-4 space-y-2 pl-3 border-l-2 border-stone-100">
                    {comments.map((comment) => (
                        <div key={comment.id}>
                            <span className="text-xs font-semibold text-stone-600">{authorName(comment)}</span>
                            <span className="text-xs text-stone-400"> &middot; {fmtPostDate(comment.createdAt)}</span>
                            <p className="text-sm text-stone-700 mt-0.5">{comment.body}</p>
                        </div>
                    ))}
                </div>
            )}
            {post._count.comments > comments.length && (
                <p className="text-xs text-stone-400 mt-3">{post._count.comments} comment{post._count.comments !== 1 ? "s" : ""}</p>
            )}

            <div className="mt-4 flex items-center gap-2">
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleReply(); } }}
                    placeholder="Write a reply..."
                    className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:outline-none focus:border-brand-300"
                />
                <button
                    onClick={() => void handleReply()}
                    disabled={isLoading || !draft.trim()}
                    aria-label="Reply"
                    className="rounded-xl border border-stone-200 p-2 text-stone-500 hover:border-brand-300 hover:text-brand-700 disabled:opacity-50 transition-colors"
                >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
            </div>
        </article>
    );
}

/* ── Post composer ── */
function PostComposer({ groupId, channelId, channelName, onPosted }: { groupId: string; channelId: string; channelName: string; onPosted: () => void }) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const { trigger, isLoading } = useCreatePost(groupId, channelId);
    const { toast } = useToast();

    const handlePost = async () => {
        const trimmed = body.trim();
        if (!trimmed || isLoading) return;
        try {
            await trigger({ body: trimmed, title: title.trim() || undefined });
            setTitle(""); setBody("");
            onPosted();
            toast("Post published");
        } catch {
            toast("Could not publish post", "error");
        }
    };

    return (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
            <p className="text-sm font-bold text-stone-500 uppercase tracking-wide">Post in <span className="text-brand-700">#{channelName}</span></p>
            <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Title (optional)"
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:outline-none focus:border-brand-300"
            />
            <textarea
                rows={3}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Share something with the group..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm resize-none focus:outline-none focus:border-brand-300"
            />
            <button
                onClick={() => void handlePost()}
                disabled={isLoading || !body.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors"
            >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Post
            </button>
        </div>
    );
}

/* ── Group panel (selected group — channels + posts) ── */
function GroupPanel({ group }: { group: CommunityGroup }) {
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    const { group: detail, isLoading: loadingDetail } = useCommunityGroup(group.id);
    const channels = detail?.channels ?? [];
    const effectiveChannelId = selectedChannelId && channels.some(c => c.id === selectedChannelId) ? selectedChannelId : channels[0]?.id ?? null;
    const selectedChannel = channels.find(c => c.id === effectiveChannelId) ?? null;
    const { posts, isLoading: loadingPosts, mutate: mutatePosts } = useChannelPosts(group.id, effectiveChannelId);

    return (
        <div className="space-y-4">
            {/* Channel tabs */}
            {loadingDetail ? (
                <div className="flex items-center gap-2 text-stone-400 text-sm"><Loader2 size={14} className="animate-spin" /> Loading channels...</div>
            ) : channels.length > 0 ? (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-wrap">
                    {channels.map(ch => (
                        <button
                            key={ch.id}
                            onClick={() => setSelectedChannelId(ch.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${ch.id === effectiveChannelId ? "bg-brand-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
                        >
                            <Hash size={12} /> {ch.name}
                        </button>
                    ))}
                </div>
            ) : null}

            {/* Composer */}
            {effectiveChannelId && selectedChannel && (
                <PostComposer groupId={group.id} channelId={effectiveChannelId} channelName={selectedChannel.name} onPosted={() => void mutatePosts()} />
            )}

            {/* Posts */}
            {loadingPosts ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-6 flex items-center gap-2 text-stone-500">
                    <Loader2 size={16} className="animate-spin" /> Loading posts...
                </div>
            ) : !effectiveChannelId ? (
                <EmptyState icon={Hash} heading="No channels yet" description="This group has no channels yet." variant="plain" />
            ) : posts.length === 0 ? (
                <EmptyState icon={MessageSquare} heading="No posts yet" description="Be the first to start a discussion." variant="plain" />
            ) : (
                <div className="space-y-3">
                    {posts.map(post => (
                        <PostItem key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Main page ── */
export default function MemberCommunityPage() {
    const [tab, setTab] = useState<Tab>("general");
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    const { groups, isLoading: loadingGroups } = useCommunityGroups();

    // Groups the member has been added to (gated)
    const myGroups = useMemo(() => groups.filter(g => g.isJoined), [groups]);

    const activeGroup = useMemo(() => {
        const target = selectedGroupId ?? myGroups[0]?.id ?? null;
        return myGroups.find(g => g.id === target) ?? null;
    }, [selectedGroupId, myGroups]);

    // General discussion group — first group where isJoined is not gating (open to all)
    // Backend serves it as the first group or with a special flag; we treat it as a separate tab
    // pointing at the first available group's general channel, or a dedicated general endpoint.
    // For now, general tab shows groups[0] if it exists (the admin-designated open board).
    const generalGroup = useMemo(() => groups.find(g => g.name.toLowerCase().includes("general")) ?? groups[0] ?? null, [groups]);

    return (
        <ErrorBoundary>
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Community</h1>
                    <p className="text-stone-500 mt-1">Discussions, groups, and conversations.</p>
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
                    <button onClick={() => setTab("general")} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-colors ${tab === "general" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>
                        <Globe size={14} /> General
                    </button>
                    <button onClick={() => setTab("my-groups")} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-colors ${tab === "my-groups" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>
                        <Lock size={14} /> My Groups {myGroups.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">{myGroups.length}</span>}
                    </button>
                </div>

                {/* ── General Tab ── */}
                {tab === "general" && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Globe size={16} className="text-stone-400" />
                            <p className="text-sm text-stone-500">Open to all community members.</p>
                        </div>
                        {loadingGroups ? (
                            <div className="rounded-2xl border border-stone-200 bg-white p-8 flex items-center justify-center gap-2 text-stone-500">
                                <Loader2 size={18} className="animate-spin" /> Loading...
                            </div>
                        ) : !generalGroup ? (
                            <EmptyState icon={MessageSquare} heading="No general board yet" description="The admin hasn&apos;t set up the general discussion board yet." variant="plain" />
                        ) : (
                            <GroupPanel group={generalGroup} />
                        )}
                    </div>
                )}

                {/* ── My Groups Tab ── */}
                {tab === "my-groups" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Sidebar */}
                        <aside className="space-y-3">
                            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Groups you&apos;re in</h2>

                            {loadingGroups ? (
                                <div className="rounded-2xl border border-stone-100 bg-white p-5 flex items-center gap-2 text-stone-500 text-sm">
                                    <Loader2 size={14} className="animate-spin" /> Loading...
                                </div>
                            ) : myGroups.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-6 text-center">
                                    <Lock size={20} className="mx-auto text-stone-300 mb-2" />
                                    <p className="text-sm font-semibold text-stone-500">No groups yet</p>
                                    <p className="text-xs text-stone-400 mt-1">An admin will add you to groups.</p>
                                </div>
                            ) : (
                                myGroups.map(group => (
                                    <button
                                        key={group.id}
                                        onClick={() => setSelectedGroupId(group.id)}
                                        className={`w-full text-left rounded-2xl border p-4 transition-all ${activeGroup?.id === group.id ? "border-brand-300 bg-brand-50 shadow-sm" : "border-stone-200 bg-white hover:border-stone-300"}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 flex-shrink-0">
                                                <Users size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-stone-900 text-sm leading-snug">{group.name}</p>
                                                {group.description && <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{group.description}</p>}
                                                <p className="text-xs text-stone-400 mt-1.5">{group.memberCount} members &middot; {group.newPostCount} new</p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </aside>

                        {/* Content panel */}
                        <section className="lg:col-span-2">
                            {!activeGroup ? (
                                <EmptyState icon={MessageSquare} heading="Select a group" description="Choose a group from the left to view its channels and posts." variant="plain" />
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700">
                                            <Users size={18} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-stone-900">{activeGroup.name}</h2>
                                            {activeGroup.description && <p className="text-sm text-stone-500">{activeGroup.description}</p>}
                                        </div>
                                    </div>
                                        <GroupPanel group={activeGroup} />
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
}
