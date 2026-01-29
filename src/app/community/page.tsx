import { redirect } from "next/navigation";

export default function CommunityPage() {
    // Redirect to member community page by default
    redirect("/member/community");
}
