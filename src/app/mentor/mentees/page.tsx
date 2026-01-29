"use client";

import { useState } from "react";
import { FileText, NotebookPen, MessageSquare, ArrowRight, Heart } from "lucide-react";

export default function MentorMenteesPage() {
    const [filter, setFilter] = useState("all");

    const mentees = [
        {
            id: 1,
            name: "Amara Okafor",
            title: "Aspiring Product Manager",
            blurb: "working on my first case study about accessibility in fintech.",
            image: "https://i.pravatar.cc/150?u=1",
            cohort: "Cohort Alpha",
            status: "On Track",
            progress: 75,
            nextMilestone: "User Persona Draft"
        },
        {
            id: 2,
            name: "Jordan Smith",
            title: "Frontend Developer",
            blurb: "Building a component library for my portfolio.",
            image: "https://i.pravatar.cc/150?u=2",
            cohort: "Cohort Alpha",
            status: "Needs Support",
            progress: 40,
            nextMilestone: "Component Library Prototype"
        },
        {
            id: 3,
            name: "Keisha Williams",
            title: "UX Researcher",
            blurb: "focusing on qualitative research methods.",
            image: "https://i.pravatar.cc/150?u=4",
            cohort: "Cohort Beta",
            status: "On Track",
            progress: 90,
            nextMilestone: "Capstone Project"
        }
    ];

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-stone-900">My Mentees</h1>
                <p className="text-stone-500 mt-1">Manage your cohort interaction and review member progress.</p>
            </div>

            {/* Review Queue */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-red-100 text-red-600 p-1.5 rounded-lg">
                        <FileText size={18} />
                    </div>
                    <h2 className="text-xl font-bold text-stone-900">Review Queue</h2>
                    <span className="bg-stone-100 text-stone-600 text-xs font-bold px-2 py-0.5 rounded-full">3 Pending</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                    <ReviewCard
                        user="Amara Okafor"
                        avatar="https://i.pravatar.cc/150?u=1"
                        type="Assignment"
                        title="User Persona Draft"
                        due="Due Yesterday"
                        urgent
                    />
                    <ReviewCard
                        user="Jordan Smith"
                        avatar="https://i.pravatar.cc/150?u=2"
                        type="Question"
                        title="React Server Components help"
                        due="Posted 2h ago"
                    />
                    <ReviewCard
                        user="Keisha Williams"
                        avatar="https://i.pravatar.cc/150?u=4"
                        type="Booking Request"
                        title="Portfolio Review"
                        due="Requested 5h ago"
                    />
                </div>
            </section>

            {/* Mentees Grid */}
            <section>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold text-stone-900">All Mentees</h2>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm font-semibold hover:bg-stone-50">Filter by Cohort</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mentees.map(mentee => (
                        <MenteeCard key={mentee.id} mentee={mentee} />
                    ))}
                </div>
            </section>

            {/* Activity Feed */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-stone-900">Recent Activity</h2>
                    <div className="flex gap-2 bg-stone-100 p-1 rounded-lg">
                        {["all", "submissions", "messages"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors ${filter === f ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100">
                    <ActivityRow
                        user="Amara Okafor"
                        avatar="https://i.pravatar.cc/150?u=1"
                        action="submitted assignment"
                        target="User Persona Draft"
                        time="2 hours ago"
                        type="submissions"
                    />
                    <ActivityRow
                        user="Keisha Williams"
                        avatar="https://i.pravatar.cc/150?u=4"
                        action="booked a session"
                        target="Career 1:1"
                        time="5 hours ago"
                        type="messages"
                    />
                    <ActivityRow
                        user="Jordan Smith"
                        avatar="https://i.pravatar.cc/150?u=2"
                        action="posted in"
                        target="Cohort Alpha Feed"
                        time="1 day ago"
                        content="Does anyone have good resources for accessible color palettes?"
                        interactive
                        type="messages"
                    />
                </div>
            </section>
        </div>
    );
}

function ReviewCard({ user, avatar, type, title, due, urgent }: any) {
    return (
        <div className="min-w-[280px] bg-white p-5 rounded-2xl border border-stone-200 hover:border-purple-300 transition-all cursor-pointer group snap-start">
            <div className="flex justify-between items-start mb-3">
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${urgent ? 'bg-red-50 text-red-600' : 'bg-stone-100 text-stone-500'}`}>
                    {type}
                </div>
                {urgent && <span className="h-2 w-2 rounded-full bg-red-500"></span>}
            </div>
            <h3 className="font-bold text-stone-900 mb-1 leading-tight group-hover:text-purple-700">{title}</h3>
            <p className={`text-xs font-medium mb-4 ${urgent ? 'text-red-500' : 'text-stone-400'}`}>{due}</p>

            <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                <img src={avatar} className="w-6 h-6 rounded-full" />
                <span className="text-xs font-semibold text-stone-600">{user}</span>
                <button className="ml-auto text-purple-700 hover:bg-purple-50 p-1.5 rounded-lg transition-colors">
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
    )
}

function MenteeCard({ mentee }: any) {
    const [showNotes, setShowNotes] = useState(false);

    return (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col group hover:border-purple-300 transition-all relative">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <img src={mentee.image} alt={mentee.name} className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-sm" />
                    <div>
                        <h3 className="text-base font-bold text-stone-900 leading-tight">{mentee.name}</h3>
                        <p className="text-xs text-stone-500">{mentee.cohort}</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowNotes(!showNotes)}
                    className={`p-2 rounded-lg transition-colors ${showNotes ? 'bg-amber-50 text-amber-600' : 'text-stone-300 hover:text-stone-500 hover:bg-stone-50'}`}
                >
                    <NotebookPen size={18} />
                </button>
            </div>

            {showNotes ? (
                <div className="mb-6 flex-1 bg-amber-50 rounded-xl p-3 border border-amber-100 animate-in fade-in zoom-in-95 duration-200">
                    <h4 className="text-xs font-bold text-amber-800 mb-2 uppercase tracking-wide">Private Notes</h4>
                    <textarea
                        className="w-full bg-transparent border-none p-0 text-sm text-amber-900 placeholder:text-amber-700/50 resize-none focus:ring-0"
                        rows={4}
                        placeholder="Add private notes about this mentee..."
                        defaultValue="Discussed lack of confidence in CSS. Suggested 2 tutorials."
                    />
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-stone-500">Progress</span>
                            <span className="text-purple-700">{mentee.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-600 rounded-full" style={{ width: `${mentee.progress}%` }}></div>
                        </div>
                        <p className="text-xs text-stone-400 mt-2">Next: <span className="text-stone-600">{mentee.nextMilestone}</span></p>
                    </div>

                    <p className="text-stone-600 text-sm leading-relaxed mb-6 flex-1 line-clamp-2">
                        {mentee.blurb}
                    </p>
                </>
            )}

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                <button className="flex-1 py-2 bg-stone-50 text-stone-700 rounded-lg text-sm font-semibold hover:bg-stone-100 transition-colors flex items-center justify-center gap-2">
                    <MessageSquare size={16} /> Chat
                </button>
                <button className="flex-1 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors">
                    Schedule 1:1
                </button>
            </div>
        </div>
    )
}

function ActivityRow({ user, avatar, action, target, time, content, interactive, type }: any) {
    return (
        <div className="p-6 hover:bg-stone-50 transition-colors">
            <div className="flex gap-4">
                <img src={avatar} className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <p className="text-sm text-stone-900">
                            <span className="font-bold">{user}</span> <span className="text-stone-500">{action}</span> <span className="font-semibold text-purple-700">{target}</span>
                        </p>
                        <span className="text-xs text-stone-400">{time}</span>
                    </div>
                    {content && (
                        <p className="mt-2 text-sm text-stone-600 bg-stone-50 p-3 rounded-lg border border-stone-100">
                            "{content}"
                        </p>
                    )}
                    {interactive && (
                        <div className="flex gap-4 mt-3">
                            <button className="text-xs font-semibold text-stone-500 hover:text-purple-700 flex items-center gap-1"><Heart size={14} /> Like</button>
                            <button className="text-xs font-semibold text-stone-500 hover:text-purple-700 flex items-center gap-1"><MessageSquare size={14} /> Reply</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
