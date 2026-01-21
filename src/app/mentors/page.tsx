"use client";

import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Search, MapPin, Calendar, Clock, Star, ArrowRight, X, CheckCircle, MessageSquare, MoreHorizontal, Heart, FileText, NotebookPen, Plus, UserCheck, Shield, Award, Briefcase, Mail } from "lucide-react";

export default function Page() {
    const { role } = useUser();

    if (role === 'mentor') {
        return <MenteesView />;
    }

    if (role === 'admin') {
        return <AdminMentorsView />;
    }

    return <MentorsView />;
}

// --- Admin View ---

function AdminMentorsView() {
    const [activeTab, setActiveTab] = useState<'active' | 'applications'>('active');
    const [selectedMentor, setSelectedMentor] = useState<any>(null); // For detail modal

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

// --- Mentees View (For Mentors) ---

function MenteesView() {
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
                <h1 className="text-3xl font-bold text-stone-900">Mentor Dashboard</h1>
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
                    <h2 className="text-xl font-bold text-stone-900">My Mentees</h2>
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

// --- Mentors View (For Members) ---

function MentorsView() {
    const [selectedMentor, setSelectedMentor] = useState<any>(null);

    const myMentors = [
        {
            id: 2,
            name: "Sarah Jenkins",
            title: "Staff Engineer @ Netflix",
            image: "https://i.pravatar.cc/150?u=sarah",
            nextSession: "Tue, Oct 25 • 2:00 PM",
            status: "Booked"
        }
    ];

    const mentors = [
        {
            id: 1,
            name: "Dr. Alisha Reid",
            title: "Senior Product Manager @ Google",
            bio: "10+ years in product management. Passionate about helping women break into tech leadership roles.",
            tags: ["Product Strategy", "Leadership", "Resume Review"],
            availability: "Tue, Thu",
            image: "https://i.pravatar.cc/150?u=alisha"
        },
        {
            id: 3,
            name: "Maya Patel",
            title: "Design Director @ Airbnb",
            bio: "Leading design teams to build inclusive products. Specializing in design systems and accessible UX.",
            tags: ["UX/UI", "Design Systems", "Portfolio"],
            availability: "Fri",
            image: "https://i.pravatar.cc/150?u=maya"
        },
        {
            id: 4,
            name: "Elena Rodriguez",
            title: "CTO @ TechStart",
            bio: "Scaling engineering teams from 0 to 50. Happy to discuss startup challenges and technical strategy.",
            tags: ["Engineering Management", "Startups", "Scalability"],
            availability: "Mon, Fri",
            image: "https://i.pravatar.cc/150?u=elena"
        }
    ];

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Mentorship</h1>
                    <p className="text-stone-500 mt-1">Connect with industry leaders for 1:1 guidance.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, role, or company..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* My Mentors */}
            <section>
                <h2 className="text-xl font-bold text-stone-900 mb-4">My Mentors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myMentors.map(mentor => (
                        <div key={mentor.id} className="bg-white rounded-2xl border border-purple-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                            <img src={mentor.image} alt={mentor.name} className="h-16 w-16 rounded-full object-cover border-2 border-purple-100" />
                            <div>
                                <h3 className="font-bold text-stone-900">{mentor.name}</h3>
                                <p className="text-xs text-purple-700 font-semibold mb-1">{mentor.title}</p>
                                <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold w-fit">
                                    <Clock size={10} /> {mentor.nextSession}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="border-2 border-dashed border-stone-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-purple-300 hover:bg-stone-50 cursor-pointer transition-colors">
                        <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 text-stone-400">
                            <Plus size={20} />
                        </div>
                        <p className="font-semibold text-stone-600">Find a Mentor</p>
                    </div>
                </div>
            </section>

            {/* Explore Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-stone-900">Explore Mentors</h2>
                    <div className="flex gap-2 overflow-x-auto">
                        {["All", "Product", "Engineering", "Design", "Marketing"].map(tag => (
                            <button key={tag} className="px-3 py-1 bg-white border border-stone-200 rounded-full text-xs font-semibold text-stone-600 hover:border-purple-300 hover:text-purple-700 whitespace-nowrap transition-colors">
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mentors.map(mentor => (
                        <div key={mentor.id} className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col hover:border-purple-300 transition-colors group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="h-16 w-16 rounded-full overflow-hidden border border-stone-100">
                                    <img src={mentor.image} alt={mentor.name} className="h-full w-full object-cover" />
                                </div>
                                <span className="flex items-center gap-1 text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Available
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-stone-900 group-hover:text-purple-700 transition-colors">{mentor.name}</h3>
                            <p className="text-sm font-medium text-purple-600 mb-3">{mentor.title}</p>
                            <p className="text-stone-600 text-sm leading-relaxed mb-6 line-clamp-3">
                                {mentor.bio}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                                {mentor.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-stone-50 text-stone-500 text-xs font-semibold rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                                <div className="flex items-center gap-1 text-xs text-stone-500">
                                    <Calendar size={14} /> {mentor.availability}
                                </div>
                                <button
                                    onClick={() => setSelectedMentor(mentor)}
                                    className="flex items-center gap-2 text-sm font-bold text-stone-900 hover:text-purple-700"
                                >
                                    Book Session <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Booking Modal (Mock) */}
            {selectedMentor && (
                <BookingModal mentor={selectedMentor} onClose={() => setSelectedMentor(null)} />
            )}
        </div>
    );
}

function BookingModal({ mentor, onClose }: any) {
    const [step, setStep] = useState(1);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Book Session</h3>
                    <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full"><X size={20} /></button>
                </div>

                <div className="p-8">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <img src={mentor.image} className="w-16 h-16 rounded-full" />
                                <div>
                                    <h4 className="font-bold text-lg">{mentor.name}</h4>
                                    <p className="text-sm text-stone-500">{mentor.title}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-2">Select a Date</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button className="py-2 border border-purple-600 bg-purple-50 text-purple-700 font-semibold rounded-lg text-sm">Oct 24</button>
                                    <button className="py-2 border border-stone-200 text-stone-600 hover:border-purple-300 rounded-lg text-sm">Oct 26</button>
                                    <button className="py-2 border border-stone-200 text-stone-600 hover:border-purple-300 rounded-lg text-sm">Oct 28</button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-2">Available Times (EST)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="py-2 px-4 border border-stone-200 rounded-lg text-sm text-center hover:border-purple-600 hover:text-purple-600">10:00 AM</button>
                                    <button className="py-2 px-4 border border-stone-200 rounded-lg text-sm text-center hover:border-purple-600 hover:text-purple-600">2:30 PM</button>
                                </div>
                            </div>

                            <button onClick={() => setStep(2)} className="w-full py-3 bg-purple-900 text-white font-bold rounded-xl hover:bg-purple-800 transition-colors">
                                Continue
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h4 className="text-2xl font-bold text-stone-900 mb-2">Request Sent!</h4>
                            <p className="text-stone-500 mb-8">
                                {mentor.name} will review your request. You'll receive a confirmation email shortly.
                            </p>
                            <button onClick={onClose} className="px-8 py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 transition-colors">
                                Back to Mentors
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
