"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useAuthSWR } from "./use-auth-swr";
import type { ApiResponse, AnalyticsOverview, AnalyticsGrowthPoint } from "@/lib/types";
import { API_BASE_URL, ApiRequestError } from "@/lib/api";

export interface CohortEngagement {
  id: string;
  name: string;
  memberCount: number;
  activeRate: number;
  sessionsDone: number;
}

export interface InactiveMember {
  id: string;
  email: string;
  lastLoginAt: string | null;
  profile: { firstName: string; lastName: string; avatarUrl: string | null } | null;
}

export function useAnalyticsOverview() {
  const { data, error, isLoading, mutate } = useAuthSWR<ApiResponse<AnalyticsOverview>>(
    "/admin/analytics/overview",
  );
  return { overview: data?.data ?? null, isLoading, error, mutate };
}

export function useAnalyticsCohorts() {
  const { data, error, isLoading } = useAuthSWR<ApiResponse<CohortEngagement[]>>(
    "/admin/analytics/cohorts",
  );
  return { cohorts: data?.data ?? [], isLoading, error };
}

export function useAnalyticsGrowth(months = 6) {
  const { data, error, isLoading } = useAuthSWR<ApiResponse<AnalyticsGrowthPoint[]>>(
    `/admin/analytics/growth?months=${months}`,
  );
  return { growth: data?.data ?? [], isLoading, error };
}

export function useInactiveMembers(days = 30) {
  const { data, error, isLoading } = useAuthSWR<ApiResponse<InactiveMember[]>>(
    `/admin/analytics/inactive-members?days=${days}`,
  );
  return { inactiveMembers: data?.data ?? [], isLoading, error };
}

type AnalyticsExportFormat = "excel" | "pdf";
type AnalyticsExportType = "overview" | "cohorts" | "inactive-members";

interface ExportAnalyticsParams {
  format: AnalyticsExportFormat;
  type: AnalyticsExportType;
  days?: number;
}

function parseFilenameFromDisposition(contentDisposition: string | null, fallback: string) {
  if (!contentDisposition) return fallback;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (asciiMatch?.[1]) {
    return asciiMatch[1];
  }

  return fallback;
}

export function useExportAnalyticsReport() {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiRequestError | null>(null);

  const trigger = useCallback(async ({ format, type, days }: ExportAnalyticsParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new ApiRequestError("Missing auth token", 401);
      }

      const query = new URLSearchParams({ format, type });
      if (typeof days === "number" && Number.isFinite(days)) {
        query.set("days", String(days));
      }

      const response = await fetch(`${API_BASE_URL}/admin/analytics/export?${query.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let message = `Request failed with status ${response.status}`;
        try {
          const payload = await response.json();
          if (payload && typeof payload.message === "string") {
            message = payload.message;
          }
        } catch {
          // Ignore json parse failures.
        }
        throw new ApiRequestError(message, response.status);
      }

      const blob = await response.blob();
      const extension = format === "excel" ? "xlsx" : "pdf";
      const fallbackName = `analytics-${type}.${extension}`;
      const filename = parseFilenameFromDisposition(response.headers.get("content-disposition"), fallbackName);

      const objectUrl = URL.createObjectURL(blob);
      try {
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch (err) {
      const apiError =
        err instanceof ApiRequestError
          ? err
          : new ApiRequestError("Unable to export analytics report", 0);
      setError(apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  return { trigger, isLoading, error };
}
