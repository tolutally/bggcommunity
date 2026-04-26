const DEFAULT_API_BASE_URL = "https://bggather-api.duckdns.org/api/v1";

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, "");

export type TokenProvider = () => Promise<string | null>;

export class ApiError extends Error {
    status: number;
    details?: unknown;

    constructor(message: string, status: number, details?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.details = details;
    }
}

interface ApiRequestOptions {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
    headers?: HeadersInit;
    getToken?: TokenProvider;
}

function buildUrl(path: string) {
    return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildQueryString(params: Record<string, string | number | boolean | null | undefined>) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
            return;
        }

        query.set(key, String(value));
    });

    const queryString = query.toString();
    return queryString ? `?${queryString}` : "";
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers, getToken } = options;
    const token = getToken ? await getToken() : null;
    const isJsonBody = body !== undefined;

    const response = await fetch(buildUrl(path), {
        method,
        headers: {
            ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        body: isJsonBody ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);

    if (!response.ok) {
        const message =
            (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string" && payload.message) ||
            (typeof payload === "string" && payload) ||
            `Request failed with status ${response.status}`;

        throw new ApiError(message, response.status, payload);
    }

    return payload as T;
}