import { ApiError, apiRequest, buildQueryString, type TokenProvider } from "@/lib/api";

export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
export type WorkMode = "REMOTE" | "HYBRID" | "ON_SITE";

export interface JobRecord {
    id: string;
    title: string;
    company: string;
    location: string;
    jobType: JobType;
    workMode: WorkMode;
    externalUrl: string | null;
    isFeatured: boolean;
    referralAvailable: boolean;
    referralContact: string | null;
    internalContactId: string | null;
    description: string | null;
    createdAt: string | null;
    postedAtLabel: string;
}

export interface JobsPage {
    items: JobRecord[];
    nextCursor: string | null;
}

export interface JobsQuery {
    jobType?: JobType;
    workMode?: WorkMode;
    isFeatured?: boolean;
    cursor?: string | null;
    limit?: number;
}

export interface JobUpsertInput {
    title: string;
    company: string;
    location: string;
    jobType: JobType;
    workMode: WorkMode;
    externalUrl?: string | null;
    referralContact?: string | null;
    internalContactId?: string | null;
    isFeatured?: boolean;
    referralAvailable?: boolean;
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

function readBoolean(value: unknown, fallback = false) {
    return typeof value === "boolean" ? value : fallback;
}

function normalizeJobType(value: unknown): JobType {
    switch (value) {
        case "PART_TIME":
            return "PART_TIME";
        case "CONTRACT":
            return "CONTRACT";
        case "INTERNSHIP":
            return "INTERNSHIP";
        default:
            return "FULL_TIME";
    }
}

function normalizeWorkMode(value: unknown): WorkMode {
    switch (value) {
        case "HYBRID":
            return "HYBRID";
        case "ON_SITE":
            return "ON_SITE";
        default:
            return "REMOTE";
    }
}

function formatRelativeDate(value: string | null) {
    if (!value) {
        return "Recently added";
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    const diffMs = Date.now() - parsed.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        return "Today";
    }

    if (diffDays === 1) {
        return "1 day ago";
    }

    if (diffDays < 7) {
        return `${diffDays} days ago`;
    }

    if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? "" : "s"} ago`;
    }

    return parsed.toLocaleDateString();
}

function serializeJobInput(input: JobUpsertInput) {
    return {
        title: input.title.trim(),
        company: input.company.trim(),
        location: input.location.trim(),
        jobType: input.jobType,
        workMode: input.workMode,
        externalUrl: input.externalUrl?.trim() || undefined,
        referralContact: input.referralContact?.trim() || undefined,
        internalContactId: input.internalContactId?.trim() || undefined,
        isFeatured: input.isFeatured ?? false,
        referralAvailable: input.referralAvailable ?? false,
    };
}

function normalizeJob(record: unknown): JobRecord {
    const value = isRecord(record) ? record : {};
    const createdAt = readString(value.createdAt) ?? readString(value.postedAt) ?? readString(value.updatedAt);
    const externalUrl =
        readString(value.externalUrl) ??
        readString(value.applicationLink) ??
        readString(value.url);

    const referralContact =
        readString(value.referralContact) ??
        readString(isRecord(value.internalContact) ? value.internalContact.name : null) ??
        readString(isRecord(value.contact) ? value.contact.name : null);

    return {
        id: String(value.id ?? value.jobId ?? `${readString(value.title) ?? "job"}-${readString(value.company) ?? "listing"}`),
        title: readString(value.title) ?? "Untitled role",
        company: readString(value.company) ?? "Unknown company",
        location: readString(value.location) ?? "Remote",
        jobType: normalizeJobType(value.jobType ?? value.type),
        workMode: normalizeWorkMode(value.workMode ?? value.mode),
        externalUrl,
        isFeatured: readBoolean(value.isFeatured, readBoolean(value.featured)),
        referralAvailable: readBoolean(value.referralAvailable, Boolean(referralContact)),
        referralContact,
        internalContactId: readString(value.internalContactId),
        description: readString(value.description),
        createdAt,
        postedAtLabel: formatRelativeDate(createdAt),
    };
}

export function getJobTypeLabel(jobType: JobType) {
    switch (jobType) {
        case "PART_TIME":
            return "Part-time";
        case "CONTRACT":
            return "Contract";
        case "INTERNSHIP":
            return "Internship";
        default:
            return "Full-time";
    }
}

export function getWorkModeLabel(workMode: WorkMode) {
    switch (workMode) {
        case "HYBRID":
            return "Hybrid";
        case "ON_SITE":
            return "On-site";
        default:
            return "Remote";
    }
}

export function getApiErrorMessage(error: unknown, fallback: string) {
    if (error instanceof ApiError) {
        return error.message;
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}

export async function fetchJobs(query: JobsQuery = {}, getToken?: TokenProvider) {
    const token = getToken ? await getToken() : undefined;
    const response = await apiRequest<CursorResponse<unknown>>(
        `/jobs${buildQueryString({
            jobType: query.jobType,
            workMode: query.workMode,
            isFeatured: query.isFeatured,
            cursor: query.cursor,
            limit: query.limit ?? 20,
        })}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {},
    );

    return {
        items: Array.isArray(response.data) ? response.data.map(normalizeJob) : [],
        nextCursor: response.nextCursor ?? null,
    } satisfies JobsPage;
}

export async function fetchAllJobs(query: Omit<JobsQuery, "cursor"> = {}) {
    const items: JobRecord[] = [];
    let nextCursor: string | null = null;

    do {
        const page = await fetchJobs({ ...query, cursor: nextCursor, limit: 50 });
        items.push(...page.items);
        nextCursor = page.nextCursor;
    } while (nextCursor);

    return items;
}

export async function requestJobReferral(jobId: string, getToken: TokenProvider) {
    await apiRequest(`/jobs/${jobId}/referral-request`, {
        method: "POST",
        getToken,
    });
}

export async function createJob(input: JobUpsertInput, getToken: TokenProvider) {
    await apiRequest("/admin/jobs", {
        method: "POST",
        body: serializeJobInput(input),
        getToken,
    });
}

export async function updateJob(id: string, input: JobUpsertInput, getToken: TokenProvider) {
    await apiRequest(`/admin/jobs/${id}`, {
        method: "PATCH",
        body: serializeJobInput(input),
        getToken,
    });
}

export async function deleteJob(id: string, getToken: TokenProvider) {
    await apiRequest(`/admin/jobs/${id}`, {
        method: "DELETE",
        getToken,
    });
}

export async function toggleFeaturedStatus(id: string, getToken: TokenProvider) {
    await apiRequest(`/admin/jobs/${id}/feature`, {
        method: "PATCH",
        getToken,
    });
}