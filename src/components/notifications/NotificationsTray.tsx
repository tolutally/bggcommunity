"use client";

import { useState, useRef, useEffect } from "react";
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

type NotificationType = "event" | "message" | "achievement" | "community" | "system" | "reminder";

interface Notification {
    id: number;
    type: NotificationType;
    title: string;
    description: string;
    time: string;
    read: boolean;
    avatar?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 1,
        type: "event",
        title: "Upcoming Workshop",
        description: "Leadership in Tech starts in 2 hours",
        time: "2h",
        read: false,
    },
    {
        id: 2,
        type: "message",
        title: "Dr. Alisha Reid",
        description: "Sent you a message about your mentorship session",
        time: "3h",
        read: false,
        avatar: "https://i.pravatar.cc/150?u=alisha",
    },
    {
        id: 3,
        type: "achievement",
        title: "Badge Earned!",
        description: "You've completed your first workshop 🎉",
        time: "1d",
        read: false,
    },
    {
        id: 4,
        type: "community",
        title: "New Discussion",
        description: "Maya started a thread in Tech Careers",
        time: "1d",
        read: true,
        avatar: "https://i.pravatar.cc/150?u=maya",
    },
    {
        id: 5,
        type: "system",
        title: "Profile Update",
        description: "Please complete your profile to unlock more features",
        time: "2d",
        read: true,
    },
    {
        id: 6,
        type: "reminder",
        title: "Session Reminder",
        description: "Don't forget your 1:1 session tomorrow at 3pm",
        time: "2d",
        read: true,
    },
];

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
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const trayRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter((n) => !n.read).length;
    const filteredNotifications = filter === "all" 
        ? notifications 
        : notifications.filter((n) => !n.read);

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

    const markAsRead = (id: number) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const deleteNotification = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications((prev) => prev.filter((n) => n.id !== id));
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
                        {filteredNotifications.length === 0 ? (
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
                                        {notification.avatar ? (
                                            <img
                                                src={notification.avatar}
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
                                                    {notification.time}
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
                            <button className="w-full text-center text-sm font-semibold text-brand-600 hover:text-brand-800 py-1.5 rounded-lg hover:bg-brand-50 transition-colors">
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
