"use client";

import { useAuthSWR } from "./use-auth-swr";
import { useApiMutation } from "./use-api-mutation";
import type { ApiResponse, PaginatedResponse, ModerationReport } from "@/lib/types";

// The API list endpoint accepts status=OPEN|RESOLVED as a query filter.
// The report record itself carries status: "OPEN" | "RESOLVED".
export function useReportQueue(status?: "OPEN" | "RESOLVED", cursor?: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (cursor) params.set("cursor", cursor);
  const query = params.toString();
  const { data, error, isLoading, mutate } = useAuthSWR<PaginatedResponse<ModerationReport>>(
    `/admin/moderation/reports${query ? `?${query}` : ""}`,
  );
  return {
    reports: data?.data ?? [],
    nextCursor: data?.nextCursor ?? null,
    isLoading,
    error,
    mutate,
  };
}

export function useReportDetail(reportId: string | null) {
  const { data, error, isLoading } = useAuthSWR<ApiResponse<ModerationReport>>(
    reportId ? `/admin/moderation/reports/${reportId}` : null,
  );
  return { report: data?.data ?? null, isLoading, error };
}

export function useDismissReport(reportId: string) {
  return useApiMutation<ApiResponse<{ id: string }>>(
    `/admin/moderation/reports/${reportId}/dismiss`,
    { method: "POST", revalidate: "/admin/moderation/reports" },
  );
}

export function useWarnUser(reportId: string) {
  return useApiMutation<ApiResponse<{ id: string }>>(
    `/admin/moderation/reports/${reportId}/warn`,
    { method: "POST", revalidate: "/admin/moderation/reports" },
  );
}

export function useDeleteContent(reportId: string) {
  return useApiMutation<ApiResponse<{ id: string }>>(
    `/admin/moderation/reports/${reportId}/delete-content`,
    { method: "POST", revalidate: "/admin/moderation/reports" },
  );
}
