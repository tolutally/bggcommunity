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
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const fetcher = async (key: string): Promise<T> => {
    let token = await getToken();
    console.log(`[BGG:SWR] fetcher called for "${key}" | token=${token ? "✅" : "❌ null (will retry)"}`);

    // getToken() can return null momentarily while Clerk refreshes the session token.
    // Retry once with skipCache before giving up so we don't abort before the token is ready.
    if (!token) {
      await new Promise((r) => setTimeout(r, 500));
      token = await getToken({ skipCache: true });
      console.log(`[BGG:SWR] retry result for "${key}" | token=${token ? "✅ got token" : "❌ still null — throwing"}`);
    }

    if (!token) {
      throw new Error("Missing auth token");
    }

    return apiClient<T>(key, { token });
  };

  const swrKey = isLoaded && isSignedIn ? path : null;
  console.log(`[BGG:SWR] key="${path}" | isLoaded=${isLoaded} isSignedIn=${isSignedIn} → swrKey=${swrKey}`);

  return useSWR<T>(swrKey, fetcher, config);
}
