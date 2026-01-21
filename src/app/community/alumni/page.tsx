"use client";

import { Search, MapPin, Briefcase } from "lucide-react";

export default function AlumniPage() {
    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-stone-900">Alumni Network</h1>
                <p className="text-stone-500 mt-1">Connect with graduates from previous cohorts.</p>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input type="text" placeholder="Search by name, company, or city..." className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <AlumniCard key={i} i={i} />
                ))}
            </div>
        </div>
    );
}

function AlumniCard({ i }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col items-center text-center hover:border-purple-300 transition-colors group">
            <img src={`https://i.pravatar.cc/150?u=${i + 10}`} className="w-20 h-20 rounded-full border-2 border-white shadow-sm mb-4" />
            <h3 className="font-bold text-stone-900 group-hover:text-purple-700">Alumni Member {i}</h3>
            <p className="text-sm text-stone-500 mb-4">Product Designer @ Spotify</p>

            <div className="flex flex-wrap justify-center gap-2 mb-4 w-full">
                <span className="px-2 py-1 bg-stone-50 text-stone-600 text-xs rounded-full flex items-center gap-1"><MapPin size={10} /> NYC</span>
                <span className="px-2 py-1 bg-stone-50 text-stone-600 text-xs rounded-full">Cohort 1</span>
            </div>

            <button className="w-full py-2 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors">Connect</button>
        </div>
    )
}
