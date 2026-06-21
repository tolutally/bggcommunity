"use client";

import { useAuthSWR } from "./use-auth-swr";
import { useApiMutation } from "./use-api-mutation";
import type { ApiResponse, PaginatedResponse, Job, ReferralRequest } from "@/lib/types";

/**
 * Fetch paginated jobs list via GET /jobs.
 */
export function useJobs(cursor?: string) {
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const { data, error, isLoading, mutate } = useAuthSWR<PaginatedResponse<Job>>(
    `/jobs${params}`,
  );

  return {
    jobs: data?.data ?? [],
    nextCursor: data?.nextCursor ?? null,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Fetch a single job via GET /jobs/:id.
 */
export function useJob(id: string | null) {
  const { data, error, isLoading, mutate } = useAuthSWR<ApiResponse<Job>>(
    id ? `/jobs/${id}` : null,
  );

  return {
    job: data?.data ?? null,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Request a referral for a job via POST /jobs/:id/referral-request.
 */
export function useRequestReferral(jobId: string) {
  return useApiMutation<ApiResponse<{ id: string }>, { message?: string }>(
    `/jobs/${jobId}/referral-request`,
    {
      method: "POST",
      revalidate: [`/jobs/${jobId}`, `/jobs/${jobId}/referral-request`],
    },
  );
}

/**
 * Fetch the current user's referral request for a job via GET /jobs/:id/referral-request.
 * Returns null if the user hasn't requested a referral yet.
 */
export function useMyReferralRequest(jobId: string | null) {
  const { data, isLoading, mutate } = useAuthSWR<ApiResponse<ReferralRequest | null>>(
    jobId ? `/jobs/${jobId}/referral-request` : null,
  );
  return { referralRequest: data?.data ?? null, isLoading, mutate };
}

/* ── Display helpers ── */

/** Format createdAt to relative time */
export function fmtJobDate(createdAt: string): string {
  const now = Date.now();
  const then = new Date(createdAt).getTime();
  const diffMs = now - then;
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
  return new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
