"use client";

import { useUser } from "@/context/UserContext";
import DMWidget from "./DMWidget";

export default function DMWidgetWrapper() {
    const { role } = useUser();

    // Show DM widget for members and mentors
    if (role !== 'member' && role !== 'mentor') {
        return null;
    }

    return <DMWidget userRole={role} />;
}
