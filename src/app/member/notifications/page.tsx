"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import {
    Bell, Calendar, MessageSquare, Award, Users, AlertCircle, Clock, CheckCheck, Trash2, X, Loader2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useToast } from "@/components/ui/toast";
import {
    fetchNotificationsFeed,
    loadNotificationState,
    saveNotificationState,
    type NotificationRecord,
    type NotificationType,
} from "@/lib/notifications";
import { getApiErrorMessage } from "@/lib/jobs";

interface Notification extends NotificationRecord {
    read: boolean;
}

const TYPE_ICON: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
    event: { icon: Calendar, color: "text-brand-600", bg: "bg-brand-100" },
    message: { icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-100" },
    achievement: { icon: Award, color: "text-amber-600", bg: "bg-amber-100" },
    community: { icon: Users, color: "text-emerald-600", bg: "bg-emerald-100" },
    system: { icon: AlertCircle, color: "text-stone-500", bg: "bg-stone-100" },
    reminder: { icon: Clock, color: "text-rose-500", bg: "bg-rose-100" },
};

type Filter = "all" | "unread" | NotificationType;

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

export default function MemberNotificationsPage() {
    const { getToken, userId } = useAuth();
    const { toast } = useToast();
    const [feed, setFeed] = useState<NotificationRecord[]>([]);
    const [state, setState] = useState<{ readIds: string[]; dismissedIds: string[] }>({ readIds: [], dismissedIds: [] });
    const [filter, setFilter] = useState<Filter>("all");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setState(loadNotificationState(userId ?? null));
    }, [userId]);

    useEffect(() => {
        let cancelled = false;

        async function loadNotifications() {
            setIsLoading(true);
            setError(null);
            try {
                const items = await fetchNotificationsFeed(getToken);
                if (cancelled) return;
                setFeed(items);
            } catch (loadError) {
                if (!cancelled) {
                    setError(getApiErrorMessage(loadError, "Unable to load notifications right now."));
                    toast(getApiErrorMessage(loadError, "Unable to load notifications right now."), "error");
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadNotifications();

        return () => {
            cancelled = true;
        };
    }, [getToken, toast]);

    useEffect(() => {
        saveNotificationState(userId ?? null, state);
    }, [state, userId]);

    const notifications: Notification[] = useMemo(() => {
        const readSet = new Set(state.readIds);
        const dismissedSet = new Set(state.dismissedIds);

        return feed
            .filter((item) => !dismissedSet.has(item.id))
            .map((item) => ({ ...item, read: readSet.has(item.id) }));
    }, [feed, state]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const filtered = useMemo(() => notifications.filter(n => {
        if (filter === "all") return true;
        if (filter === "unread") return !n.read;
        return n.type === filter;
    }), [filter, notifications]);

    const markRead = (id: string) => {
        setState((prev) => prev.readIds.includes(id)
            ? prev
            : { ...prev, readIds: [...prev.readIds, id] });
    };
    const markAllRead = () => {
        setState((prev) => ({
            ...prev,
            readIds: Array.from(new Set([...prev.readIds, ...notifications.map((n) => n.id)])),
        }));
    };
    const deleteNotif = (id: string) => {
        setState((prev) => prev.dismissedIds.includes(id)
            ? prev
            : { ...prev, dismissedIds: [...prev.dismissedIds, id] });
    };
    const clearAll = () => {
        setState((prev) => ({
            ...prev,
            dismissedIds: Array.from(new Set([...prev.dismissedIds, ...notifications.map((n) => n.id)])),
        }));
    };

    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Notifications</h1>
                    <p className="text-stone-500 mt-1">
                        {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up!"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors">
                            <CheckCheck size={16} /> Mark All Read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button onClick={clearAll} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors">
                            <Trash2 size={16} /> Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
                {([
                    { key: "all" as Filter, label: "All" },
                    { key: "unread" as Filter, label: `Unread (${unreadCount})` },
                    { key: "event" as Filter, label: "Events" },
                    { key: "message" as Filter, label: "Messages" },
                    { key: "community" as Filter, label: "Community" },
                    { key: "achievement" as Filter, label: "Achievements" },
                ]).map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === f.key ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
                        {f.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-8 text-stone-500 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Loading notifications...
                </div>
            ) : error ? (
                <EmptyState icon={Bell} heading="Notifications unavailable" description={error} variant="plain" />
            ) : (
                <div className="space-y-2">
                    {filtered.map(notif => {
                        const cfg = TYPE_ICON[notif.type];
                        const Icon = cfg.icon;
                        return (
                            <div
                                key={notif.id}
                                onClick={() => markRead(notif.id)}
                                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${notif.read ? "bg-white border-stone-100 hover:border-stone-200" : "bg-brand-50/40 border-brand-100 hover:border-brand-200"}`}
                            >
                                {notif.avatarUrl ? (
                                    <AvatarInitials name={notif.title} src={notif.avatarUrl} size="md" />
                                ) : (
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                                        <Icon size={18} className={cfg.color} />
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`text-sm font-bold ${notif.read ? "text-stone-700" : "text-stone-900"}`}>{notif.title}</h3>
                                        {!notif.read ? <span className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0" /> : null}
                                    </div>
                                    <p className="text-sm text-stone-500 mt-0.5">{notif.description}</p>
                                    <span className="text-[11px] text-stone-400 font-medium mt-1 block">{formatRelativeTime(notif.createdAt)}</span>
                                </div>

                                <button
                                    onClick={event => { event.stopPropagation(); deleteNotif(notif.id); }}
                                    title="Dismiss notification"
                                    aria-label="Dismiss notification"
                                    className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
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
