"use client";

import { useAuthSWR } from "./use-auth-swr";
import type { ApiResponse, User } from "@/lib/types";

/**
 * Fetch the authenticated user's profile via GET /users/me.
 * Returns the full User object (with nested profile).
 *
 * Usage:
 *   const { user, isLoading, error, mutate } = useCurrentUser();
 */
export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useAuthSWR<ApiResponse<User>>(
    "/users/me",
  );

  return {
    user: data?.data ?? null,
    isLoading,
    error,
    mutate,
  };
}
