"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

/* ──────────────────────────── types ──────────────────────────── */

export interface ErrorBoundaryProps {
    children: ReactNode;
    /** Optional custom fallback — receives error + reset callback */
    fallback?: (props: { error: Error; reset: () => void }) => ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/* ──────────────────────── component ──────────────────────────── */

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // Log to console in dev — swap for your error reporting service later
        console.error("[ErrorBoundary]", error, info.componentStack);
    }

    reset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError && this.state.error) {
            if (this.props.fallback) {
                return this.props.fallback({
                    error: this.state.error,
                    reset: this.reset,
                });
            }

            return <DefaultFallback error={this.state.error} reset={this.reset} />;
        }

        return this.props.children;
    }
}

/* ──────────────── default fallback UI ────────────────────────── */

function DefaultFallback({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                <AlertCircle size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">
                Something went wrong
            </h3>
            <p className="text-stone-500 text-sm max-w-xs mb-4">
                {error.message || "An unexpected error occurred."}
            </p>
            <button
                onClick={reset}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
            >
                <RefreshCw size={14} />
                Try again
            </button>
        </div>
    );
}
