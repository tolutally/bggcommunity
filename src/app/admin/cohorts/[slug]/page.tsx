"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Users,
    Calendar,
    Clock,
    CheckCircle2,
    MoreHorizontal,
    FileText,
    Video,
    Download,
    Search,
    Plus,
    Mail,
    UserPlus,
    BarChart3,
    GraduationCap,
    Settings,
    Pencil,
} from "lucide-react";

// --- Mock Data ---
const COHORT_DATA: Record<string, any> = {
    alpha: {
        name: "Cohort Alpha",
        track: "Engineering",
        description: "Full-stack engineering intensive — building production-ready applications with modern tools. Members work through real-world projects covering frontend frameworks, backend APIs, databases, and deployment pipelines.",
        status: "Active",
        phase: "Week 3: Research & Planning",
        startDate: "Jan 6, 2026",
        endDate: "Apr 3, 2026",
        health: "High",
        activeRate: 95,
        maxMembers: 50,
        members: [
            { id: 1, name: "Tiana Brooks", avatar: "https://i.pravatar.cc/150?u=tiana", role: "Member", status: "Active", joinedAt: "Jan 6, 2026", progress: 72 },
            { id: 2, name: "Jasmine Cole", avatar: "https://i.pravatar.cc/150?u=jasmine", role: "Member", status: "Active", joinedAt: "Jan 6, 2026", progress: 85 },
            { id: 3, name: "Amara Osei", avatar: "https://i.pravatar.cc/150?u=amara", role: "Member", status: "Active", joinedAt: "Jan 7, 2026", progress: 60 },
            { id: 4, name: "Deja Williams", avatar: "https://i.pravatar.cc/150?u=deja", role: "Member", status: "Inactive", joinedAt: "Jan 6, 2026", progress: 30 },
            { id: 5, name: "Keisha Johnson", avatar: "https://i.pravatar.cc/150?u=keisha", role: "Facilitator", status: "Active", joinedAt: "Jan 3, 2026", progress: 100 },
            { id: 6, name: "Nia Thomas", avatar: "https://i.pravatar.cc/150?u=nia", role: "Member", status: "Active", joinedAt: "Jan 6, 2026", progress: 55 },
        ],
        sessions: [
            { id: 1, title: "Week 3: System Design Workshop", date: "Feb 24, 2026", time: "6:00 PM EST", status: "upcoming", attendees: 38 },
            { id: 2, title: "Week 3: Code Review Session", date: "Feb 26, 2026", time: "6:00 PM EST", status: "upcoming", attendees: 35 },
            { id: 3, title: "Week 2: API Development", date: "Feb 17, 2026", time: "6:00 PM EST", status: "completed", attendees: 40 },
            { id: 4, title: "Week 2: Database Design", date: "Feb 19, 2026", time: "6:00 PM EST", status: "completed", attendees: 42 },
            { id: 5, title: "Week 1: Program Kickoff", date: "Feb 10, 2026", time: "6:00 PM EST", status: "completed", attendees: 42 },
        ],
        resources: [
            { id: 1, title: "System Design Primer", type: "PDF", size: "2.4 MB", date: "Feb 20" },
            { id: 2, title: "Week 2 Recording: API Dev", type: "VIDEO", size: "890 MB", date: "Feb 17" },
            { id: 3, title: "Project Starter Repo", type: "ZIP", size: "12 MB", date: "Feb 10" },
            { id: 4, title: "Cohort Handbook", type: "PDF", size: "1.1 MB", date: "Jan 6" },
        ],
    },
    beta: {
        name: "Cohort Beta",
        track: "Product Design",
        description: "Product design bootcamp — from user research to high-fidelity prototyping. Members learn design thinking, Figma, usability testing, and how to build design systems from scratch.",
        status: "Active",
        phase: "Week 1: Onboarding",
        startDate: "Feb 3, 2026",
        endDate: "May 1, 2026",
        health: "Medium",
        activeRate: 82,
        maxMembers: 35,
        members: [
            { id: 1, name: "Maya Johnson", avatar: "https://i.pravatar.cc/150?u=maya2", role: "Member", status: "Active", joinedAt: "Feb 3, 2026", progress: 20 },
            { id: 2, name: "Zara Mitchell", avatar: "https://i.pravatar.cc/150?u=zara", role: "Member", status: "Active", joinedAt: "Feb 3, 2026", progress: 15 },
            { id: 3, name: "Imani Davis", avatar: "https://i.pravatar.cc/150?u=imani", role: "Facilitator", status: "Active", joinedAt: "Feb 1, 2026", progress: 100 },
            { id: 4, name: "Aaliyah Brown", avatar: "https://i.pravatar.cc/150?u=aaliyah", role: "Member", status: "Inactive", joinedAt: "Feb 3, 2026", progress: 5 },
        ],
        sessions: [
            { id: 1, title: "Week 1: Design Thinking Workshop", date: "Feb 24, 2026", time: "7:00 PM EST", status: "upcoming", attendees: 24 },
            { id: 2, title: "Week 1: Orientation", date: "Feb 20, 2026", time: "6:00 PM EST", status: "completed", attendees: 28 },
        ],
        resources: [
            { id: 1, title: "Design Thinking Guide", type: "PDF", size: "3.2 MB", date: "Feb 3" },
            { id: 2, title: "Figma Starter Kit", type: "ZIP", size: "8 MB", date: "Feb 3" },
        ],
    },
    gamma: {
        name: "Cohort Gamma",
        track: "Data Science",
        description: "Data science foundations — statistics, Python, and machine learning fundamentals. Pre-enrollment phase with orientation materials available.",
        status: "Upcoming",
        phase: "Enrollment Open",
        startDate: "Mar 10, 2026",
        endDate: "Jun 5, 2026",
        health: "High",
        activeRate: 0,
        maxMembers: 40,
        members: [
            { id: 1, name: "Destiny Clark", avatar: "https://i.pravatar.cc/150?u=destiny", role: "Member", status: "Enrolled", joinedAt: "Feb 15, 2026", progress: 0 },
            { id: 2, name: "Raven Scott", avatar: "https://i.pravatar.cc/150?u=raven", role: "Facilitator", status: "Active", joinedAt: "Feb 10, 2026", progress: 0 },
        ],
        sessions: [
            { id: 1, title: "Orientation & Welcome", date: "Mar 10, 2026", time: "6:00 PM EST", status: "upcoming", attendees: 18 },
        ],
        resources: [
            { id: 1, title: "Pre-reading: Stats Fundamentals", type: "PDF", size: "1.8 MB", date: "Feb 15" },
        ],
    },
    pioneer: {
        name: "Cohort Pioneer",
        track: "Product Management",
        description: "Product management accelerator — strategy, roadmapping, and stakeholder management. This cohort has successfully completed the full 12-week program.",
        status: "Completed",
        phase: "Completed",
        startDate: "Sep 1, 2025",
        endDate: "Dec 15, 2025",
        health: "High",
        activeRate: 100,
        maxMembers: 35,
        members: [
            { id: 1, name: "Brianna Lewis", avatar: "https://i.pravatar.cc/150?u=brianna", role: "Member", status: "Graduated", joinedAt: "Sep 1, 2025", progress: 100 },
            { id: 2, name: "Kayla Robinson", avatar: "https://i.pravatar.cc/150?u=kayla", role: "Member", status: "Graduated", joinedAt: "Sep 1, 2025", progress: 100 },
            { id: 3, name: "Gabrielle Harris", avatar: "https://i.pravatar.cc/150?u=gabrielle", role: "Facilitator", status: "Graduated", joinedAt: "Aug 25, 2025", progress: 100 },
        ],
        sessions: [
            { id: 1, title: "Demo Day & Graduation", date: "Dec 15, 2025", time: "5:00 PM EST", status: "completed", attendees: 35 },
            { id: 2, title: "Week 12: Final Presentations", date: "Dec 12, 2025", time: "6:00 PM EST", status: "completed", attendees: 33 },
        ],
        resources: [
            { id: 1, title: "Final Project Guidelines", type: "PDF", size: "900 KB", date: "Nov 20" },
            { id: 2, title: "Demo Day Recording", type: "VIDEO", size: "1.2 GB", date: "Dec 15" },
        ],
    },
};

