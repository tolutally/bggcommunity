"use client";

import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import {
    MessageSquare,
    Calendar,
    Users,
    FolderOpen,
    Send,
    MoreHorizontal,
    Heart,
    MessageCircle,
    Share2,
    FileText,
    Video,
    Download,
    Clock
} from "lucide-react";
import { useParams } from "next/navigation";

export default function CohortPage() {
    const { slug } = useParams();
    const [activeTab, setActiveTab] = useState("feed");

    // Mock Data based on slug
    const cohortName = slug === "alpha" ? "Cohort Alpha" : "Cohort Beta";
    const description = slug === "alpha"
        ? "The inaugural cohort focusing on Product Design & Strategy."
        : "The second cohort focused on Engineering & Leadership.";

    return (
        <div className="flex bg-stone-50 min-h-full">
            <div className="flex-1 min-w-0">
                {/* Cohort Header */}
                <div className="bg-white border-b border-stone-200 px-6 py-8 md:px-10">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold text-stone-900 mb-2">{cohortName}</h1>
                        <p className="text-lg text-stone-500">{description}</p>

                        {/* Tabs */}
                        <div className="flex items-center gap-8 mt-8 border-b border-stone-100 -mb-8">
                            <TabButton
                                active={activeTab === "feed"}
                                onClick={() => setActiveTab("feed")}
                                label="Feed"
                                icon={MessageSquare}
                            />
                            <TabButton
                                active={activeTab === "sessions"}
                                onClick={() => setActiveTab("sessions")}
                                label="Sessions"
                                icon={Calendar}
                            />
                            <TabButton
                                active={activeTab === "resources"}
                                onClick={() => setActiveTab("resources")}
                                label="Resources"
                                icon={FolderOpen}
                            />
                            <TabButton
                                active={activeTab === "members"}
                                onClick={() => setActiveTab("members")}
                                label="Members"
                                icon={Users}
                            />
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="px-6 py-8 md:px-10 max-w-4xl mx-auto">
                    {activeTab === "feed" && <FeedTab />}
                    {activeTab === "sessions" && <SessionsTab />}
                    {activeTab === "resources" && <ResourcesTab />}
                    {activeTab === "members" && <MembersTab />}
                </div>
            </div>

            {/* Right Sidebar (Desktop Only - Contextual Info) */}
            <div className="hidden xl:block w-80 border-l border-stone-200 bg-white p-6 overflow-y-auto max-h-[calc(100vh-65px)]">
                <h3 className="font-bold text-stone-900 mb-4">Cohort Stats</h3>
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Members</span>
                        <span className="font-medium">42</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Posts this week</span>
                        <span className="font-medium">15</span>
                    </div>
                </div>

                <h3 className="font-bold text-stone-900 mb-4">Pinned Resources</h3>
                <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 flex items-center gap-3">
                        <FileText className="text-purple-600" size={18} />
                        <div>
                            <p className="text-sm font-semibold text-purple-900">Syllabus.pdf</p>
                            <p className="text-xs text-purple-600">Updated 2 days ago</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Tabs ---

function FeedTab() {
    return (
        <div className="space-y-6">
            {/* Composer */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
                <div className="flex gap-4">
                    <div className="h-10 w-10 bg-stone-200 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-stone-600">
                        N
                    </div>
                    <div className="flex-1">
                        <textarea
                            placeholder="Share an update, question, or resource..."
                            className="w-full resize-none border-none focus:ring-0 p-0 text-stone-700 placeholder:text-stone-400 min-h-[80px]"
                        ></textarea>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                            <div className="flex gap-2">
                                {/* Attachments icons could go here */}
                            </div>
                            <button className="bg-purple-900 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-purple-800 flex items-center gap-2">
                                <Send size={16} /> Post
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts */}
            <PostCard
                author="Sarah Jenkins"
                role="Mentor"
                time="2 hours ago"
                content="Just uploaded the slides from yesterday's workshop! Let me know if you have any questions about the user persona template."
                likes={12}
                comments={3}
            />
            <PostCard
                author="David Chen"
                role="Member"
                time="4 hours ago"
                content="Is anyone dealing with imposter syndrome this week? Feeling a bit overwhelmed by the scope of the new project assignments."
                likes={24}
                comments={8}
            />
        </div>
    )
}

function SessionsTab() {
    return (
        <div className="space-y-6">
            <h3 className="font-bold text-xl text-stone-900">Upcoming Schedule</h3>
            <div className="space-y-4">
                <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-6">
                        <div className="flex flex-col items-center justify-center w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl">
                            <span className="text-xs font-bold uppercase">OCT</span>
                            <span className="text-2xl font-bold">24</span>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-stone-900">Deep Dive: Systems Thinking</h4>
                            <p className="text-stone-500 flex items-center gap-2">
                                <Clock size={16} /> 2:00 PM - 3:30 PM EST
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="bg-stone-100 px-2 py-0.5 rounded text-xs font-semibold text-stone-600">Lecture</span>
                                <span className="bg-stone-100 px-2 py-0.5 rounded text-xs font-semibold text-stone-600">Mandatory</span>
                            </div>
                        </div>
                    </div>
                    <button className="px-6 py-2.5 bg-white border-2 border-purple-900 text-purple-900 font-bold rounded-xl hover:bg-purple-50 transition-colors">
                        Add to Calendar
                    </button>
                </div>
            </div>

            <h3 className="font-bold text-xl text-stone-900 mt-10">Recordings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group cursor-pointer">
                    <div className="aspect-video bg-stone-900 rounded-xl relative overflow-hidden mb-3">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Video className="text-white opacity-50 group-hover:opacity-100 transition-opacity" size={48} />
                        </div>
                    </div>
                    <h4 className="font-bold text-stone-900 group-hover:text-purple-700">Week 2: Kickoff</h4>
                    <p className="text-sm text-stone-500">Recorded Oct 10 • 1h 15m</p>
                </div>
            </div>
        </div>
    )
}

function ResourcesTab() {
    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <input type="text" placeholder="Search resources..." className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                <select className="bg-white border border-stone-200 rounded-xl px-4 py-2.5 outline-none">
                    <option>All Categories</option>
                    <option>Templates</option>
                    <option>Reading</option>
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-stone-200 flex items-start justify-between group hover:border-purple-300">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-stone-900">User Persona Template</h4>
                            <p className="text-sm text-stone-500">PDF • 2.4 MB</p>
                        </div>
                    </div>
                    <button className="text-stone-300 hover:text-purple-700"><Download size={20} /></button>
                </div>
            </div>
        </div>
    )
}

function MembersTab() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className="h-20 w-20 bg-stone-200 rounded-full overflow-hidden mb-4">
                        <img src={`https://i.pravatar.cc/150?u=${i}`} alt="Member" className="h-full w-full object-cover" />
                    </div>
                    <h3 className="font-bold text-stone-900">Member Name</h3>
                    <p className="text-sm text-stone-500 mb-4">Product Designer @ Tech</p>
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                        <span className="px-2 py-0.5 bg-stone-100 rounded text-[10px] font-semibold text-stone-600">Design</span>
                        <span className="px-2 py-0.5 bg-stone-100 rounded text-[10px] font-semibold text-stone-600">Research</span>
                    </div>
                    <button className="mt-auto w-full py-2 border border-stone-200 rounded-lg text-sm font-semibold hover:bg-stone-50">View Profile</button>
                </div>
            ))}
        </div>
    )
}

