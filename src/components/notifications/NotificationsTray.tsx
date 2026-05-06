"use client";

import { useState, useRef, useEffect } from "react";
import { 
    Bell, 
    X, 
    Calendar, 
    MessageSquare, 
    Briefcase,
    Award, 
    Users, 
    AlertCircle,
    CheckCircle2,
    Clock,
} from "lucide-react";
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@/hooks/use-notifications";
import type { AppNotification, NotificationType } from "@/lib/types";
import { getApiErrorMessage } from "@/lib/jobs";
import { useToast } from "@/components/ui/toast";

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

function getNotificationPresentation(type: NotificationType | string) {
    switch (type) {
        case "EVENT_CREATED":
            return {
                icon: <Calendar className="w-4 h-4 text-brand-600" />,
                bgColor: "bg-brand-100",
            };
        case "SESSION_REMINDER":
            return {
                icon: <Clock className="w-4 h-4 text-rose-500" />,
                bgColor: "bg-rose-100",
            };
        case "JOB_POSTED":
        case "REFERRAL_UPDATE":
            return {
                icon: <Briefcase className="w-4 h-4 text-blue-600" />,
                bgColor: "bg-blue-100",
            };
        case "ANNOUNCEMENT":
        case "COHORT_INVITE":
            return {
                icon: <Users className="w-4 h-4 text-emerald-600" />,
                bgColor: "bg-emerald-100",
            };
        case "REPORT_RESOLVED":
            return {
                icon: <Award className="w-4 h-4 text-accent-500" />,
                bgColor: "bg-accent-100",
            };
        case "WARNING_SENT":
            return {
                icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
                bgColor: "bg-amber-100",
            };
        default:
            return {
                icon: <MessageSquare className="w-4 h-4 text-stone-500" />,
                bgColor: "bg-stone-100",
            };
    }
}

export default function NotificationsTray() {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [optimisticReadIds, setOptimisticReadIds] = useState<string[]>([]);
    const trayRef = useRef<HTMLDivElement>(null);
    const { notifications: apiNotifications, unreadCount: apiUnreadCount, isLoading, error } = useNotifications();
    const { trigger: markNotificationRead } = useMarkNotificationRead();
    const { trigger: markAllNotificationsRead, isLoading: isMarkingAllRead } = useMarkAllNotificationsRead();

    const notifications: AppNotification[] = apiNotifications.map((notification) => (
        optimisticReadIds.includes(notification.id)
            ? { ...notification, read: true }
            : notification
    ));

    const unreadCount = Math.max(
        0,
        apiUnreadCount - optimisticReadIds.filter((id) => apiNotifications.some((notification) => notification.id === id && !notification.read)).length,
    );
    const filteredNotifications = filter === "all" 
        ? notifications 
        : notifications.filter((n) => !n.read);

    useEffect(() => {
        if (error && isOpen) {
            toast(getApiErrorMessage(error, "Unable to load notifications right now."), "error");
        }
    }, [error, isOpen, toast]);

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

    const markAsRead = async (id: string) => {
        const target = notifications.find((notification) => notification.id === id);
        if (!target || target.read || optimisticReadIds.includes(id)) {
            return;
        }

        setOptimisticReadIds((prev) => [...prev, id]);

        try {
            await markNotificationRead(id);
        } catch (readError) {
            setOptimisticReadIds((prev) => prev.filter((value) => value !== id));
            toast(getApiErrorMessage(readError, "Unable to update notification right now."), "error");
        }
    };

    const markAllAsRead = async () => {
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
                                disabled={isMarkingAllRead}
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
                                    We&apos;ll notify you when something happens
                                </p>
                            </div>
                        ) : (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => void markAsRead(notification.id)}
                                    className={`p-4 flex gap-3 hover:bg-stone-50 transition-colors cursor-pointer group ${
                                        !notification.read ? "bg-brand-50/50" : ""
                                    }`}
                                >
                                    {/* Icon or Avatar */}
                                    <div className="flex-shrink-0">
                                        {(() => {
                                            const presentation = getNotificationPresentation(notification.type);
                                            return (
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${presentation.bgColor}`}
                                                >
                                                    {presentation.icon}
                                                </div>
                                            );
                                        })()}
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
                                            {notification.body}
                                        </p>
                                    </div>
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
