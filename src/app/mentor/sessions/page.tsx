"use client";

import { useState } from "react";
import { Calendar, Clock, Plus, MoreHorizontal } from "lucide-react";

export default function MentorSessionsPage() {
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
                        <Calendar size={22} className="text-brand-700" /> Weekly Availability
                    </h2>
                    <button className="text-sm font-semibold text-brand-700 hover:text-brand-800 border border-brand-200 px-3 py-1 rounded-lg hover:bg-brand-50">
                        Edit Time Slots
                    </button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {Object.entries(availability).map(([day, isAvailable]) => (
                        <div key={day} className={`flex-1 min-w-[80px] p-4 rounded-xl border-2 cursor-pointer transition-all ${isAvailable ? 'border-brand-600 bg-brand-50' : 'border-stone-100 bg-stone-50'}`}>
                            <div className="text-center">
                                <span className={`block font-bold mb-1 ${isAvailable ? 'text-brand-800' : 'text-stone-400'}`}>{day}</span>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isAvailable ? 'bg-brand-200 text-brand-800' : 'bg-stone-200 text-stone-500'}`}>
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
                    <div className="border-2 border-dashed border-stone-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-accent-400 hover:bg-stone-50 cursor-pointer transition-colors min-h-[140px]">
                        <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 text-stone-400">
                            <Plus size={20} />
                        </div>
                        <p className="font-semibold text-stone-600">Open Slot</p>
                        <p className="text-xs text-stone-400">Wed, 4:00 PM</p>
                    </div>
                </div>
            </div>

            {/* General Sessions */}
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
                <p className="text-sm font-semibold text-brand-700 mb-1">{topic}</p>
                <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Clock size={14} /> {time}
                </div>
            </div>
            <button className="w-full mt-4 bg-stone-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-stone-800">Start Session</button>
        </div>
    )
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
            <button className="text-sm font-semibold text-stone-500 hover:text-brand-700 px-3 py-1.5 rounded hover:bg-stone-50">Details</button>
        </div>
    )
}
