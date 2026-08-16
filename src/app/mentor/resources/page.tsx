"use client";

import { FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function MentorResourcesPage() {
    return (
        <ErrorBoundary>
            <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">My Toolkit</h1>
                    <p className="text-stone-500 mt-1">Resources you share with your mentees will appear here.</p>
                </div>
                <div className="bg-white rounded-2xl border border-stone-200 p-6">
                    <EmptyState
                        icon={FileText}
                        heading="No resources yet"
                        description="Mentor toolkit resources are not available from the API yet."
                        variant="plain"
                    />
                </div>
            </div>
        </ErrorBoundary>
    );
}
