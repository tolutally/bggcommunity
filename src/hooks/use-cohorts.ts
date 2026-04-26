"use client";

import { useAuthSWR } from "./use-auth-swr";
import { useApiMutation } from "./use-api-mutation";
import type {
  ApiResponse,
  PaginatedResponse,
  Cohort,
  CohortMember,
  CohortSession,
  CohortResource,
} from "@/lib/types";

/* ── List all cohorts ── */

export function useCohorts(cursor?: string) {
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const { data, error, isLoading, mutate } = useAuthSWR<PaginatedResponse<Cohort>>(
    `/cohorts${params}`,
  );

  return {
    cohorts: data?.data ?? [],
    nextCursor: data?.nextCursor ?? null,
    isLoading,
    error,
    mutate,
  };
}

/* ── Single cohort detail ── */

export function useCohort(slugOrId: string | null) {
  const { data, error, isLoading, mutate } = useAuthSWR<ApiResponse<Cohort>>(
    slugOrId ? `/cohorts/${slugOrId}` : null,
  );

  return {
    cohort: data?.data ?? null,
    isLoading,
    error,
    mutate,
  };
}

/* ── Cohort members ── */

export function useCohortMembers(slugOrId: string | null, cursor?: string) {
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const { data, error, isLoading, mutate } = useAuthSWR<PaginatedResponse<CohortMember>>(
    slugOrId ? `/cohorts/${slugOrId}/members${params}` : null,
  );

  return {
    members: data?.data ?? [],
    nextCursor: data?.nextCursor ?? null,
    isLoading,
    error,
    mutate,
  };
}

/* ── Cohort sessions ── */

export function useCohortSessions(slugOrId: string | null) {
  const { data, error, isLoading, mutate } = useAuthSWR<PaginatedResponse<CohortSession>>(
    slugOrId ? `/cohorts/${slugOrId}/sessions` : null,
  );

  return {
    sessions: data?.data ?? [],
    isLoading,
    error,
    mutate,
  };
}

/* ── Cohort resources ── */

export function useCohortResources(slugOrId: string | null) {
  const { data, error, isLoading, mutate } = useAuthSWR<PaginatedResponse<CohortResource>>(
    slugOrId ? `/cohorts/${slugOrId}/resources` : null,
  );

  return {
    resources: data?.data ?? [],
    isLoading,
    error,
    mutate,
  };
}

/* ── RSVP to a cohort session ── */

export function useRsvpCohortSession(slugOrId: string, sessionId: string) {
  return useApiMutation<ApiResponse<{ rsvped: boolean }>>(
    `/cohorts/${slugOrId}/sessions/${sessionId}/rsvp`,
    {
      method: "POST",
      revalidate: [`/cohorts/${slugOrId}/sessions`],
    },
  );
}

/* ── Display helpers ── */

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  UPCOMING: "Upcoming",
};

export function cohortStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function fmtCohortDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function fmtSessionDay(scheduledAt: string) {
  return new Date(scheduledAt).getDate();
}

export function fmtSessionMonth(scheduledAt: string) {
  return new Date(scheduledAt)
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
}

export function fmtSessionTime(scheduledAt: string) {
  return new Date(scheduledAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function fmtDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (rem === 0) return `${hrs}h`;
  return `${hrs}h ${rem}m`;
}

export function isSessionPast(scheduledAt: string, durationMinutes: number): boolean {
  return new Date(scheduledAt).getTime() + durationMinutes * 60_000 < Date.now();
}

export function memberDisplayName(m: CohortMember): string {
  if (m.profile) {
    const full = `${m.profile.firstName ?? ""} ${m.profile.lastName ?? ""}`.trim();
    if (full) return full;
  }
  return m.email;
}
