export type QueryScope = "events" | "jobs" | "community" | "cohorts";

type InvalidationListener = () => void | Promise<void>;

const listeners = new Map<QueryScope, Set<InvalidationListener>>();

export function subscribeToInvalidation(scope: QueryScope, listener: InvalidationListener) {
    const scopeListeners = listeners.get(scope) ?? new Set<InvalidationListener>();
    scopeListeners.add(listener);
    listeners.set(scope, scopeListeners);

    return () => {
        const current = listeners.get(scope);
        if (!current) {
            return;
        }

        current.delete(listener);

        if (current.size === 0) {
            listeners.delete(scope);
        }
    };
}

export function invalidateQuery(scope: QueryScope) {
    const scopeListeners = listeners.get(scope);
    if (!scopeListeners || scopeListeners.size === 0) {
        return;
    }

    scopeListeners.forEach((listener) => {
        void Promise.resolve(listener()).catch(() => {
            // Invalidation listeners should never break unrelated UI updates.
        });
    });
}

export function invalidateQueries(scopes: QueryScope[]) {
    scopes.forEach((scope) => invalidateQuery(scope));
}
