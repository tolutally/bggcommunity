"use client";

import useSWR, { type SWRConfiguration } from "swr";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api";

/**
 * Thin wrapper around useSWR that auto-attaches the Clerk Bearer token.
 *
 * Usage:
 *   const { data, error, isLoading } = useAuthSWR<User>("/users/me");
 *   const { data } = useAuthSWR<Event[]>("/events?cursor=abc");
 */
export function useAuthSWR<T = unknown>(
  path: string | null,
  config?: SWRConfiguration<T>,
) {
  const { getToken } = useAuth();

  const fetcher = async (key: string): Promise<T> => {
    const token = await getToken();
    return apiClient<T>(key, { token });
  };

  return useSWR<T>(path, fetcher, config);
}
