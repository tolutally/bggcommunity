"use client";

import { Briefcase, Search, MapPin, Building2, Clock, Filter, Users } from "lucide-react";
import { useState } from "react";

const MOCK_JOBS = [
    {
        id: 1,
        company: "CGI",
        logo: "CGI",
        logoColor: "from-rose-500 to-rose-600",
        title: "Java Developer",
        location: "Toronto, ON",
        flag: "🇨🇦",
        type: "Permanent Full-time",
        typeColor: "bg-green-500",
        workMode: "Hybrid",
        postedAt: "2 days ago",
        referralAvailable: true,
    },
    {
        id: 2,
        company: "CGI",
        logo: "CGI",
        logoColor: "from-rose-500 to-rose-600",
        title: "Campus Talent Acquisition Specialist",
        location: "Toronto, ON",
        flag: "🇨🇦",
        type: "Contract Full-time",
        typeColor: "bg-amber-500",
        workMode: "Hybrid",
        postedAt: "a month ago",
        referralAvailable: false,
    },
    {
        id: 3,
        company: "Shopify",
        logo: "S",
        logoColor: "from-green-500 to-emerald-600",
        title: "Senior Product Manager",
        location: "Remote, Canada",
        flag: "🇨🇦",
        type: "Permanent Full-time",
        typeColor: "bg-green-500",
        workMode: "Remote",
        postedAt: "1 week ago",
        referralAvailable: true,
    },
    {
        id: 4,
        company: "Google",
        logo: "G",
        logoColor: "from-blue-500 to-blue-600",
        title: "UX Designer",
        location: "New York, NY",
        flag: "🇺🇸",
        type: "Permanent Full-time",
        typeColor: "bg-green-500",
        workMode: "On-site",
        postedAt: "3 days ago",
        referralAvailable: true,
    },
    {
        id: 5,
        company: "Microsoft",
        logo: "M",
        logoColor: "from-cyan-500 to-blue-600",
        title: "Software Engineer II",
        location: "Seattle, WA",
        flag: "🇺🇸",
        type: "Permanent Full-time",
        typeColor: "bg-green-500",
        workMode: "Hybrid",
        postedAt: "5 days ago",
        referralAvailable: false,
    },
];

export default function JobsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-stone-900">Job Board</h1>
                <p className="text-stone-500 mt-1">Discover opportunities from our partner companies</p>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search jobs, companies, skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-200 transition-colors">
                        <MapPin size={16} /> Location
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-200 transition-colors">
                        <Filter size={16} /> Filters
                    </button>
                </div>
            </div>

            {/* Job Listings */}
            <div className="space-y-4">
                {MOCK_JOBS.map((job) => (
                    <div
                        key={job.id}
                        className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-brand-200 hover:shadow-lg transition-all cursor-pointer group"
                    >
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            {/* Company Logo */}
                            <div className={`w-14 h-14 bg-gradient-to-br ${job.logoColor} rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                                {job.logo}
                            </div>

                            {/* Job Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-stone-700">{job.company}</span>
                                    <span className="text-stone-300">•</span>
                                    <span className="text-sm text-stone-400">{job.postedAt}</span>
                                </div>
                                <h3 className="text-lg font-bold text-stone-900 group-hover:text-brand-700 transition-colors mb-2">
                                    {job.title}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600">
                                        {job.flag} {job.location}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600">
                                        <span className={`w-1.5 h-1.5 ${job.typeColor} rounded-full`}></span>
                                        {job.type}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                        {job.workMode}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
                                <button className="px-5 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm">
                                    Apply
                                </button>
                                {job.referralAvailable && (
                                    <button className="px-5 py-2.5 bg-accent-100 text-accent-700 font-bold rounded-xl hover:bg-accent-200 transition-colors text-sm flex items-center gap-1.5">
                                        <Users size={14} />
                                        Seek Referral
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More */}
            <div className="text-center">
                <button className="px-8 py-3 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-full transition-colors">
                    Load More Jobs
                </button>
            </div>
        </div>
    );
}
