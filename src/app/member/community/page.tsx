"use client";

import { useState } from "react";
import { Hash, Loader2, MessageSquare, Send, Users } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import {
    useCommunityGroups,
    useCommunityGroup,
    useChannelPosts,
    useCreatePost,
    useJoinGroup,
    useLeaveGroup,
    useCreateComment,
    fmtPostDate,
} from "@/hooks/use-community";
import type { CommunityGroup, Post, Comment } from "@/lib/types";

/* -- Helpers -- */
function authorName(post: Post | Comment): string {
    const p = (post as Post).author?.profile ?? (post as Comment).author?.profile;
    if (p) return `${p.firstName} ${p.lastName}`;
    return "Member";
}

/* -- Group sidebar item � has its own join/leave hooks -- */
function GroupItem({
    group,
    isSelected,
    onSelect,
}: {
    group: CommunityGroup;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const join = useJoinGroup(group.id);
    const leave = useLeaveGroup(group.id);
    const isBusy = join.isLoading || leave.isLoading;

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            if (group.isJoined) {
                await leave.trigger();
            } else {
                await join.trigger();
            }
        } catch {
            // silently ignore; SWR revalidation will correct the state
        }
    };

    return (
        <article
            className={`rounded-2xl border p-4 transition-colors cursor-pointer ${isSelected ? "border-brand-300 bg-brand-50" : "border-stone-200 bg-white hover:border-stone-300"}`}
            onClick={onSelect}
        >
            <p className="font-semibold text-stone-900 leading-snug">{group.name}</p>
            {group.description && (
                <p className="text-sm text-stone-500 mt-1 line-clamp-2">{group.description}</p>
            )}
            <p className="text-xs text-stone-400 mt-2">{group.memberCount} members � {group.newPostCount} new posts</p>
            <button
                onClick={handleToggle}
                disabled={isBusy}
                className="mt-3 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 hover:border-brand-300 hover:text-brand-700 disabled:opacity-60 transition-colors"
            >
                {isBusy ? "Updating..." : group.isJoined ? "Leave Group" : "Join Group"}
            </button>
        </article>
    );
}

/* -- Single post with inline comment composer -- */
function PostItem({
    post,
    localComments,
    onCommentAdded,
}: {
    post: Post;
    localComments: Comment[];
    onCommentAdded: (postId: string, comment: Comment) => void;
}) {
    const [draft, setDraft] = useState("");
    const { trigger, isLoading } = useCreateComment(post.id);
    const { toast } = useToast();

    const handleReply = async () => {
        const body = draft.trim();
        if (!body || isLoading) return;
        try {
            const res = await trigger({ body });
            if (res?.data) onCommentAdded(post.id, res.data);
            setDraft("");
            toast("Reply posted");
        } catch {
            toast("Could not post reply", "error");
        }
    };

    return (
        <article className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-sm text-stone-500">{authorName(post)} � {fmtPostDate(post.createdAt)}</p>
            {post.title && <h3 className="text-lg font-semibold text-stone-900 mt-1">{post.title}</h3>}
            <p className="text-stone-700 mt-2 whitespace-pre-wrap">{post.body}</p>

            {localComments.length > 0 && (
                <div className="mt-4 space-y-2">
                    {localComments.map((comment) => (
                        <div key={comment.id} className="rounded-xl bg-stone-50 border border-stone-100 p-3">
                            <p className="text-xs text-stone-500">{authorName(comment)} � {fmtPostDate(comment.createdAt)}</p>
                            <p className="text-sm text-stone-700 mt-1">{comment.body}</p>
                        </div>
                    ))}
                </div>
            )}
            {post._count.comments > localComments.length && (
                <p className="text-xs text-stone-400 mt-3">{post._count.comments} comment{post._count.comments !== 1 ? "s" : ""}</p>
            )}

            <div className="mt-3 flex items-center gap-2">
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleReply(); } }}
                    placeholder="Write a reply..."
                    className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-300"
                />
                <button
                    onClick={() => void handleReply()}
                    disabled={isLoading || !draft.trim()}
                    aria-label="Reply"
                    className="rounded-lg border border-stone-300 p-2 text-stone-600 hover:border-brand-300 hover:text-brand-700 disabled:opacity-50 transition-colors"
                >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
            </div>
        </article>
    );
}

