"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/* ──────────────────────────── types ──────────────────────────── */

export type EmptyStateVariant = "plain" | "dashed";

export interface EmptyStateProps {
    /** lucide-react icon component */
    icon: LucideIcon;
    /** Primary heading text */
    heading: string;
    /** Optional subtext / description */
    description?: string;
    /** Optional CTA button */
    action?: {
        label: string;
        onClick: () => void;
    };
    /** "plain" = white background, "dashed" = stone-50 dashed border (default: "dashed") */
    variant?: EmptyStateVariant;
    /** Override icon size (default 28 for plain, 48 for dashed) */
    iconSize?: number;
    /** Additional class names on the wrapper */
    className?: string;
}

/* ──────────────────────── component ──────────────────────────── */

export function EmptyState({
    icon: Icon,
    heading,
    description,
    action,
    variant = "dashed",
    iconSize,
    className,
}: EmptyStateProps) {
    const size = iconSize ?? (variant === "plain" ? 28 : 48);

    return (
        <div
            className={cn(
                "text-center py-16",
                variant === "dashed" &&
                    "bg-stone-50 rounded-2xl border border-dashed border-stone-200",
                className,
            )}
        >
            {variant === "plain" ? (
                /* Icon inside a circle — matches the "plain" variant found in jobs, notifications */
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon size={size} className="text-stone-300" />
                </div>
            ) : (
                /* Larger standalone icon — matches the "dashed" variant found in community, schedule */
                <Icon className="mx-auto text-stone-300 mb-4" size={size} />
            )}

            <h3 className="text-lg font-bold text-stone-900 mb-1">{heading}</h3>

            {description && (
                <p className="text-stone-500 text-sm">{description}</p>
            )}

            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-3 text-sm font-bold text-brand-600 hover:text-brand-700 hover:underline"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