type Tab = "overview" | "members" | "sessions" | "resources";

export default function AdminCohortDetailPage() {
    const { slug } = useParams();
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [memberSearch, setMemberSearch] = useState("");

    const cohort = COHORT_DATA[slug as string];

    if (!cohort) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-2xl font-bold text-stone-900">Cohort not found</h2>
                <Link href="/admin/cohorts" className="text-brand-600 hover:underline mt-2 inline-block">
                    Back to Cohorts
                </Link>
            </div>
        );
    }

    const tabs: { key: Tab; label: string; count?: number }[] = [
        { key: "overview", label: "Overview" },
        { key: "members", label: "Members", count: cohort.members.length },
        { key: "sessions", label: "Sessions", count: cohort.sessions.length },
        { key: "resources", label: "Resources", count: cohort.resources.length },
    ];

    const filteredMembers = cohort.members.filter((m: any) =>
        m.name.toLowerCase().includes(memberSearch.toLowerCase())
    );

    const statusBadge = cohort.status === "Active"
        ? "bg-green-50 text-green-700"
        : cohort.status === "Upcoming"
        ? "bg-blue-50 text-blue-700"
        : "bg-stone-100 text-stone-600";

    return (
        <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-6">
            {/* Back + Header */}
            <Link
                href="/admin/cohorts"
                className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-brand-700 transition-colors mb-2"
            >
                <ArrowLeft size={16} /> Back to Cohorts
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-brand-50 text-brand-700 rounded-2xl">
                        <GraduationCap size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl md:text-3xl font-bold text-stone-900">{cohort.name}</h1>
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusBadge}`}>
                                {cohort.status}
                            </span>
                        </div>
                        <p className="text-stone-500 text-sm mt-1">{cohort.track} Track &bull; {cohort.startDate} – {cohort.endDate}</p>
                    </div>
                </div>
                <div className="flex gap-2 self-start">
                    <button className="px-4 py-2.5 bg-white border border-stone-200 text-stone-600 rounded-xl font-semibold text-sm hover:bg-stone-50 transition-colors flex items-center gap-2">
                        <Settings size={16} /> Settings
                    </button>
                    <button className="px-4 py-2.5 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors flex items-center gap-2">
                        <UserPlus size={16} /> Add Members
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-stone-200 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-3 text-sm font-semibold transition-colors whitespace-nowrap border-b-2 ${
                            activeTab === tab.key
                                ? "border-brand-600 text-brand-700"
                                : "border-transparent text-stone-500 hover:text-stone-700"
                        }`}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className="ml-2 text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* === Overview Tab === */}
            {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                            <h3 className="font-bold text-stone-900 mb-2">About this Cohort</h3>
                            <p className="text-stone-600 text-sm leading-relaxed">{cohort.description}</p>
                        </div>

                        {/* Progress */}
                        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-stone-900">Current Phase</h3>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                    cohort.health === "High" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                }`}>
                                    {cohort.health} Health
                                </span>
                            </div>
                            <div className="bg-stone-50 rounded-xl p-4">
                                <p className="text-sm font-bold text-stone-800 mb-3">{cohort.phase}</p>
                                <div className="w-full bg-stone-200 rounded-full h-2 mb-2">
                                    <div
                                        className="bg-brand-600 h-2 rounded-full transition-all"
                                        style={{ width: `${cohort.activeRate}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-stone-500">{cohort.activeRate}% member activity rate</p>
                            </div>
                        </div>

                        {/* Upcoming Sessions Preview */}
                        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-stone-900">Upcoming Sessions</h3>
                                <button onClick={() => setActiveTab("sessions")} className="text-sm text-brand-600 font-semibold hover:text-brand-800">
                                    View all
                                </button>
                            </div>
                            <div className="space-y-3">
                                {cohort.sessions.filter((s: any) => s.status === "upcoming").length === 0 ? (
                                    <p className="text-sm text-stone-400 py-4 text-center">No upcoming sessions scheduled.</p>
                                ) : (
                                    cohort.sessions.filter((s: any) => s.status === "upcoming").map((session: any) => (
                                        <div key={session.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-brand-100 text-brand-700 rounded-lg">
                                                    <Video size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-stone-800">{session.title}</p>
                                                    <p className="text-xs text-stone-500">{session.date} &bull; {session.time}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium text-stone-500">{session.attendees} RSVPs</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column — Stats */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-5">
                            <h3 className="font-bold text-stone-900">Cohort Stats</h3>
                            <div className="space-y-4">
                                <StatRow icon={Users} label="Members" value={`${cohort.members.length} / ${cohort.maxMembers}`} />
                                <StatRow icon={Calendar} label="Start" value={cohort.startDate} />
                                <StatRow icon={Calendar} label="End" value={cohort.endDate} />
                                <StatRow icon={Clock} label="Phase" value={cohort.phase} />
                                <StatRow icon={BarChart3} label="Active Rate" value={`${cohort.activeRate}%`} />
                                <StatRow icon={CheckCircle2} label="Sessions Done" value={`${cohort.sessions.filter((s: any) => s.status === "completed").length}`} />
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                            <h3 className="font-bold text-stone-900 mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-sm font-medium text-stone-700">
                                    <Mail size={16} className="text-stone-400" /> Send Announcement
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-sm font-medium text-stone-700">
                                    <Plus size={16} className="text-stone-400" /> Schedule Session
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-sm font-medium text-stone-700">
                                    <FileText size={16} className="text-stone-400" /> Upload Resource
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-sm font-medium text-stone-700">
                                    <UserPlus size={16} className="text-stone-400" /> Add Members
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* === Members Tab === */}
            {activeTab === "members" && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none"
                            />
                        </div>
                        <button className="px-5 py-2.5 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors flex items-center gap-2">
                            <UserPlus size={16} /> Add Members
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px]">
                                <thead>
                                    <tr className="border-b border-stone-100 bg-stone-50">
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Member</th>
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Role</th>
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Status</th>
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Progress</th>
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Joined</th>
                                        <th className="text-right text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {filteredMembers.map((member: any) => (
                                        <tr key={member.id} className="hover:bg-stone-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={member.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                                                    <span className="font-semibold text-stone-900 text-sm">{member.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                                    member.role === "Facilitator" ? "bg-brand-100 text-brand-700" : "bg-stone-100 text-stone-600"
                                                }`}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                                                    member.status === "Active" || member.status === "Graduated"
                                                        ? "text-green-600"
                                                        : member.status === "Enrolled"
                                                        ? "text-blue-600"
                                                        : "text-stone-400"
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        member.status === "Active" || member.status === "Graduated"
                                                            ? "bg-green-500"
                                                            : member.status === "Enrolled"
                                                            ? "bg-blue-500"
                                                            : "bg-stone-300"
                                                    }`}></span>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 bg-stone-200 rounded-full h-1.5">
                                                        <div className="bg-brand-600 h-1.5 rounded-full" style={{ width: `${member.progress}%` }}></div>
                                                    </div>
                                                    <span className="text-xs font-medium text-stone-600">{member.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-500">{member.joinedAt}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* === Sessions Tab === */}
            {activeTab === "sessions" && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-stone-900">All Sessions</h3>
                        <button className="px-5 py-2.5 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors flex items-center gap-2">
                            <Plus size={16} /> Schedule Session
                        </button>
                    </div>

                    {cohort.sessions.filter((s: any) => s.status === "upcoming").length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Upcoming</p>
                            <div className="space-y-3">
                                {cohort.sessions.filter((s: any) => s.status === "upcoming").map((session: any) => (
                                    <div key={session.id} className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm flex items-center justify-between hover:border-brand-200 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-brand-50 text-brand-700">
                                                <Video size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-stone-900">{session.title}</h4>
                                                <p className="text-sm text-stone-500">{session.date} &bull; {session.time}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-stone-500">{session.attendees} RSVPs</span>
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase bg-blue-50 text-blue-700">
                                                Upcoming
                                            </span>
                                            <button className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
                                                <Pencil size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {cohort.sessions.filter((s: any) => s.status === "completed").length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Completed</p>
                            <div className="space-y-3">
                                {cohort.sessions.filter((s: any) => s.status === "completed").map((session: any) => (
                                    <div key={session.id} className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm flex items-center justify-between hover:border-stone-200 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-stone-100 text-stone-500">
                                                <Video size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-stone-900">{session.title}</h4>
                                                <p className="text-sm text-stone-500">{session.date} &bull; {session.time}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-stone-500">{session.attendees} attended</span>
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase bg-stone-100 text-stone-500">
                                                Completed
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* === Resources Tab === */}
            {activeTab === "resources" && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-stone-900">Resources</h3>
                        <button className="px-5 py-2.5 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors flex items-center gap-2">
                            <Plus size={16} /> Upload Resource
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[500px]">
                                <thead>
                                    <tr className="border-b border-stone-100 bg-stone-50">
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Name</th>
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Type</th>
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Size</th>
                                        <th className="text-left text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3">Date</th>
                                        <th className="text-right text-xs font-bold text-stone-500 uppercase tracking-wider px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {cohort.resources.map((resource: any) => {
                                        const typeColors: Record<string, string> = {
                                            PDF: "bg-rose-100 text-rose-700",
                                            VIDEO: "bg-blue-100 text-blue-700",
                                            ZIP: "bg-amber-100 text-amber-700",
                                        };
                                        return (
                                            <tr key={resource.id} className="hover:bg-stone-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <FileText size={18} className="text-stone-400" />
                                                        <span className="font-semibold text-stone-900 text-sm">{resource.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${typeColors[resource.type] || "bg-stone-100 text-stone-600"}`}>
                                                        {resource.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-stone-500">{resource.size}</td>
                                                <td className="px-6 py-4 text-sm text-stone-500">{resource.date}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 text-stone-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                                                        <Download size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-500">
                <Icon size={15} />
                <span className="text-sm">{label}</span>
            </div>
            <span className="text-sm font-semibold text-stone-800">{value}</span>
        </div>
    );
}
