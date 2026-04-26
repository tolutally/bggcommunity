"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface CursorPageResult<TItem> {
    items: TItem[];
    nextCursor: string | null;
}

export interface CursorPaginationState<TItem> {
    items: TItem[];
    nextCursor: string | null;
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    reload: () => Promise<void>;
    loadMore: () => Promise<void>;
    setItems: React.Dispatch<React.SetStateAction<TItem[]>>;
}

interface UseCursorPaginationOptions<TItem, TQuery> {
    query: TQuery;
    loadPage: (query: TQuery & { cursor?: string | null }) => Promise<CursorPageResult<TItem>>;
    getErrorMessage: (error: unknown) => string;
}

export function useCursorPagination<TItem, TQuery extends Record<string, unknown>>({
    query,
    loadPage,
    getErrorMessage,
}: UseCursorPaginationOptions<TItem, TQuery>): CursorPaginationState<TItem> {
    const [items, setItems] = useState<TItem[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const requestIdRef = useRef(0);

    const loadInitial = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        setIsLoading(true);
        setError(null);

        try {
            const page = await loadPage({ ...query, cursor: null });

            if (requestId !== requestIdRef.current) {
                return;
            }

            setItems(page.items);
            setNextCursor(page.nextCursor);
        } catch (loadError) {
            if (requestId !== requestIdRef.current) {
                return;
            }

            setError(getErrorMessage(loadError));
            setItems([]);
            setNextCursor(null);
        } finally {
            if (requestId === requestIdRef.current) {
                setIsLoading(false);
            }
        }
    }, [getErrorMessage, loadPage, query]);

    const loadMore = useCallback(async () => {
        if (!nextCursor || isLoadingMore) {
            return;
        }

        setIsLoadingMore(true);

        try {
            const page = await loadPage({ ...query, cursor: nextCursor });
            setItems((prev) => {
                const existing = new Set(prev.map((item) => JSON.stringify(item)));
                const nextItems = page.items.filter((item) => !existing.has(JSON.stringify(item)));
                return [...prev, ...nextItems];
            });
            setNextCursor(page.nextCursor);
        } catch (loadError) {
            setError(getErrorMessage(loadError));
        } finally {
            setIsLoadingMore(false);
        }
    }, [getErrorMessage, isLoadingMore, loadPage, nextCursor, query]);

    useEffect(() => {
        void loadInitial();
    }, [loadInitial]);

    return {
        items,
        nextCursor,
        isLoading,
        isLoadingMore,
        error,
        hasMore: nextCursor !== null,
        reload: loadInitial,
        loadMore,
        setItems,
    };
}