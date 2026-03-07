"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

/* ──────────────────────────── types ──────────────────────────── */

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AvatarInitialsProps {
    /** Full name — initials are derived from this */
    name: string;
    /** Optional image URL — falls back to initials when missing or broken */
    src?: string | null;
    /** Size preset (default: "md") */
    size?: AvatarSize;
    /** Additional class names */
    className?: string;
}

/* ──────────────────────── size map ──────────────────────────── */

const SIZE_MAP: Record<AvatarSize, { container: string; text: string }> = {
    xs: { container: "w-6 h-6",   text: "text-[10px]" },
    sm: { container: "w-8 h-8",   text: "text-xs" },
    md: { container: "w-10 h-10", text: "text-sm" },
    lg: { container: "w-12 h-12", text: "text-base" },
    xl: { container: "w-16 h-16", text: "text-lg" },
};

/* ──────────── deterministic color from name ────────────────── */

const COLORS = [
    "bg-brand-100 text-brand-700",
    "bg-green-100 text-green-700",
    "bg-blue-100 text-blue-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-purple-100 text-purple-700",
    "bg-teal-100 text-teal-700",
    "bg-indigo-100 text-indigo-700",
];

function colorFromName(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (parts[0]?.[0] ?? "?").toUpperCase();
}

/* ──────────────────────── component ──────────────────────────── */

export function AvatarInitials({
    name,
    src,
    size = "md",
    className,
}: AvatarInitialsProps) {
    const [imgError, setImgError] = useState(false);

    const s = SIZE_MAP[size];
    const showImage = src && !imgError;

    return (
        <div
            className={cn(
                "rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden font-bold",
                s.container,
                !showImage && s.text,
                !showImage && colorFromName(name),
                className,
            )}
        >
            {showImage ? (
                <img
                    src={src}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                />
            ) : (
                getInitials(name)
            )}
        </div>
    );
}
