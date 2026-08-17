import { apiRequest, buildQueryString, type TokenProvider } from "@/lib/api";
import { getApiErrorMessage as getSharedApiErrorMessage } from "@/lib/jobs";
import type { CursorPageResult } from "@/hooks/useCursorPagination";

export type EventType = "WORKSHOP" | "QA" | "SPEAKER_SERIES" | "SOCIAL" | "HACKATHON";
export type EventPlatform = "ZOOM" | "GOOGLE_MEET" | "OTHER" | "IN_PERSON";
export type EventLinkType = "MEETING" | "REGISTRATION" | "IN_PERSON";

export interface EventRecord {
    id: string;
    title: string;
    description: string | null;
    scheduledAt: string;
    durationMinutes: number;
    host: string;
    type: EventType;
    platform: EventPlatform;
    /** Venue/address, only populated when platform is IN_PERSON */
    location: string | null;
    linkType: EventLinkType;
    recordingUrl: string | null;
    createdAt: string | null;
    attendeeCount: number;
}

export interface EventDetailRecord extends EventRecord {
    hasRsvp: boolean;
    meetingLink: string | null;
}

export interface EventUpsertInput {
    title: string;
    description: string | null;
    scheduledAt: string;
    durationMinutes: number;
    host: string;
    type: EventType;
    platform: EventPlatform;
    location: string | null;
    linkType: EventLinkType;
    meetingLink: string | null;
}

export interface EventRsvpRecord {
    createdAt: string;
    userId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
}

export interface EventsQuery {
    type?: EventType;
    status?: "upcoming" | "past";
    cursor?: string | null;
    limit?: number;
}

interface CursorResponse<T> {
    success: true;
    data: T[];
    nextCursor: string | null;
}

interface DetailResponse<T> {
    success: true;
    data: T;
}

interface ToggleRsvpResponse {
    success: true;
    data: {
        rsvped: boolean;
    };
}

interface RsvpListResponse {
    success: true;
    data: unknown[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
    return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown, fallback = 0) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeEvent(value: unknown): EventRecord {
    const record = isRecord(value) ? value : {};
    const count = isRecord(record._count) ? record._count : {};
    const platform = (readString(record.platform) as EventPlatform) ?? "OTHER";
    const linkType = (readString(record.linkType) as EventLinkType) ?? (platform === "IN_PERSON" ? "IN_PERSON" : "MEETING");

    return {
        id: String(record.id ?? `event-${Date.now()}`),
        title: readString(record.title) ?? "Untitled event",
        description: readString(record.description),
        scheduledAt: readString(record.scheduledAt) ?? new Date().toISOString(),
        durationMinutes: readNumber(record.durationMinutes, 60),
        host: readString(record.host) ?? "Community Team",
        type: (readString(record.type) as EventType) ?? "WORKSHOP",
        platform,
        location: readString(record.location),
        linkType,
        recordingUrl: readString(record.recordingUrl),
        createdAt: readString(record.createdAt),
        attendeeCount: readNumber(count.rsvps),
    };
}

function normalizeEventDetail(value: unknown): EventDetailRecord {
    const record = isRecord(value) ? value : {};
    const event = normalizeEvent(record);

    return {
        ...event,
        hasRsvp: Boolean(record.hasRsvp),
        meetingLink: readString(record.meetingLink),
    };
}

function normalizeEventRsvp(value: unknown): EventRsvpRecord {
    const record = isRecord(value) ? value : {};
    const user = isRecord(record.user) ? record.user : {};
    const profile = isRecord(user.profile) ? user.profile : {};

    return {
        createdAt: readString(record.createdAt) ?? new Date().toISOString(),
        userId: String(user.id ?? "unknown-user"),
        email: readString(user.email) ?? "Unknown email",
        firstName: readString(profile.firstName),
        lastName: readString(profile.lastName),
        avatarUrl: readString(profile.avatarUrl),
    };
}

export async function fetchEvents(query: EventsQuery = {}, getToken?: TokenProvider): Promise<CursorPageResult<EventRecord>> {
    const response = await apiRequest<CursorResponse<unknown>>(
        `/events${buildQueryString({ type: query.type, status: query.status, cursor: query.cursor, limit: query.limit ?? 20 })}`,
        getToken ? { getToken } : undefined,
    );

    return {
        items: Array.isArray(response.data) ? response.data.map(normalizeEvent) : [],
        nextCursor: response.nextCursor ?? null,
    };
}

export async function fetchEventDetail(id: string, getToken?: TokenProvider) {
    const response = await apiRequest<DetailResponse<unknown>>(
        `/events/${id}`,
        getToken ? { getToken } : undefined,
    );

    return normalizeEventDetail(response.data);
}


export async function toggleEventRsvp(id: string, getToken: TokenProvider) {
    const response = await apiRequest<ToggleRsvpResponse>(`/events/${id}/rsvp`, {
        method: "POST",
        getToken,
    });

    return response.data.rsvped;
}

export async function createEvent(data: EventUpsertInput, getToken: TokenProvider) {
    await apiRequest(`/admin/events`, {
        method: "POST",
        getToken,
        body: data,
    });
}

export async function updateEvent(id: string, data: Partial<EventUpsertInput>, getToken: TokenProvider) {
    await apiRequest(`/admin/events/${id}`, {
        method: "PATCH",
        getToken,
        body: data,
    });
}

export async function deleteEvent(id: string, getToken: TokenProvider) {
    await apiRequest(`/admin/events/${id}`, {
        method: "DELETE",
        getToken,
    });
}

export async function fetchEventRsvps(id: string, getToken: TokenProvider) {
    const response = await apiRequest<RsvpListResponse>(`/admin/events/${id}/rsvps`, {
        getToken,
    });

    return Array.isArray(response.data) ? response.data.map(normalizeEventRsvp) : [];
}

export async function updateEventRecording(id: string, recordingUrl: string, getToken: TokenProvider) {
    const response = await apiRequest<DetailResponse<unknown>>(`/admin/events/${id}/recording`, {
        method: "PATCH",
        getToken,
        body: { recordingUrl },
    });

    return normalizeEvent(response.data);
}

export function getEventsErrorMessage(error: unknown) {
    return getSharedApiErrorMessage(error, "Unable to load events right now.");
}

export function getEventTypeLabel(type: EventType) {
    switch (type) {
        case "QA":
            return "Q&A";
        case "SPEAKER_SERIES":
            return "Speaker Series";
        case "SOCIAL":
            return "Social";
        case "HACKATHON":
            return "Hackathon";
        default:
            return "Workshop";
    }
}

export function getEventPlatformLabel(platform: EventPlatform) {
    switch (platform) {
        case "ZOOM":
            return "Zoom";
        case "GOOGLE_MEET":
            return "Google Meet";
        case "IN_PERSON":
            return "In Person";
        default:
            return "Other";
    }
}

/** High-level location badge shown on cards/detail so members can tell before RSVP */
export function getEventLocationLabel(platform: EventPlatform) {
    return platform === "IN_PERSON" ? "In Person" : "Online";
}

export function getEventLinkCtaLabel(linkType: EventLinkType) {
    return linkType === "REGISTRATION" ? "Register" : "Join meeting";
}