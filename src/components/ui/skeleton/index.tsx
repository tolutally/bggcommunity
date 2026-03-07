"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* ──────────────────────────── types ──────────────────────────── */

export interface SkeletonProps {
    /** Additional class names — use to set width/height (e.g. "h-4 w-32") */
    className?: string;
}

export interface SkeletonCardProps {
    /** Number of text lines to show below the header bar (default: 3) */
    lines?: number;
    /** Additional class names on the card wrapper */
    className?: string;
}

/* ──────────────────── base skeleton bar ──────────────────────── */

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-lg bg-stone-200",
                className,
            )}
        />
    );
}

/* ──────────────── skeleton card (common preset) ──────────────── */

export function SkeletonCard({ lines = 3, className }: SkeletonCardProps) {
    return (
        <div
            className={cn(
                "bg-white rounded-2xl border border-stone-100 p-5 space-y-3",
                className,
            )}
        >
            {/* Header row: circle + title bar */}
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>

            {/* Body lines */}
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
                />
            ))}
        </div>
    );
}

/* ──────────── skeleton table row (admin lists) ───────────────── */

export function SkeletonRow({ cols = 4, className }: { cols?: number; className?: string }) {
    return (
        <div className={cn("flex items-center gap-4 py-3", className)}>
            {Array.from({ length: cols }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn(
                        "h-4",
                        i === 0 ? "w-40" : i === cols - 1 ? "w-16" : "w-24",
                    )}
                />
            ))}
        </div>
    );
}
