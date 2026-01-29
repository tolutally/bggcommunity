import { redirect } from "next/navigation";

export default function ResourcesPage() {
    // Redirect to member resources page by default
    redirect("/member/resources");
}
