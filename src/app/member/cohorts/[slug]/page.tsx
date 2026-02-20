"use client";

import React, { useState } from "react";
import {
    MessageSquare,
    Calendar,
    Users,
    Send,
    MoreHorizontal,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    FolderOpen,
    FileText,
    Download,
    Search,
    Video,
    Play,
    Briefcase,
    MapPin,
    BadgeCheck,
    X,
    Linkedin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";

export default function MemberCohortPage() {
    const { slug } = useParams();
    const [activeTab, setActiveTab] = useState("feed");

    // Mock Data based on slug
    const cohortName = slug === "alpha" ? "Cohort Alpha" : "Cohort Beta";
    const description = slug === "alpha"
        ? "The inaugural cohort focusing on Product Design & Strategy."
        : "The second cohort focused on Engineering & Leadership.";

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
            {/* Cohort Header */}
            <div>
                <h1 className="text-3xl font-bold text-stone-900 mb-2">{cohortName}</h1>
                <p className="text-lg text-stone-500">{description}</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-stone-200">
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

            {/* Tab Content */}
            <div>
                {activeTab === "feed" && <FeedTab />}
                {activeTab === "sessions" && <SessionsTab />}
                {activeTab === "resources" && <ResourcesTab />}
                {activeTab === "members" && <MembersTab />}
            </div>
        </div>
    );
}

// --- Tabs ---

