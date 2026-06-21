import { apiRequest, buildQueryString, type TokenProvider } from "@/lib/api";
import { getApiErrorMessage as getSharedApiErrorMessage } from "@/lib/jobs";

interface SuccessResponse<T> {
    success: true;
    data: T;
}

interface CursorResponse<T> {
    success: true;
    data: T[];
    nextCursor: string | null;
}

export interface CohortRecord {
    id: string;
    slug: string | null;
    name: string;
    description: string | null;
    status: string | null;
    track: string | null;
    phase: string | null;
    health: string | null;
    activeRate: number | null;
    memberCount: number | null;
    maxMembers: number | null;
    startDate: string | null;
    endDate: string | null;
    communityGroupId: string | null;
}

export interface CohortMemberRecord {
    userId: string;
    email: string;
    role: string | null;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    joinedAt: string | null;
    progress: number | null;
}

export interface CohortSessionRecord {
    id: string;
    title: string;
    description: string | null;
    scheduledAt: string;
    durationMinutes: number;
    host: string;
    meetingPlatform: string | null;
    meetingLink: string | null;
    recordingUrl: string | null;
    hasRsvp: boolean;
    attendeeCount: number;
}

export interface CohortResourceRecord {
    id: string;
    title: string;
    description: string | null;
    url: string;
    type: string | null;
    size: string | null;
    createdAt: string | null;
}

export interface AdminCohortStatsRecord {
    activeRate: number;
    sessionsDone: number;
    memberCount: number;
}

export interface CohortGroupRecord {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    colorTheme: string | null;
    isDefault: boolean;
    cohortId: string | null;
    createdAt: string | null;
    memberCount: number;
    channelCount: number;
}

export interface AdminCohortCreateInput {
    name: string;
    track: string;
    description?: string | null;
    status?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    maxMembers?: number | null;
}

export interface AdminCohortUpdateInput {
    name?: string;
    track?: string | null;
    description?: string | null;
    status?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    maxMembers?: number | null;
}

/** @deprecated Use AdminCohortCreateInput or AdminCohortUpdateInput */
export type AdminCohortUpsertInput = AdminCohortCreateInput;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
    return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown, fallback = 0) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeCohort(value: unknown): CohortRecord {
    const record = isRecord(value) ? value : {};
    const count = isRecord(record._count) ? record._count : {};

    return {
        id: String(record.id ?? "unknown-cohort"),
        slug: readString(record.slug),
        name: readString(record.name) ?? "Untitled cohort",
        description: readString(record.description),
        status: readString(record.status),
        track: readString(record.track),
        phase: readString(record.phase),
        health: readString(record.health),
        activeRate: typeof record.activeRate === "number" ? record.activeRate : null,
        memberCount: typeof count.members === "number" ? count.members : typeof record.memberCount === "number" ? record.memberCount : null,
        maxMembers: typeof record.maxMembers === "number" ? record.maxMembers : null,
        startDate: readString(record.startDate),
        endDate: readString(record.endDate),
        communityGroupId: readString(record.communityGroupId),
    };
}

function normalizeMember(value: unknown): CohortMemberRecord {
    const record = isRecord(value) ? value : {};
    const user = isRecord(record.user) ? record.user : {};
    const profile = isRecord(user.profile) ? user.profile : {};

    return {
        userId: String(user.id ?? record.userId ?? "unknown-member"),
        email: readString(user.email) ?? readString(record.email) ?? "Unknown email",
        role: readString(record.role),
        firstName: readString(profile.firstName) ?? readString(record.firstName),
        lastName: readString(profile.lastName) ?? readString(record.lastName),
        avatarUrl: readString(profile.avatarUrl) ?? readString(record.avatarUrl),
        joinedAt: readString(record.createdAt) ?? readString(record.joinedAt),
        progress: typeof record.progress === "number" ? record.progress : null,
    };
}

function normalizeSession(value: unknown): CohortSessionRecord {
    const record = isRecord(value) ? value : {};
    const count = isRecord(record._count) ? record._count : {};

    return {
        id: String(record.id ?? "unknown-session"),
        title: readString(record.title) ?? "Untitled session",
        description: readString(record.description),
        scheduledAt: readString(record.scheduledAt) ?? new Date().toISOString(),
        durationMinutes: readNumber(record.durationMinutes, 60),
        host: readString(record.host) ?? "Community Team",
        meetingPlatform: readString(record.meetingPlatform),
        meetingLink: readString(record.meetingLink),
        recordingUrl: readString(record.recordingUrl),
        hasRsvp: Boolean(record.hasRsvp),
        attendeeCount: readNumber(count.rsvps, readNumber(record.attendeeCount, 0)),
    };
}

function normalizeResource(value: unknown): CohortResourceRecord {
    const record = isRecord(value) ? value : {};

    return {
        id: String(record.id ?? "unknown-resource"),
        title: readString(record.title) ?? "Untitled resource",
        description: readString(record.description),
        url: readString(record.url) ?? "#",
        type: readString(record.type),
        size: readString(record.size),
        createdAt: readString(record.createdAt),
    };
}

