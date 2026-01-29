import { redirect } from "next/navigation";

export default function MembersPage() {
    // Redirect to admin members page
    redirect("/admin/members");
}
