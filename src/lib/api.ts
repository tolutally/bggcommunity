import { ApiError } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

/**
 * Handle 401 globally — redirect to sign-in.
 * Uses a flag to prevent multiple simultaneous redirects.
 */
let redirecting = false;
export function handle401() {
  if (redirecting || typeof window === "undefined") return;
  redirecting = true;
  try { window.localStorage.removeItem("__clerk_db_jwt"); } catch {}
  window.location.replace("/sign-in");
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string | null;
}

/**
 * Centralized fetch wrapper.
 * - Prepends NEXT_PUBLIC_API_URL
 * - Attaches Bearer token when provided
 * - Parses JSON; throws ApiRequestError on non-2xx
 * - Supports FormData (skips Content-Type so browser sets boundary)
 */
export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, token, headers: customHeaders, ...rest } = options;

  const headers = new Headers(customHeaders);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (!isFormData && body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers,
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (json as ApiError | null)?.message ?? res.statusText ?? "Request failed";
    if (res.status === 401) handle401();
    throw new ApiRequestError(message, res.status);
  }

  return json as T;
}
