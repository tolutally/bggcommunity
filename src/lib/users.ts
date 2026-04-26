import { API_BASE_URL, ApiError, apiRequest, type TokenProvider } from "@/lib/api";

export interface UserProfileRecord {
    name: string;
    email: string;
    occupation: string;
    industry: string;
    location: string;
    bio: string;
    website: string;
    linkedin: string;
    twitter: string;
    company: string;
    avatarUrl: string;
    isOpenToWork: boolean;
    profileVisible: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function readString(value: unknown, fallback = "") {
    return typeof value === "string" ? value : fallback;
}

function readBoolean(value: unknown, fallback = false) {
    return typeof value === "boolean" ? value : fallback;
}

function normalizeUserProfile(input: unknown): UserProfileRecord {
    const record = isRecord(input) ? input : {};
    const profile = isRecord(record.profile) ? record.profile : {};

    return {
        name: readString(record.name) || `${readString(record.firstName)} ${readString(record.lastName)}`.trim() || "Community Member",
        email: readString(record.email),
        occupation: readString(profile.jobTitle) || readString(profile.occupation) || readString(record.occupation),
        industry: readString(profile.industry) || readString(record.industry),
        location: readString(profile.location) || readString(record.location),
        bio: readString(profile.bio) || readString(record.bio),
        website: readString(profile.website) || readString(record.website),
        linkedin: readString(profile.linkedin) || readString(profile.linkedinHandle) || readString(record.linkedin),
        twitter: readString(profile.twitter) || readString(profile.twitterHandle) || readString(record.twitter),
        company: readString(profile.company) || readString(record.company),
        avatarUrl: readString(profile.avatarUrl) || readString(record.avatarUrl),
        isOpenToWork: readBoolean(profile.isOpenToWork ?? record.isOpenToWork),
        profileVisible: readBoolean(profile.profileVisible ?? record.profileVisible, true),
    };
}

export interface UpdateUserProfileInput {
    occupation: string;
    industry: string;
    location: string;
    bio: string;
    website: string;
    linkedin: string;
    twitter: string;
    company: string;
    isOpenToWork: boolean;
}

export async function fetchCurrentUserProfile(getToken: TokenProvider) {
    const response = await apiRequest<{ data?: unknown } | unknown>("/users/me", { getToken });
    const payload = isRecord(response) && "data" in response ? (response as { data?: unknown }).data : response;
    return normalizeUserProfile(payload);
}

export async function updateCurrentUserProfile(input: UpdateUserProfileInput, getToken: TokenProvider) {
    const response = await apiRequest<{ data?: unknown } | unknown>("/users/me/profile", {
        method: "PATCH",
        getToken,
        body: {
            occupation: input.occupation,
            industry: input.industry,
            location: input.location,
            bio: input.bio,
            website: input.website,
            linkedin: input.linkedin,
            twitter: input.twitter,
            company: input.company,
            isOpenToWork: input.isOpenToWork,
        },
    });

    const payload = isRecord(response) && "data" in response ? (response as { data?: unknown }).data : response;
    return normalizeUserProfile(payload);
}

export async function updateProfileVisibility(profileVisible: boolean, getToken: TokenProvider) {
    await apiRequest("/users/me/privacy", {
        method: "PATCH",
        getToken,
        body: { profileVisible },
    });
}

export async function uploadCurrentUserAvatar(file: File, getToken: TokenProvider) {
    const token = await getToken();
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        const message = isRecord(payload) && typeof payload.message === "string"
            ? payload.message
            : `Request failed with status ${response.status}`;
        throw new ApiError(message, response.status, payload);
    }

    const avatarUrl = isRecord(payload) && isRecord(payload.data) && typeof payload.data.avatarUrl === "string"
        ? payload.data.avatarUrl
        : "";
    return avatarUrl;
}

export async function deleteOwnAccount(getToken: TokenProvider) {
    await apiRequest("/auth/account", {
        method: "DELETE",
        getToken,
    });
}

export function getUsersErrorMessage(error: unknown) {
    if (error instanceof ApiError) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return "Unable to complete this profile request right now.";
}