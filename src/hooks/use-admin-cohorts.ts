"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSWRConfig } from "swr";
import { useAuthSWR } from "./use-auth-swr";
import { useApiMutation } from "./use-api-mutation";
import { apiClient } from "@/lib/api";
import type {
  ApiResponse,
  AvailableUser,
  Cohort,
  CohortStats,
  CohortSession,
  CohortResource,
} from "@/lib/types";

/* ── Create cohort ── */

export function useCreateCohort() {
  return useApiMutation<
    ApiResponse<Cohort>,
    { name: string; track: string; slug?: string; description?: string; status?: string; startDate?: string; endDate?: string }
  >("/admin/cohorts", {
    method: "POST",
    revalidate: "/cohorts",
  });
}

/* ── Update cohort ── */

export function useUpdateCohort(id: string) {
  return useApiMutation<
    ApiResponse<Cohort>,
    Partial<{ name: string; description: string; status: string; startDate: string; endDate: string }>
  >(`/admin/cohorts/${id}`, {
    method: "PATCH",
    revalidate: ["/cohorts", `/cohorts/${id}`],
  });
}

/* ── Delete cohort ── */

export function useDeleteCohort(id: string) {
  return useApiMutation(`/admin/cohorts/${id}`, {
    method: "DELETE",
    revalidate: "/cohorts",
  });
}

/* ── Cohort stats (admin) ── */

export function useCohortStats(slugOrId: string | null) {
  const { data, error, isLoading } = useAuthSWR<ApiResponse<CohortStats>>(
    slugOrId ? `/admin/cohorts/${slugOrId}/stats` : null,
  );

  return {
    stats: data?.data ?? null,
    isLoading,
    error,
  };
}

/* ── Available users (not yet in this cohort) ── */

export function useAvailableCohortUsers(cohortId: string) {
  const { data, error, isLoading } = useAuthSWR<ApiResponse<AvailableUser[]>>(
    cohortId ? `/admin/cohorts/${cohortId}/available-users` : null,
  );
  return { users: data?.data ?? [], isLoading, error };
}

/* ── Add members ── */

export function useAddCohortMembers(cohortId: string) {
  return useApiMutation<ApiResponse<void>, { userIds: string[] }>(
    `/admin/cohorts/${cohortId}/members`,
    {
      method: "POST",
      revalidate: [`/cohorts/${cohortId}/members`, `/admin/cohorts/${cohortId}/stats`],
    },
  );
}

/* ── Remove member ── */

export function useRemoveCohortMember(cohortId: string) {
  const { getToken } = useAuth();
  const { mutate } = useSWRConfig();
  const [isLoading, setIsLoading] = useState(false);

  const trigger = useCallback(
    async (userId: string) => {
      setIsLoading(true);
      try {
        const token = await getToken();
        await apiClient(`/admin/cohorts/${cohortId}/members/${userId}`, {
          method: "DELETE",
          token,
        });
        await mutate(
          (key: unknown) =>
            typeof key === "string" &&
            (key.includes(`/cohorts/${cohortId}/members`) ||
              key.includes(`/admin/cohorts/${cohortId}/stats`)),
          undefined,
          { revalidate: true },
        );
      } finally {
        setIsLoading(false);
      }
    },
    [cohortId, getToken, mutate],
  );

  return { trigger, isLoading };
}

/* ── Create session ── */

export function useCreateCohortSession(cohortId: string) {
  return useApiMutation<
    ApiResponse<CohortSession>,
    {
      title: string;
      scheduledAt: string;
      durationMinutes: number;
      description?: string;
      meetingPlatform?: "ZOOM" | "GOOGLE_MEET" | "OTHER";
      meetingLink?: string;
    }
  >(`/admin/cohorts/${cohortId}/sessions`, {
    method: "POST",
    revalidate: [`/cohorts/${cohortId}/sessions`],
  });
}

/* ── Update session ── */

export function useUpdateCohortSession(cohortId: string) {
  const { getToken } = useAuth();
  const { mutate } = useSWRConfig();
  const [isLoading, setIsLoading] = useState(false);

  const trigger = useCallback(
    async (
      sessionId: string,
      body: {
        title?: string;
        description?: string;
        scheduledAt?: string;
        durationMinutes?: number;
        host?: string;
        meetingPlatform?: "ZOOM" | "GOOGLE_MEET" | "OTHER";
        meetingLink?: string;
      },
    ) => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const response = await apiClient<ApiResponse<CohortSession>>(
          `/admin/cohorts/${cohortId}/sessions/${sessionId}`,
          {
            method: "PATCH",
            body,
            token,
          },
        );

        await mutate(`/cohorts/${cohortId}/sessions`);
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [cohortId, getToken, mutate],
  );

  return { trigger, isLoading };
}

/* ── Attach session recording ── */

export function useAttachCohortSessionRecording(cohortId: string) {
  const { getToken } = useAuth();
  const { mutate } = useSWRConfig();
  const [isLoading, setIsLoading] = useState(false);

  const trigger = useCallback(
    async (sessionId: string, recordingUrl: string) => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const response = await apiClient<ApiResponse<CohortSession>>(
          `/admin/cohorts/${cohortId}/sessions/${sessionId}/recording`,
          {
            method: "PATCH",
            body: { recordingUrl },
            token,
          },
        );

        await mutate(`/cohorts/${cohortId}/sessions`);
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [cohortId, getToken, mutate],
  );

  return { trigger, isLoading };
}

/* ── Delete session ── */

export function useDeleteCohortSession(cohortId: string, sessionId: string) {
  return useApiMutation(`/admin/cohorts/${cohortId}/sessions/${sessionId}`, {
    method: "DELETE",
    revalidate: [`/cohorts/${cohortId}/sessions`],
  });
}

/* ── Create resource ── */

export function useCreateCohortResource(cohortId: string) {
  return useApiMutation<
    ApiResponse<CohortResource>,
    { title: string; url: string; description?: string; accessType?: "link" | "download" }
  >(`/admin/cohorts/${cohortId}/resources`, {
    method: "POST",
    revalidate: [`/cohorts/${cohortId}/resources`],
  });
}

/* ── Delete resource ── */

export function useDeleteCohortResource(cohortId: string, resourceId: string) {
  return useApiMutation(`/admin/cohorts/${cohortId}/resources/${resourceId}`, {
    method: "DELETE",
    revalidate: [`/cohorts/${cohortId}/resources`],
  });
}

/* ── Post announcement ── */

export function usePostAnnouncement(cohortId: string) {
  return useApiMutation<ApiResponse<void>, { title?: string; body: string }>(
    `/admin/cohorts/${cohortId}/announcements`,
    { method: "POST" },
  );
}
