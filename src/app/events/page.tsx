"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Users, Video, MoreVertical, X, CheckCircle } from "lucide-react";

const UPCOMING_EVENTS = [
    {
        id: 1,
        title: "Product Design Workshop",
        date: "Today, Oct 24",
        time: "5:00 PM - 6:30 PM EST",
        type: "Workshop",
        attendees: 45,
        location: "Zoom",
        color: "bg-purple-100 text-purple-700"
    },
    {
        id: 2,
        title: "AMA with Tech Leads",
        date: "Tomorrow, Oct 25",
        time: "12:00 PM - 1:00 PM EST",
        type: "Community",
        attendees: 120,
        location: "Zoom",
        color: "bg-blue-100 text-blue-700"
    },
    {
        id: 3,
        title: "Cohort Alpha Standup",
        date: "Oct 26",
        time: "10:00 AM - 10:30 AM EST",
        type: "Cohort",
        attendees: 15,
        location: "Google Meet",
        color: "bg-green-100 text-green-700"
    }
];

export default function EventsPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8 h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-2 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Events Schedule</h1>
                    <p className="text-stone-500 mt-1">Plan workshops, sessions, and community gatherings.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-purple-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-purple-800 flex items-center gap-2 shadow-lg shadow-purple-900/10"
                >
                    <Plus size={18} /> Create Event
                </button>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 h-full min-h-0">
                {/* Calendar View (Mock Grid) */}
                <div className="flex-1 bg-white rounded-3xl border border-stone-200 p-6 flex flex-col h-full shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-lg">October 2024</h2>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border rounded-lg text-sm hover:bg-stone-50">Today</button>
                            <button className="px-3 py-1 border rounded-lg text-sm hover:bg-stone-50">Month</button>
                            <button className="px-3 py-1 border rounded-lg text-sm hover:bg-stone-50">Week</button>
                        </div>
                    </div>

                    {/* Mock Calendar Grid */}
                    <div className="grid grid-cols-7 gap-px bg-stone-100 border border-stone-100 rounded-xl overflow-hidden flex-1 active-calendar">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="bg-stone-50 p-2 text-center text-xs font-semibold text-stone-500 uppercase">
                                {day}
                            </div>
                        ))}
                        {/* Days Mockup */}
                        {Array.from({ length: 35 }).map((_, i) => {
                            const day = i - 2; // Offset start
                            const isToday = day === 24;
                            return (
                                <div key={i} className={`bg-white p-2 min-h-[80px] hover:bg-stone-50 transition-colors relative group border-t border-stone-100 md:border-t-0`}>
                                    {day > 0 && day <= 31 && (
                                        <>
                                            <span className={`text-xs font-semibold ${isToday ? 'bg-purple-900 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-stone-700'}`}>
                                                {day}
                                            </span>
                                            {/* Random Events Mock */}
                                            {day === 24 && (
                                                <div className="mt-2 text-[10px] bg-purple-100 text-purple-800 px-1 py-0.5 rounded truncate font-medium cursor-pointer">
                                                    Design Workshop
                                                </div>
                                            )}
                                            {day === 25 && (
                                                <div className="mt-2 text-[10px] bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate font-medium cursor-pointer">
                                                    Tech Help AMA
                                                </div>
                                            )}
                                            {day === 28 && (
                                                <div className="mt-2 text-[10px] bg-green-100 text-green-800 px-1 py-0.5 rounded truncate font-medium cursor-pointer">
                                                    Cohort Sync
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Upcoming Sidebar */}
                <div className="w-full xl:w-96 flex flex-col gap-6 overflow-y-auto">
                    <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200">
                        <h3 className="font-bold text-stone-900 mb-6 flex items-center gap-2">
                            <CalendarIcon size={18} /> Upcoming Events
                        </h3>
                        <div className="space-y-4">
                            {UPCOMING_EVENTS.map(event => (
                                <div key={event.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:border-purple-300 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${event.color}`}>
                                            {event.type}
                                        </div>
                                        <button className="text-stone-300 hover:text-stone-600">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                    <h4 className="font-bold text-stone-900 mb-1 group-hover:text-purple-700">{event.title}</h4>
                                    <div className="text-xs text-stone-500 space-y-1">
                                        <div className="flex items-center gap-1.5"><Clock size={12} /> {event.date} • {event.time}</div>
                                        <div className="flex items-center gap-1.5"><Video size={12} /> {event.location}</div>
                                        <div className="flex items-center gap-1.5"><Users size={12} /> {event.attendees} Attending</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Event Modal */}
            {isCreateModalOpen && (
                <CreateEventModal onClose={() => setIsCreateModalOpen(false)} />
            )}
        </div>
    );
}

function CreateEventModal({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(1);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Create New Event</h3>
                    <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full"><X size={20} /></button>
                </div>

                <div className="p-8">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Event Title</label>
                                <input type="text" className="w-full border-b border-stone-200 py-2 focus:border-purple-600 outline-none font-medium text-lg" placeholder="e.g., Weekly Design Critique" autoFocus />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Date</label>
                                    <input type="date" className="w-full border-b border-stone-200 py-2 focus:border-purple-600 outline-none font-medium" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Time</label>
                                    <input type="time" className="w-full border-b border-stone-200 py-2 focus:border-purple-600 outline-none font-medium" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Event Type</label>
                                <div className="flex gap-2">
                                    {['Workshop', 'Social', 'Class', 'Guest Speaker'].map(type => (
                                        <button key={type} className="px-3 py-1.5 border border-stone-200 rounded-lg text-sm font-semibold hover:border-purple-500 hover:text-purple-600 transition-colors">
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Video Link</label>
                                <input type="text" className="w-full border-b border-stone-200 py-2 focus:border-purple-600 outline-none font-medium" placeholder="Zoom or Google Meet URL" />
                            </div>

                            <div className="pt-4">
                                <button onClick={() => setStep(2)} className="w-full py-3 bg-purple-900 text-white font-bold rounded-xl hover:bg-purple-800 transition-colors">
                                    Create Event
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h4 className="text-2xl font-bold text-stone-900 mb-2">Event Created!</h4>
                            <p className="text-stone-500 mb-8">
                                "Weekly Design Critique" has been added to the calendar and members have been notified.
                            </p>
                            <button onClick={onClose} className="px-8 py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 transition-colors">
                                Return to Calendar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
