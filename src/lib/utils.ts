import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Extract a YouTube video ID from various URL formats.
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/
 * Returns null if the URL is not a recognized YouTube URL.
 */
export function extractYouTubeId(url: string): string | null {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match?.[1]) return match[1];
    }
    return null;
}

/**
 * Get a YouTube thumbnail URL from a video URL.
 * Returns the medium quality thumbnail (320x180) by default.
 * Quality options: "default" (120x90), "mqdefault" (320x180), "hqdefault" (480x360), "maxresdefault" (1280x720)
 */
export function getYouTubeThumbnail(
    url: string,
    quality: "default" | "mqdefault" | "hqdefault" | "maxresdefault" = "mqdefault",
): string | null {
    const id = extractYouTubeId(url);
    if (!id) return null;
    return `https://img.youtube.com/vi/${id}/${quality}.jpg`;
}
