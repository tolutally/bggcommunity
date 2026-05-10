"use client";

import { useApiMutation } from "./use-api-mutation";
import type { ApiResponse, CommunityGroup, Channel } from "@/lib/types";

export function useCreateGroup() {
  return useApiMutation<ApiResponse<CommunityGroup>, { name: string; description?: string }>(
    "/admin/community/groups",
    { method: "POST", revalidate: "/community/groups" },
  );
}

export function useUpdateGroup(id: string) {
  return useApiMutation<ApiResponse<CommunityGroup>, Partial<{ name: string; description: string }>>(
    `/admin/community/groups/${id}`,
    { method: "PATCH", revalidate: ["/community/groups", `/community/groups/${id}`] },
  );
}

export function useDeleteGroup(id: string) {
  return useApiMutation(`/admin/community/groups/${id}`, {
    method: "DELETE",
    revalidate: "/community/groups",
  });
}

export function useAddChannel(groupId: string) {
  return useApiMutation<ApiResponse<Channel>, { name: string; description?: string }>(
    `/admin/community/groups/${groupId}/channels`,
    { method: "POST", revalidate: `/community/groups/${groupId}` },
  );
}

export function useAnnounce() {
  return useApiMutation<ApiResponse<{ id: string }>, { title: string; body: string; groupId?: string }>(
    "/admin/community/announce",
    { method: "POST" },
  );
}

export function useAddGroupMembers(groupId: string) {
  return useApiMutation<ApiResponse<{ added: number }>, { userIds: string[] }>(
    `/admin/community/groups/${groupId}/members`,
    { method: "POST", revalidate: ["/community/groups", `/community/groups/${groupId}`] },
  );
}

export function useAddGroupCohort(groupId: string) {
  return useApiMutation<ApiResponse<{ added: number }>, { cohortId: string }>(
    `/admin/community/groups/${groupId}/cohorts`,
    { method: "POST", revalidate: ["/community/groups", `/community/groups/${groupId}`] },
  );
}

export function useRemoveGroupMember(groupId: string, userId: string) {
  return useApiMutation(
    `/admin/community/groups/${groupId}/members/${userId}`,
    { method: "DELETE", revalidate: ["/community/groups", `/community/groups/${groupId}`] },
  );
}
