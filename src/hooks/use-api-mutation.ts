"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSWRConfig } from "swr";
import { apiClient, ApiRequestError } from "@/lib/api";

type HttpMethod = "POST" | "PATCH" | "PUT" | "DELETE";

interface MutationOptions<TData, TBody> {
  /** HTTP method (default: POST) */
  method?: HttpMethod;
  /** SWR cache keys to revalidate on success */
  revalidate?: string | string[];
  /** Called on success */
  onSuccess?: (data: TData) => void;
  /** Called on error */
  onError?: (error: ApiRequestError) => void;
  /** Transform the body before sending (e.g. into FormData) */
  transformBody?: (body: TBody) => unknown;
}

interface MutationState<TData> {
  data: TData | null;
  error: ApiRequestError | null;
  isLoading: boolean;
}

/**
 * Reusable hook for POST/PATCH/DELETE mutations.
 *
 * Usage:
 *   const { trigger, isLoading } = useApiMutation<RsvpResponse>("/events/123/rsvp");
 *   await trigger();
 */
export function useApiMutation<TData = unknown, TBody = unknown>(
  path: string,
  options: MutationOptions<TData, TBody> = {},
) {
  const { method = "POST", revalidate, onSuccess, onError, transformBody } = options;
  const { getToken } = useAuth();
  const { mutate } = useSWRConfig();

  const [state, setState] = useState<MutationState<TData>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const trigger = useCallback(
    async (body?: TBody) => {
      setState((s) => ({ ...s, isLoading: true, error: null }));

      try {
        const token = await getToken();
        const finalBody = body !== undefined && transformBody ? transformBody(body) : body;

        const data = await apiClient<TData>(path, {
          method,
          body: finalBody,
          token,
        });

        setState({ data, error: null, isLoading: false });

        // Revalidate SWR caches
        if (revalidate) {
          const keys = Array.isArray(revalidate) ? revalidate : [revalidate];
          await Promise.all(keys.map((k) => mutate(k)));
        }

        onSuccess?.(data);
        return data;
      } catch (err) {
        const apiErr =
          err instanceof ApiRequestError
            ? err
            : new ApiRequestError("Unknown error", 0);

        setState({ data: null, error: apiErr, isLoading: false });
        onError?.(apiErr);
        throw apiErr;
      }
    },
    [path, method, revalidate, onSuccess, onError, transformBody, getToken, mutate],
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return { ...state, trigger, reset };
}
