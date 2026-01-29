import { redirect } from "next/navigation";

export default function MemberAlumniPage() {
    // Feature conditioned out - redirect to member dashboard
    redirect("/member");
}
