import { redirect } from "next/navigation";

export default function SessionsPage() {
    // Redirect to member schedule page by default
    redirect("/member/schedule");
}
