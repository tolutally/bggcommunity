"use client";

import { useAuthSWR } from "./use-auth-swr";
import { useApiMutation } from "./use-api-mutation";
import type { ApiResponse, PaginatedResponse, User } from "@/lib/types";

// ── Input types ────────────────────────────────────────────────────────

export interface AddMemberInput {
  email: string;
  firstName: string;
  lastName: string;
}

export interface BulkAddInput {
  members: AddMemberInput[];
}

export interface BulkAddResult {
  created: number;
  skipped: string[];
}

export interface WarningInput {
  message: string;
}

// ── Read hooks ──────────────────────────────────────────────────────────

export function useAdminUsers() {
  const { data, error, isLoading, mutate } = useAuthSWR<PaginatedResponse<User>>(
    "/admin/users",
  );
  return {
    users: data?.data ?? [],
    isLoading,
    error,
    mutate,
  };
}

export function useAdminUser(id: string | null) {
  const { data, error, isLoading, mutate } = useAuthSWR<ApiResponse<User>>(
    id ? `/admin/users/${id}` : null,
  );
  return {
    user: data?.data ?? null,
    isLoading,
    error,
    mutate,
  };
}

// ── Mutation hooks ──────────────────────────────────────────────────────

export function useAddMember() {
  return useApiMutation<ApiResponse<User>, AddMemberInput>("/admin/users", {
    method: "POST",
    revalidate: ["/admin/users", "/members"],
  });
}

export function useBulkAddMembers() {
  return useApiMutation<ApiResponse<BulkAddResult>, BulkAddInput>(
    "/admin/users/bulk",
    { method: "POST", revalidate: ["/admin/users", "/members"] },
  );
}

export function useSuspendMember(id: string) {
  return useApiMutation<ApiResponse<User>>(
    `/admin/users/${id}/suspend`,
    { method: "PATCH", revalidate: ["/admin/users", "/members"] },
  );
}

export function useReinstateMember(id: string) {
  return useApiMutation<ApiResponse<User>>(
    `/admin/users/${id}/reinstate`,
    { method: "PATCH", revalidate: ["/admin/users", "/members"] },
  );
}

export function useDeleteMember(id: string) {
  return useApiMutation(
    `/admin/users/${id}`,
    { method: "DELETE", revalidate: ["/admin/users", "/members"] },
  );
}

export function useSendWarning(id: string) {
  return useApiMutation<ApiResponse<{ sent: boolean }>, WarningInput>(
    `/admin/users/${id}/warning`,
    { method: "POST", revalidate: [] },
  );
}
