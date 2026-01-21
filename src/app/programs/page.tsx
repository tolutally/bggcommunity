"use client";

import { Users, BookOpen, TrendingUp, Calendar, MoreHorizontal, Plus, ChevronRight, CheckCircle, Clock } from "lucide-react";

export default function ProgramsPage() {
    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-10">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Programs</h1>
                    <p className="text-stone-500 mt-1">Manage cohorts, curriculum, and learning paths.</p>
                </div>
                <button className="bg-purple-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-purple-800 flex items-center gap-2 shadow-lg shadow-purple-900/10">
                    <Plus size={18} /> New Cohort
                </button>
            </div>

            {/* Active Cohorts Grid */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-xl font-bold text-stone-900">Active Cohorts</h2>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">3 Running</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CohortCard
                        name="Cohort Alpha"
                        track="Product Design"
                        students={145}
                        week="Week 8 of 12"
                        module="Design Systems"
                        engagement={92}
                        color="bg-purple-50 text-purple-700 border-purple-200"
                        accent="bg-purple-600"
                    />
                    <CohortCard
                        name="Cohort Beta"
                        track="Frontend Engineering"
                        students={132}
                        week="Week 4 of 12"
                        module="React Fundamentals"
                        engagement={88}
                        color="bg-blue-50 text-blue-700 border-blue-200"
                        accent="bg-blue-600"
                    />
                    <CohortCard
                        name="Cohort Gamma"
                        track="Data Science"
                        students={98}
                        week="Week 2 of 12"
                        module="Python Basics"
                        engagement={95}
                        color="bg-emerald-50 text-emerald-700 border-emerald-200"
                        accent="bg-emerald-600"
                    />
                </div>
            </section>

            {/* Curriculum Timeline */}
            <section className="bg-white rounded-3xl border border-stone-200 p-8">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-stone-900">Curriculum Roadmap</h2>
                        <p className="text-stone-500 text-sm mt-1">Product Design Track • Q4 2024</p>
                    </div>
                    <button className="text-stone-500 hover:text-stone-900 font-bold text-sm flex items-center gap-1">
                        View All Tracks <ChevronRight size={16} />
                    </button>
                </div>

                <div className="relative">
                    {/* Line connecting nodes */}
                    <div className="absolute top-8 left-0 w-full h-1 bg-stone-100 -z-10"></div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        <TimelineNode week={1} title="Intro to UX" status="Completed" />
                        <TimelineNode week={2} title="User Research" status="Completed" />
                        <TimelineNode week={3} title="Synthesizing Data" status="Completed" />
                        <TimelineNode week={4} title="Wireframing" status="Active" />
                        <TimelineNode week={5} title="Prototyping" status="Upcoming" />
                        <TimelineNode week={6} title="UI Design" status="Upcoming" />
                    </div>
                </div>
            </section>
        </div>
    );
}

function CohortCard({ name, track, students, week, module, engagement, color, accent }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 hover:border-purple-300 transition-all cursor-pointer group shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${color}`}>
                    {track}
                </div>
                <button className="text-stone-400 hover:text-stone-600">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <h3 className="text-2xl font-bold text-stone-900 mb-1">{name}</h3>
            <div className="flex items-center gap-4 text-sm text-stone-500 mb-6">
                <span className="flex items-center gap-1"><Users size={14} /> {students} Students</span>
                <span className="flex items-center gap-1"><TrendingUp size={14} /> {engagement}% Avg. Score</span>
            </div>

            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 group-hover:bg-white group-hover:border-purple-100 transition-colors">
                <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-stone-500 uppercase">Current Module</span>
                    <span className="text-stone-900">{week}</span>
                </div>
                <div className="font-bold text-stone-900 mb-3">{module}</div>
                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${accent} w-[65%]`}></div>
                </div>
            </div>
        </div>
    )
}

function TimelineNode({ week, title, status }: any) {
    const isCompleted = status === "Completed";
    const isActive = status === "Active";

    return (
        <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-4 mb-3 transition-colors ${isCompleted ? 'bg-green-500 border-green-100 text-white' :
                    isActive ? 'bg-purple-600 border-purple-100 text-white shadow-lg shadow-purple-200' :
                        'bg-white border-stone-100 text-stone-300'
                }`}>
                {isCompleted ? <CheckCircle size={24} /> : isActive ? <BookOpen size={24} /> : <Calendar size={24} />}
            </div>
            <span className={`text-xs font-bold uppercase mb-1 ${isActive ? 'text-purple-600' : 'text-stone-400'
                }`}>
                Week {week}
            </span>
            <h4 className={`font-bold text-sm leading-tight ${status === 'Upcoming' ? 'text-stone-400' : 'text-stone-900'
                }`}>{title}</h4>
        </div>
    )
}
