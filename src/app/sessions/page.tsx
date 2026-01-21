"use client";

import { useUser } from "@/context/UserContext";
import { Calendar, Clock, Video, MapPin, CheckCircle, Plus, MoreHorizontal } from "lucide-react";
import { useState } from "react";

export default function SessionsPage() {
    const { role } = useUser();

    if (role === 'mentor') {
        return <MentorSessionsView />;
    }

    return <MemberSessionsView />;
}

// --- Mentor View ---

function MentorSessionsView() {
    const [availability, setAvailability] = useState({
        Mon: true,
        Tue: false,
        Wed: true,
        Thu: false,
        Fri: true
    });

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-stone-900">Schedule & Availability</h1>
                <p className="text-stone-500 mt-1">Manage your coaching slots and view upcoming sessions.</p>
            </div>

            {/* Availability Manager */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                        <Calendar size={22} className="text-purple-700" /> Weekly Availability
                    </h2>
                    <button className="text-sm font-semibold text-purple-700 hover:text-purple-900 border border-purple-200 px-3 py-1 rounded-lg hover:bg-purple-50">
                        Edit Time Slots
                    </button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {Object.entries(availability).map(([day, isAvailable]) => (
                        <div key={day} className={`flex-1 min-w-[80px] p-4 rounded-xl border-2 cursor-pointer transition-all ${isAvailable ? 'border-purple-600 bg-purple-50' : 'border-stone-100 bg-stone-50'}`}>
                            <div className="text-center">
                                <span className={`block font-bold mb-1 ${isAvailable ? 'text-purple-900' : 'text-stone-400'}`}>{day}</span>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isAvailable ? 'bg-purple-200 text-purple-800' : 'bg-stone-200 text-stone-500'}`}>
                                    {isAvailable ? '4 Slots' : 'Off'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Coaching Sessions (1:1s) */}
            <div>
                <h2 className="text-xl font-bold text-stone-900 mb-4">Upcoming Coaching</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <CoachingCard
                        mentee="Keisha Williams"
                        time="Today, 2:00 PM"
                        topic="Career Strategy"
                        avatar="https://i.pravatar.cc/150?u=4"
                    />
                    <CoachingCard
                        mentee="Jordan Smith"
                        time="Tomorrow, 10:00 AM"
                        topic="Technical Review"
                        avatar="https://i.pravatar.cc/150?u=2"
                    />
                    <div className="border-2 border-dashed border-stone-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-purple-300 hover:bg-stone-50 cursor-pointer transition-colors min-h-[140px]">
                        <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 text-stone-400">
                            <Plus size={20} />
                        </div>
                        <p className="font-semibold text-stone-600">Open Slot</p>
                        <p className="text-xs text-stone-400">Wed, 4:00 PM</p>
                    </div>
                </div>
            </div>

            {/* General Sessions (reused/adjusted) */}
            <div>
                <h2 className="text-xl font-bold text-stone-900 mb-4">General Programming</h2>
                <div className="space-y-4 opacity-80 hover:opacity-100 transition-opacity">
                    <SessionRow
                        day="24"
                        month="OCT"
                        title="Deep Dive: Systems Thinking"
                        time="2:00 PM - 3:30 PM EST"
                        type="Workshop"
                    />
                </div>
            </div>
        </div>
    )
}

function CoachingCard({ mentee, time, topic, avatar }: any) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <img src={avatar} className="w-10 h-10 rounded-full" />
                    <div>
                        <h4 className="font-bold text-stone-900 text-sm">{mentee}</h4>
                        <p className="text-xs text-stone-500">Mentee</p>
                    </div>
                </div>
                <button className="text-stone-400 hover:text-stone-600"><MoreHorizontal size={18} /></button>
            </div>
            <div className="mt-auto">
                <p className="text-sm font-semibold text-purple-700 mb-1">{topic}</p>
                <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Clock size={14} /> {time}
                </div>
            </div>
            <button className="w-full mt-4 bg-stone-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-stone-800">Start Session</button>
        </div>
    )
}

// --- Member View (Original) ---

function MemberSessionsView() {
    const rsvps = [
        {
            day: "25",
            month: "OCT",
            title: "Weekly Office Hours",
            time: "4:00 PM - 5:00 PM EST",
            type: "Q&A",
            tutor: "Dr. Alisha Reid",
            status: "attending"
        }
    ];

    const sessions = [
        {
            day: "24",
            month: "OCT",
            title: "Deep Dive: Systems Thinking",
            time: "2:00 PM - 3:30 PM EST",
            type: "Workshop",
            tutor: "Sarah Jenkins",
            status: "upcoming"
        },
        {
            day: "26",
            month: "OCT",
            title: "Group Crits: Week 3 Work",
            time: "4:00 PM - 5:30 PM EST",
            type: "Interactive",
            tutor: "Peer Group A",
            status: "upcoming"
        },
        {
            day: "28",
            month: "OCT",
            title: "Guest Speaker: Product at Uber",
            time: "1:00 PM - 2:00 PM EST",
            type: "Speaker Series",
            tutor: "Amanda Jones",
            status: "upcoming"
        }
    ];

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Your Schedule</h1>
                    <p className="text-stone-500 mt-1">Track your commitment and upcoming workshops.</p>
                </div>
            </div>

            {/* My RSVPs */}
            <div className="bg-purple-50 rounded-3xl p-8 border border-purple-100">
                <div className="flex items-center gap-2 mb-6">
                    <CheckCircle className="text-purple-700" size={24} />
                    <h2 className="text-xl font-bold text-purple-900">My RSVPs</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rsvps.map((session, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm flex items-start gap-4">
                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-purple-100/50 rounded-xl text-purple-800">
                                <span className="text-[10px] font-bold uppercase tracking-wider">{session.month}</span>
                                <span className="text-2xl font-bold">{session.day}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-stone-900 leading-tight">{session.title}</h3>
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Going</span>
                                </div>
                                <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                                    <Clock size={12} /> {session.time}
                                </p>
                                <p className="text-xs text-purple-700 font-semibold mt-2">Hosted by {session.tutor}</p>
                            </div>
                        </div>
                    ))}
                    {/* Empty State / Add More */}
                    <div className="border-2 border-dashed border-purple-200 rounded-2xl flex flex-col items-center justify-center text-purple-400 font-medium text-sm p-4 hover:bg-white/50 transition-colors cursor-pointer">
                        <Plus size={24} className="mb-1" />
                        Browse more sessions
                    </div>
                </div>
            </div>

            {/* All Sessions */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-stone-900">Program Schedule</h2>
                    <div className="flex bg-stone-100 p-1 rounded-lg">
                        <button className="px-4 py-1.5 bg-white shadow-sm rounded-md text-sm font-semibold text-stone-900">Upcoming</button>
                        <button className="px-4 py-1.5 text-stone-500 text-sm font-semibold hover:text-stone-900">Past</button>
                    </div>
                </div>

                <div className="space-y-4">
                    {sessions.map((session, idx) => (
                        <div key={idx} className="group bg-white rounded-2xl border border-stone-200 p-6 flex flex-col md:flex-row gap-6 hover:border-purple-300 transition-all">
                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 bg-stone-50 rounded-2xl border border-stone-100 group-hover:bg-purple-50 group-hover:text-purple-700 transition-colors">
                                <span className="text-xs font-bold uppercase tracking-wider">{session.month}</span>
                                <span className="text-3xl font-bold">{session.day}</span>
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-100">
                                                {session.type}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-stone-900 mb-2">{session.title}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                                            <span className="flex items-center gap-1.5"><Clock size={16} /> {session.time}</span>
                                            <span className="flex items-center gap-1.5"><CheckCircle size={16} className="text-green-500" /> w/ {session.tutor}</span>
                                        </div>
                                    </div>
                                    <button className="hidden md:block px-6 py-2 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-800 transition-colors">
                                        RSVP
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SessionRow({ day, month, title, time, type }: any) {
    return (
        <div className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-4">
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 bg-stone-50 rounded-lg border border-stone-100 text-stone-400">
                <span className="text-[10px] font-bold uppercase">{month}</span>
                <span className="text-lg font-bold">{day}</span>
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-stone-900 text-sm">{title}</h4>
                <p className="text-xs text-stone-500 flex items-center gap-2 mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">{type}</span>
                    <span>{time}</span>
                </p>
            </div>
            <button className="text-sm font-semibold text-stone-500 hover:text-purple-700 px-3 py-1.5 rounded hover:bg-stone-50">Details</button>
        </div>
    )
}
