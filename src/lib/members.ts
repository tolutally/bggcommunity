import { apiRequest, buildQueryString, type TokenProvider } from "@/lib/api";
import { getApiErrorMessage as getSharedApiErrorMessage } from "@/lib/jobs";
import type { CursorPageResult } from "@/hooks/useCursorPagination";

export interface MemberRecord {
    id: string;
    name: string;
    email: string | null;
    occupation: string | null;
    industry: string | null;
    location: string | null;
    bio: string | null;
    avatarUrl: string | null;
    joinedLabel: string;
    cohort: string | null;
    status: string;
    isOpenToWork: boolean;
    linkedinUrl: string | null;
}

export interface MembersQuery {
    cursor?: string | null;
    limit?: number;
}

interface CursorResponse<T> {
    success: true;
    data: T[];
    nextCursor: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
    return typeof value === "string" && value.trim() ? value.trim() : null;
}

function formatJoinedLabel(value: string | null) {
    if (!value) {
        return "Recently joined";
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function buildName(record: Record<string, unknown>) {
    const fullName = readString(record.name) ?? readString(record.fullName) ?? readString(record.displayName);
    if (fullName) {
        return fullName;
    }

    const firstName = readString(record.firstName);
    const lastName = readString(record.lastName);
    const combined = [firstName, lastName].filter(Boolean).join(" ").trim();
    return combined || "Community Member";
}

function normalizeMember(value: unknown): MemberRecord {
    const record = isRecord(value) ? value : {};
    const profile = isRecord(record.profile) ? record.profile : {};
    const createdAt = readString(record.createdAt) ?? readString(record.joinedAt);
    const status = readString(record.status) ?? (record.isPublic === false ? "Private" : "Active");

    return {
        id: String(record.id ?? record.userId ?? buildName(record)),
        name: buildName({ ...profile, ...record }),
        email: readString(record.email),
        occupation: readString(profile.jobTitle) ?? readString(record.occupation) ?? readString(record.role),
        industry: readString(profile.industry) ?? readString(record.industry),
        location: readString(profile.location) ?? readString(record.location),
        bio: readString(profile.bio) ?? readString(record.bio),
        avatarUrl: readString(profile.avatarUrl) ?? readString(record.avatarUrl),
        joinedLabel: formatJoinedLabel(createdAt),
        cohort: readString(record.cohort) ?? readString(record.cohortName),
        status,
        isOpenToWork: Boolean(profile.isOpenToWork ?? record.isOpenToWork),
        linkedinUrl: readString(profile.linkedinUrl) ?? readString(record.linkedinUrl),
    };
}

export async function fetchMembers(query: MembersQuery = {}, getToken?: TokenProvider): Promise<CursorPageResult<MemberRecord>> {
    const token = getToken ? await getToken() : undefined;
    const response = await apiRequest<CursorResponse<unknown>>(
        `/members${buildQueryString({ cursor: query.cursor, limit: query.limit ?? 20 })}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {},
    );

    return {
        items: Array.isArray(response.data) ? response.data.map(normalizeMember) : [],
        nextCursor: response.nextCursor ?? null,
    };
}

export function getMembersErrorMessage(error: unknown) {
    return getSharedApiErrorMessage(error, "Unable to load members right now.");
}