const DEFAULT_API_BASE_URL = "https://bggather-api.duckdns.org/api/v1";

export const API_BASE_URL =
    (process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, "");

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

export class ApiRequestError extends ApiError {}

interface ApiRequestOptions {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: unknown;
    headers?: HeadersInit;
    getToken?: TokenProvider;
}

interface ApiClientOptions {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: unknown;
    headers?: HeadersInit;
    token?: string | null;
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
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const isJsonBody = body !== undefined && !isFormData;

    const response = await fetch(buildUrl(path), {
        method,
        headers: {
            ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);

    if (!response.ok) {
        const message =
            (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string" && payload.message) ||
            (typeof payload === "string" && payload) ||
            `Request failed with status ${response.status}`;

        throw new ApiRequestError(message, response.status, payload);
    }

    return payload as T;
}

export async function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
    const { token, headers, ...rest } = options;

    return apiRequest<T>(path, {
        ...rest,
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
    });
}

export function handle401() {
    if (typeof window === "undefined") {
        return;
    }

    window.dispatchEvent(new CustomEvent("bgg:auth-expired"));
}