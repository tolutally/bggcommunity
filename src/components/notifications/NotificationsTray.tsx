"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { 
    Bell, 
    X, 
    Calendar, 
    MessageSquare, 
    Award, 
    Users, 
    AlertCircle,
    CheckCircle2,
    Clock,
    Trash2
} from "lucide-react";
import {
    fetchNotificationsFeed,
    loadNotificationState,
    saveNotificationState,
    type NotificationRecord,
    type NotificationType,
} from "@/lib/notifications";
import { getApiErrorMessage } from "@/lib/jobs";
import { useToast } from "@/components/ui/toast";

interface Notification extends NotificationRecord {
    read: boolean;
}

function formatRelativeTime(value: string) {
    const date = new Date(value);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "now";
    if (diffMinutes < 60) return `${diffMinutes}m`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString();
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
    event: <Calendar className="w-4 h-4 text-brand-600" />,
    message: <MessageSquare className="w-4 h-4 text-blue-600" />,
    achievement: <Award className="w-4 h-4 text-accent-500" />,
    community: <Users className="w-4 h-4 text-emerald-600" />,
    system: <AlertCircle className="w-4 h-4 text-stone-500" />,
    reminder: <Clock className="w-4 h-4 text-rose-500" />,
};

const notificationBgColors: Record<NotificationType, string> = {
    event: "bg-brand-100",
    message: "bg-blue-100",
    achievement: "bg-accent-100",
    community: "bg-emerald-100",
    system: "bg-stone-100",
    reminder: "bg-rose-100",
};

export default function NotificationsTray() {
    const { getToken, userId } = useAuth();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [feed, setFeed] = useState<NotificationRecord[]>([]);
    const [state, setState] = useState<{ readIds: string[]; dismissedIds: string[] }>({ readIds: [], dismissedIds: [] });
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [isLoading, setIsLoading] = useState(true);
    const trayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setState(loadNotificationState(userId ?? null));
    }, [userId]);

    useEffect(() => {
        saveNotificationState(userId ?? null, state);
    }, [state, userId]);

    const notifications: Notification[] = (() => {
        const readSet = new Set(state.readIds);
        const dismissedSet = new Set(state.dismissedIds);
        return feed
            .filter((item) => !dismissedSet.has(item.id))
            .map((item) => ({ ...item, read: readSet.has(item.id) }));
    })();

    const unreadCount = notifications.filter((n) => !n.read).length;
    const filteredNotifications = filter === "all" 
        ? notifications 
        : notifications.filter((n) => !n.read);

    useEffect(() => {
        let cancelled = false;

        async function loadNotifications() {
            setIsLoading(true);
            try {
                const items = await fetchNotificationsFeed(getToken);
                if (!cancelled) {
                    setFeed(items);
                }
            } catch (error) {
                if (!cancelled) {
                    toast(getApiErrorMessage(error, "Unable to load notifications right now."), "error");
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        if (isOpen) {
            void loadNotifications();
        }

        return () => {
            cancelled = true;
        };
    }, [getToken, isOpen, toast]);

    // Close tray when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (trayRef.current && !trayRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const markAsRead = (id: string) => {
        setState((prev) => prev.readIds.includes(id)
            ? prev
            : { ...prev, readIds: [...prev.readIds, id] });
    };

    const markAllAsRead = () => {
        setState((prev) => ({
            ...prev,
            readIds: Array.from(new Set([...prev.readIds, ...notifications.map((n) => n.id)])),
        }));
    };

    const deleteNotification = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setState((prev) => prev.dismissedIds.includes(id)
            ? prev
            : { ...prev, dismissedIds: [...prev.dismissedIds, id] });
    };

    return (
        <div className="relative" ref={trayRef}>
            {/* Bell Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 h-4 w-4 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {/* Notifications Tray */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-[100]">
                    {/* Header */}
                    <div className="bg-brand-800 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            <span className="font-bold">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            title="Close notifications"
                            aria-label="Close notifications"
                            className="hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Filter Tabs & Actions */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-stone-100 bg-stone-50">
                        <div className="flex gap-1">
                            <button
                                onClick={() => setFilter("all")}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                    filter === "all"
                                        ? "bg-brand-100 text-brand-700"
                                        : "text-stone-500 hover:bg-stone-100"
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter("unread")}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                    filter === "unread"
                                        ? "bg-brand-100 text-brand-700"
                                        : "text-stone-500 hover:bg-stone-100"
                                }`}
                            >
                                Unread
                            </button>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1 transition-colors"
                            >
                                <CheckCircle2 className="w-3 h-3" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                        {isLoading ? (
                            <div className="p-8 text-center">
                                <Clock className="w-10 h-10 text-stone-300 mx-auto mb-3 animate-pulse" />
                                <p className="text-sm text-stone-500 font-medium">Loading notifications...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                                <p className="text-sm text-stone-500 font-medium">
                                    {filter === "unread" 
                                        ? "No unread notifications" 
                                        : "No notifications yet"}
                                </p>
                                <p className="text-xs text-stone-400 mt-1">
                                    We'll notify you when something happens
                                </p>
                            </div>
                        ) : (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => markAsRead(notification.id)}
                                    className={`p-4 flex gap-3 hover:bg-stone-50 transition-colors cursor-pointer group ${
                                        !notification.read ? "bg-brand-50/50" : ""
                                    }`}
                                >
                                    {/* Icon or Avatar */}
                                    <div className="flex-shrink-0">
                                        {notification.avatarUrl ? (
                                            <img
                                                src={notification.avatarUrl}
                                                alt=""
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                    notificationBgColors[notification.type]
                                                }`}
                                            >
                                                {notificationIcons[notification.type]}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4
                                                className={`text-sm truncate ${
                                                    !notification.read
                                                        ? "font-bold text-stone-900"
                                                        : "font-medium text-stone-700"
                                                }`}
                                            >
                                                {notification.title}
                                            </h4>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {!notification.read && (
                                                    <span className="w-2 h-2 bg-accent-500 rounded-full"></span>
                                                )}
                                                <span className="text-xs text-stone-400">
                                                    {formatRelativeTime(notification.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">
                                            {notification.description}
                                        </p>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => deleteNotification(notification.id, e)}
                                        title="Dismiss notification"
                                        aria-label="Dismiss notification"
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all flex-shrink-0 self-center"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-stone-100 bg-stone-50">
                            <a href="/member/notifications" className="block w-full text-center text-sm font-semibold text-brand-600 hover:text-brand-800 py-1.5 rounded-lg hover:bg-brand-50 transition-colors">
                                View all notifications
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
