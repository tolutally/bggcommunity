import { redirect } from "next/navigation";

export default function MemberMentorsPage() {
    // Feature conditioned out - redirect to member dashboard
    redirect("/member");
}
