"use client";

import { useUser } from "@/context/UserContext";
import { Calendar, Clock, ArrowRight, AlertTriangle, Activity, CheckCircle, Video, MapPin, Users, BookOpen, Briefcase, MessageSquare, Target, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useEvents, eventTypeLabel, fmtEventTime, fmtDuration, isEventPast } from "@/hooks/use-events";

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
    const { events: apiEvents, isLoading: eventsLoading } = useEvents();
    const [scheduleView, setScheduleView] = useState<'upcoming' | 'past'>('upcoming');
    const [showDevPlanBanner, setShowDevPlanBanner] = useState(false);

    // Check if user skipped dev plan during onboarding
    useEffect(() => {
        const skipped = localStorage.getItem("bgg_devplan_skipped");
        const dismissed = localStorage.getItem("bgg_devplan_banner_dismissed");
        if (skipped === "true" && dismissed !== "true") {
            setShowDevPlanBanner(true);
        }
    }, []);

    // Derive upcoming + past sessions from API events
    const upcomingSessions = apiEvents
        .filter(e => !isEventPast(e.scheduledAt, e.durationMinutes))
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
        .slice(0, 4);

    const pastSessions = apiEvents
        .filter(e => isEventPast(e.scheduledAt, e.durationMinutes) && e.recordingUrl)
        .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
        .slice(0, 3);

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

            {/* Complete Dev Plan Banner */}
            {showDevPlanBanner && (
                <motion.div
                    variants={item}
                    className="relative bg-gradient-to-r from-accent-50 via-amber-50 to-accent-50 border border-accent-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Target size={20} className="text-accent-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-stone-900">Complete your Development Plan</p>
                            <p className="text-xs text-stone-500 mt-0.5">You skipped this during onboarding. Setting goals helps you stay on track and get the most out of your cohort.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                            href="/member/devplan"
                            className="px-4 py-2 bg-accent-500 text-white text-sm font-bold rounded-xl hover:bg-accent-600 transition-colors shadow-sm"
                        >
                            Set Up Dev Plan
                        </Link>
                        <button
                            onClick={() => {
                                setShowDevPlanBanner(false);
                                localStorage.setItem("bgg_devplan_banner_dismissed", "true");
                            }}
                            className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                            aria-label="Dismiss banner"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </motion.div>
            )}

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
                                        <div className="text-4xl font-bold text-accent-400">3<span className="text-lg text-white/60">/5</span></div>
                                        <div className="text-xs text-brand-200 font-medium uppercase tracking-wide">Goals Completed</div>
                                    </div>
                                </div>

                                {/* Goal Progress Pills */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="bg-accent-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                                        <CheckCircle size={12} /> Build Portfolio
                                    </span>
                                    <span className="bg-accent-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                                        <CheckCircle size={12} /> 10 Coffee Chats
                                    </span>
                                    <span className="bg-accent-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                                        <CheckCircle size={12} /> Update Resume
                                    </span>
                                    <span className="bg-white/10 border border-white/20 text-white/80 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                                        <Clock size={12} className="text-accent-400" /> Apply to 5 Jobs
                                    </span>
                                    <span className="bg-white/10 border border-white/20 text-white/80 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                                        <Clock size={12} className="text-accent-400" /> Mock Interview
                                    </span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-accent-500/20">
                                        Update Dev Plan <ArrowRight size={16} />
                                    </button>
                                    <span className="text-sm font-medium text-brand-200">60% to your goals 🔥</span>
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
                                {scheduleView === 'upcoming' ? (
                                    <div className="space-y-4">
                                        {eventsLoading && upcomingSessions.length === 0 && (
                                            <div className="flex items-center justify-center py-10">
                                                <Loader2 className="animate-spin text-brand-500" size={24} />
                                            </div>
                                        )}
                                        {upcomingSessions.map((session) => {
                                            const dt = new Date(session.scheduledAt);
                                            const day = String(dt.getDate());
                                            const monthStr = dt.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
                                            const today = new Date();
                                            const isToday = dt.toDateString() === today.toDateString();
                                            const tomorrow = new Date(today);
                                            tomorrow.setDate(tomorrow.getDate() + 1);
                                            const isTomorrow = dt.toDateString() === tomorrow.toDateString();
                                            const dayLabel = isToday ? "TODAY" : isTomorrow ? "TOMORROW" : dt.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
                                            const typeLabel = eventTypeLabel(session.type);
                                            const timeStr = fmtEventTime(session.scheduledAt);
                                            const endTime = new Date(dt.getTime() + session.durationMinutes * 60_000);
                                            const endTimeStr = endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                                            const platform = session.platform ?? (session.meetingLink?.includes("zoom") ? "Zoom" : session.meetingLink?.includes("meet.google") ? "Google Meet" : "Virtual");

                                            return (
                                                <div
                                                    key={session.id}
                                                    className="group bg-stone-50 hover:bg-white border border-stone-100 hover:border-brand-200 rounded-2xl p-5 transition-all hover:shadow-md"
                                                >
                                                    <div className="flex flex-col lg:flex-row gap-5">
                                                        {/* Date Badge */}
                                                        <div className="flex-shrink-0 flex lg:flex-col items-center lg:items-center gap-4 lg:gap-0">
                                                            <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${isToday ? 'bg-gradient-to-br from-brand-600 to-brand-800 text-white' : 'bg-white border border-stone-200'}`}>
                                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-brand-200' : 'text-stone-400'}`}>
                                                                    {monthStr}
                                                                </span>
                                                                <span className={`text-2xl font-bold ${isToday ? 'text-white' : 'text-stone-900'}`}>
                                                                    {day}
                                                                </span>
                                                            </div>
                                                            <span className={`text-xs font-bold uppercase tracking-wide ${isToday ? 'text-brand-600' : 'text-stone-400'}`}>
                                                                {dayLabel}
                                                            </span>
                                                        </div>

                                                        {/* Session Details */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${getTypeColor(typeLabel)}`}>
                                                                    {typeLabel}
                                                                </span>
                                                            </div>

                                                            <h3 className="text-lg font-bold text-stone-900 group-hover:text-brand-800 transition-colors mb-2">
                                                                {session.title}
                                                            </h3>

                                                            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Clock size={15} className="text-stone-400" />
                                                                    {timeStr} - {endTimeStr}
                                                                </span>
                                                                <span className="flex items-center gap-1.5">
                                                                    <MapPin size={15} className="text-stone-400" />
                                                                    Virtual - {platform}
                                                                </span>
                                                                <span className="flex items-center gap-1.5">
                                                                    <Users size={15} className="text-stone-400" />
                                                                    {session.host}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Action Button */}
                                                        <div className="flex-shrink-0 flex items-center">
                                                            {session.meetingLink ? (
                                                                <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center gap-2">
                                                                    <Video size={16} /> Join Session
                                                                </a>
                                                            ) : (
                                                                <Link href="/member/schedule" className="px-5 py-2.5 bg-white border-2 border-stone-200 text-stone-700 font-bold rounded-xl hover:border-brand-300 hover:text-brand-700 transition-colors">
                                                                    View Details
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {!eventsLoading && upcomingSessions.length === 0 && (
                                            <div className="text-center py-10 text-stone-500">
                                                <Calendar size={32} className="mx-auto mb-2 text-stone-300" />
                                                <p className="font-semibold">No upcoming events</p>
                                                <p className="text-sm">Check back soon for new events.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {eventsLoading && pastSessions.length === 0 && (
                                            <div className="col-span-full flex items-center justify-center py-10">
                                                <Loader2 className="animate-spin text-brand-500" size={24} />
                                            </div>
                                        )}
                                        {pastSessions.map((session) => {
                                            const dt = new Date(session.scheduledAt);
                                            const monthStr = dt.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
                                            const day = String(dt.getDate());

                                            return (
                                                <div key={session.id} className="group cursor-pointer">
                                                    {/* Video Thumbnail */}
                                                    <a href={session.recordingUrl ?? "#"} target="_blank" rel="noopener noreferrer" className="block">
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
                                                    </a>
                                                    {/* Recording Info */}
                                                    <h4 className="font-bold text-stone-900 group-hover:text-brand-800 transition-colors">{session.title}</h4>
                                                    <p className="text-sm text-stone-500">{monthStr} {day}</p>
                                                </div>
                                            );
                                        })}

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
                                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-start gap-3 hover:bg-stone-100 transition-colors cursor-pointer group">
                                    <div className="mt-0.5 w-4 h-4 rounded border-2 border-stone-300 group-hover:border-accent-400 transition-colors bg-white"></div>
                                    <div>
                                        <p className="text-sm font-bold text-stone-800 leading-tight group-hover:text-brand-800">Submit Research Findings</p>
                                        <p className="text-xs text-rose-500 font-bold mt-1">Due Today, 5:00 PM</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-start gap-3 hover:bg-stone-100 transition-colors cursor-pointer group">
                                    <div className="mt-0.5 w-4 h-4 rounded border-2 border-stone-300 group-hover:border-accent-400 transition-colors bg-white"></div>
                                    <div>
                                        <p className="text-sm font-bold text-stone-800 leading-tight group-hover:text-brand-800">RSVP for Fireside Chat</p>
                                        <p className="text-xs text-stone-400 font-medium mt-1">Tomorrow</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Featured Jobs */}
                        <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
                            <h3 className="text-lg font-bold text-stone-900 mb-4">Featured Jobs</h3>
                            <div className="space-y-4">
                                {/* Job Card 1 - Referral Available */}
                                <div className="bg-white rounded-xl border border-stone-200 p-4 hover:border-brand-200 hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            CGI
                                        </div>
                                        <div>
                                            <p className="font-semibold text-stone-900 text-sm">CGI</p>
                                            <p className="text-xs text-stone-400">2 days ago</p>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-stone-900 mb-2">Java Developer</h4>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600">
                                            🇨🇦 Toronto, ON
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Permanent Full-time
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Hybrid
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex-1 px-3 py-2 bg-brand-800 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors text-xs">
                                            Apply
                                        </button>
                                        <button className="flex-1 px-3 py-2 bg-accent-100 text-accent-700 font-bold rounded-lg hover:bg-accent-200 transition-colors text-xs flex items-center justify-center gap-1">
                                            <Users size={12} />
                                            Seek Referral
                                        </button>
                                    </div>
                                </div>

                                {/* Job Card 2 - No Referral */}
                                <div className="bg-white rounded-xl border border-stone-200 p-4 hover:border-brand-200 hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            CGI
                                        </div>
                                        <div>
                                            <p className="font-semibold text-stone-900 text-sm">CGI</p>
                                            <p className="text-xs text-stone-400">a month ago</p>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-stone-900 mb-2 line-clamp-1">Campus Talent Acquisition...</h4>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600">
                                            🇨🇦 Toronto, ON
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600">
                                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Contract Full-time
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Hybrid
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="w-full px-3 py-2 bg-brand-800 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors text-xs">
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </div>

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
