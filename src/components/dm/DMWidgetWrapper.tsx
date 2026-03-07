"use client";

import { useUser } from "@/context/UserContext";
import DMWidget from "./DMWidget";

export default function DMWidgetWrapper() {
    const { role } = useUser();

    // Show DM widget for members only (mentor module disabled)
    if (role !== 'member') {
        return null;
    }

    return <DMWidget userRole={role} />;
}
