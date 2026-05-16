import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Comment, CommunityGroup, CommunityGroupDetail, Post } from "@/lib/types";

const toastMock = vi.fn();
const mutatePostsMock = vi.fn();
const createCommentTriggerMock = vi.fn();
const createPostTriggerMock = vi.fn();
const joinGroupTriggerMock = vi.fn();
const leaveGroupTriggerMock = vi.fn();

vi.mock("@clerk/nextjs", () => ({
    useAuth: () => ({
        getToken: vi.fn().mockResolvedValue("token"),
    }),
}));

vi.mock("@/components/ui/toast", () => ({
    useToast: () => ({ toast: toastMock }),
}));

vi.mock("@/hooks/use-community", async () => {
    const actual = await vi.importActual<typeof import("@/hooks/use-community")>("@/hooks/use-community");
    return {
        ...actual,
        useCommunityGroups: vi.fn(),
        useCommunityGroup: vi.fn(),
        useChannelPosts: vi.fn(),
        useCreatePost: vi.fn(),
        useCreateComment: vi.fn(),
        useJoinGroup: vi.fn(),
        useLeaveGroup: vi.fn(),
        fmtPostDate: vi.fn(() => "Just now"),
    };
});

import MemberCommunityPage from "@/app/member/community/page";
import * as communityHooks from "@/hooks/use-community";

const group: CommunityGroup = {
    id: "g1",
    name: "Backend Guild",
    description: "API focused",
    memberCount: 5,
    newPostCount: 1,
    isJoined: true,
    createdAt: "2026-05-01T00:00:00.000Z",
};

const groupDetail: CommunityGroupDetail = {
    ...group,
    isMember: true,
    channels: [{ id: "c1", name: "general", description: null }],
};

const post: Post = {
    id: "post-1",
    title: "Intro",
    body: "Welcome everyone",
    isDeleted: false,
    createdAt: "2026-05-01T00:00:00.000Z",
    author: {
        id: "user-1",
        profile: { firstName: "Admin", lastName: "User", avatarUrl: null },
    },
    _count: { comments: 0 },
};

const comment: Comment = {
    id: "comment-1",
    body: "Looks good",
    isDeleted: false,
    createdAt: "2026-05-01T00:00:00.000Z",
    author: {
        id: "user-2",
        profile: { firstName: "You", lastName: "Member", avatarUrl: null },
    },
};

describe("member community page smoke", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mutatePostsMock.mockReset();
        createCommentTriggerMock.mockReset();
        createPostTriggerMock.mockReset();
        joinGroupTriggerMock.mockReset();
        leaveGroupTriggerMock.mockReset();

        vi.mocked(communityHooks.useCommunityGroups).mockReturnValue({
            groups: [group],
            isLoading: false,
            error: null,
            mutate: vi.fn(),
        });

        vi.mocked(communityHooks.useCommunityGroup).mockReturnValue({
            group: groupDetail,
            isLoading: false,
            error: null,
            mutate: vi.fn(),
        });

        vi.mocked(communityHooks.useChannelPosts).mockReturnValue({
            posts: [post],
            nextCursor: null,
            isLoading: false,
            error: null,
            mutate: mutatePostsMock,
        });

        vi.mocked(communityHooks.useCreatePost).mockReturnValue({
            data: null,
            error: null,
            isLoading: false,
            trigger: createPostTriggerMock,
            reset: vi.fn(),
        });

        vi.mocked(communityHooks.useCreateComment).mockReturnValue({
            data: null,
            error: null,
            isLoading: false,
            trigger: createCommentTriggerMock,
            reset: vi.fn(),
        });

        vi.mocked(communityHooks.useJoinGroup).mockReturnValue({
            data: null,
            error: null,
            isLoading: false,
            trigger: joinGroupTriggerMock,
            reset: vi.fn(),
        });

        vi.mocked(communityHooks.useLeaveGroup).mockReturnValue({
            data: null,
            error: null,
            isLoading: false,
            trigger: leaveGroupTriggerMock,
            reset: vi.fn(),
        });
    });

    it("loads, comments, and handles failed then successful post creation", async () => {
        const user = userEvent.setup();

        createCommentTriggerMock.mockResolvedValue({ data: comment });

        createPostTriggerMock
            .mockRejectedValueOnce(new Error("Unable to post"))
            .mockResolvedValueOnce({
                data: {
                    ...post,
                    id: "post-2",
                    title: "Question",
                    body: "How does RSVP sync?",
                },
            });

        render(<MemberCommunityPage />);

        await screen.findByText("Welcome everyone");

        await user.click(screen.getByRole("button", { name: /My Groups/i }));
        await screen.findAllByText("Backend Guild");

        const replyInput = await screen.findByPlaceholderText("Write a reply...");
        await user.type(replyInput, "Looks good");
        await user.click(screen.getByRole("button", { name: "Reply" }));
        await waitFor(() => {
            expect(createCommentTriggerMock).toHaveBeenCalledWith({ body: "Looks good" });
        });
        await screen.findByText("Looks good");

        await user.type(screen.getByPlaceholderText("Title (optional)"), "Question");
        await user.type(screen.getByPlaceholderText("Share something with the group..."), "How does RSVP sync?");
        await user.click(screen.getByRole("button", { name: "Post" }));
        await waitFor(() => {
            expect(createPostTriggerMock).toHaveBeenCalledTimes(1);
        });
        expect(toastMock).toHaveBeenCalledWith("Could not publish post", "error");

        await user.click(screen.getByRole("button", { name: "Post" }));

        await waitFor(() => {
            expect(createPostTriggerMock).toHaveBeenCalledTimes(2);
        });
        expect(mutatePostsMock).toHaveBeenCalledTimes(1);
        expect(toastMock).toHaveBeenCalledWith("Post published");
    });
});
