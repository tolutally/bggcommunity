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
            case "Workshop": return "bg-purple-100 text-purple-700 border-purple-200";
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

                        {/* Hero: Learning Path Progress */}
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className="bg-gradient-to-br from-indigo-900 via-purple-900 to-stone-900 rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-purple-900/10 text-white min-h-[240px] flex flex-col justify-between"
                        >
                            <div className="relative z-10 w-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10 flex items-center gap-2 w-fit mb-3">
                                            <Activity size={14} /> Week 3 of 12
                                        </span>
                                        <h3 className="text-3xl font-bold leading-tight">User Research & Synthesis</h3>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <div className="text-3xl font-bold">75%</div>
                                        <div className="text-xs text-purple-200 font-medium uppercase tracking-wide">Module Completion</div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mb-8">
                                    {/* Micro-milestones */}
                                    <div className="h-1.5 flex-1 bg-white/30 rounded-full overflow-hidden"><div className="h-full bg-white w-full"></div></div>
                                    <div className="h-1.5 flex-1 bg-white/30 rounded-full overflow-hidden"><div className="h-full bg-white w-full"></div></div>
                                    <div className="h-1.5 flex-1 bg-white/30 rounded-full overflow-hidden"><div className="h-full bg-white w-3/4 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div></div>
                                    <div className="h-1.5 flex-1 bg-white/10 rounded-full"></div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button className="bg-white text-purple-950 px-6 py-3 rounded-xl font-bold text-sm hover:bg-purple-50 transition-colors flex items-center gap-2 shadow-lg shadow-white/5">
                                        Continue Module <ArrowRight size={16} />
                                    </button>
                                    <span className="text-sm font-medium text-purple-200">Next: Synthesis Matrix</span>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500 opacity-20 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-pink-500 opacity-10 rounded-full blur-2xl"></div>
                        </motion.div>

                        {/* Schedule Section */}
                        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                            {/* Schedule Header */}
                            <div className="p-6 border-b border-stone-100">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl">
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
                                                className="group bg-stone-50 hover:bg-white border border-stone-100 hover:border-purple-200 rounded-2xl p-5 transition-all hover:shadow-md"
                                            >
                                                <div className="flex flex-col lg:flex-row gap-5">
                                                    {/* Date Badge */}
                                                    <div className="flex-shrink-0 flex lg:flex-col items-center lg:items-center gap-4 lg:gap-0">
                                                        <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${session.dayLabel === 'TODAY' ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white' : 'bg-white border border-stone-200'}`}>
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${session.dayLabel === 'TODAY' ? 'text-purple-200' : 'text-stone-400'}`}>
                                                                {session.month}
                                                            </span>
                                                            <span className={`text-2xl font-bold ${session.dayLabel === 'TODAY' ? 'text-white' : 'text-stone-900'}`}>
                                                                {session.day}
                                                            </span>
                                                        </div>
                                                        <span className={`text-xs font-bold uppercase tracking-wide ${session.dayLabel === 'TODAY' ? 'text-purple-600' : 'text-stone-400'}`}>
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

                                                        <h3 className="text-lg font-bold text-stone-900 group-hover:text-purple-900 transition-colors mb-2">
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
                                                            <button className="px-5 py-2.5 bg-purple-900 text-white font-bold rounded-xl hover:bg-purple-800 transition-colors flex items-center gap-2">
                                                                <Video size={16} /> Join Session
                                                            </button>
                                                        ) : (
                                                            <button className="px-5 py-2.5 bg-white border-2 border-stone-200 text-stone-700 font-bold rounded-xl hover:border-purple-300 hover:text-purple-700 transition-colors">
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
                                                    <div className="absolute inset-0 bg-purple-900/0 group-hover:bg-purple-900/20 transition-colors flex items-center justify-center">
                                                        <div className="w-16 h-16 bg-white/0 group-hover:bg-white/90 rounded-full flex items-center justify-center transition-all scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100">
                                                            <ArrowRight size={28} className="text-purple-900 ml-1" />
                                                        </div>
                                                    </div>
                                                    {/* Duration Badge */}
                                                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded-md text-white text-xs font-medium">
                                                        {session.duration}
                                                    </div>
                                                </div>
                                                {/* Recording Info */}
                                                <h4 className="font-bold text-stone-900 group-hover:text-purple-900 transition-colors">{session.title}</h4>
                                                <p className="text-sm text-stone-500">{session.month} {session.day}</p>
                                            </div>
                                        ))}

                                        {/* View All Card */}
                                        <div className="aspect-video border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-stone-400 hover:border-purple-300 hover:text-purple-600 transition-colors cursor-pointer group">
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
                                    <div className="mt-0.5 w-4 h-4 rounded border-2 border-stone-300 group-hover:border-purple-400 transition-colors bg-white"></div>
                                    <div>
                                        <p className="text-sm font-bold text-stone-800 leading-tight group-hover:text-purple-900">Submit Research Findings</p>
                                        <p className="text-xs text-rose-500 font-bold mt-1">Due Today, 5:00 PM</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-start gap-3 hover:bg-stone-100 transition-colors cursor-pointer group">
                                    <div className="mt-0.5 w-4 h-4 rounded border-2 border-stone-300 group-hover:border-purple-400 transition-colors bg-white"></div>
                                    <div>
                                        <p className="text-sm font-bold text-stone-800 leading-tight group-hover:text-purple-900">RSVP for Fireside Chat</p>
                                        <p className="text-xs text-stone-400 font-medium mt-1">Tomorrow</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Daily Standup */}
                        <div className="bg-stone-900 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Daily Standup</h3>
                                </div>
                                <p className="text-xl font-bold leading-tight mb-4">What's your main focus today?</p>

                                <div className="space-y-2">
                                    <button className="w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-medium transition-all group flex items-center justify-between">
                                        Assignment <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                                    </button>
                                    <button className="w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-medium transition-all group flex items-center justify-between">
                                        Session <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                                    </button>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500 opacity-20 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500 opacity-10 blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
