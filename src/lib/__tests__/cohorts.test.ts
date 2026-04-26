import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchCohortSessions, toggleCohortSessionRsvp } from "@/lib/cohorts";

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

describe("cohorts client smoke", () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it("loads sessions and toggles RSVP", async () => {
        fetchMock
            .mockResolvedValueOnce(jsonResponse({
                success: true,
                data: [{ id: "s1", title: "Live coding", scheduledAt: "2026-01-01T10:00:00.000Z", durationMinutes: 60, host: "Mentor", hasRsvp: false }],
            }))
            .mockResolvedValueOnce(jsonResponse({
                success: true,
                data: { rsvped: true },
            }));

        const sessions = await fetchCohortSessions("cohort-1", async () => "token");
        const rsvped = await toggleCohortSessionRsvp("cohort-1", "s1", async () => "token");

        expect(sessions).toHaveLength(1);
        expect(sessions[0]?.title).toBe("Live coding");
        expect(rsvped).toBe(true);
    });
});
