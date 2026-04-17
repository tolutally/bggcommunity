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

export function useJobReferralRequests(jobId: string | null) {
  const { data, error, isLoading, mutate } = useAuthSWR<PaginatedResponse<ReferralRequest>>(
    jobId ? `/admin/jobs/${jobId}/referral-requests` : null,
  );
  return { referrals: data?.data ?? [], isLoading, error, mutate };
}

export function useUpdateReferralStatus(requestId: string) {
  return useApiMutation<ApiResponse<ReferralRequest>, { status: ReferralRequestStatus }>(
    `/admin/jobs/referral-requests/${requestId}`,
    { method: "PATCH", revalidate: [] },
  );
}
