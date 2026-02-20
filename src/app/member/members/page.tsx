"use client";

import { useState } from "react";
import {
    Search,
    MapPin,
    Briefcase,
    Linkedin,
    X,
    MessageSquare,
    BadgeCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Mock Data: Members ---
const MEMBERS = [
    {
        id: 1,
        name: "Theresa Edem-Isemin",
        avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=faces",
        occupation: "Product Manager",
        industry: "FinTech",
        location: "Toronto, ON",
        bio: "Passionate about building inclusive financial products. 5+ years in product leadership helping startups scale zero to one.",
        isOpenToWork: true,
        joined: "Oct 2023"
    },
    {
        id: 2,
        name: "Seriff Salaudeen",
        avatar: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=400&h=400&fit=crop&crop=faces",
        occupation: "UX Designer",
        industry: "HealthTech",
        location: "London, UK",
        bio: "Designing interfaces that save lives. Focused on accessibility and user research in the healthcare space.",
        isOpenToWork: false,
        joined: "Sep 2023"
    },
    {
        id: 3,
        name: "Dacia Rohlehr",
        avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=400&fit=crop&crop=faces",
        occupation: "Entrepreneur",
        industry: "E-commerce",
        location: "Ontario, CA",
        bio: "Founder of SheaGlow. Developing sustainable beauty products for melanin-rich skin.",
        isOpenToWork: true,
        joined: "Nov 2023"
    },
    {
        id: 4,
        name: "Kidus Gebru",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces",
        occupation: "Software Engineer",
        industry: "SaaS",
        location: "Nova Scotia, CA",
        bio: "Full-stack developer with a love for clean code and scalable architecture. React & Node.js expert.",
        isOpenToWork: true,
        joined: "Aug 2023"
    },
    {
        id: 5,
        name: "Arash Rahimi",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces",
        occupation: "Marketing Lead",
        industry: "Media",
        location: "New York, USA",
        bio: "Storyteller at heart. specialized in brand strategy and digital marketing for creative agencies.",
        isOpenToWork: false,
        joined: "Dec 2023"
    },
    {
        id: 6,
        name: "Shamsan Cherumala",
        avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop&crop=faces",
        occupation: "Data Analyst",
        industry: "EdTech",
        location: "Berlin, DE",
        bio: "Turning data into actionable insights. Python & SQL wizard helping educational platforms improve student outcomes.",
        isOpenToWork: true,
        joined: "Jan 2024"
    },
    {
        id: 7,
        name: "Hafijur Tarafder",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
        occupation: "Product Designer",
        industry: "Design Systems",
        location: "Lagos, NG",
        bio: "Obsessed with design systems and micro-interactions. Creating delightful experiences one pixel at a time.",
        isOpenToWork: false,
        joined: "Oct 2023"
    },
    {
        id: 8,
        name: "Amara Ndiaye",
        avatar: "https://images.unsplash.com/photo-1522512119668-00917633c4c2?w=400&h=400&fit=crop&crop=faces",
        occupation: "Community Mgr",
        industry: "Non-Profit",
        location: "Accra, GH",
        bio: "Building communities that thrive. Expert in engagement strategy and member retention.",
        isOpenToWork: true,
        joined: "Nov 2023"
    }
];

export default function MembersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMember, setSelectedMember] = useState<typeof MEMBERS[0] | null>(null);

    const filteredMembers = MEMBERS.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.occupation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Member Directory</h1>
                    <p className="text-stone-500 mt-1">Discover and connect with talented members of the community.</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name, role, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none transition-all shadow-sm"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMembers.map(member => (
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

                        {member.occupation && (
                            <p className="text-sm font-medium text-stone-600 mb-0.5">{member.occupation}</p>
                        )}

                        {member.location && (
                            <p className="text-xs text-stone-400 flex items-center justify-center gap-1 mb-3">
                                <MapPin size={10} /> {member.location}
                            </p>
                        )}

                        {/* Tag */}
                        <div className="mt-auto pt-3 border-t border-stone-50 w-full">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">{member.industry}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedMember && (
                    <MemberDetailModal
                        member={selectedMember}
                        onClose={() => setSelectedMember(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function MemberDetailModal({ member, onClose }: { member: typeof MEMBERS[0], onClose: () => void }) {
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
                        <BadgeCheck size={20} className="text-blue-500" fill="currentColor" />
                    </h2>
                    <p className="text-lg font-medium text-brand-700 mb-1">{member.occupation}</p>
                    <p className="text-stone-500 text-sm flex items-center gap-1.5 mb-6">
                        <MapPin size={14} /> {member.location}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
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
