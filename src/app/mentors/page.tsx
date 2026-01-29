import { redirect } from "next/navigation";

export default function MentorsPage() {
    // Redirect to member mentors page by default
    redirect("/member/mentors");
}
