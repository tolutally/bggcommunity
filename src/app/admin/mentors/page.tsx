"use client";

import React, { useState } from "react";
import { Search, Star, UserCheck, FileText, X, Mail, Shield, Briefcase, Award } from "lucide-react";

export default function AdminMentorsPage() {
    const [activeTab, setActiveTab] = useState<'active' | 'applications'>('active');
    const [selectedMentor, setSelectedMentor] = useState<any>(null);

    const pendingApps = [
        {
            id: 101,
            name: "Zoe Kudjoe",
            role: "Senior UX Researcher",
            company: "Spotify",
            bio: "Passionate about inclusive design and accessibility. Want to help others navigate the research field.",
            appliedDate: "2 days ago",
            status: "Pending Review",
            avatar: "https://i.pravatar.cc/150?u=zoe"
        },
        {
            id: 102,
            name: "Fatima Ali",
            role: "Backend Engineer",
            company: "Shopify",
            bio: "Experienced in Ruby on Rails and Go. I can help with system design interviews and career growth.",
            appliedDate: "5 days ago",
            status: "Pending Review",
            avatar: "https://i.pravatar.cc/150?u=fatima"
        }
    ];

    const activeMentors = [
        {
            id: 1,
            name: "Dr. Alisha Reid",
            title: "Senior Product Manager",
            company: "Google",
            email: "alisha.r@google.com",
            bio: "10+ years in product management. Passionate about helping women break into tech leadership roles.",
            tags: ["Product Strategy", "Leadership", "Resume Review"],
            availability: "Tue, Thu",
            image: "https://i.pravatar.cc/150?u=alisha",
            mentees: 4,
            capacity: "Full",
            rating: 4.9,
            joinedDate: "Jan 2024",
            totalSessions: 45
        },
        {
            id: 3,
            name: "Maya Patel",
            title: "Design Director",
            company: "Airbnb",
            email: "maya@airbnb.com",
            bio: "Leading design teams to build inclusive products. Specializing in design systems and accessible UX.",
            tags: ["UX/UI", "Design Systems", "Portfolio"],
            availability: "Fri",
            image: "https://i.pravatar.cc/150?u=maya",
            mentees: 2,
            capacity: "Open",
            rating: 5.0,
            joinedDate: "Mar 2024",
            totalSessions: 28
        },
        {
            id: 4,
            name: "Elena Rodriguez",
            title: "CTO",
            company: "TechStart",
            email: "elena@techstart.io",
            bio: "Scaling engineering teams from 0 to 50. Happy to discuss startup challenges and technical strategy.",
            tags: ["Engineering Management", "Startups", "Scalability"],
            availability: "Mon, Fri",
            image: "https://i.pravatar.cc/150?u=elena",
            mentees: 1,
            capacity: "Open",
            rating: 4.8,
            joinedDate: "Feb 2024",
            totalSessions: 12
        }
    ];

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Mentor Network</h1>
                    <p className="text-stone-500 mt-1">Manage applications, monitor capacity, and review performance.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl shadow-sm">
                        <UserCheck size={18} className="text-purple-600" />
                        <span className="font-bold text-stone-900">42 Active</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl shadow-sm">
                        <FileText size={18} className="text-amber-600" />
                        <span className="font-bold text-stone-900">2 Pending</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-stone-200 flex gap-8">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`pb-4 px-2 font-bold text-sm transition-colors relative ${activeTab === 'active' ? 'text-purple-700' : 'text-stone-500 hover:text-stone-700'}`}
                >
                    Active Directory
                    {activeTab === 'active' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-700 rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('applications')}
                    className={`pb-4 px-2 font-bold text-sm transition-colors relative flex items-center gap-2 ${activeTab === 'applications' ? 'text-purple-700' : 'text-stone-500 hover:text-stone-700'}`}
                >
                    Applications
                    <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-full">2</span>
                    {activeTab === 'applications' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-700 rounded-t-full"></div>}
                </button>
            </div>

            {/* Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'active' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeMentors.map(mentor => (
                            <div
                                key={mentor.id}
                                onClick={() => setSelectedMentor(mentor)}
                                className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-purple-300 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <img src={mentor.image} className="w-14 h-14 rounded-full object-cover border border-stone-100" />
                                        <div>
                                            <h3 className="font-bold text-stone-900 group-hover:text-purple-700 transition-colors">{mentor.name}</h3>
                                            <p className="text-xs text-stone-500">{mentor.title} @ {mentor.company}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${mentor.capacity === 'Full' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                                        {mentor.capacity}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-stone-50 mb-4">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-stone-900">{mentor.rating}</div>
                                        <div className="text-[10px] text-stone-400 font-medium uppercase">Rating</div>
                                    </div>
                                    <div className="text-center border-l border-stone-100">
                                        <div className="text-lg font-bold text-stone-900">{mentor.mentees}</div>
                                        <div className="text-[10px] text-stone-400 font-medium uppercase">Mentees</div>
                                    </div>
                                    <div className="text-center border-l border-stone-100">
                                        <div className="text-lg font-bold text-stone-900">{mentor.totalSessions}</div>
                                        <div className="text-[10px] text-stone-400 font-medium uppercase">Sessions</div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {mentor.tags.slice(0, 3).map((tag: string) => (
                                        <span key={tag} className="bg-stone-50 text-stone-600 px-2 py-1 rounded text-xs font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingApps.map(app => (
                            <div key={app.id} className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4 max-w-2xl">
                                    <img src={app.avatar} className="w-16 h-16 rounded-full object-cover border border-stone-100" />
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-stone-900">{app.name}</h3>
                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">{app.status}</span>
                                        </div>
                                        <p className="text-sm text-stone-600 font-medium mb-2">{app.role} at {app.company}</p>
                                        <p className="text-sm text-stone-500">{app.bio}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button className="flex-1 md:flex-none px-6 py-2.5 border border-stone-200 rounded-xl font-bold text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors">
                                        Review App
                                    </button>
                                    <button className="flex-1 md:flex-none px-6 py-2.5 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10">
                                        Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Mentor Detail Modal */}
            {selectedMentor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="relative h-32 bg-purple-900">
                            <button onClick={() => setSelectedMentor(null)} className="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 backdrop-blur-md">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="px-8 pb-8">
                            <div className="flex justify-between items-end -mt-12 mb-6">
                                <img src={selectedMentor.image} className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white object-cover" />
                                <div className="flex gap-2 mb-2">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-sm font-bold hover:bg-stone-200">
                                        <Mail size={16} /> Email
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-bold hover:bg-purple-100">
                                        <Shield size={16} /> Admin Actions
                                    </button>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-stone-900">{selectedMentor.name}</h2>
                                <p className="text-purple-600 font-medium">{selectedMentor.title} @ {selectedMentor.company}</p>
                                <p className="mt-4 text-stone-600 leading-relaxed">{selectedMentor.bio}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                                    <div className="flex items-center gap-2 text-sm font-bold text-stone-500 mb-1 uppercase tracking-wider">
                                        <Briefcase size={14} /> Expertise
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedMentor.tags.map((tag: any) => (
                                            <span key={tag} className="text-sm font-medium text-stone-900 bg-white px-2 py-1 rounded shadow-sm border border-stone-100">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                                    <div className="flex items-center gap-2 text-sm font-bold text-stone-500 mb-3 uppercase tracking-wider">
                                        <Award size={14} /> Stats
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-stone-600">Member Since</span>
                                            <span className="font-bold text-stone-900">{selectedMentor.joinedDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-stone-600">Total Sessions</span>
                                            <span className="font-bold text-stone-900">{selectedMentor.totalSessions}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-stone-600">Avg Rating</span>
                                            <span className="font-bold text-stone-900 flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" /> {selectedMentor.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-lg text-stone-900 mb-4">Recent Notes</h3>
                                <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 text-sm text-stone-500 italic text-center py-6">
                                    No admin notes yet.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
