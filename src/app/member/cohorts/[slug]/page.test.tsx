import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, it, vi } from "vitest";

const toastMock = vi.fn();

vi.mock("@clerk/nextjs", () => ({
    useAuth: () => ({
        getToken: vi.fn().mockResolvedValue("token"),
    }),
}));

vi.mock("next/navigation", () => ({
    useParams: () => ({ slug: "cohort-alpha" }),
}));

vi.mock("@/components/ui/toast", () => ({
    useToast: () => ({ toast: toastMock }),
}));

vi.mock("@/lib/cohorts", async () => {
    const actual = await vi.importActual<typeof import("@/lib/cohorts")>("@/lib/cohorts");
    return {
        ...actual,
        resolveCohortIdFromSlug: vi.fn(),
        fetchCohortDetail: vi.fn(),
        fetchCohortMembers: vi.fn(),
        fetchCohortSessions: vi.fn(),
        fetchCohortResources: vi.fn(),
        toggleCohortSessionRsvp: vi.fn(),
    };
});

import MemberCohortPage from "@/app/member/cohorts/[slug]/page";
import * as cohortsApi from "@/lib/cohorts";

describe("member cohort page smoke", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        const mockCohort = {
            id: "cohort-1",
            slug: "cohort-alpha",
            name: "Cohort Alpha",
            description: "Alpha",
            status: null,
            track: null,
            phase: null,
            health: null,
            activeRate: null,
            memberCount: null,
            maxMembers: null,
            startDate: null,
            endDate: null,
            communityGroupId: null,
        } as const;

        vi.mocked(cohortsApi.resolveCohortIdFromSlug).mockResolvedValue(mockCohort);
        vi.mocked(cohortsApi.fetchCohortDetail).mockResolvedValue(mockCohort);

        vi.mocked(cohortsApi.fetchCohortMembers).mockResolvedValue([]);
        vi.mocked(cohortsApi.fetchCohortResources).mockResolvedValue([]);
        vi.mocked(cohortsApi.fetchCohortSessions)
            .mockResolvedValueOnce([
                {
                    id: "session-1",
                    title: "System Design",
                    description: null,
                    scheduledAt: "2099-01-01T10:00:00.000Z",
                    durationMinutes: 60,
                    host: "Mentor",
                    meetingPlatform: null,
                    meetingLink: "https://meet.example.com",
                    recordingUrl: null,
                    hasRsvp: false,
                    attendeeCount: 0,
                },
            ])
            .mockResolvedValue([
                {
                    id: "session-1",
                    title: "System Design",
                    description: null,
                    scheduledAt: "2099-01-01T10:00:00.000Z",
                    durationMinutes: 60,
                    host: "Mentor",
                    meetingPlatform: null,
                    meetingLink: "https://meet.example.com",
                    recordingUrl: null,
                    hasRsvp: true,
                    attendeeCount: 1,
                },
            ]);
    });

    it("loads sessions and opens detail modal on click", async () => {
        const user = userEvent.setup();

        render(<MemberCohortPage />);

        await screen.findByText("Cohort Alpha");
        await screen.findByText("System Design");

        // Click the session card to open the detail modal
        await user.click(screen.getAllByRole("button").find((b) => b.textContent?.includes("System Design")) ?? screen.getByText("System Design"));

        // Detail modal should appear
        await screen.findByText("Session Details");
    });
});
