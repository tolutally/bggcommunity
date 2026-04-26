import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

const toastMock = vi.fn();

vi.mock("@clerk/nextjs", () => ({
    useAuth: () => ({
        getToken: vi.fn().mockResolvedValue("token"),
    }),
}));

vi.mock("@/components/ui/toast", () => ({
    useToast: () => ({ toast: toastMock }),
}));

vi.mock("@/lib/community", async () => {
    const actual = await vi.importActual<typeof import("@/lib/community")>("@/lib/community");
    return {
        ...actual,
        fetchCommunityGroups: vi.fn(),
        fetchCommunityGroupDetail: vi.fn(),
        fetchCommunityPosts: vi.fn(),
        createCommunityPost: vi.fn(),
        addCommunityComment: vi.fn(),
        joinCommunityGroup: vi.fn(),
        leaveCommunityGroup: vi.fn(),
    };
});

import MemberCommunityPage from "@/app/member/community/page";
import * as communityApi from "@/lib/community";

describe("member community page smoke", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(communityApi.fetchCommunityGroups).mockResolvedValue([
            {
                id: "g1",
                name: "Backend Guild",
                description: "API focused",
                memberCount: 5,
                newPostCount: 1,
                isJoined: true,
                channels: [{ id: "c1", name: "general" }],
            },
        ]);

        vi.mocked(communityApi.fetchCommunityGroupDetail).mockResolvedValue({
            id: "g1",
            name: "Backend Guild",
            description: "API focused",
            memberCount: 5,
            newPostCount: 1,
            isJoined: true,
            channels: [{ id: "c1", name: "general" }],
        });

        vi.mocked(communityApi.fetchCommunityPosts).mockImplementation(async () => ({
            items: [
                {
                    id: "post-1",
                    title: "Intro",
                    content: "Welcome everyone",
                    createdAt: new Date().toISOString(),
                    authorName: "Admin",
                    comments: [],
                },
            ],
            nextCursor: null,
        }));
    });

    it("loads, comments, and retries failed post creation", async () => {
        const user = userEvent.setup();

        vi.mocked(communityApi.addCommunityComment).mockResolvedValue({
            id: "comment-1",
            content: "Looks good",
            createdAt: new Date().toISOString(),
            authorName: "You",
        });

        vi.mocked(communityApi.createCommunityPost)
            .mockRejectedValueOnce(new Error("Unable to post"))
            .mockResolvedValueOnce({
                id: "post-2",
                title: "Question",
                content: "How does RSVP sync?",
                createdAt: new Date().toISOString(),
                authorName: "You",
                comments: [],
            });

        render(<MemberCommunityPage />);

        await screen.findByText("Backend Guild");
        await screen.findByText("Welcome everyone");

        await user.type(screen.getByPlaceholderText("Write a reply..."), "Looks good");
        await user.click(screen.getByRole("button", { name: "Reply" }));
        await waitFor(() => {
            expect(communityApi.addCommunityComment).toHaveBeenCalledTimes(1);
        });

        await user.type(screen.getByPlaceholderText("Optional title"), "Question");
        await user.type(screen.getByPlaceholderText("Share an update with your group..."), "How does RSVP sync?");
        await user.click(screen.getByRole("button", { name: "Post" }));

        await screen.findByRole("button", { name: "Retry" });
        await user.click(screen.getByRole("button", { name: "Retry" }));

        await waitFor(() => {
            expect(communityApi.createCommunityPost).toHaveBeenCalledTimes(2);
        });
    });
});
