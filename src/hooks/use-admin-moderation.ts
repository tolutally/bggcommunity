"use client";

import { useAuthSWR } from "./use-auth-swr";
import { useApiMutation } from "./use-api-mutation";
import type { ApiResponse, PaginatedResponse, ModerationReport, ModerationReportStatus } from "@/lib/types";

export function useReportQueue(status?: ModerationReportStatus) {
  const params = status ? `?status=${status}` : "";
  const { data, error, isLoading, mutate } = useAuthSWR<PaginatedResponse<ModerationReport>>(
    `/admin/moderation/reports${params}`,
  );
  return { reports: data?.data ?? [], isLoading, error, mutate };
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
