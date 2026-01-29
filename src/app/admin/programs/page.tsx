"use client";

import { BookOpen, Users, Calendar, Plus, MoreHorizontal } from "lucide-react";

export default function AdminProgramsPage() {
    const programs = [
        {
            id: 1,
            name: "Engineering Track",
            description: "Learn software engineering fundamentals and best practices",
            cohorts: 3,
            members: 156,
            status: "Active"
        },
        {
            id: 2,
            name: "Product Design",
            description: "Master UX/UI design principles and create stunning interfaces",
            cohorts: 2,
            members: 89,
            status: "Active"
        },
        {
            id: 3,
            name: "Product Management",
            description: "Develop skills to lead product teams and drive innovation",
            cohorts: 2,
            members: 67,
            status: "Active"
        },
        {
            id: 4,
            name: "Data Science",
            description: "Learn data analysis, machine learning, and visualization",
            cohorts: 1,
            members: 42,
            status: "Planning"
        }
    ];

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-10">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Programs</h1>
                    <p className="text-stone-500 mt-1">Manage learning tracks and cohort programs.</p>
                </div>
                <button className="bg-purple-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-purple-800 flex items-center gap-2 shadow-lg shadow-purple-900/10">
                    <Plus size={18} /> Create Program
                </button>
            </div>

            {/* Programs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map(program => (
                    <div key={program.id} className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-purple-300 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
                                <BookOpen size={24} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${program.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                    {program.status}
                                </span>
                                <button className="text-stone-400 hover:text-stone-600">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-purple-700 transition-colors">{program.name}</h3>
                        <p className="text-sm text-stone-500 mb-6 line-clamp-2">{program.description}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-stone-100 text-sm">
                            <div className="flex items-center gap-1 text-stone-600">
                                <Users size={16} />
                                <span className="font-medium">{program.members} Members</span>
                            </div>
                            <div className="flex items-center gap-1 text-stone-600">
                                <Calendar size={16} />
                                <span className="font-medium">{program.cohorts} Cohorts</span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Card */}
                <div className="border-2 border-dashed border-stone-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-purple-300 hover:bg-stone-50 cursor-pointer transition-colors min-h-[200px]">
                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-stone-400">
                        <Plus size={24} />
                    </div>
                    <p className="font-bold text-stone-600">Create New Program</p>
                    <p className="text-xs text-stone-400 mt-1">Add a learning track</p>
                </div>
            </div>
        </div>
    );
}
