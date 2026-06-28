"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSWRConfig } from "swr";
import { useAuthSWR } from "./use-auth-swr";
import { useApiMutation } from "./use-api-mutation";
import { apiRequest, ApiError } from "@/lib/api";
import type { ApiResponse, AppNotification, NotificationsPayload } from "@/lib/types";

const UNREAD_POLL_INTERVAL = 60_000; // 60 s

export function useUnreadNotificationCount() {
  const { data } = useAuthSWR<ApiResponse<{ count: number }>>(
    "/notifications/unread-count",
    { refreshInterval: UNREAD_POLL_INTERVAL, revalidateOnFocus: true },
  );

  return data?.data?.count ?? 0;
}

export function useNotificationById(id: string | null) {
  const { data, error, isLoading } = useAuthSWR<ApiResponse<AppNotification>>(
    id ? `/notifications/${id}` : null,
  );

  return {
    notification: data?.data ?? null,
    isLoading,
    error,
  };
}

export function useNotifications(cursor?: string) {
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const { data, error, isLoading, mutate } = useAuthSWR<ApiResponse<NotificationsPayload>>(
    `/notifications${params}`,
  );

  return {
    notifications: data?.data.notifications ?? ([] as AppNotification[]),
    unreadCount: data?.data.unreadCount ?? 0,
    nextCursor: data?.data.meta.nextCursor ?? null,
    hasNextPage: data?.data.meta.hasNextPage ?? false,
    isLoading,
    error,
    mutate,
  };
}

export function useMarkNotificationRead() {
  const { getToken } = useAuth();
  const { mutate } = useSWRConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const trigger = useCallback(
    async (notificationId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await apiRequest(`/notifications/${notificationId}/read`, {
          method: "PATCH",
          getToken,
        });
        await Promise.all([mutate("/notifications"), mutate("/notifications/unread-count")]);
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError("Unknown error", 0);
        setError(apiError);
        throw apiError;
      } finally {
        setIsLoading(false);
      }
    },
    [getToken, mutate],
  );

  return { trigger, isLoading, error };
}

export function useMarkAllNotificationsRead() {
  return useApiMutation<unknown>("/notifications/read-all", {
    method: "PATCH",
    revalidate: ["/notifications", "/notifications/unread-count"],
  });
}