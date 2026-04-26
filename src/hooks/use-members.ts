"use client";

import { useAuthSWR } from "./use-auth-swr";
import type { ApiResponse, PaginatedResponse, MemberCard, User } from "@/lib/types";

/**
 * Fetch paginated members directory via GET /members.
 * Supports cursor-based pagination.
 */
export function useMembers(cursor?: string) {
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const { data, error, isLoading, mutate } = useAuthSWR<PaginatedResponse<MemberCard>>(
    `/members${params}`,
  );

  return {
    members: data?.data ?? [],
    nextCursor: data?.nextCursor ?? null,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Fetch a single member's full profile via GET /members/:id.
 */
export function useMember(id: string | null) {
  const { data, error, isLoading, mutate } = useAuthSWR<ApiResponse<User>>(
    id ? `/members/${id}` : null,
  );

  return {
    member: data?.data ?? null,
    isLoading,
    error,
    mutate,
  };
}
