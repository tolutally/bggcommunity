"use client";

import Link from "next/link";
import { GraduationCap, Calendar, Users, ArrowRight, Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { useMyCohorts, fmtCohortDate, cohortStatusLabel } from "@/hooks/use-cohorts";

export default function MemberCohortsPage() {
    const { cohorts, isLoading } = useMyCohorts();

    return (
        <ErrorBoundary>
            <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">My Cohorts</h1>
                    <p className="text-stone-500 mt-1">Your learning cohorts and programs.</p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16 gap-2 text-stone-400">
                        <Loader2 size={20} className="animate-spin" /> Loading cohorts...
                    </div>
                ) : cohorts.length === 0 ? (
                    <EmptyState
                        icon={GraduationCap}
                        heading="No cohorts yet"
                        description="You haven't been added to any cohorts. An admin will enroll you when one is ready."
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cohorts.map((cohort) => (
                            <Link
                                key={cohort.id}
                                href={`/member/cohorts/${cohort.id}`}
                                className="group bg-white rounded-2xl border border-stone-200 p-5 hover:border-brand-300 hover:shadow-md transition-all flex flex-col gap-4"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="p-2.5 bg-brand-50 text-brand-700 rounded-xl flex-shrink-0">
                                        <GraduationCap size={20} />
                                    </div>
                                    <StatusBadge
                                        label={cohortStatusLabel(cohort.status)}
                                        preset={cohortStatusLabel(cohort.status) as never}
                                        variant="tag"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h2 className="font-bold text-stone-900 text-base leading-snug group-hover:text-brand-700 transition-colors">
                                        {cohort.name}
                                    </h2>
                                    {cohort.description && (
                                        <p className="text-sm text-stone-500 mt-1 line-clamp-2">{cohort.description}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5 text-xs text-stone-500">
                                    <div className="flex items-center gap-1.5">
                                        <Users size={12} className="text-stone-400" />
                                        {cohort._count.members} member{cohort._count.members !== 1 ? "s" : ""}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={12} className="text-stone-400" />
                                        {fmtCohortDate(cohort.startDate)} — {fmtCohortDate(cohort.endDate)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-xs font-semibold text-brand-700 group-hover:gap-2 transition-all">
                                    Open cohort <ArrowRight size={13} />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
}
