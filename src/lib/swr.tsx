"use client";

import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import { ApiRequestError, handle401 } from "@/lib/api";

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: true,
        errorRetryCount: 3,
        dedupingInterval: 2000,
        onError(error) {
          if (error instanceof ApiRequestError && error.status === 401) {
            handle401();
          }
        },
        onErrorRetry(error, _key, _config, revalidate, { retryCount }) {
          if (error instanceof ApiRequestError && [401, 403, 404].includes(error.status)) return;
          if (retryCount >= 3) return;
          setTimeout(() => revalidate({ retryCount }), 5000 * (retryCount + 1));
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
