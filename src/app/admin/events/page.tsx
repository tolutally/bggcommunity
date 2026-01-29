"use client";

import { Calendar, Clock, MapPin, Users, Plus, MoreHorizontal } from "lucide-react";

export default function AdminEventsPage() {
    const events = [
        {
            id: 1,
            title: "Weekly Office Hours",
            date: "Oct 25",
            time: "4:00 PM - 5:00 PM EST",
            type: "Q&A",
            host: "Dr. Alisha Reid",
            attendees: 42,
            status: "upcoming"
        },
        {
            id: 2,
            title: "Product Strategy Workshop",
            date: "Oct 26",
            time: "2:00 PM - 3:30 PM EST",
            type: "Workshop",
            host: "Sarah Jenkins",
            attendees: 67,
            status: "upcoming"
        },
        {
            id: 3,
            title: "Guest Speaker: Product at Uber",
            date: "Oct 28",
            time: "1:00 PM - 2:00 PM EST",
            type: "Speaker Series",
            host: "Amanda Jones",
            attendees: 120,
            status: "upcoming"
        }
    ];

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-10">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Events</h1>
                    <p className="text-stone-500 mt-1">Schedule and manage community events.</p>
                </div>
                <button className="bg-purple-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-purple-800 flex items-center gap-2 shadow-lg shadow-purple-900/10">
                    <Plus size={18} /> Create Event
                </button>
            </div>

            {/* Events List */}
            <div className="space-y-4">
                {events.map(event => (
                    <div key={event.id} className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col md:flex-row gap-6 hover:border-purple-300 transition-all group">
                        <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 bg-purple-50 rounded-2xl border border-purple-100 group-hover:bg-purple-100 transition-colors">
                            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">{event.date.split(' ')[0]}</span>
                            <span className="text-3xl font-bold text-purple-900">{event.date.split(' ')[1]}</span>
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-100">
                                            {event.type}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-purple-700 transition-colors">{event.title}</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                                        <span className="flex items-center gap-1.5"><Clock size={16} /> {event.time}</span>
                                        <span className="flex items-center gap-1.5"><Users size={16} /> {event.attendees} Attending</span>
                                        <span className="flex items-center gap-1.5">Host: {event.host}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-medium text-sm">Edit</button>
                                    <button className="text-stone-400 hover:text-stone-600">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
