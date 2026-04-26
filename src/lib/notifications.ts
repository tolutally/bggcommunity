import type { TokenProvider } from "@/lib/api";
import { fetchEvents, type EventRecord } from "@/lib/events";
import { fetchCommunityGroups, fetchCommunityGroupDetail, fetchCommunityPosts } from "@/lib/community";

export type NotificationType = "event" | "community" | "system" | "reminder";

export interface NotificationRecord {
    id: string;
    type: NotificationType;
    title: string;
    description: string;
    createdAt: string;
    avatarUrl?: string;
}

export interface NotificationState {
    readIds: string[];
    dismissedIds: string[];
}

const EMPTY_STATE: NotificationState = {
    readIds: [],
    dismissedIds: [],
};

function notificationStateKey(userId: string | null) {
    return `bgg-notifications-state:${userId ?? "anonymous"}`;
}

export function loadNotificationState(userId: string | null): NotificationState {
    if (typeof window === "undefined") return EMPTY_STATE;

    try {
        const raw = window.localStorage.getItem(notificationStateKey(userId));
        if (!raw) return EMPTY_STATE;

        const parsed = JSON.parse(raw) as Partial<NotificationState>;
        const readIds = Array.isArray(parsed.readIds) ? parsed.readIds : [];
        const dismissedIds = Array.isArray(parsed.dismissedIds) ? parsed.dismissedIds : [];
        return { readIds, dismissedIds };
    } catch {
        return EMPTY_STATE;
    }
}

export function saveNotificationState(userId: string | null, state: NotificationState) {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
        notificationStateKey(userId),
        JSON.stringify({
            readIds: Array.from(new Set(state.readIds)),
            dismissedIds: Array.from(new Set(state.dismissedIds)),
        }),
    );
}

function hoursUntil(value: string) {
    return (new Date(value).getTime() - Date.now()) / (1000 * 60 * 60);
}

function buildEventNotifications(events: EventRecord[]): NotificationRecord[] {
    const output: NotificationRecord[] = [];

    events.forEach((event) => {
        const deltaHours = hoursUntil(event.scheduledAt);

        if (deltaHours >= 0 && deltaHours <= 48) {
            output.push({
                id: `event-reminder-${event.id}`,
                type: "reminder",
                title: `Upcoming: ${event.title}`,
                description: `${new Date(event.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} • Host: ${event.host}`,
                createdAt: event.scheduledAt,
            });
        }

        if (event.recordingUrl) {
            output.push({
                id: `event-recording-${event.id}`,
                type: "event",
                title: `Recording available: ${event.title}`,
                description: "A session recording is now available to watch.",
                createdAt: event.createdAt ?? event.scheduledAt,
            });
        }
    });

    return output;
}

export async function fetchNotificationsFeed(getToken: TokenProvider) {
    const [upcomingEvents, pastEvents, groups] = await Promise.all([
        fetchEvents({ status: "upcoming", limit: 20 }, getToken),
        fetchEvents({ status: "past", limit: 20 }, getToken),
        fetchCommunityGroups(),
    ]);

    const joinedGroups = groups.filter((group) => group.isJoined);
    const groupDetails = await Promise.all(joinedGroups.map((group) => fetchCommunityGroupDetail(group.id).catch(() => group)));

    const communityNotifications: NotificationRecord[] = [];

    await Promise.all(groupDetails.map(async (group) => {
        const channels = group.channels ?? [];

        await Promise.all(channels.slice(0, 2).map(async (channel) => {
            try {
                const postsPage = await fetchCommunityPosts({
                    groupId: group.id,
                    channelId: channel.id,
                    limit: 5,
                }, getToken);

                postsPage.items.forEach((post) => {
                    communityNotifications.push({
                        id: `community-post-${post.id}`,
                        type: "community",
                        title: post.title || `New post in ${group.name}`,
                        description: `${post.authorName}: ${post.content.slice(0, 120)}`,
                        createdAt: post.createdAt,
                    });
                });
            } catch {
                // Ignore individual channel failures.
            }
        }));
    }));

    const eventNotifications = buildEventNotifications([...upcomingEvents.items, ...pastEvents.items]);

    const merged = [...eventNotifications, ...communityNotifications]
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
        .slice(0, 100);

    if (merged.length === 0) {
        return [{
            id: "system-empty-notifications",
            type: "system" as const,
            title: "No new updates yet",
            description: "We will notify you when new sessions and community activity happen.",
            createdAt: new Date().toISOString(),
        }];
    }

    return merged;
}
