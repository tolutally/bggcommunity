import { redirect } from "next/navigation";

export default function SettingsPage() {
    // Redirect to member settings page by default
    redirect("/member/settings");
}
