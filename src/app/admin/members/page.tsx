"use client";

import { useState, useMemo } from "react";
import { Search, LayoutGrid, List as ListIcon, MoreHorizontal, Mail, Shield } from "lucide-react";

// Mock Data Generation
const PROGRAMS = ["Engineering", "Product Design", "Data Science", "Product Management"];
const COHORTS = ["Alpha", "Beta", "Gamma"];
const STATUSES = ["Active", "On Leave", "Alumni"];

const NAMES = [
    "Amara Okafor", "Brianna Sterling", "Chiamaka Nnadi", "Danielle Robinson", "Efe Omoregie",
    "Fatima Diop", "Gabrielle Union", "Halan Fenty", "Imani Lewis", "Jasmine Carter",
    "Keisha Williams", "Laila Ali", "Maya Angelou", "Nia Long", "Oprah Winfrey",
    "Penny Proud", "Queen Latifah", "Rihanna Fenty", "Solange Knowles", "Tiana Rogers",
    "Ursula Burns", "Viola Davis", "Willow Smith", "Xena Warrior", "Yara Shahidi",
    "Zendaya Coleman", "Aaliyah Haughton", "Beyoncé Knowles", "Ciara Wilson", "Doja Cat",
    "Erykah Badu", "Foxy Brown", "Grace Jones", "Halle Berry", "Issa Rae",
    "Janelle Monáe", "Kelly Rowland", "Lizzo", "Megan Thee Stallion", "Normani Kordei"
];

const MOCK_MEMBERS = NAMES.map((name, i) => ({
    id: i + 1,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    role: i < 5 ? "Mentor" : "Member",
    program: PROGRAMS[i % PROGRAMS.length],
    cohort: COHORTS[i % COHORTS.length],
    status: STATUSES[i % STATUSES.length],
    location: ["New York, NY", "Atlanta, GA", "London, UK", "Lagos, NG", "Remote"][i % 5],
    joinDate: new Date(2023, i % 12, (i % 28) + 1).toLocaleDateString(),
    avatar: `https://i.pravatar.cc/150?u=${i + 10}`,
    progress: Math.floor(Math.random() * 100),
}));

export default function AdminMembersPage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCohort, setSelectedCohort] = useState("All");
    const [selectedProgram, setSelectedProgram] = useState("All");

    const filteredMembers = useMemo(() => {
        return MOCK_MEMBERS.filter(member => {
            const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCohort = selectedCohort === "All" || member.cohort === selectedCohort;
            const matchesProgram = selectedProgram === "All" || member.program === selectedProgram;
            return matchesSearch && matchesCohort && matchesProgram;
        });
    }, [searchQuery, selectedCohort, selectedProgram]);

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Community Members</h1>
                    <p className="text-stone-500 mt-1">Manage access, track progress, and view member profiles.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-lg text-sm font-bold">
                        {filteredMembers.length} Members
                    </span>
                    <button className="bg-stone-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors">
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-stone-200">
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2 bg-stone-50 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        <select
                            className="bg-stone-50 border border-stone-200 text-stone-700 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block p-2 outline-none cursor-pointer font-medium"
                            value={selectedCohort}
                            onChange={(e) => setSelectedCohort(e.target.value)}
                        >
                            <option value="All">All Cohorts</option>
                            {COHORTS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select
                            className="bg-stone-50 border border-stone-200 text-stone-700 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block p-2 outline-none cursor-pointer font-medium"
                            value={selectedProgram}
                            onChange={(e) => setSelectedProgram(e.target.value)}
                        >
                            <option value="All">All Programs</option>
                            {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex bg-stone-100 p-1 rounded-xl w-fit self-end xl:self-auto">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-stone-900" : "text-stone-400 hover:text-stone-600"}`}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-stone-900" : "text-stone-400 hover:text-stone-600"}`}
                    >
                        <ListIcon size={18} />
                    </button>
                </div>
            </div>

            {/* Content View */}
            {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {filteredMembers.map(member => (
                        <MemberGridCard key={member.id} member={member} />
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-stone-500">
                            <thead className="text-xs text-stone-400 uppercase bg-stone-50 border-b border-stone-100">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Member</th>
                                    <th className="px-6 py-4 font-bold">Role</th>
                                    <th className="px-6 py-4 font-bold">Program</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold">Joined</th>
                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.map(member => (
                                    <MemberListRow key={member.id} member={member} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {filteredMembers.length === 0 && (
                <div className="text-center py-20 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                    <div className="bg-white p-4 rounded-full shadow-sm w-fit mx-auto mb-4">
                        <Search className="text-stone-300" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-stone-900">No members found</h3>
                    <p className="text-stone-500">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
}

function MemberGridCard({ member }: { member: typeof MOCK_MEMBERS[0] }) {
    return (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col items-center text-center group hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/5 transition-all cursor-pointer relative overflow-hidden">
            <button className="absolute top-4 right-4 text-stone-300 hover:text-stone-600 transition-colors">
                <MoreHorizontal size={20} />
            </button>

            <div className="relative mb-4">
                <img src={member.avatar} alt={member.name} className="w-24 h-24 rounded-full object-cover border-4 border-stone-50 shadow-sm group-hover:scale-105 transition-transform duration-300" />
                <span className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-white ${member.status === 'Active' ? 'bg-green-500' : 'bg-stone-400'}`}></span>
            </div>

            <h3 className="text-lg font-bold text-stone-900 mb-1">{member.name}</h3>
            <p className="text-sm text-stone-500 mb-4 flex items-center gap-1">
                <Mail size={12} /> {member.email}
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-6 w-full">
                <span className="px-2 py-1 bg-stone-50 border border-stone-100 rounded-md text-xs font-semibold text-stone-600">
                    {member.cohort}
                </span>
                <span className="px-2 py-1 bg-purple-50 border border-purple-100 rounded-md text-xs font-bold text-purple-700">
                    {member.program}
                </span>
            </div>

            <div className="w-full mt-auto pt-4 border-t border-stone-100 flex justify-between items-center px-2">
                <div className="flex flex-col items-start">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Progress</span>
                    <span className="text-sm font-bold text-stone-900">{member.progress}%</span>
                </div>
                <button className="text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
                    View Profile
                </button>
            </div>
        </div>
    )
}

function MemberListRow({ member }: { member: typeof MOCK_MEMBERS[0] }) {
    return (
        <tr className="bg-white border-b border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer group">
            <td className="px-6 py-4 flex items-center gap-3">
                <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                    <div className="font-bold text-stone-900">{member.name}</div>
                    <div className="text-xs text-stone-500">{member.email}</div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${member.role === 'Mentor' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-800'
                    }`}>
                    {member.role === 'Mentor' && <Shield size={10} />}
                    {member.role}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="text-stone-900 font-medium">{member.program}</div>
                <div className="text-xs text-stone-400">{member.cohort}</div>
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${member.status === 'Active' ? 'bg-green-100 text-green-700' :
                    member.status === 'On Leave' ? 'bg-yellow-100 text-yellow-700' : 'bg-stone-100 text-stone-500'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-green-500' :
                        member.status === 'On Leave' ? 'bg-yellow-500' : 'bg-stone-500'
                        }`}></span>
                    {member.status}
                </span>
            </td>
            <td className="px-6 py-4 text-stone-500 font-medium">
                {member.joinDate}
            </td>
            <td className="px-6 py-4 text-right">
                <button className="text-stone-400 hover:text-purple-700 transition-colors p-2 hover:bg-purple-50 rounded-full">
                    <MoreHorizontal size={18} />
                </button>
            </td>
        </tr>
    )
}
