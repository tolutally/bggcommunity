import { redirect } from "next/navigation";

export default function MemberResourcesPage() {
    // Feature conditioned out - redirect to member dashboard
    redirect("/member");
}
