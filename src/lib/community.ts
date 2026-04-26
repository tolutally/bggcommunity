import { apiRequest, buildQueryString, type TokenProvider } from "@/lib/api";
import { getApiErrorMessage as getSharedApiErrorMessage } from "@/lib/jobs";

interface SuccessResponse<T> {
    success: true;
    data: T;
}

interface CursorResponse<T> {
    success: true;
    data: T[];
    nextCursor: string | null;
}

export interface CommunityChannel {
    id: string;
    name: string;
}

export interface CommunityGroupRecord {
    id: string;
    name: string;
    description: string | null;
    memberCount: number;
    newPostCount: number;
    isJoined: boolean;
    channels: CommunityChannel[];
}

export interface CommunityCommentRecord {
    id: string;
    content: string;
    createdAt: string;
    authorName: string;
}

export interface CommunityPostRecord {
    id: string;
    title: string | null;
    content: string;
    createdAt: string;
    authorName: string;
    comments: CommunityCommentRecord[];
}

export interface CommunityPostsQuery {
    groupId: string;
    channelId: string;
    cursor?: string | null;
    limit?: number;
}

export interface ModerationContentRecord {
    id: string;
    sourceType: "Post" | "Comment";
    groupId: string;
    groupName: string;
    channelId: string;
    channelName: string;
    authorName: string;
    content: string;
    createdAt: string;
    postTitle: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
    return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown, fallback = 0) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeChannel(value: unknown): CommunityChannel {
    const record = isRecord(value) ? value : {};

    return {
        id: String(record.id ?? "unknown-channel"),
        name: readString(record.name) ?? "general",
    };
}

function normalizeGroup(value: unknown): CommunityGroupRecord {
    const record = isRecord(value) ? value : {};
    const channels = Array.isArray(record.channels) ? record.channels.map(normalizeChannel) : [];

    return {
        id: String(record.id ?? "unknown-group"),
        name: readString(record.name) ?? "Untitled group",
        description: readString(record.description),
        memberCount: readNumber(record.memberCount),
        newPostCount: readNumber(record.newPostCount),
        isJoined: Boolean(record.isJoined),
        channels,
    };
}

function normalizeComment(value: unknown): CommunityCommentRecord {
    const record = isRecord(value) ? value : {};
    const author = isRecord(record.author) ? record.author : {};
    const profile = isRecord(author.profile) ? author.profile : {};

    return {
        id: String(record.id ?? "unknown-comment"),
        content: readString(record.content) ?? "",
        createdAt: readString(record.createdAt) ?? new Date().toISOString(),
        authorName:
            [readString(profile.firstName), readString(profile.lastName)].filter(Boolean).join(" ") ||
            readString(author.email) ||
            "Community member",
    };
}

function normalizePost(value: unknown): CommunityPostRecord {
    const record = isRecord(value) ? value : {};
    const author = isRecord(record.author) ? record.author : {};
    const profile = isRecord(author.profile) ? author.profile : {};
    const comments = Array.isArray(record.comments) ? record.comments.map(normalizeComment) : [];

    return {
        id: String(record.id ?? "unknown-post"),
        title: readString(record.title),
        content: readString(record.content) ?? "",
        createdAt: readString(record.createdAt) ?? new Date().toISOString(),
        authorName:
            [readString(profile.firstName), readString(profile.lastName)].filter(Boolean).join(" ") ||
            readString(author.email) ||
            "Community member",
        comments,
    };
}

export async function fetchCommunityGroups() {
    const response = await apiRequest<SuccessResponse<unknown[]>>("/community/groups");
    return Array.isArray(response.data) ? response.data.map(normalizeGroup) : [];
}

export async function fetchCommunityGroupDetail(groupId: string) {
    const response = await apiRequest<SuccessResponse<unknown>>(`/community/groups/${groupId}`);
    return normalizeGroup(response.data);
}

export async function joinCommunityGroup(groupId: string, getToken: TokenProvider) {
    await apiRequest(`/community/groups/${groupId}/join`, {
        method: "POST",
        getToken,
    });
}

export async function leaveCommunityGroup(groupId: string, getToken: TokenProvider) {
    await apiRequest(`/community/groups/${groupId}/leave`, {
        method: "DELETE",
        getToken,
    });
}

export async function fetchCommunityPosts(query: CommunityPostsQuery, getToken: TokenProvider) {
    const response = await apiRequest<CursorResponse<unknown>>(
        `/community/groups/${query.groupId}/channels/${query.channelId}/posts${buildQueryString({
            cursor: query.cursor,
            limit: query.limit ?? 20,
        })}`,
        { getToken },
    );

    return {
        items: Array.isArray(response.data) ? response.data.map(normalizePost) : [],
        nextCursor: response.nextCursor ?? null,
    };
}

export async function createCommunityPost(groupId: string, channelId: string, content: string, getToken: TokenProvider, title?: string) {
    const response = await apiRequest<SuccessResponse<unknown>>(
        `/community/groups/${groupId}/channels/${channelId}/posts`,
        {
            method: "POST",
            getToken,
            body: {
                content,
                title,
            },
        },
    );

    return normalizePost(response.data);
}

export async function addCommunityComment(postId: string, content: string, getToken: TokenProvider) {
    const response = await apiRequest<SuccessResponse<unknown>>(
        `/community/posts/${postId}/comments`,
        {
            method: "POST",
            getToken,
            body: { content },
        },
    );

    return normalizeComment(response.data);
}

export async function deleteCommunityPost(postId: string, getToken: TokenProvider) {
    await apiRequest(`/community/posts/${postId}`, {
        method: "DELETE",
        getToken,
    });
}

export async function deleteCommunityComment(commentId: string, getToken: TokenProvider) {
    await apiRequest(`/community/comments/${commentId}`, {
        method: "DELETE",
        getToken,
    });
}

export async function fetchModerationContent(getToken: TokenProvider) {
    const groups = await fetchCommunityGroups();
    const detailedGroups = await Promise.all(groups.map((group) => fetchCommunityGroupDetail(group.id).catch(() => group)));

    const items: ModerationContentRecord[] = [];

    await Promise.all(detailedGroups.map(async (group) => {
        const channels = group.channels ?? [];

        await Promise.all(channels.map(async (channel) => {
            try {
                const page = await fetchCommunityPosts({
                    groupId: group.id,
                    channelId: channel.id,
                    limit: 20,
                }, getToken);

                page.items.forEach((post) => {
                    items.push({
                        id: post.id,
                        sourceType: "Post",
                        groupId: group.id,
                        groupName: group.name,
                        channelId: channel.id,
                        channelName: channel.name,
                        authorName: post.authorName,
                        content: post.content,
                        createdAt: post.createdAt,
                        postTitle: post.title,
                    });

                    post.comments.forEach((comment) => {
                        items.push({
                            id: comment.id,
                            sourceType: "Comment",
                            groupId: group.id,
                            groupName: group.name,
                            channelId: channel.id,
                            channelName: channel.name,
                            authorName: comment.authorName,
                            content: comment.content,
                            createdAt: comment.createdAt,
                            postTitle: post.title,
                        });
                    });
                });
            } catch {
                // Skip channel-level failures so one channel does not block moderation page.
            }
        }));
    }));

    return items.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function getCommunityErrorMessage(error: unknown) {
    return getSharedApiErrorMessage(error, "Unable to load community data right now.");
}
