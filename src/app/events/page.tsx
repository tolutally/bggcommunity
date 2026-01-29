import { redirect } from "next/navigation";

export default function EventsPage() {
    // Redirect to admin events page
    redirect("/admin/events");
}
