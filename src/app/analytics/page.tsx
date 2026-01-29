import { redirect } from "next/navigation";

export default function AnalyticsPage() {
    // Redirect to admin analytics page
    redirect("/admin/analytics");
}
