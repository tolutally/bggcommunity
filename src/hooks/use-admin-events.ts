"use client";

import { useAuthSWR } from "./use-auth-swr";
import { useApiMutation } from "./use-api-mutation";
import type { ApiResponse, Event, RsvpUser } from "@/lib/types";
import type { EventUpsertInput } from "@/lib/events";

/**
 * Admin: create a new event via POST /admin/events.
 */
export function useCreateEvent() {
  return useApiMutation<ApiResponse<Event>, EventUpsertInput>("/admin/events", {
    method: "POST",
    revalidate: "/events",
  });
}

/**
 * Admin: update an event via PATCH /admin/events/:id.
 */
export function useUpdateEvent(id: string) {
  return useApiMutation<ApiResponse<Event>, Partial<EventUpsertInput>>(`/admin/events/${id}`, {
    method: "PATCH",
    revalidate: ["/events", `/events/${id}`],
  });
}

/**
 * Admin: delete an event via DELETE /admin/events/:id.
 */
export function useDeleteEvent(id: string) {
  return useApiMutation(`/admin/events/${id}`, {
    method: "DELETE",
    revalidate: "/events",
  });
}

/**
 * Admin: fetch RSVP list for an event via GET /admin/events/:id/rsvps.
 */
export function useEventRsvps(eventId: string | null) {
  const { data, error, isLoading, mutate } = useAuthSWR<ApiResponse<RsvpUser[]>>(
    eventId ? `/admin/events/${eventId}/rsvps` : null,
  );

  return {
    rsvps: data?.data ?? [],
    isLoading,
    error,
    mutate,
  };
}

/**
 * Admin: attach a recording URL via PATCH /admin/events/:id.
 */
export function useAttachRecording(eventId: string) {
  return useApiMutation<ApiResponse<Event>, { recordingUrl: string }>(
    `/admin/events/${eventId}/recording`,
    {
      method: "PATCH",
      revalidate: [`/events/${eventId}`],
    },
  );
}
