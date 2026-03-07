"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

/* ──────────────────────────── types ──────────────────────────── */

export type ToastVariant = "success" | "error" | "info";

export interface Toast {
    id: string;
    message: string;
    variant: ToastVariant;
}

interface ToastContextValue {
    toasts: Toast[];
    toast: (message: string, variant?: ToastVariant) => void;
    dismiss: (id: string) => void;
}

/* ──────────────────────── context ──────────────────────────── */

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
    return ctx;
}

/* ────────────────── variant config ───────────────────────────── */

const VARIANT_CONFIG: Record<
    ToastVariant,
    { icon: typeof CheckCircle; bg: string; text: string }
> = {
    success: { icon: CheckCircle, bg: "bg-green-600", text: "text-white" },
    error:   { icon: AlertCircle, bg: "bg-red-600",   text: "text-white" },
    info:    { icon: Info,        bg: "bg-stone-800",  text: "text-white" },
};

/* ──────────────────── provider + renderer ─────────────────────── */

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(
        (message: string, variant: ToastVariant = "success") => {
            const id = `toast-${++counter}`;
            setToasts((prev) => [...prev, { id, message, variant }]);
            setTimeout(() => dismiss(id), 3000);
        },
        [dismiss],
    );

    return (
        <ToastContext.Provider value={{ toasts, toast: addToast, dismiss }}>
            {children}

            {/* Render stack */}
            <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => {
                    const cfg = VARIANT_CONFIG[t.variant];
                    const Icon = cfg.icon;
                    return (
                        <div
                            key={t.id}
                            className={cn(
                                "pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-lg animate-in fade-in slide-in-from-top-2",
                                cfg.bg,
                                cfg.text,
                            )}
                        >
                            <Icon size={18} />
                            <span className="flex-1">{t.message}</span>
                            <button
                                onClick={() => dismiss(t.id)}
                                className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}
