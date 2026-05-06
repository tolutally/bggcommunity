"use client";

import { useUser } from "@/context/UserContext";
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    BookOpen,
    Briefcase,
    Calendar,
    CheckCircle,
    Clock,
    ExternalLink,
    Loader2,
    MapPin,
    MessageSquare,
    Users,
    Video,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useEvents, eventTypeLabel, fmtDuration } from "@/hooks/use-events";
import { useJobs, fmtJobDate, useRequestReferral } from "@/hooks/use-jobs";

interface DevGoalSnapshot {
    done?: boolean;
    status?: "not-started" | "in-progress" | "completed";
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function MemberDashboard() {
    const { user } = useUser();
    const [scheduleView, setScheduleView] = useState<'upcoming' | 'past'>('upcoming');
    const [devPlanMeta, setDevPlanMeta] = useState({ total: 0, completed: 0 });

    const { events, isLoading: isLoadingSchedule, error: scheduleErrorRaw } = useEvents();
    const { jobs, isLoading: isLoadingJobs, error: jobsErrorRaw } = useJobs();

    const scheduleError = scheduleErrorRaw instanceof Error ? scheduleErrorRaw.message : scheduleErrorRaw ? "Could not load schedule." : null;
    const jobsError = jobsErrorRaw instanceof Error ? jobsErrorRaw.message : jobsErrorRaw ? "Could not load jobs." : null;

    const now = useMemo(() => new Date(), []);
    const upcomingSessions = useMemo(() =>
        events.filter(e => new Date(e.scheduledAt) > now).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()).slice(0, 4)
    , [events, now]);
    const pastRecordings = useMemo(() =>
        events.filter(e => e.recordingUrl && new Date(e.scheduledAt) <= now).slice(0, 3)
    , [events, now]);
    const featuredJobs = useMemo(() => jobs.filter(j => j.isFeatured), [jobs]);

    useEffect(() => {
        const loadDevPlanMeta = () => {
            try {
                const raw = localStorage.getItem("bgg-goals");
                if (!raw) {
                    setDevPlanMeta({ total: 0, completed: 0 });
                    return;
                }

                const goals = JSON.parse(raw) as DevGoalSnapshot[];
                if (!Array.isArray(goals) || goals.length === 0) {
                    setDevPlanMeta({ total: 0, completed: 0 });
                    return;
                }

                const completed = goals.filter((goal) => goal.done || goal.status === "completed").length;
                setDevPlanMeta({ total: goals.length, completed });
            } catch {
                setDevPlanMeta({ total: 0, completed: 0 });
            }
        };

        loadDevPlanMeta();
        window.addEventListener("storage", loadDevPlanMeta);

        return () => {
            window.removeEventListener("storage", loadDevPlanMeta);
        };
    }, []);

    const showDevPlanReminder = devPlanMeta.total === 0 || devPlanMeta.completed < devPlanMeta.total;

    const todayLabel = useMemo(() => {
        const ref = now;
        const today = ref.toDateString();
        const tomorrow = new Date(ref.getTime() + 24 * 60 * 60 * 1000).toDateString();

        return (dateString: string) => {
            const value = new Date(dateString).toDateString();
            if (value === today) {
                return "TODAY";
            }
            if (value === tomorrow) {
                return "TOMORROW";
            }
            return new Date(dateString).toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
        };
    }, [now]);

