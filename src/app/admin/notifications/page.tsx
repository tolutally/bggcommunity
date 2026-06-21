"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Bell, Calendar, Briefcase, AlertTriangle, CheckCheck, Loader2,
    Megaphone, UserPlus, Video, ShieldCheck, Send,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useToast } from "@/components/ui/toast";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/hooks/use-notifications";
import type { AppNotification, NotificationType } from "@/lib/types";
import { getApiErrorMessage } from "@/lib/jobs";

type Filter = "all" | "unread" | "events" | "jobs" | "community" | "system";

function formatRelativeTime(value: string) {
    const date = new Date(value);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
}

function getNotificationPresentation(type: NotificationType | string) {
    switch (type) {
        case "ANNOUNCEMENT":
            return { icon: Megaphone, color: "text-emerald-600", bg: "bg-emerald-100", filter: "community" as const };
        case "COHORT_INVITE":
            return { icon: UserPlus, color: "text-violet-600", bg: "bg-violet-100", filter: "community" as const };
        case "EVENT_CREATED":
            return { icon: Calendar, color: "text-brand-600", bg: "bg-brand-100", filter: "events" as const };
        case "SESSION_REMINDER":
            return { icon: Video, color: "text-rose-500", bg: "bg-rose-100", filter: "events" as const };
        case "JOB_POSTED":
            return { icon: Briefcase, color: "text-blue-600", bg: "bg-blue-100", filter: "jobs" as const };
        case "REFERRAL_UPDATE":
            return { icon: Send, color: "text-sky-600", bg: "bg-sky-100", filter: "jobs" as const };
        case "REPORT_RESOLVED":
            return { icon: ShieldCheck, color: "text-green-600", bg: "bg-green-100", filter: "system" as const };
        case "WARNING_SENT":
            return { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100", filter: "system" as const };
        default:
            return { icon: Bell, color: "text-stone-500", bg: "bg-stone-100", filter: "system" as const };
    }
}

function resolveHref(referenceType: string | null, referenceId: string | null): string | null {
    if (!referenceType || !referenceId) return null;
    switch (referenceType) {
        case "Cohort": return `/admin/cohorts/${referenceId}`;
        case "Event": return `/admin/events/${referenceId}`;
        case "Job": return `/admin/jobs`;
        case "Group": return `/admin/community`;
        default: return null;
    }
}

export default function AdminNotificationsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [filter, setFilter] = useState<Filter>("all");
    const [optimisticReadIds, setOptimisticReadIds] = useState<string[]>([]);
    const { notifications: apiNotifications, unreadCount: apiUnreadCount, isLoading, error } = useNotifications();
    const { trigger: markNotificationRead } = useMarkNotificationRead();
    const { trigger: markAllNotificationsRead, isLoading: isMarkingAllRead } = useMarkAllNotificationsRead();

    useEffect(() => {
        if (error) {
            toast(getApiErrorMessage(error, "Unable to load notifications right now."), "error");
        }
    }, [error, toast]);

    const notifications: AppNotification[] = useMemo(() => apiNotifications.map((notification) => (
        optimisticReadIds.includes(notification.id)
            ? { ...notification, read: true }
            : notification
    )), [apiNotifications, optimisticReadIds]);

    const unreadCount = Math.max(
        0,
        apiUnreadCount - optimisticReadIds.filter((id) => apiNotifications.some((notification) => notification.id === id && !notification.read)).length,
    );

    const filtered = useMemo(() => notifications.filter((notification) => {
        if (filter === "all") return true;
        if (filter === "unread") return !notification.read;
        return getNotificationPresentation(notification.type).filter === filter;
    }), [filter, notifications]);

    const handleNotificationClick = async (id: string) => {
        const target = notifications.find((notification) => notification.id === id);
        if (!target) return;

        const href = resolveHref(target.referenceType, target.referenceId);

        if (!target.read && !optimisticReadIds.includes(id)) {
            setOptimisticReadIds((prev) => [...prev, id]);
            try {
                await markNotificationRead(id);
            } catch (readError) {
                setOptimisticReadIds((prev) => prev.filter((value) => value !== id));
                toast(getApiErrorMessage(readError, "Unable to update notification right now."), "error");
            }
        }

        if (href) router.push(href);
    };

    const markAllRead = async () => {
        const unreadIds = notifications.filter((notification) => !notification.read).map((notification) => notification.id);
        if (unreadIds.length === 0) {
            return;
        }

        setOptimisticReadIds((prev) => Array.from(new Set([...prev, ...unreadIds])));

        try {
            await markAllNotificationsRead();
        } catch (readError) {
            setOptimisticReadIds((prev) => prev.filter((value) => !unreadIds.includes(value)));
            toast(getApiErrorMessage(readError, "Unable to update notifications right now."), "error");
        }
    };

    return (
        <ErrorBoundary>
            <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-900">Notifications</h1>
                        <p className="text-stone-500 mt-1">
                            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up!"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button onClick={() => void markAllRead()} disabled={isMarkingAllRead} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors disabled:opacity-60">
                                <CheckCheck size={16} /> Mark All Read
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {([
                        { key: "all" as Filter, label: "All" },
                        { key: "unread" as Filter, label: `Unread (${unreadCount})` },
                        { key: "events" as Filter, label: "Events" },
                        { key: "jobs" as Filter, label: "Jobs" },
                        { key: "community" as Filter, label: "Community" },
                        { key: "system" as Filter, label: "System" },
                    ]).map((entry) => (
                        <button key={entry.key} onClick={() => setFilter(entry.key)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === entry.key ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
                            {entry.label}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="rounded-2xl border border-stone-200 bg-white p-8 text-stone-500 flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" /> Loading notifications...
                    </div>
                ) : error ? (
                    <EmptyState icon={Bell} heading="Notifications unavailable" description={getApiErrorMessage(error, "Unable to load notifications right now.")} variant="plain" />
                ) : (
                    <div className="space-y-2">
                        {filtered.map((notification) => {
                            const cfg = getNotificationPresentation(notification.type);
                            const Icon = cfg.icon;
                            const href = resolveHref(notification.referenceType, notification.referenceId);

                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => void handleNotificationClick(notification.id)}
                                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${href ? "cursor-pointer hover:shadow-sm" : "cursor-default"} ${notification.read ? "bg-white border-stone-100 hover:border-stone-200" : "bg-brand-50/40 border-brand-100 hover:border-brand-200"}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                                        <Icon size={18} className={cfg.color} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className={`text-sm font-bold ${notification.read ? "text-stone-700" : "text-stone-900"}`}>{notification.title}</h3>
                                            {!notification.read ? <span className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0" /> : null}
                                        </div>
                                        <p className="text-sm text-stone-500 mt-0.5">{notification.body}</p>
                                        <span className="text-[11px] text-stone-400 font-medium mt-1 block">{formatRelativeTime(notification.createdAt)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!isLoading && !error && filtered.length === 0 && (
                    <EmptyState
                        icon={Bell}
                        heading={filter === "unread" ? "No unread notifications" : "No notifications"}
                        description={filter === "unread" ? "You're all caught up!" : "When something happens, you'll see it here."}
                        variant="plain"
                    />
                )}
            </div>
        </ErrorBoundary>
    );
}
