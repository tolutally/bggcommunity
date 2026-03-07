"use client";

import { useState } from "react";
import {
    Bell, Calendar, MessageSquare, Award, Users, AlertCircle, Clock, CheckCheck, Trash2, X,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { ErrorBoundary } from "@/components/ui/error-boundary";

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
    { id: 1, type: "event", title: "Upcoming Workshop", description: "Leadership in Tech starts in 2 hours", time: "2h ago", read: false },
    { id: 2, type: "message", title: "Brianna Sterling", description: "Replied to your question in the Product Design group", time: "3h ago", read: false, avatar: "https://i.pravatar.cc/150?u=brianna" },
    { id: 3, type: "achievement", title: "Badge Earned!", description: "You've completed your first workshop 🎉", time: "1d ago", read: false },
    { id: 4, type: "community", title: "New Discussion", description: "Maya started a thread in Tech Careers", time: "1d ago", read: true, avatar: "https://i.pravatar.cc/150?u=maya" },
    { id: 5, type: "system", title: "Profile Incomplete", description: "Add your bio and skills to unlock community features", time: "2d ago", read: true },
    { id: 6, type: "reminder", title: "Session Reminder", description: "Don't forget your 1:1 session tomorrow at 3pm", time: "2d ago", read: true },
    { id: 7, type: "event", title: "Product Strategy Workshop", description: "Starts next Tuesday at 2 PM EST. RSVP now!", time: "3d ago", read: true },
    { id: 8, type: "message", title: "Keisha Williams", description: "Sent you a referral link for the CGI opening", time: "4d ago", read: true, avatar: "https://i.pravatar.cc/150?u=keisha" },
    { id: 9, type: "community", title: "Welcome to Cohort Alpha!", description: "You've been added to the Alpha cohort channel", time: "5d ago", read: true },
    { id: 10, type: "achievement", title: "7-Day Streak 🔥", description: "You've been active 7 days in a row!", time: "1w ago", read: true },
];

const TYPE_ICON: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
    event: { icon: Calendar, color: "text-brand-600", bg: "bg-brand-100" },
    message: { icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-100" },
    achievement: { icon: Award, color: "text-amber-600", bg: "bg-amber-100" },
    community: { icon: Users, color: "text-emerald-600", bg: "bg-emerald-100" },
    system: { icon: AlertCircle, color: "text-stone-500", bg: "bg-stone-100" },
    reminder: { icon: Clock, color: "text-rose-500", bg: "bg-rose-100" },
};

type Filter = "all" | "unread" | NotificationType;

export default function MemberNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [filter, setFilter] = useState<Filter>("all");

    const unreadCount = notifications.filter(n => !n.read).length;

    const filtered = notifications.filter(n => {
        if (filter === "all") return true;
        if (filter === "unread") return !n.read;
        return n.type === filter;
    });

    const markRead = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const deleteNotif = (id: number) => setNotifications(prev => prev.filter(n => n.id !== id));
    const clearAll = () => setNotifications([]);

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

            {/* Notification List */}
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
                            {/* Icon or Avatar */}
                            {notif.avatar ? (
                                <AvatarInitials name="User" src={notif.avatar} size="md" />
                            ) : (
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                                    <Icon size={18} className={cfg.color} />
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className={`text-sm font-bold ${notif.read ? "text-stone-700" : "text-stone-900"}`}>{notif.title}</h3>
                                    {!notif.read && <span className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0" />}
                                </div>
                                <p className="text-sm text-stone-500 mt-0.5">{notif.description}</p>
                                <span className="text-[11px] text-stone-400 font-medium mt-1 block">{notif.time}</span>
                            </div>

                            {/* Delete */}
                            <button
                                onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }}
                                className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filtered.length === 0 && (
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
