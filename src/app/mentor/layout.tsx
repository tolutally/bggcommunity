import { redirect } from "next/navigation";

export default function MentorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Mentor module is disabled - redirect to member dashboard
    redirect("/member");
}
