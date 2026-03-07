"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/* ──────────────────────────── types ──────────────────────────── */

export type BadgeVariant = "pill" | "tag" | "dot-only";

export interface StatusBadgeProps {
    /** The label text to display */
    label: string;
    /** Color scheme — maps to Tailwind color name (e.g. "green", "red", "brand") */
    color?: string;
    /** Pre-built status presets — overrides `color` if provided */
    preset?: keyof typeof STATUS_PRESETS;
    /** "pill" = rounded-full status pill, "tag" = uppercase tracking tag, "dot-only" = colored dot only */
    variant?: BadgeVariant;
    /** Show colored dot before label (default: true for "pill" variant) */
    dot?: boolean;
    /** Optional leading icon (lucide-react icon component) */
    icon?: LucideIcon;
    /** Additional class names */
    className?: string;
}

/* ──────────────────────── preset mappings ─────────────────────── */

export const STATUS_PRESETS = {
    // member / cohort statuses
    Active:      { bg: "bg-green-50",   text: "text-green-700",  dot: "bg-green-500",  border: "border-green-100" },
    Upcoming:    { bg: "bg-blue-50",    text: "text-blue-700",   dot: "bg-blue-500",   border: "border-blue-200" },
    Completed:   { bg: "bg-green-50",   text: "text-green-700",  dot: "bg-green-500",  border: "border-green-200" },
    "On Leave":  { bg: "bg-yellow-50",  text: "text-yellow-700", dot: "bg-yellow-500", border: "border-yellow-100" },
    Suspended:   { bg: "bg-red-50",     text: "text-red-700",    dot: "bg-red-500",    border: "border-red-100" },
    Inactive:    { bg: "bg-stone-100",  text: "text-stone-500",  dot: "bg-stone-400",  border: "border-stone-200" },

    // devplan
    "To Do":       { bg: "bg-stone-100",  text: "text-stone-600",  dot: "bg-stone-400",  border: "border-stone-200" },
    "In Progress": { bg: "bg-amber-50",   text: "text-amber-700",  dot: "bg-amber-500",  border: "border-amber-200" },

    // severity
    High:   { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500",    border: "border-red-200" },
    Medium: { bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-500", border: "border-orange-200" },
    Low:    { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500", border: "border-yellow-200" },

    // work mode
    Remote:   { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500",  border: "border-green-100" },
    Hybrid:   { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500",   border: "border-blue-100" },
    "On-site": { bg: "bg-stone-50",  text: "text-stone-600",  dot: "bg-stone-400",  border: "border-stone-200" },

    // platforms
    Zoom:          { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500",   border: "border-blue-200" },
    "Google Meet": { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500",  border: "border-green-200" },

    // event types
    Workshop:         { bg: "bg-purple-50",   text: "text-purple-700",   dot: "bg-purple-500",   border: "border-purple-200" },
    "Q&A":            { bg: "bg-blue-100",    text: "text-blue-700",     dot: "bg-blue-500",     border: "border-blue-200" },
    "Speaker Series": { bg: "bg-emerald-100", text: "text-emerald-700",  dot: "bg-emerald-500",  border: "border-emerald-200" },
    Social:           { bg: "bg-amber-100",   text: "text-amber-700",    dot: "bg-amber-500",    border: "border-amber-200" },
    Hackathon:        { bg: "bg-purple-100",  text: "text-purple-700",   dot: "bg-purple-500",   border: "border-purple-200" },
} as const;

/* ──────────────── ad-hoc color helper ─────────────────────────── */

function colorClasses(color: string) {
    return {
        bg: `bg-${color}-50`,
        text: `text-${color}-700`,
        dot: `bg-${color}-500`,
        border: `border-${color}-200`,
    };
}

/* ──────────────────────── component ──────────────────────────── */

export function StatusBadge({
    label,
    color,
    preset,
    variant = "pill",
    dot,
    icon: Icon,
    className,
}: StatusBadgeProps) {
    const scheme = preset
        ? STATUS_PRESETS[preset]
        : color
            ? colorClasses(color)
            : STATUS_PRESETS.Inactive;

    const showDot = dot ?? (variant === "pill");

    const base =
        variant === "pill"
            ? cn(
                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold",
                scheme.bg,
                scheme.text,
                className,
            )
            : variant === "tag"
                ? cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border",
                    scheme.bg,
                    scheme.text,
                    scheme.border,
                    className,
                )
                : /* dot-only */ cn("w-2.5 h-2.5 rounded-full", scheme.dot, className);

    if (variant === "dot-only") {
        return <span className={base} />;
    }

    return (
        <span className={base}>
            {showDot && <span className={cn("w-1.5 h-1.5 rounded-full", scheme.dot)} />}
            {Icon && <Icon size={variant === "tag" ? 10 : 12} />}
            {label}
        </span>
    );
}
