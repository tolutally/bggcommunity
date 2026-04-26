import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    addCommunityComment,
    createCommunityPost,
    fetchCommunityGroups,
    fetchCommunityPosts,
} from "@/lib/community";

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

describe("community client smoke", () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it("loads groups and posts", async () => {
        fetchMock
            .mockResolvedValueOnce(jsonResponse({
                success: true,
                data: [{ id: "g1", name: "Backend", memberCount: 4, newPostCount: 1, isJoined: true, channels: [{ id: "c1", name: "general" }] }],
            }))
            .mockResolvedValueOnce(jsonResponse({
                success: true,
                data: [{ id: "p1", content: "hello", author: { email: "dev@example.com" }, comments: [] }],
                nextCursor: null,
            }));

        const groups = await fetchCommunityGroups();
        const posts = await fetchCommunityPosts({ groupId: "g1", channelId: "c1", limit: 20 }, async () => "token");

        expect(groups).toHaveLength(1);
        expect(groups[0]?.name).toBe("Backend");
        expect(posts.items).toHaveLength(1);
        expect(posts.nextCursor).toBeNull();
    });

    it("creates a post and comment", async () => {
        fetchMock
            .mockResolvedValueOnce(jsonResponse({
                success: true,
                data: { id: "p-new", title: "Question", content: "How do I deploy?", author: { email: "me@example.com" }, comments: [] },
            }))
            .mockResolvedValueOnce(jsonResponse({
                success: true,
                data: { id: "cm1", content: "Use CI", author: { email: "mentor@example.com" } },
            }));

        const post = await createCommunityPost("g1", "c1", "How do I deploy?", async () => "token", "Question");
        const comment = await addCommunityComment("p-new", "Use CI", async () => "token");

        expect(post.id).toBe("p-new");
        expect(comment.id).toBe("cm1");
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});