    const formatSessionTime = (value: string, durationMinutes: number) => {
        const start = new Date(value);
        const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
        return `${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} - ${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    };



    const getTypeColor = (type: string) => {
        switch (type) {
            case "Workshop": return "bg-brand-100 text-brand-700 border-brand-200";
            case "Q&A": return "bg-blue-100 text-blue-700 border-blue-200";
            case "Interactive": return "bg-amber-100 text-amber-700 border-amber-200";
            case "Speaker Series": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            default: return "bg-stone-100 text-stone-700 border-stone-200";
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto"
        >
            {/* Welcome Section */}
            <motion.div variants={item}>
                <h1 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">
                    Welcome back, {user.name.split(' ')[0]}
                </h1>
                <p className="text-lg text-stone-500 mt-2">
                    Here&apos;s what&apos;s happening in your cohort today.
                </p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={item} className="flex flex-wrap gap-3">
                <Link href="/member/schedule" className="flex items-center gap-2 px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm shadow-sm">
                    <Calendar size={16} /> Join Next Event
                </Link>
                <Link href="/member/resources" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-200 text-stone-700 font-bold rounded-xl hover:border-brand-300 hover:text-brand-700 transition-colors text-sm">
                    <BookOpen size={16} /> View Resources
                </Link>
                <Link href="/member/jobs" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-200 text-stone-700 font-bold rounded-xl hover:border-brand-300 hover:text-brand-700 transition-colors text-sm">
                    <Briefcase size={16} /> Browse Jobs
                </Link>
                <Link href="/member/community" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-200 text-stone-700 font-bold rounded-xl hover:border-brand-300 hover:text-brand-700 transition-colors text-sm">
                    <MessageSquare size={16} /> Community
                </Link>
            </motion.div>

            {showDevPlanReminder ? (
                <motion.div variants={item} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 md:p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 rounded-lg bg-amber-100 p-2 text-amber-700">
                                <AlertTriangle size={16} />
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-amber-900">Complete your dev plan to unlock a clearer weekly focus.</p>
                                <p className="mt-1 text-sm text-amber-800">
                                    {devPlanMeta.total === 0
                                        ? "You skipped setup during onboarding. Add your first milestones now."
                                        : `${devPlanMeta.completed}/${devPlanMeta.total} milestones completed. Keep going until all are done.`}
                                </p>
                            </div>
                        </div>
                        <Link
                            href={devPlanMeta.total === 0 ? "/onboarding?devplan=1" : "/member/devplan"}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800"
                        >
                            {devPlanMeta.total === 0 ? "Set Up Dev Plan" : "Open Dev Plan"} <ArrowRight size={14} />
                        </Link>
                    </div>
                </motion.div>
            ) : null}

            {/* Main Content Grid */}
            <motion.div variants={item}>
              <ErrorBoundary>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column (2/3): Learning Path & Schedule */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Hero: Dev Plan Progress */}
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className="bg-gradient-to-br from-brand-900 via-brand-800 to-stone-900 rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-brand-900/10 text-white min-h-[240px] flex flex-col justify-between"
                        >
                            <div className="relative z-10 w-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="bg-accent-500/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-accent-500/30 text-accent-300 flex items-center gap-2 w-fit mb-3">
                                            <Activity size={14} /> Your Dev Journey
                                        </span>
                                        <h3 className="text-3xl font-bold leading-tight">Dev Plan</h3>
                                        <p className="text-brand-200 text-sm mt-1">Track your growth & hit your goals</p>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <div className="text-4xl font-bold text-accent-400">{devPlanMeta.completed}<span className="text-lg text-white/60">/{devPlanMeta.total || "-"}</span></div>
                                        <div className="text-xs text-brand-200 font-medium uppercase tracking-wide">Goals Completed</div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {devPlanMeta.total > 0 ? (
                                        <span className="bg-accent-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                                            <CheckCircle size={12} /> {devPlanMeta.completed} completed
                                        </span>
                                    ) : null}
                                    <span className="bg-white/10 border border-white/20 text-white/80 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                                        <Clock size={12} className="text-accent-400" /> {devPlanMeta.total === 0 ? "No plan yet" : `${Math.max(devPlanMeta.total - devPlanMeta.completed, 0)} remaining`}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Link href="/member/devplan" className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-accent-500/20">
                                        Update Dev Plan <ArrowRight size={16} />
                                    </Link>
                                    <span className="text-sm font-medium text-brand-200">
                                        {devPlanMeta.total > 0
                                            ? `${Math.round((devPlanMeta.completed / devPlanMeta.total) * 100)}% to your goals`
                                            : "Set your first goals to get started"}
                                    </span>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accent-500 opacity-20 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-pink-500 opacity-10 rounded-full blur-2xl"></div>
                        </motion.div>

                        {/* Schedule Section */}
                        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                            {/* Schedule Header */}
                            <div className="p-6 border-b border-stone-100">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-xl">
                                            <Calendar size={22} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-stone-900">Your Schedule</h2>
                                            <p className="text-sm text-stone-500">Track your sessions and workshops</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                    <Link href="/member/schedule" className="text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors flex items-center gap-1">View All <ArrowRight size={14} /></Link>
                                    <div className="flex bg-stone-100 p-1 rounded-xl">
                                        <button
                                            onClick={() => setScheduleView('upcoming')}
                                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${scheduleView === 'upcoming' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-900'}`}
                                        >
                                            Upcoming
                                        </button>
                                        <button
                                            onClick={() => setScheduleView('past')}
                                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${scheduleView === 'past' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-900'}`}
                                        >
                                            Past Recordings
                                        </button>
                                    </div>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Content */}
                            <div className="p-6">
                                {isLoadingSchedule ? (
                                    <div className="py-12 flex items-center justify-center text-stone-500 gap-2">
                                        <Loader2 size={18} className="animate-spin" /> Loading your schedule...
                                    </div>
                                ) : scheduleError ? (
                                    <EmptyState icon={Calendar} heading="Schedule unavailable" description={scheduleError} variant="plain" />
                                ) : scheduleView === 'upcoming' ? (
                                    <div className="space-y-4">
                                        {upcomingSessions.map((session) => (
                                            <div
                                                key={session.id}
                                                className="group bg-stone-50 hover:bg-white border border-stone-100 hover:border-brand-200 rounded-2xl p-5 transition-all hover:shadow-md"
                                            >
                                                <div className="flex flex-col lg:flex-row gap-5">
                                                    {/* Date Badge */}
                                                    <div className="flex-shrink-0 flex lg:flex-col items-center lg:items-center gap-4 lg:gap-0">
                                                        <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${todayLabel(session.scheduledAt) === 'TODAY' ? 'bg-gradient-to-br from-brand-600 to-brand-800 text-white' : 'bg-white border border-stone-200'}`}>
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${todayLabel(session.scheduledAt) === 'TODAY' ? 'text-brand-200' : 'text-stone-400'}`}>
                                                                {new Date(session.scheduledAt).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                                                            </span>
                                                            <span className={`text-2xl font-bold ${todayLabel(session.scheduledAt) === 'TODAY' ? 'text-white' : 'text-stone-900'}`}>
                                                                {new Date(session.scheduledAt).getDate()}
                                                            </span>
                                                        </div>
                                                        <span className={`text-xs font-bold uppercase tracking-wide ${todayLabel(session.scheduledAt) === 'TODAY' ? 'text-brand-600' : 'text-stone-400'}`}>
                                                            {todayLabel(session.scheduledAt)}
                                                        </span>
                                                    </div>

                                                    {/* Session Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${getTypeColor(eventTypeLabel(session.type))}`}>
                                                                {eventTypeLabel(session.type)}
                                                            </span>
                                                        </div>

                                                        <h3 className="text-lg font-bold text-stone-900 group-hover:text-brand-800 transition-colors mb-2">
                                                            {session.title}
                                                        </h3>

                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock size={15} className="text-stone-400" />
                                                                {formatSessionTime(session.scheduledAt, session.durationMinutes)}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <MapPin size={15} className="text-stone-400" />
                                                                {session.platform === "ZOOM" ? "Virtual - Zoom" : session.platform === "GOOGLE_MEET" ? "Virtual - Google Meet" : "Virtual"}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <AvatarInitials name={session.host} size="xs" className="!w-5 !h-5" />
                                                                {session.host}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Action Button */}
                                                    <div className="flex-shrink-0 flex items-center">
                                                        <Link href="/member/schedule" className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center gap-2">
                                                            <Video size={16} /> Open Schedule
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {upcomingSessions.length === 0 ? (
                                            <EmptyState icon={Calendar} heading="No upcoming sessions" description="Check back soon for your next cohort events." variant="plain" />
                                        ) : null}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {pastRecordings.map((session) => (
                                            <a key={session.id} className="group cursor-pointer" href={session.recordingUrl ?? "#"} target="_blank" rel="noreferrer">
                                                {/* Video Thumbnail */}
                                                <div className="aspect-video bg-stone-800 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-stone-700 transition-colors overflow-hidden relative">
                                                    <div className="w-14 h-14 bg-stone-700 group-hover:bg-stone-600 rounded-xl flex items-center justify-center transition-colors">
                                                        <Video size={28} className="text-stone-400" />
                                                    </div>
                                                    {/* Play overlay on hover */}
                                                    <div className="absolute inset-0 bg-brand-800/0 group-hover:bg-brand-800/20 transition-colors flex items-center justify-center">
                                                        <div className="w-16 h-16 bg-white/0 group-hover:bg-white/90 rounded-full flex items-center justify-center transition-all scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100">
                                                            <ArrowRight size={28} className="text-brand-800 ml-1" />
                                                        </div>
                                                    </div>
                                                    {/* Duration Badge */}
                                                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded-md text-white text-xs font-medium">
                                                        {fmtDuration(session.durationMinutes)}
                                                    </div>
                                                </div>
                                                {/* Recording Info */}
                                                <h4 className="font-bold text-stone-900 group-hover:text-brand-800 transition-colors">{session.title}</h4>
                                                <p className="text-sm text-stone-500">{new Date(session.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                                            </a>
                                        ))}
                                        {pastRecordings.length === 0 ? (
                                            <div className="sm:col-span-2 lg:col-span-3">
                                                <EmptyState icon={Video} heading="No recordings yet" description="Past sessions with recordings will appear here." variant="plain" />
                                            </div>
                                        ) : null}

                                        {/* View All Card */}
                                        <Link href="/member/schedule" className="aspect-video border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-stone-400 hover:border-accent-400 hover:text-accent-500 transition-colors cursor-pointer group">
                                            <Video size={32} className="mb-2" />
                                            <span className="font-semibold text-sm">View All Recordings</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column (1/3): Action Center & Daily Standup */}
                    <div className="space-y-6">
                        {/* Action Center (Due Soon) */}
                        <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm flex flex-col">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                                    <AlertTriangle size={18} />
                                </div>
                                <h3 className="font-bold text-stone-900">Action Center</h3>
                            </div>

                            <div className="space-y-3 flex-1">
                                {showDevPlanReminder ? (
                                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-start gap-3">
                                        <div className="mt-0.5 w-4 h-4 rounded border-2 border-amber-300 bg-amber-50"></div>
                                        <div>
                                            <p className="text-sm font-bold text-stone-800 leading-tight">Finish your dev plan milestones</p>
                                            <p className="text-xs text-amber-600 font-semibold mt-1">{devPlanMeta.completed}/{devPlanMeta.total || 0} completed</p>
                                        </div>
                                    </div>
                                ) : null}
                                {upcomingSessions.slice(0, 2).map((session) => (
                                    <div key={session.id} className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-start gap-3">
                                        <div className="mt-0.5 w-4 h-4 rounded border-2 border-brand-300 bg-brand-50"></div>
                                        <div>
                                            <p className="text-sm font-bold text-stone-800 leading-tight">Attend {session.title}</p>
                                            <p className="text-xs text-stone-500 font-medium mt-1">{new Date(session.scheduledAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                                        </div>
                                    </div>
                                ))}
                                {!showDevPlanReminder && upcomingSessions.length === 0 ? (
                                    <p className="text-sm text-stone-500">You are all caught up for now.</p>
                                ) : null}
                            </div>
                        </div>

                        {/* Featured Jobs */}
                        <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
                            <h3 className="text-lg font-bold text-stone-900 mb-4">Featured Jobs</h3>
                            {isLoadingJobs ? (
                                <div className="py-10 flex items-center justify-center text-stone-500 gap-2">
                                    <Loader2 size={18} className="animate-spin" /> Loading featured roles...
                                </div>
                            ) : jobsError ? (
                                <EmptyState icon={Briefcase} heading="Jobs unavailable" description={jobsError} variant="plain" />
                            ) : (
                                <div className="space-y-4">
                                    {featuredJobs.map((job) => (
                                        <div key={job.id} className="bg-white rounded-xl border border-stone-200 p-4 hover:border-brand-200 hover:shadow-md transition-all">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                    {job.company.slice(0, 3).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-stone-900 text-sm">{job.company}</p>
                                                    <p className="text-xs text-stone-400">{fmtJobDate(job.createdAt)}</p>
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-stone-900 mb-2 line-clamp-1">{job.title}</h4>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {job.location ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600">
                                                        <MapPin size={12} /> {job.location}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <div className="flex gap-2">
                                                {job.externalUrl ? (
                                                    <a href={job.externalUrl} target="_blank" rel="noreferrer" className="flex-1 px-3 py-2 bg-brand-800 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors text-xs flex items-center justify-center gap-1">
                                                        Apply <ExternalLink size={12} />
                                                    </a>
                                                ) : (
                                                    <Link href="/member/jobs" className="flex-1 px-3 py-2 bg-brand-800 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors text-xs text-center">
                                                        View Job
                                                    </Link>
                                                )}
                                                {job.referralAvailable ? (
                                                    <JobReferralButton jobId={job.id} />
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                    {featuredJobs.length === 0 ? (
                                        <EmptyState icon={Briefcase} heading="No featured jobs yet" description="Featured opportunities will appear here as soon as they are published." variant="plain" />
                                    ) : null}
                                </div>
                            )}

                            <Link href="/member/jobs" className="block w-full mt-4 bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-full font-bold text-sm transition-colors text-center">
                                Explore More Jobs
                            </Link>
                        </div>

                        {/* Invite Community */}
                        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col items-center text-center">
                            <h3 className="text-lg font-bold text-stone-900 mb-6">Bring Your Community</h3>
                            <button className="w-full bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-full font-bold text-sm transition-colors shadow-lg shadow-accent-500/20">
                                Invite Peeps
                            </button>
                        </div>
                    </div>
                </div>
              </ErrorBoundary>
            </motion.div>
        </motion.div>
    );
}

function JobReferralButton({ jobId }: { jobId: string }) {
    const { trigger, isLoading } = useRequestReferral(jobId);
    const { toast } = useToast();
    return (
        <button
            onClick={() => void trigger({}).then(() => toast("Referral request sent")).catch(() => toast("Could not request referral", "error"))}
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-accent-100 text-accent-700 font-bold rounded-lg hover:bg-accent-200 transition-colors text-xs flex items-center justify-center gap-1 disabled:opacity-60"
        >
            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Users size={12} />}
            Seek Referral
        </button>
    );
}
