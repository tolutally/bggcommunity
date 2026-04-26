"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageSquare, Send, Users } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useQueryInvalidation } from "@/hooks/useQueryInvalidation";
import {
    addCommunityComment,
    createCommunityPost,
    fetchCommunityGroupDetail,
    fetchCommunityGroups,
    fetchCommunityPosts,
    getCommunityErrorMessage,
    joinCommunityGroup,
    leaveCommunityGroup,
    type CommunityChannel,
    type CommunityGroupRecord,
    type CommunityPostRecord,
} from "@/lib/community";
import { useCursorPagination } from "@/hooks/useCursorPagination";
import { invalidateQuery } from "@/lib/queryInvalidation";

function formatRelativeDate(value: string) {
    const date = new Date(value);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) {
        return "just now";
    }

    if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
        return `${diffDays}d ago`;
    }

    return date.toLocaleDateString();
}

export default function MemberCommunityPage() {
    const { getToken } = useAuth();
    const { toast } = useToast();

    const [groups, setGroups] = useState<CommunityGroupRecord[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    const [isLoadingGroups, setIsLoadingGroups] = useState(true);
    const [groupsError, setGroupsError] = useState<string | null>(null);
    const [composerTitle, setComposerTitle] = useState("");
    const [composerContent, setComposerContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [isTogglingGroupId, setIsTogglingGroupId] = useState<string | null>(null);
    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
    const [replyingToPostId, setReplyingToPostId] = useState<string | null>(null);
    const [mutationError, setMutationError] = useState<string | null>(null);
    const [retryMutation, setRetryMutation] = useState<(() => void) | null>(null);

    const runWithRetry = (message: string, retry: () => void) => {
        setMutationError(message);
        setRetryMutation(() => retry);
    };

    const clearMutationError = () => {
        setMutationError(null);
        setRetryMutation(null);
    };

    const loadGroups = useMemo(() => {
        let cancelled = false;

        const run = async () => {
            setIsLoadingGroups(true);
            setGroupsError(null);

            try {
                const response = await fetchCommunityGroups();

                if (cancelled) {
                    return;
                }

                setGroups(response);

                if (response.length > 0) {
                    setSelectedGroupId((current) => current ?? response[0].id);
                }
            } catch (error) {
                if (!cancelled) {
                    setGroupsError(getCommunityErrorMessage(error));
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingGroups(false);
                }
            }
        };

        return {
            run,
            cancel: () => {
                cancelled = true;
            },
        };
    }, []);

    useEffect(() => {
        void loadGroups.run();

        return () => {
            loadGroups.cancel();
        };
    }, [loadGroups]);

    useEffect(() => {
        let cancelled = false;

        async function loadSelectedGroupDetail() {
            if (!selectedGroupId) {
                return;
            }

            try {
                const detail = await fetchCommunityGroupDetail(selectedGroupId);
                if (cancelled) {
                    return;
                }

                setGroups((prev) => prev.map((group) => group.id === detail.id ? detail : group));
                setSelectedChannelId((current) => {
                    if (current && detail.channels.some((channel) => channel.id === current)) {
                        return current;
                    }
                    return detail.channels[0]?.id ?? null;
                });
            } catch {
                // Keep list-level data if detail endpoint fails.
            }
        }

        void loadSelectedGroupDetail();

        return () => {
            cancelled = true;
        };
    }, [selectedGroupId]);

    const selectedGroup = useMemo(
        () => groups.find((group) => group.id === selectedGroupId) ?? null,
        [groups, selectedGroupId],
    );

    const channels: CommunityChannel[] = selectedGroup?.channels ?? [];

    const postsQuery = useMemo(
        () => ({
            groupId: selectedGroupId ?? "",
            channelId: selectedChannelId ?? "",
            limit: 20,
        }),
        [selectedChannelId, selectedGroupId],
    );

    const {
        items: posts,
        isLoading: isLoadingPosts,
        isLoadingMore,
        error: postsError,
        hasMore,
        loadMore,
        reload,
        setItems,
    } = useCursorPagination<CommunityPostRecord, typeof postsQuery>({
        query: postsQuery,
        loadPage: (query) => {
            if (!query.groupId || !query.channelId) {
                return Promise.resolve({ items: [], nextCursor: null });
            }
            return fetchCommunityPosts(query, getToken);
        },
        getErrorMessage: getCommunityErrorMessage,
    });

    const communityInvalidationScopes = useMemo(() => ["community"] as const, []);
    useQueryInvalidation([...communityInvalidationScopes], async () => {
        await Promise.all([loadGroups.run(), reload()]);
    });

    const handleToggleGroupMembership = async (group: CommunityGroupRecord) => {
        if (isTogglingGroupId === group.id) {
            return;
        }

        clearMutationError();
        const previousGroups = groups;
        const optimisticJoined = !group.isJoined;
        setGroups((prev) => prev.map((item) => {
            if (item.id !== group.id) {
                return item;
            }

            return {
                ...item,
                isJoined: optimisticJoined,
                memberCount: item.memberCount + (optimisticJoined ? 1 : -1),
            };
        }));
        setIsTogglingGroupId(group.id);

        try {
            if (group.isJoined) {
                await leaveCommunityGroup(group.id, getToken);
            } else {
                await joinCommunityGroup(group.id, getToken);
            }
            invalidateQuery("community");
        } catch (error) {
            setGroups(previousGroups);
            const message = getCommunityErrorMessage(error);
            runWithRetry(message, () => {
                void handleToggleGroupMembership(group);
            });
            toast(message, "error");
        } finally {
            setIsTogglingGroupId(null);
        }
    };

    const handlePost = async () => {
        const content = composerContent.trim();
        const title = composerTitle.trim();

        if (!selectedGroupId || !selectedChannelId || !content || isPosting) {
            return;
        }

        clearMutationError();
        const optimisticId = `optimistic-post-${Date.now()}`;
        const previousTitle = composerTitle;
        const previousContent = composerContent;
        const optimisticPost: CommunityPostRecord = {
            id: optimisticId,
            title: title || null,
            content,
            authorName: "You",
            createdAt: new Date().toISOString(),
            comments: [],
        };
        setItems((prev) => [optimisticPost, ...prev]);
        setComposerTitle("");
        setComposerContent("");
        setIsPosting(true);

        try {
            const post = await createCommunityPost(
                selectedGroupId,
                selectedChannelId,
                content,
                getToken,
                title || undefined,
            );

            setItems((prev) => prev.map((item) => item.id === optimisticId ? post : item));
            invalidateQuery("community");
            toast("Post published");
        } catch (error) {
            setItems((prev) => prev.filter((item) => item.id !== optimisticId));
            setComposerTitle(previousTitle);
            setComposerContent(previousContent);
            const message = getCommunityErrorMessage(error);
            runWithRetry(message, () => {
                void handlePost();
            });
            toast(message, "error");
        } finally {
            setIsPosting(false);
        }
    };

    const handleReply = async (postId: string) => {
        const content = replyDrafts[postId]?.trim();

        if (!content || replyingToPostId === postId) {
            return;
        }

        clearMutationError();
        const optimisticId = `optimistic-comment-${postId}-${Date.now()}`;
        const optimisticCreatedAt = new Date().toISOString();
        setItems((prev) => prev.map((post) => post.id === postId ? {
            ...post,
            comments: [
                ...post.comments,
                {
                    id: optimisticId,
                    content,
                    authorName: "You",
                    createdAt: optimisticCreatedAt,
                },
            ],
        } : post));
        setReplyDrafts((prev) => ({ ...prev, [postId]: "" }));
        setReplyingToPostId(postId);

        try {
            const comment = await addCommunityComment(postId, content, getToken);
            setItems((prev) => prev.map((post) => post.id === postId ? {
                ...post,
                comments: post.comments.map((entry) => entry.id === optimisticId ? comment : entry),
            } : post));
            invalidateQuery("community");
            toast("Reply posted");
        } catch (error) {
            setItems((prev) => prev.map((post) => post.id === postId ? {
                ...post,
                comments: post.comments.filter((entry) => entry.id !== optimisticId),
            } : post));
            setReplyDrafts((prev) => ({ ...prev, [postId]: content }));
            const message = getCommunityErrorMessage(error);
            runWithRetry(message, () => {
                void handleReply(postId);
            });
            toast(message, "error");
        } finally {
            setReplyingToPostId(null);
        }
    };

    return (
        <ErrorBoundary>
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Community</h1>
                    <p className="text-stone-500 mt-1">Real-time discussion threads from your BGG groups.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <aside className="space-y-3">
                        <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wide">Groups</h2>
                        {isLoadingGroups ? (
                            <div className="rounded-2xl border border-stone-200 bg-white p-6 flex items-center gap-2 text-stone-500">
                                <Loader2 size={16} className="animate-spin" /> Loading groups...
                            </div>
                        ) : groupsError ? (
                            <EmptyState icon={Users} heading="Groups unavailable" description={groupsError} variant="plain" />
                        ) : groups.length === 0 ? (
                            <EmptyState icon={Users} heading="No groups found" description="Community groups will appear here when available." variant="plain" />
                        ) : (
                            groups.map((group) => (
                                <article key={group.id} className={`rounded-2xl border p-4 transition-colors ${group.id === selectedGroupId ? "border-brand-300 bg-brand-50" : "border-stone-200 bg-white hover:border-stone-300"}`}>
                                    <button onClick={() => setSelectedGroupId(group.id)} className="w-full text-left">
                                        <p className="font-semibold text-stone-900">{group.name}</p>
                                        <p className="text-sm text-stone-500 mt-1 line-clamp-2">{group.description || "No description"}</p>
                                        <p className="text-xs text-stone-500 mt-2">{group.memberCount} members · {group.newPostCount} new posts</p>
                                    </button>
                                    <button
                                        onClick={() => void handleToggleGroupMembership(group)}
                                        disabled={isTogglingGroupId === group.id}
                                        className="mt-3 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 hover:border-brand-300 hover:text-brand-700 disabled:opacity-60"
                                    >
                                        {isTogglingGroupId === group.id ? "Updating..." : group.isJoined ? "Leave Group" : "Join Group"}
                                    </button>
                                </article>
                            ))
                        )}
                    </aside>

                    <section className="lg:col-span-2 space-y-4">
                        {mutationError ? (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-center justify-between gap-3">
                                <p className="text-sm text-red-700">{mutationError}</p>
                                {retryMutation ? (
                                    <button
                                        onClick={() => {
                                            clearMutationError();
                                            retryMutation();
                                        }}
                                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                                    >
                                        Retry
                                    </button>
                                ) : null}
                            </div>
                        ) : null}

                        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-lg font-bold text-stone-900">Discussion</h2>
                                <select
                                    aria-label="Select community channel"
                                    value={selectedChannelId ?? ""}
                                    onChange={(event) => setSelectedChannelId(event.target.value)}
                                    className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-brand-300"
                                >
                                    {channels.length === 0 ? <option value="">No channels</option> : null}
                                    {channels.map((channel) => (
                                        <option key={channel.id} value={channel.id}>{channel.name}</option>
                                    ))}
                                </select>
                            </div>

                            <input
                                type="text"
                                value={composerTitle}
                                onChange={(event) => setComposerTitle(event.target.value)}
                                placeholder="Optional title"
                                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:outline-none focus:border-brand-300"
                            />
                            <textarea
                                rows={3}
                                value={composerContent}
                                onChange={(event) => setComposerContent(event.target.value)}
                                placeholder="Share an update with your group..."
                                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm resize-none focus:outline-none focus:border-brand-300"
                            />
                            <button
                                onClick={() => void handlePost()}
                                disabled={isPosting || !selectedGroupId || !selectedChannelId || !composerContent.trim()}
                                className="inline-flex items-center gap-2 rounded-xl bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                            >
                                {isPosting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Post
                            </button>
                        </div>

                        {isLoadingPosts ? (
                            <div className="rounded-2xl border border-stone-200 bg-white p-6 flex items-center gap-2 text-stone-500">
                                <Loader2 size={16} className="animate-spin" /> Loading posts...
                            </div>
                        ) : postsError ? (
                            <EmptyState icon={MessageSquare} heading="Posts unavailable" description={postsError} variant="plain" />
                        ) : posts.length === 0 ? (
                            <EmptyState icon={MessageSquare} heading="No posts yet" description="Be the first to start a discussion in this channel." variant="plain" />
                        ) : (
                            <div className="space-y-3">
                                {posts.map((post) => (
                                    <article key={post.id} className="rounded-2xl border border-stone-200 bg-white p-5">
                                        <p className="text-sm text-stone-500">{post.authorName} · {formatRelativeDate(post.createdAt)}</p>
                                        {post.title ? <h3 className="text-lg font-semibold text-stone-900 mt-1">{post.title}</h3> : null}
                                        <p className="text-stone-700 mt-2 whitespace-pre-wrap">{post.content}</p>

                                        <div className="mt-4 space-y-2">
                                            {post.comments.map((comment) => (
                                                <div key={comment.id} className="rounded-xl bg-stone-50 border border-stone-100 p-3">
                                                    <p className="text-xs text-stone-500">{comment.authorName} · {formatRelativeDate(comment.createdAt)}</p>
                                                    <p className="text-sm text-stone-700 mt-1">{comment.content}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-3 flex items-center gap-2">
                                            <input
                                                value={replyDrafts[post.id] ?? ""}
                                                onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [post.id]: event.target.value }))}
                                                placeholder="Write a reply..."
                                                className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-300"
                                            />
                                            <button
                                                onClick={() => void handleReply(post.id)}
                                                disabled={replyingToPostId === post.id || !(replyDrafts[post.id] ?? "").trim()}
                                                className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 hover:border-brand-300 hover:text-brand-700 disabled:opacity-60"
                                            >
                                                {replyingToPostId === post.id ? "Replying..." : "Reply"}
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        {hasMore ? (
                            <div className="flex justify-center">
                                <button
                                    onClick={() => void loadMore()}
                                    disabled={isLoadingMore}
                                    className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-brand-300 hover:text-brand-700 disabled:opacity-60"
                                >
                                    {isLoadingMore ? "Loading..." : "Load more"}
                                </button>
                            </div>
                        ) : null}

                        {!isLoadingPosts && posts.length > 0 ? (
                            <div className="flex justify-center">
                                <button onClick={() => void reload()} className="text-xs font-semibold text-stone-500 hover:text-brand-700">
                                    Refresh posts
                                </button>
                            </div>
                        ) : null}
                    </section>
                </div>
            </div>
        </ErrorBoundary>
    );
}
