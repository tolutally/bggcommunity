"use client";

import { useUser } from "@/context/UserContext";
import { Calendar, Clock, ArrowRight, AlertTriangle, Activity, CheckCircle, Video, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

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

    const upcomingSessions = [
        {
            id: 1,
            day: "24",
            month: "OCT",
            dayLabel: "TODAY",
            title: "Deep Dive: Systems Thinking",
            time: "2:00 PM - 3:30 PM EST",
            type: "Workshop",
            host: "Sarah Jenkins",
            hostAvatar: "https://i.pravatar.cc/150?u=sarah",
            isRequired: true,
            isRsvped: true,
            location: "Virtual - Zoom",
        },
        {
            id: 2,
            day: "25",
            month: "OCT",
            dayLabel: "TOMORROW",
            title: "Weekly Office Hours",
            time: "4:00 PM - 5:00 PM EST",
            type: "Q&A",
            host: "Dr. Alisha Reid",
            hostAvatar: "https://i.pravatar.cc/150?u=alisha",
            isRequired: false,
            isRsvped: true,
            location: "Virtual - Zoom",
        },
        {
            id: 3,
            day: "26",
            month: "OCT",
            dayLabel: "SAT",
            title: "Group Crits: Week 3 Work",
            time: "4:00 PM - 5:30 PM EST",
            type: "Interactive",
            host: "Peer Group A",
            hostAvatar: null,
            isRequired: true,
            isRsvped: false,
            location: "Virtual - Zoom",
        },
        {
            id: 4,
            day: "28",
            month: "OCT",
            dayLabel: "MON",
            title: "Guest Speaker: Product at Uber",
            time: "1:00 PM - 2:00 PM EST",
            type: "Speaker Series",
            host: "Amanda Jones",
            hostAvatar: "https://i.pravatar.cc/150?u=amanda",
            isRequired: false,
            isRsvped: false,
            location: "Virtual - Zoom",
        },
    ];

    const pastSessions = [
        {
            id: 101,
            day: "21",
            month: "OCT",
            title: "Week 2: Research Methods",
            duration: "1h 45m",
            hasRecording: true,
        },
        {
            id: 102,
            day: "17",
            month: "OCT",
            title: "Week 1: Program Kickoff",
            duration: "2h 00m",
            hasRecording: true,
        },
    ];

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
                    Here's what's happening in your cohort today.
                </p>
            </motion.div>

            {/* Main Content Grid */}
            <motion.div variants={item}>
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

                            {/* Schedule Content */}
                            <div className="p-6">
                                {scheduleView === 'upcoming' ? (
                                    <div className="space-y-4">
                                        {upcomingSessions.map((session) => (
                                            <div
                                                key={session.id}
                                                className="group bg-stone-50 hover:bg-white border border-stone-100 hover:border-brand-200 rounded-2xl p-5 transition-all hover:shadow-md"
                                            >
                                                <div className="flex flex-col lg:flex-row gap-5">
                                                    {/* Date Badge */}
                                                    <div className="flex-shrink-0 flex lg:flex-col items-center lg:items-center gap-4 lg:gap-0">
                                                        <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${session.dayLabel === 'TODAY' ? 'bg-gradient-to-br from-brand-600 to-brand-800 text-white' : 'bg-white border border-stone-200'}`}>
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${session.dayLabel === 'TODAY' ? 'text-brand-200' : 'text-stone-400'}`}>
                                                                {session.month}
                                                            </span>
                                                            <span className={`text-2xl font-bold ${session.dayLabel === 'TODAY' ? 'text-white' : 'text-stone-900'}`}>
                                                                {session.day}
                                                            </span>
                                                        </div>
                                                        <span className={`text-xs font-bold uppercase tracking-wide ${session.dayLabel === 'TODAY' ? 'text-brand-600' : 'text-stone-400'}`}>
                                                            {session.dayLabel}
                                                        </span>
                                                    </div>

                                                    {/* Session Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${getTypeColor(session.type)}`}>
                                                                {session.type}
                                                            </span>
                                                            {session.isRequired && (
                                                                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-rose-100 text-rose-600 border border-rose-200">
                                                                    Required
                                                                </span>
                                                            )}
                                                            {session.isRsvped && (
                                                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-green-100 text-green-700 border border-green-200">
                                                                    <CheckCircle size={12} /> Going
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h3 className="text-lg font-bold text-stone-900 group-hover:text-brand-800 transition-colors mb-2">
                                                            {session.title}
                                                        </h3>

                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock size={15} className="text-stone-400" />
                                                                {session.time}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <MapPin size={15} className="text-stone-400" />
                                                                {session.location}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                {session.hostAvatar ? (
                                                                    <img src={session.hostAvatar} className="w-5 h-5 rounded-full" alt={session.host} />
                                                                ) : (
                                                                    <Users size={15} className="text-stone-400" />
                                                                )}
                                                                {session.host}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Action Button */}
                                                    <div className="flex-shrink-0 flex items-center">
                                                        {session.isRsvped ? (
                                                            <button className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center gap-2">
                                                                <Video size={16} /> Join Session
                                                            </button>
                                                        ) : (
                                                            <button className="px-5 py-2.5 bg-white border-2 border-stone-200 text-stone-700 font-bold rounded-xl hover:border-brand-300 hover:text-brand-700 transition-colors">
                                                                RSVP Now
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {pastSessions.map((session) => (
                                            <div key={session.id} className="group cursor-pointer">
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
                                                        {session.duration}
                                                    </div>
                                                </div>
                                                {/* Recording Info */}
                                                <h4 className="font-bold text-stone-900 group-hover:text-brand-800 transition-colors">{session.title}</h4>
                                                <p className="text-sm text-stone-500">{session.month} {session.day}</p>
                                            </div>
                                        ))}

                                        {/* View All Card */}
                                        <div className="aspect-video border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-stone-400 hover:border-accent-400 hover:text-accent-500 transition-colors cursor-pointer group">
                                            <Video size={32} className="mb-2" />
                                            <span className="font-semibold text-sm">View All Recordings</span>
                                        </div>
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

                            <button className="w-full mt-4 bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-full font-bold text-sm transition-colors">
                                Explore More Jobs
                            </button>
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
            </motion.div>
        </motion.div>
    );
}
