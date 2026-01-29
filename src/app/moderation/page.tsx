import { redirect } from "next/navigation";

export default function ModerationPage() {
    // Redirect to admin moderation page
    redirect("/admin/moderation");
}
