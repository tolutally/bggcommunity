"use client";

import { useAuthSWR } from "./use-auth-swr";
import { useApiMutation } from "./use-api-mutation";
import type { ApiResponse, PaginatedResponse, Event, RsvpResponse } from "@/lib/types";

/**
 * Fetch paginated events list via GET /events.
 */
export function useEvents(cursor?: string) {
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const { data, error, isLoading, mutate } = useAuthSWR<PaginatedResponse<Event>>(
    `/events${params}`,
  );

  return {
    events: data?.data ?? [],
    nextCursor: data?.nextCursor ?? null,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Fetch a single event via GET /events/:id.
 */
export function useEvent(id: string | null) {
  const { data, error, isLoading, mutate } = useAuthSWR<ApiResponse<Event>>(
    id ? `/events/${id}` : null,
  );

  return {
    event: data?.data ?? null,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Toggle RSVP for an event via POST /events/:id/rsvp.
 * Revalidates both the events list and the specific event.
 */
export function useRsvpEvent(eventId: string) {
  return useApiMutation<ApiResponse<RsvpResponse>>(
    `/events/${eventId}/rsvp`,
    {
      method: "POST",
      revalidate: ["/events", `/events/${eventId}`],
    },
  );
}

/* ── Display helpers ── */

const EVENT_TYPE_LABELS: Record<string, string> = {
  WORKSHOP: "Workshop",
  QA: "Q&A",
  SPEAKER_SERIES: "Speaker Series",
  SOCIAL: "Social",
  HACKATHON: "Hackathon",
};

/** Convert API EventType enum to display label */
export function eventTypeLabel(type: string): string {
  return EVENT_TYPE_LABELS[type] ?? type;
}

/** Format an ISO date string to short month + day */
export function fmtEventDay(scheduledAt: string) {
  return new Date(scheduledAt).getDate();
}

export function fmtEventMonth(scheduledAt: string) {
  return new Date(scheduledAt).toLocaleDateString("en-US", { month: "short" }).toUpperCase();
}

export function fmtEventDate(scheduledAt: string) {
  return new Date(scheduledAt).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function fmtEventTime(scheduledAt: string) {
  return new Date(scheduledAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

/** Convert durationMinutes to human-readable string */
export function fmtDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (rem === 0) return `${hrs} hr${hrs > 1 ? "s" : ""}`;
  return `${hrs}h ${rem}m`;
}

/** Check if an event is in the past */
export function isEventPast(scheduledAt: string, durationMinutes: number): boolean {
  const end = new Date(scheduledAt).getTime() + durationMinutes * 60_000;
  return Date.now() > end;
}

/** Detect platform from meeting link */
export function detectPlatform(link: string | null): "zoom" | "google-meet" | "other" {
  if (!link) return "other";
  if (link.includes("zoom.us")) return "zoom";
  if (link.includes("meet.google.com")) return "google-meet";
  return "other";
}
