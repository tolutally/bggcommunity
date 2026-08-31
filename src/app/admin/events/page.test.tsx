import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EventFormModal } from "./page";

describe("EventFormModal", () => {
    it("submits a five-hour in-person event with venue and registration link", async () => {
        const user = userEvent.setup();
        const onSave = vi.fn().mockResolvedValue(undefined);

        render(
            <EventFormModal
                onClose={vi.fn()}
                onSave={onSave}
                saving={false}
            />,
        );

        await user.type(screen.getByPlaceholderText("e.g. Portfolio Review Session"), "BGG Workshop");
        await user.type(screen.getByLabelText("Event date"), "2099-01-15");
        await user.type(screen.getByLabelText("Event time"), "10:30");

        const duration = screen.getByLabelText("Event duration in minutes");
        await user.clear(duration);
        await user.type(duration, "300");

        await user.type(screen.getByPlaceholderText("e.g. Sarah Jenkins"), "BGG Team");
        await user.click(screen.getByRole("button", { name: "In Person" }));
        await user.type(
            screen.getByPlaceholderText("e.g. 123 Main St, Suite 400, Atlanta, GA"),
            "123 Main St, Atlanta, GA",
        );
        await user.type(screen.getByPlaceholderText("https://forms.gle/..."), "https://example.com/register");
        await user.click(screen.getByRole("button", { name: "Create Event" }));

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
                durationMinutes: 300,
                locationType: "in_person",
                venueAddress: "123 Main St, Atlanta, GA",
                linkType: "registration",
                meetingLink: "https://example.com/register",
            }));
        });
    });
});
