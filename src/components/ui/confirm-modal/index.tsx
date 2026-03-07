"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ──────────────────────────── types ──────────────────────────── */

export interface ConfirmModalProps {
    /** Whether the modal is open */
    open: boolean;
    /** Called when the user dismisses (backdrop click or Cancel) */
    onClose: () => void;
    /** Called when the user confirms the action */
    onConfirm: () => void;
    /** Modal heading (e.g. "Delete Cohort?") */
    title: string;
    /** Descriptive text below the heading */
    description?: string;
    /** Confirm button label (default: "Delete") */
    confirmLabel?: string;
    /** Cancel button label (default: "Cancel") */
    cancelLabel?: string;
    /** Confirm button color scheme — "danger" (red) or "primary" (brand) */
    variant?: "danger" | "primary";
    /** Icon displayed in the colored circle (default: AlertCircle) */
    icon?: LucideIcon;
    /** If true, the confirm button shows a loading spinner */
    loading?: boolean;
    /** Additional class names on the card */
    className?: string;
}

/* ──────────────────────── component ──────────────────────────── */

export function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    variant = "danger",
    icon: Icon = AlertCircle,
    loading = false,
    className,
}: ConfirmModalProps) {
    if (!open) return null;

    const isDanger = variant === "danger";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className={cn(
                    "bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center",
                    className,
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon */}
                <div
                    className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4",
                        isDanger ? "bg-red-50" : "bg-brand-50",
                    )}
                >
                    <Icon
                        size={24}
                        className={isDanger ? "text-red-500" : "text-brand-600"}
                    />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-stone-900 mb-2">
                    {title}
                </h3>

                {/* Description */}
                {description && (
                    <p className="text-stone-500 text-sm mb-6">{description}</p>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={cn(
                            "flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-colors",
                            isDanger
                                ? "bg-red-600 hover:bg-red-500"
                                : "bg-brand-600 hover:bg-brand-500",
                            loading && "opacity-50 cursor-not-allowed",
                        )}
                    >
                        {loading ? "…" : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
