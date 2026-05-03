"use client";

import { useAuthSWR } from "./use-auth-swr";
import type { ApiResponse, AnalyticsOverview } from "@/lib/types";

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

export function useInactiveMembers(days = 30) {
  const { data, error, isLoading } = useAuthSWR<ApiResponse<InactiveMember[]>>(
    `/admin/analytics/inactive-members?days=${days}`,
  );
  return { inactiveMembers: data?.data ?? [], isLoading, error };
}