function normalizeCohortGroup(value: unknown): CohortGroupRecord {
    const record = isRecord(value) ? value : {};
    const count = isRecord(record._count) ? record._count : {};

    return {
        id: String(record.id ?? "unknown-group"),
        name: readString(record.name) ?? "Untitled group",
        description: readString(record.description),
        icon: readString(record.icon),
        colorTheme: readString(record.colorTheme),
        isDefault: Boolean(record.isDefault),
        cohortId: readString(record.cohortId),
        createdAt: readString(record.createdAt),
        memberCount: readNumber(count.members, readNumber(record.memberCount, 0)),
        channelCount: readNumber(count.channels, readNumber(record.channelCount, 0)),
    };
}

function normalizeAdminStats(value: unknown): AdminCohortStatsRecord {
    const record = isRecord(value) ? value : {};

    return {
        activeRate: readNumber(record.activeRate),
        sessionsDone: readNumber(record.sessionsDone),
        memberCount: readNumber(record.memberCount),
    };
}

export async function fetchCohorts(cursor?: string | null, getToken?: TokenProvider) {
    const response = await apiRequest<CursorResponse<unknown>>(
        `/cohorts${buildQueryString({ cursor: cursor ?? undefined, limit: 50 })}`,
        getToken ? { getToken } : undefined,
    );

    return {
        items: Array.isArray(response.data) ? response.data.map(normalizeCohort) : [],
        nextCursor: response.nextCursor ?? null,
    };
}

export async function resolveCohortIdFromSlug(slug: string, getToken?: TokenProvider) {
    const response = await fetchCohorts(undefined, getToken);
    return response.items.find((cohort) => cohort.slug === slug) ?? null;
}

export async function fetchCohortDetail(cohortId: string, getToken?: TokenProvider) {
    const response = await apiRequest<SuccessResponse<unknown>>(`/cohorts/${cohortId}`, getToken ? { getToken } : undefined);
    return normalizeCohort(response.data);
}

export async function fetchCohortMembers(cohortId: string, getToken?: TokenProvider) {
    const response = await apiRequest<SuccessResponse<unknown[]>>(`/cohorts/${cohortId}/members`, getToken ? { getToken } : undefined);
    return Array.isArray(response.data) ? response.data.map(normalizeMember) : [];
}

export async function fetchCohortSessions(cohortId: string, getToken?: TokenProvider) {
    const response = await apiRequest<SuccessResponse<unknown[]>>(
        `/cohorts/${cohortId}/sessions`,
        getToken ? { getToken } : undefined,
    );
    return Array.isArray(response.data) ? response.data.map(normalizeSession) : [];
}

export async function fetchCohortResources(cohortId: string, getToken?: TokenProvider) {
    const response = await apiRequest<SuccessResponse<unknown[]>>(`/cohorts/${cohortId}/resources`, getToken ? { getToken } : undefined);
    return Array.isArray(response.data) ? response.data.map(normalizeResource) : [];
}

export async function fetchAdminCohortGroups(cohortId: string, getToken: TokenProvider) {
    const response = await apiRequest<SuccessResponse<unknown[]>>(`/admin/cohorts/${cohortId}/groups`, {
        getToken,
    });
    return Array.isArray(response.data) ? response.data.map(normalizeCohortGroup) : [];
}

export async function fetchAdminCohortStats(cohortId: string, getToken: TokenProvider) {
    const response = await apiRequest<SuccessResponse<unknown>>(`/admin/cohorts/${cohortId}/stats`, {
        getToken,
    });

    return normalizeAdminStats(response.data);
}

export async function createAdminCohort(input: AdminCohortUpsertInput, getToken: TokenProvider) {
    const response = await apiRequest<SuccessResponse<unknown>>("/admin/cohorts", {
        method: "POST",
        getToken,
        body: input,
    });

    return normalizeCohort(response.data);
}

export async function updateAdminCohort(cohortId: string, input: Partial<AdminCohortUpsertInput>, getToken: TokenProvider) {
    const response = await apiRequest<SuccessResponse<unknown>>(`/admin/cohorts/${cohortId}`, {
        method: "PATCH",
        getToken,
        body: input,
    });

    return normalizeCohort(response.data);
}

export async function deleteAdminCohort(cohortId: string, getToken: TokenProvider) {
    await apiRequest(`/admin/cohorts/${cohortId}`, {
        method: "DELETE",
        getToken,
    });
}

export async function toggleCohortSessionRsvp(cohortId: string, sessionId: string, getToken: TokenProvider) {
    const response = await apiRequest<SuccessResponse<{ rsvped?: boolean }>>(
        `/cohorts/${cohortId}/sessions/${sessionId}/rsvp`,
        {
            method: "POST",
            getToken,
        },
    );

    return Boolean(response.data?.rsvped);
}

export function buildCohortMembersLabel(member: CohortMemberRecord) {
    const fullName = [member.firstName, member.lastName].filter(Boolean).join(" ").trim();
    return fullName || member.email;
}

export function getCohortsErrorMessage(error: unknown) {
    return getSharedApiErrorMessage(error, "Unable to load cohort data right now.");
}
