"use client";

import { useEffect, useRef } from "react";
import { subscribeToInvalidation, type QueryScope } from "@/lib/queryInvalidation";

export function useQueryInvalidation(scopes: QueryScope[], onInvalidate: () => void | Promise<void>) {
    const invalidateRef = useRef(onInvalidate);

    useEffect(() => {
        invalidateRef.current = onInvalidate;
    }, [onInvalidate]);

    useEffect(() => {
        const unsubscribers = scopes.map((scope) => subscribeToInvalidation(scope, () => invalidateRef.current()));

        return () => {
            unsubscribers.forEach((unsubscribe) => unsubscribe());
        };
    }, [scopes]);
}
