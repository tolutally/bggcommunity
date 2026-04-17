"use client";

import { useAuthSWR } from "./use-auth-swr";
import { useApiMutation } from "./use-api-mutation";
import type {
  ApiResponse,
  PaginatedResponse,
  CommunityGroup,
  CommunityGroupDetail,
  Post,
  Comment,
} from "@/lib/types";

/* ── Groups ── */

export function useCommunityGroups() {
  const { data, error, isLoading, mutate } = useAuthSWR<PaginatedResponse<CommunityGroup>>(
    "/community/groups",
  );
  return { groups: data?.data ?? [], isLoading, error, mutate };
}

export function useCommunityGroup(id: string | null) {
  const { data, error, isLoading, mutate } = useAuthSWR<ApiResponse<CommunityGroupDetail>>(
    id ? `/community/groups/${id}` : null,
  );
  return { group: data?.data ?? null, isLoading, error, mutate };
}

export function useJoinGroup(groupId: string) {
  return useApiMutation<ApiResponse<{ joined: boolean }>>(
    `/community/groups/${groupId}/join`,
    { method: "POST", revalidate: [`/community/groups/${groupId}`, "/community/groups"] },
  );
}

export function useLeaveGroup(groupId: string) {
  return useApiMutation(
    `/community/groups/${groupId}/leave`,
    { method: "DELETE", revalidate: [`/community/groups/${groupId}`, "/community/groups"] },
  );
}

/* ── Posts ── */

export function useChannelPosts(groupId: string | null, channelId: string | null, cursor?: string) {
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const key = groupId && channelId
    ? `/community/groups/${groupId}/channels/${channelId}/posts${params}`
    : null;
  const { data, error, isLoading, mutate } = useAuthSWR<PaginatedResponse<Post>>(key);
  return { posts: data?.data ?? [], nextCursor: data?.nextCursor ?? null, isLoading, error, mutate };
}

export function useCreatePost(groupId: string, channelId: string) {
  return useApiMutation<ApiResponse<Post>, { title?: string; body: string }>(
    `/community/groups/${groupId}/channels/${channelId}/posts`,
    { method: "POST", revalidate: `/community/groups/${groupId}/channels/${channelId}/posts` },
  );
}

export function useDeletePost(postId: string) {
  return useApiMutation(`/community/posts/${postId}`, {
    method: "DELETE",
  });
}

/* ── Comments ── */

export function usePostComments(postId: string | null) {
  // Comments come as part of a separate fetch if needed;
  // For now we don't have a dedicated list endpoint — comments load with post detail
  // We'll use the post's comment endpoint for creating
  return { postId };
}

export function useCreateComment(postId: string) {
  return useApiMutation<ApiResponse<Comment>, { body: string }>(
    `/community/posts/${postId}/comments`,
    { method: "POST" },
  );
}

export function useDeleteComment(commentId: string) {
  return useApiMutation(`/community/comments/${commentId}`, {
    method: "DELETE",
  });
}

/* ── Helpers ── */

export function fmtPostDate(createdAt: string): string {
  const now = Date.now();
  const then = new Date(createdAt).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
