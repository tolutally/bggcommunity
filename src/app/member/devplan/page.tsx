"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    Target, CheckCircle, Circle, Clock, ArrowLeft, Loader2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useToast } from "@/components/ui/toast";
import { useDeveloperPlan, useToggleMilestone } from "@/hooks/use-developer-plan";
import type { Milestone } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type FilterTab = "all" | "completed" | "incomplete";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG = {
    completed: {
        label: "Completed",
        icon: CheckCircle,
        badge: "bg-green-50 text-green-700 border-green-200",
        ring: "border-green-300",
    },
    incomplete: {
        label: "To Do",
        icon: Circle,
        badge: "bg-stone-100 text-stone-600 border-stone-200",
        ring: "border-stone-200",
    },
} as const;

/* ------------------------------------------------------------------ */
/*  MilestoneRow                                                        */
/* ------------------------------------------------------------------ */

function MilestoneRow({ milestone, onToggle, toggling }: {
    milestone: Milestone;
    onToggle: () => void;
    toggling: boolean;
}) {
    const cfg = milestone.completed ? STATUS_CONFIG.completed : STATUS_CONFIG.incomplete;
    const Icon = cfg.icon;

    return (
        <div className={`bg-white rounded-2xl border p-5 flex items-start gap-4 transition-all ${cfg.ring} hover:shadow-sm`}>
            <button
                onClick={onToggle}
                disabled={toggling}
                title={milestone.completed ? "Mark incomplete" : "Mark complete"}
                className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${milestone.completed ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-stone-100 text-stone-400 hover:bg-stone-200"} disabled:opacity-50`}
            >
                {toggling ? <Loader2 size={14} className="animate-spin" /> : <Icon size={16} />}
            </button>

            <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${milestone.completed ? "line-through text-stone-400" : "text-stone-900"}`}>
                    {milestone.title}
                </p>
                {milestone.completedAt ? (
                    <p className="text-xs text-stone-400 mt-1">
                        Completed {new Date(milestone.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                ) : null}
            </div>

            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${cfg.badge}`}>
                {cfg.label}
            </span>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Toggling wrapper — hook per milestone ID                           */
/* ------------------------------------------------------------------ */

function MilestoneToggle({ milestone, onDone }: { milestone: Milestone; onDone: () => void }) {
    const { trigger, isLoading } = useToggleMilestone(milestone.id);
    const { toast } = useToast();

    const handleToggle = async () => {
        try {
            await trigger();
            onDone();
        } catch {
            toast("Unable to update milestone", "error");
        }
    };

    return (
        <MilestoneRow
            milestone={milestone}
            onToggle={() => void handleToggle()}
            toggling={isLoading}
        />
    );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function MemberDevPlanPage() {
    const [filter, setFilter] = useState<FilterTab>("all");
    const { milestones, progress, isLoading, error, mutate } = useDeveloperPlan();

    const completedCount = useMemo(() => milestones.filter((m) => m.completed).length, [milestones]);
    const incompleteCount = milestones.length - completedCount;
    const allDone = milestones.length > 0 && completedCount === milestones.length;

    const counts: Record<FilterTab, number> = {
        all: milestones.length,
        completed: completedCount,
        incomplete: incompleteCount,
    };

    const filtered = useMemo(() => {
        if (filter === "completed") return milestones.filter((m) => m.completed);
        if (filter === "incomplete") return milestones.filter((m) => !m.completed);
        return [...milestones].sort((a, b) => a.order - b.order);
    }, [milestones, filter]);

    const tabs: Array<{ key: FilterTab; label: string }> = [
        { key: "all", label: "All" },
        { key: "incomplete", label: "To Do" },
        { key: "completed", label: "Completed" },
    ];

    return (
        <ErrorBoundary>
            <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/member/profile" className="p-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-400 hover:text-stone-600">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-accent-100 text-accent-600 rounded-2xl">
                                <Target size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Development Plan</h1>
                                <p className="text-sm text-stone-500">Track your career milestones</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Card */}
                {!isLoading && milestones.length > 0 ? (
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-100 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                <p className="text-sm font-bold text-stone-400 uppercase tracking-wider">Overall Progress</p>
                                <p className="text-3xl font-bold text-stone-900 mt-1">{progress}%</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="px-4 py-2 rounded-xl border bg-stone-100 text-stone-600 border-stone-200 text-center">
                                    <p className="text-lg font-bold">{incompleteCount}</p>
                                    <p className="text-xs font-medium">To Do</p>
                                </div>
                                <div className="px-4 py-2 rounded-xl border bg-green-50 text-green-700 border-green-200 text-center">
                                    <p className="text-lg font-bold">{completedCount}</p>
                                    <p className="text-xs font-medium">Completed</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full h-4 bg-stone-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-accent-500 to-brand-600 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                ) : null}

                {/* All Done Banner */}
                {allDone ? (
                    <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border border-green-200 rounded-3xl p-6 md:p-8 flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={28} className="text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-stone-900">All milestones completed! &#x1F389;</h3>
                            <p className="text-sm text-stone-500 mt-1">Amazing work &mdash; you&apos;ve hit every milestone in your plan.</p>
                        </div>
                    </div>
                ) : null}

                {/* Filter Tabs */}
                {milestones.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                        {tabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setFilter(t.key)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === t.key ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-brand-200 hover:text-brand-700"}`}
                            >
                                {t.label} <span className="ml-1 opacity-70">({counts[t.key]})</span>
                            </button>
                        ))}
                    </div>
                ) : null}

                {/* Content */}
                {isLoading ? (
                    <div className="flex items-center gap-2 text-stone-500 py-8">
                        <Loader2 size={18} className="animate-spin" /> Loading your plan&hellip;
                    </div>
                ) : error ? (
                    <EmptyState
                        icon={Target}
                        heading="Plan unavailable"
                        description="We could not load your development plan. Please try refreshing."
                        action={{ label: "Retry", onClick: () => void mutate() }}
                        variant="plain"
                        className="bg-white rounded-3xl p-12 border border-stone-100"
                    />
                ) : milestones.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 border border-stone-100 text-center space-y-4">
                        <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto">
                            <Target size={28} className="text-accent-500" />
                        </div>
                        <h3 className="text-lg font-bold text-stone-900">No dev plan yet</h3>
                        <p className="text-sm text-stone-500 max-w-xs mx-auto">Set your first goal and milestones to start tracking your progress.</p>
                        <Link
                            href="/onboarding?devplan=1"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors"
                        >
                            <Target size={16} /> Set Up Dev Plan
                        </Link>
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={Target}
                        heading="No milestones in this category"
                        variant="plain"
                        className="bg-white rounded-3xl p-12 border border-stone-100"
                    />
                ) : (
                    <div className="space-y-3">
                        {filtered.map((milestone) => (
                            <MilestoneToggle
                                key={milestone.id}
                                milestone={milestone}
                                onDone={() => void mutate()}
                            />
                        ))}
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
}
