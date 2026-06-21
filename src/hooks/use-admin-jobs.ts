"use client";

import { useAuthSWR } from "./use-auth-swr";
import { useApiMutation } from "./use-api-mutation";
import type { ApiResponse, PaginatedResponse, Job, ReferralRequest, ReferralRequestStatus } from "@/lib/types";

export function useCreateJob() {
  return useApiMutation<ApiResponse<Job>, {
    title: string;
    company: string;
    location?: string;
    description: string;
    externalUrl: string;
    isFeatured?: boolean;
    referralAvailable?: boolean;
    referralContact?: string;
  }>("/admin/jobs", {
    method: "POST",
    revalidate: "/jobs",
  });
}

export function useUpdateJob(id: string) {
  return useApiMutation<ApiResponse<Job>, Partial<{
    title: string;
    company: string;
    location: string;
    description: string;
    externalUrl: string;
    isFeatured: boolean;
    referralAvailable: boolean;
    referralContact: string;
  }>>(`/admin/jobs/${id}`, {
    method: "PATCH",
    revalidate: ["/jobs", `/jobs/${id}`],
  });
}

export function useDeleteJob(id: string) {
  return useApiMutation(`/admin/jobs/${id}`, {
    method: "DELETE",
    revalidate: "/jobs",
  });
}

export function useToggleFeatured(id: string) {
  return useApiMutation<ApiResponse<Job>>(`/admin/jobs/${id}/feature`, {
    method: "PATCH",
    revalidate: ["/jobs", `/jobs/${id}`],
  });
}

function normalizeReferralRequest(raw: unknown): ReferralRequest {
  const r = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;

  // Backend may return user under different field names
  const userRaw = r.user ?? r.member ?? r.requester ?? r.applicant;
  const u = (typeof userRaw === "object" && userRaw !== null ? userRaw : null) as Record<string, unknown> | null;

  // Profile may be nested under user, or flattened directly into the request/user
  const profileRaw = u?.profile ?? r.profile;
  const p = (typeof profileRaw === "object" && profileRaw !== null ? profileRaw : null) as Record<string, unknown> | null;

  const firstName = String(p?.firstName ?? u?.firstName ?? r.firstName ?? "").trim();
  const lastName = String(p?.lastName ?? u?.lastName ?? r.lastName ?? "").trim();
  const email = String(u?.email ?? r.email ?? "").trim();
  const avatarUrl = (String(p?.avatarUrl ?? u?.avatarUrl ?? r.avatarUrl ?? "").trim()) || null;

  const hasUserData = u !== null || email || firstName;

  return {
    id: String(r.id ?? ""),
    jobId: String(r.jobId ?? ""),
    userId: String(r.userId ?? u?.id ?? ""),
    status: (r.status as ReferralRequestStatus) ?? "PENDING",
    message: typeof r.message === "string" ? r.message : null,
    createdAt: String(r.createdAt ?? ""),
    user: hasUserData ? {
      id: String(u?.id ?? r.userId ?? ""),
      email,
      profile: (firstName || lastName || avatarUrl) ? { firstName, lastName, avatarUrl } : null,
    } : undefined,
  };
}

export function useJobReferralRequests(jobId: string | null) {
  const { data, error, isLoading, mutate } = useAuthSWR<PaginatedResponse<ReferralRequest>>(
    jobId ? `/admin/jobs/${jobId}/referral-requests` : null,
  );
  const referrals = (data?.data ?? []).map(normalizeReferralRequest);
  return { referrals, isLoading, error, mutate };
}

export function useUpdateReferralStatus(requestId: string) {
  return useApiMutation<ApiResponse<ReferralRequest>, { status: ReferralRequestStatus }>(
    `/admin/jobs/referral-requests/${requestId}`,
    { method: "PATCH", revalidate: [] },
  );
}
