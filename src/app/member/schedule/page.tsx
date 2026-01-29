import { redirect } from "next/navigation";

export default function MemberSchedulePage() {
    // Schedule functionality has been moved to the member dashboard
    redirect("/member");
}