function FeedTab() {
    const [posts, setPosts] = useState([
        {
            id: 1,
            author: "Sarah Jenkins",
            avatar: "https://i.pravatar.cc/150?u=sarah",
            role: "Mentor",
            time: "2 hours ago",
            title: "Workshop slides uploaded!",
            content: "Just uploaded the slides from yesterday's workshop! Let me know if you have any questions about the user persona template.",
            replies: [
                { id: 101, author: "David Chen", avatar: "https://i.pravatar.cc/150?u=david", time: "1 hour ago", content: "Thanks Sarah! The template is super helpful." }
            ]
        },
        {
            id: 2,
            author: "David Chen",
            avatar: "https://i.pravatar.cc/150?u=david",
            role: "Member",
            time: "4 hours ago",
            title: "Dealing with imposter syndrome",
            content: "Is anyone dealing with imposter syndrome this week? Feeling a bit overwhelmed by the scope of the new project assignments.",
            replies: [
                { id: 201, author: "Maya Patel", avatar: "https://i.pravatar.cc/150?u=maya", time: "3 hours ago", content: "You're not alone! Let's do a study session together?" },
                { id: 202, author: "Sarah Jenkins", avatar: "https://i.pravatar.cc/150?u=sarah", time: "2 hours ago", content: "David, this is totally normal. Remember, everyone here started somewhere. You belong here! 💪" }
            ]
        }
    ]);

    const [expandedPosts, setExpandedPosts] = useState<number[]>([1]);

    const toggleExpanded = (postId: number) => {
        setExpandedPosts(prev =>
            prev.includes(postId)
                ? prev.filter(id => id !== postId)
                : [...prev, postId]
        );
    };

    return (
        <div className="space-y-6">
            {/* Composer */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                <div className="flex gap-4">
                    <img src="https://i.pravatar.cc/150?u=nia" className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Start a discussion with your cohort..."
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none mb-3"
                        />
                        <div className="flex items-center justify-end">
                            <button className="bg-brand-800 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-brand-700 flex items-center gap-2">
                                <Send size={16} /> Post
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts */}
            {posts.map(post => (
                <div key={post.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <img src={post.avatar} className="h-10 w-10 rounded-full" />
                                <div>
                                    <span className="font-bold text-stone-900">{post.author}</span>
                                    <span className="ml-2 text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded">{post.role}</span>
                                    <span className="text-stone-400 text-sm flex items-center gap-1 mt-0.5">
                                        <Clock size={12} /> {post.time}
                                    </span>
                                </div>
                            </div>
                            <button className="text-stone-400 hover:text-stone-600">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>

                        <h3 className="text-lg font-bold text-stone-900 mb-2">{post.title}</h3>
                        <p className="text-stone-600 leading-relaxed">{post.content}</p>

                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stone-100">
                            <button
                                onClick={() => toggleExpanded(post.id)}
                                className="flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-brand-700"
                            >
                                <MessageCircle size={16} />
                                {post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}
                                {expandedPosts.includes(post.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            <button className="text-sm font-medium text-brand-700 hover:text-brand-800">
                                Add Reply
                            </button>
                        </div>
                    </div>

                    {expandedPosts.includes(post.id) && post.replies.length > 0 && (
                        <div className="bg-stone-50 border-t border-stone-100 px-6 py-4 space-y-4">
                            {post.replies.map(reply => (
                                <div key={reply.id} className="flex gap-3">
                                    <div className="w-0.5 bg-brand-200 rounded-full flex-shrink-0 ml-4"></div>
                                    <div className="flex-1 bg-white rounded-xl p-4 border border-stone-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <img src={reply.avatar} className="w-6 h-6 rounded-full" />
                                            <span className="font-semibold text-stone-900 text-sm">{reply.author}</span>
                                            <span className="text-stone-400 text-xs">{reply.time}</span>
                                        </div>
                                        <p className="text-stone-600 text-sm">{reply.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

function SessionsTab() {
    const recordings = [
        { id: 1, title: "Week 2: Kickoff", date: "Oct 10", duration: "1h 15m" },
        { id: 2, title: "Week 1: Orientation", date: "Oct 3", duration: "1h 30m" },
        { id: 3, title: "Pre-Program Welcome", date: "Sep 28", duration: "45m" },
    ];

    return (
        <div className="space-y-8">
            {/* Upcoming Schedule */}
            <div className="space-y-6">
                <h3 className="font-bold text-xl text-stone-900">Upcoming Schedule</h3>
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex gap-6">
                            <div className="flex flex-col items-center justify-center w-16 h-16 bg-brand-100 text-brand-700 rounded-2xl">
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
                                    <span className="bg-brand-100 px-2 py-0.5 rounded text-xs font-semibold text-brand-700">Mandatory</span>
                                </div>
                            </div>
                        </div>
                        <button className="px-6 py-2.5 bg-white border-2 border-brand-800 text-brand-800 font-bold rounded-xl hover:bg-brand-50 transition-colors">
                            Add to Calendar
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex gap-6">
                            <div className="flex flex-col items-center justify-center w-16 h-16 bg-stone-100 text-stone-600 rounded-2xl">
                                <span className="text-xs font-bold uppercase">OCT</span>
                                <span className="text-2xl font-bold">26</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-stone-900">Office Hours with Sarah</h4>
                                <p className="text-stone-500 flex items-center gap-2">
                                    <Clock size={16} /> 4:00 PM - 5:00 PM EST
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="bg-stone-100 px-2 py-0.5 rounded text-xs font-semibold text-stone-600">Q&A</span>
                                    <span className="bg-stone-100 px-2 py-0.5 rounded text-xs font-semibold text-stone-600">Optional</span>
                                </div>
                            </div>
                        </div>
                        <button className="px-6 py-2.5 bg-white border-2 border-brand-800 text-brand-800 font-bold rounded-xl hover:bg-brand-50 transition-colors">
                            Add to Calendar
                        </button>
                    </div>
                </div>
            </div>

            {/* Recordings Section */}
            <div className="space-y-6">
                <h3 className="font-bold text-xl text-stone-900">Recordings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recordings.map(recording => (
                        <div key={recording.id} className="group cursor-pointer">
                            {/* Video Thumbnail */}
                            <div className="aspect-video bg-stone-800 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-stone-700 transition-colors overflow-hidden relative">
                                <div className="w-14 h-14 bg-stone-700 group-hover:bg-stone-600 rounded-xl flex items-center justify-center transition-colors">
                                    <Video size={28} className="text-stone-400" />
                                </div>
                                {/* Play overlay on hover */}
                                <div className="absolute inset-0 bg-brand-800/0 group-hover:bg-brand-800/20 transition-colors flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white/0 group-hover:bg-white/90 rounded-full flex items-center justify-center transition-all scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100">
                                        <Play size={28} className="text-brand-800 ml-1" />
                                    </div>
                                </div>
                            </div>
                            {/* Recording Info */}
                            <h4 className="font-bold text-stone-900 group-hover:text-brand-800 transition-colors">{recording.title}</h4>
                            <p className="text-sm text-stone-500">Recorded {recording.date} • {recording.duration}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function ResourcesTab() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    const resources = [
        { id: 1, name: "User Persona Template", type: "PDF", size: "2.4 MB", category: "templates" },
        { id: 2, name: "Design Systems Guide", type: "PDF", size: "5.1 MB", category: "guides" },
        { id: 3, name: "Workshop Recording - Week 1", type: "VIDEO", size: "156 MB", category: "recordings" },
        { id: 4, name: "UX Research Methods Cheatsheet", type: "PDF", size: "1.2 MB", category: "templates" },
        { id: 5, name: "Figma Component Library", type: "ZIP", size: "8.7 MB", category: "assets" },
    ];

    const categories = [
        { value: "all", label: "All Categories" },
        { value: "templates", label: "Templates" },
        { value: "guides", label: "Guides" },
        { value: "recordings", label: "Recordings" },
        { value: "assets", label: "Assets" },
    ];

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getTypeColor = (type: string) => {
        switch (type) {
            case "PDF": return "bg-red-100 text-red-600";
            case "VIDEO": return "bg-blue-100 text-blue-600";
            case "ZIP": return "bg-amber-100 text-amber-600";
            default: return "bg-stone-100 text-stone-600";
        }
    };

    return (
        <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-700 font-medium focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none cursor-pointer"
                >
                    {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                </select>
            </div>

            {/* Resources List */}
            <div className="space-y-3">
                {filteredResources.map(resource => (
                    <div key={resource.id} className="bg-white p-5 rounded-2xl border border-stone-200 flex items-center justify-between hover:border-brand-200 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(resource.type)}`}>
                                <FileText size={22} />
                            </div>
                            <div>
                                <h4 className="font-bold text-stone-900">{resource.name}</h4>
                                <p className="text-sm text-stone-500">{resource.type} • {resource.size}</p>
                            </div>
                        </div>
                        <button className="p-3 text-stone-400 hover:text-brand-700 hover:bg-brand-50 rounded-xl transition-colors">
                            <Download size={20} />
                        </button>
                    </div>
                ))}

                {filteredResources.length === 0 && (
                    <div className="text-center py-12 text-stone-500">
                        <FolderOpen size={48} className="mx-auto mb-3 text-stone-300" />
                        <p>No resources found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// --- Members Tab with Detailed Cards & Modal ---

function MembersTab() {
    const [selectedMember, setSelectedMember] = useState<any>(null);

    // Mock Data for Cohort Members (Enhanced)
    const members = [
        {
            id: 1,
            name: "Sarah Jenkins",
            role: "Mentor",
            avatar: "https://i.pravatar.cc/150?u=sarah",
            occupation: "Product Manager",
            industry: "Tech",
            location: "San Francisco, CA",
            bio: "Product leader with 10+ years of experience. Passionate about mentoring the next generation of PMs.",
            isOpenToWork: false,
            joined: "Aug 2023"
        },
        {
            id: 2,
            name: "David Chen",
            role: "Member",
            avatar: "https://i.pravatar.cc/150?u=david",
            occupation: "UX Designer",
            industry: "SaaS",
            location: "Austin, TX",
            bio: "Transitioning from graphic design to UX. Love solving complex user problems.",
            isOpenToWork: true,
            joined: "Oct 2023"
        },
        {
            id: 3,
            name: "Maya Patel",
            role: "Member",
            avatar: "https://i.pravatar.cc/150?u=maya",
            occupation: "Frontend Dev",
            industry: "FinTech",
            location: "New York, NY",
            bio: "React enthusiast building accessible and responsive web applications.",
            isOpenToWork: true,
            joined: "Oct 2023"
        },
        {
            id: 4,
            name: "Jordan Smith",
            role: "Member",
            avatar: "https://i.pravatar.cc/150?u=2",
            occupation: "Product Designer",
            industry: "EdTech",
            location: "Chicago, IL",
            bio: "Creating learning experiences that empower students.",
            isOpenToWork: false,
            joined: "Sep 2023"
        },
        {
            id: 5,
            name: "Keisha Williams",
            role: "Member",
            avatar: "https://i.pravatar.cc/150?u=4",
            occupation: "UX Researcher",
            industry: "Social Media",
            location: "Atlanta, GA",
            bio: "Understanding the 'why' behind user behaviors. Mixed-methods researcher.",
            isOpenToWork: true,
            joined: "Oct 2023"
        },
        {
            id: 6,
            name: "Theresa Edem",
            role: "Member",
            avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop",
            occupation: "Product Manager",
            industry: "FinTech",
            location: "Toronto, ON",
            bio: "Passionate about building inclusive financial products.",
            isOpenToWork: true,
            joined: "Oct 2023"
        }
    ];

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {members.map(member => (
                    <motion.div
                        key={member.id}
                        layoutId={`card-${member.id}`}
                        onClick={() => setSelectedMember(member)}
                        className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm hover:shadow-lg hover:border-brand-100 transition-all cursor-pointer group flex flex-col items-center text-center relative"
                    >
                        {/* Avatar */}
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-brand-100 to-orange-100 group-hover:from-brand-300 group-hover:to-orange-300 transition-colors">
                                <img
                                    src={member.avatar}
                                    alt={member.name}
                                    className="w-full h-full rounded-full object-cover border-2 border-white"
                                />
                            </div>
                            {member.isOpenToWork && (
                                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1.5 rounded-full border-2 border-white" title="Open to Opportunities">
                                    <Briefcase size={12} strokeWidth={3} />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <h3 className="font-bold text-stone-900 text-lg mb-1 group-hover:text-brand-700 transition-colors">{member.name}</h3>

                        <p className="text-sm font-medium text-stone-600 mb-0.5">{member.occupation}</p>

                        <p className="text-xs text-stone-400 flex items-center justify-center gap-1 mb-3">
                            <MapPin size={10} /> {member.location}
                        </p>

                        {/* Tag */}
                        <div className="mt-auto pt-3 border-t border-stone-50 w-full flex flex-wrap justify-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">{member.industry}</span>
                            {member.role === 'Mentor' && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">Mentor</span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedMember && (
                    <MemberDetailModal
                        member={selectedMember}
                        onClose={() => setSelectedMember(null)}
                    />
                )}
            </AnimatePresence>
        </>
    )
}

function MemberDetailModal({ member, onClose }: { member: any, onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />

            <motion.div
                layoutId={`card-${member.id}`}
                className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            >
                {/* Header Background */}
                <div className="h-32 bg-gradient-to-br from-brand-600 to-indigo-700 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Decorative Circles */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
                </div>

                {/* Content */}
                <div className="px-8 pb-8 -mt-16 flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full p-1.5 bg-white shadow-xl">
                            <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-full h-full rounded-full object-cover bg-stone-100"
                            />
                        </div>
                        {member.isOpenToWork && (
                            <div className="absolute bottom-2 right-2 bg-green-500 text-white p-2 rounded-full border-4 border-white shadow-sm flex items-center justify-center" title="Open to Opportunities">
                                <Briefcase size={16} strokeWidth={3} />
                            </div>
                        )}
                    </div>

                    {/* Name & Title */}
                    <h2 className="text-2xl font-bold text-stone-900 mb-1 flex items-center gap-2 justify-center">
                        {member.name}
                        {/* Using explicit BadgeCheck if verification logic existed, for now static or omitted if not needed. Adding back simpler version */}
                        <div className="text-blue-500"><BadgeCheck size={20} fill="currentColor" className="text-white fill-blue-500" /></div>
                    </h2>
                    <p className="text-lg font-medium text-brand-700 mb-1">{member.occupation}</p>
                    <p className="text-stone-500 text-sm flex items-center gap-1.5 mb-6">
                        <MapPin size={14} /> {member.location}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {member.role === 'Mentor' && (
                            <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-100">
                                Mentor
                            </span>
                        )}
                        {member.isOpenToWork && (
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                                Open to Opportunities
                            </span>
                        )}
                        <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-bold border border-brand-100">
                            {member.industry}
                        </span>
                        <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-bold border border-stone-200">
                            Since {member.joined}
                        </span>
                    </div>

                    {/* Bio */}
                    <div className="w-full bg-stone-50 rounded-2xl p-6 mb-8 text-left border border-stone-100">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">About</h4>
                        <p className="text-stone-700 leading-relaxed font-medium">
                            "{member.bio}"
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="w-full grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors">
                            <MessageSquare size={18} /> Message
                        </button>
                        <a
                            href="#"
                            className="flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-stone-200 text-stone-700 rounded-xl font-bold hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all"
                        >
                            <Linkedin size={18} /> LinkedIn
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// --- Helper Components ---

function TabButton({ active, onClick, label, icon: Icon }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 pb-4 border-b-2 transition-all px-2 ${active ? 'border-brand-800 text-brand-800' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
        >
            <Icon size={18} />
            <span className="font-semibold">{label}</span>
        </button>
    )
}
