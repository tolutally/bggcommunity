import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to member module by default
  // In production, this would check auth status and redirect to appropriate module
  redirect("/member");
}