// --- Helper Components ---

function TabButton({ active, onClick, label, icon: Icon }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 pb-4 border-b-2 transition-all px-2 ${active ? 'border-purple-900 text-purple-900' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
        >
            <Icon size={18} />
            <span className="font-semibold">{label}</span>
        </button>
    )
}

function PostCard({ author, role, time, content, likes, comments }: any) {
    return (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">
                        {author[0]}
                    </div>
                    <div>
                        <h4 className="font-bold text-stone-900 text-sm">{author}</h4>
                        <p className="text-xs text-stone-500">{role} • {time}</p>
                    </div>
                </div>
                <button className="text-stone-400 hover:text-stone-600"><MoreHorizontal size={20} /></button>
            </div>
            <p className="text-stone-800 leading-relaxed mb-4">
                {content}
            </p>
            <div className="flex items-center gap-6 pt-4 border-t border-stone-100">
                <button className="flex items-center gap-2 text-stone-500 hover:text-rose-600 text-sm font-medium transition-colors">
                    <Heart size={18} /> {likes}
                </button>
                <button className="flex items-center gap-2 text-stone-500 hover:text-purple-600 text-sm font-medium transition-colors">
                    <MessageCircle size={18} /> {comments}
                </button>
                <button className="flex items-center gap-2 text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors ml-auto">
                    <Share2 size={18} /> Share
                </button>
            </div>
        </div>
    )
}
