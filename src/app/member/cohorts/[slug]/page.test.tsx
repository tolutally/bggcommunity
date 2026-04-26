import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

        vi.mocked(cohortsApi.resolveCohortIdFromSlug).mockResolvedValue({
            id: "cohort-1",
            slug: "cohort-alpha",
            name: "Cohort Alpha",
            description: "Alpha",
        });

        vi.mocked(cohortsApi.fetchCohortDetail).mockResolvedValue({
            id: "cohort-1",
            slug: "cohort-alpha",
            name: "Cohort Alpha",
            description: "Alpha",
        });

        vi.mocked(cohortsApi.fetchCohortMembers).mockResolvedValue([]);
        vi.mocked(cohortsApi.fetchCohortResources).mockResolvedValue([]);
        vi.mocked(cohortsApi.fetchCohortSessions)
            .mockResolvedValueOnce([
                {
                    id: "session-1",
                    title: "System Design",
                    scheduledAt: "2099-01-01T10:00:00.000Z",
                    durationMinutes: 60,
                    host: "Mentor",
                    meetingLink: "https://meet.example.com",
                    recordingUrl: null,
                    hasRsvp: false,
                },
            ])
            .mockResolvedValue([
                {
                    id: "session-1",
                    title: "System Design",
                    scheduledAt: "2099-01-01T10:00:00.000Z",
                    durationMinutes: 60,
                    host: "Mentor",
                    meetingLink: "https://meet.example.com",
                    recordingUrl: null,
                    hasRsvp: true,
                },
            ]);
    });

    it("loads and retries RSVP mutation", async () => {
        const user = userEvent.setup();

        vi.mocked(cohortsApi.toggleCohortSessionRsvp)
            .mockRejectedValueOnce(new Error("RSVP failed"))
            .mockResolvedValueOnce(true);

        render(<MemberCohortPage />);

        await screen.findByText("Cohort Alpha");
        await screen.findByText("System Design");

        await user.click(screen.getByRole("button", { name: /RSVP|Going/ }));
        await screen.findByRole("button", { name: "Retry" });

        await user.click(screen.getByRole("button", { name: "Retry" }));
        await screen.findByRole("button", { name: "Going" });

        expect(cohortsApi.toggleCohortSessionRsvp).toHaveBeenCalledTimes(2);
    });
});