/* -- Main page -- */
export default function MemberCommunityPage() {
    const { toast } = useToast();
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    const [composerTitle, setComposerTitle] = useState("");
    const [composerBody, setComposerBody] = useState("");
    // local comment map: postId ? Comment[] (optimistic additions)
    const [localComments, setLocalComments] = useState<Record<string, Comment[]>>({});

    const { groups, isLoading: loadingGroups, error: groupsError } = useCommunityGroups();

    // Derive effective IDs without side effects
    const effectiveGroupId = selectedGroupId ?? groups[0]?.id ?? null;

    const { group: groupDetail, isLoading: loadingDetail } = useCommunityGroup(effectiveGroupId);
    const channels = groupDetail?.channels ?? [];
    const effectiveChannelId =
        selectedChannelId && channels.some(c => c.id === selectedChannelId)
            ? selectedChannelId
            : channels[0]?.id ?? null;

    const { posts, isLoading: loadingPosts, error: postsError, mutate: mutatePosts } = useChannelPosts(
        effectiveGroupId,
        effectiveChannelId,
    );

    const createPost = useCreatePost(effectiveGroupId ?? "", effectiveChannelId ?? "");

    const selectedChannel = channels.find(c => c.id === effectiveChannelId);

    const handlePost = async () => {
        const body = composerBody.trim();
        if (!body || !effectiveGroupId || !effectiveChannelId || createPost.isLoading) return;
        try {
            await createPost.trigger({ body, title: composerTitle.trim() || undefined });
            setComposerTitle("");
            setComposerBody("");
            void mutatePosts();
            toast("Post published");
        } catch {
            toast("Could not publish post", "error");
        }
    };

    const handleCommentAdded = (postId: string, comment: Comment) => {
        setLocalComments(prev => ({
            ...prev,
            [postId]: [...(prev[postId] ?? []), comment],
        }));
    };

    return (
        <ErrorBoundary>
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Community</h1>
                    <p className="text-stone-500 mt-1">Discussion threads from your BGG groups.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* -- Groups sidebar -- */}
                    <aside className="space-y-3">
                        <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wide">Groups</h2>

                        {loadingGroups ? (
                            <div className="rounded-2xl border border-stone-200 bg-white p-6 flex items-center gap-2 text-stone-500">
                                <Loader2 size={16} className="animate-spin" /> Loading groups...
                            </div>
                        ) : groupsError ? (
                            <EmptyState icon={Users} heading="Groups unavailable" description="Could not load community groups." variant="plain" />
                        ) : groups.length === 0 ? (
                            <EmptyState icon={Users} heading="No groups found" description="Community groups will appear here." variant="plain" />
                        ) : (
                            groups.map(group => (
                                <GroupItem
                                    key={group.id}
                                    group={group}
                                    isSelected={group.id === effectiveGroupId}
                                    onSelect={() => { setSelectedGroupId(group.id); setSelectedChannelId(null); }}
                                />
                            ))
                        )}
                    </aside>

                    {/* -- Channel + posts -- */}
                    <section className="lg:col-span-2 space-y-4">
                        {/* Channel selector */}
                        {loadingDetail ? (
                            <div className="flex items-center gap-2 text-stone-400 text-sm"><Loader2 size={14} className="animate-spin" /> Loading channels...</div>
                        ) : channels.length > 0 ? (
                            <div className="flex items-center gap-2 overflow-x-auto pb-1">
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
                        {effectiveGroupId && effectiveChannelId && (
                            <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
                                <h2 className="text-base font-bold text-stone-900">
                                    Post in {selectedChannel?.name ?? "channel"}
                                </h2>
                                <input
                                    type="text"
                                    value={composerTitle}
                                    onChange={e => setComposerTitle(e.target.value)}
                                    placeholder="Optional title"
                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:outline-none focus:border-brand-300"
                                />
                                <textarea
                                    rows={3}
                                    value={composerBody}
                                    onChange={e => setComposerBody(e.target.value)}
                                    placeholder="Share an update with your group..."
                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm resize-none focus:outline-none focus:border-brand-300"
                                />
                                <button
                                    onClick={() => void handlePost()}
                                    disabled={createPost.isLoading || !composerBody.trim()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors"
                                >
                                    {createPost.isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Post
                                </button>
                            </div>
                        )}

                        {/* Posts */}
                        {!effectiveGroupId || !effectiveChannelId ? (
                            <EmptyState icon={MessageSquare} heading="Select a group and channel" description="Pick a group from the sidebar to see posts." variant="plain" />
                        ) : loadingPosts ? (
                            <div className="rounded-2xl border border-stone-200 bg-white p-6 flex items-center gap-2 text-stone-500">
                                <Loader2 size={16} className="animate-spin" /> Loading posts...
                            </div>
                        ) : postsError ? (
                            <EmptyState icon={MessageSquare} heading="Posts unavailable" description="Could not load posts for this channel." variant="plain" />
                        ) : posts.length === 0 ? (
                            <EmptyState icon={MessageSquare} heading="No posts yet" description="Be the first to start a discussion in this channel." variant="plain" />
                        ) : (
                            <div className="space-y-3">
                                {posts.map(post => (
                                    <PostItem
                                        key={post.id}
                                        post={post}
                                        localComments={localComments[post.id] ?? []}
                                        onCommentAdded={handleCommentAdded}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </ErrorBoundary>
    );
}
