"use client";

import { useUser } from "@/context/UserContext";
import { FileText, Video, Link as LinkIcon, Download, Search, Upload, Plus, Trash2, Eye, Lock, Globe, Info, HelpCircle, X } from "lucide-react";
import { useState } from "react";

export default function ResourcesPage() {
    const { role } = useUser();

    if (role === 'mentor') {
        return <MentorResourcesView />;
    }

    return <MemberResourcesView />;
}

// --- Mentor View ---

function MentorResourcesView() {
    const [myResources, setMyResources] = useState([
        { id: 101, title: "Career Roadmap Template", type: "PDF", downloads: 12, shared: true, permissions: "download" },
        { id: 102, title: "Interview Prep Checklist", type: "PDF", downloads: 8, shared: false, permissions: "view" },
        { id: 103, title: "System Design 101 Link", type: "Link", downloads: 45, shared: true, permissions: "view" },
    ]);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const handleDelete = (id: number) => {
        setMyResources(myResources.filter(r => r.id !== id));
    };

    const toggleShared = (id: number) => {
        setMyResources(myResources.map(r => r.id === id ? { ...r, shared: !r.shared } : r));
    };

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">My Toolkit</h1>
                    <p className="text-stone-500 mt-1">Manage resources you share with your mentees.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-purple-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-purple-800 flex items-center gap-2 shadow-lg shadow-purple-900/10"
                >
                    <Upload size={18} /> Upload Resource
                </button>
            </div>

            {/* Teaching/Guidance Alert */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4">
                <div className="bg-blue-100 text-blue-700 p-2 rounded-lg h-fit">
                    <Info size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-blue-900 text-sm">Why share resources?</h3>
                    <p className="text-sm text-blue-800 mt-1">
                        Sharing your personal toolkit (templates, guides, articles) helps mentees apply your advice practically.
                        You retain full control over who sees it and whether they can download copies.
                    </p>
                </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Add New Placeholder */}
                <div
                    onClick={() => setIsUploadModalOpen(true)}
                    className="border-2 border-dashed border-stone-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-purple-300 hover:bg-stone-50 cursor-pointer transition-colors min-h-[200px]"
                >
                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-stone-400">
                        <Plus size={24} />
                    </div>
                    <p className="font-bold text-stone-600">Add New Resource</p>
                    <p className="text-xs text-stone-400 mt-1">PDF, Video, or Link</p>
                </div>

                {/* Existing Resources */}
                {myResources.map(resource => (
                    <div key={resource.id} className="bg-white p-6 rounded-2xl border border-stone-200 group hover:border-purple-300 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 bg-purple-50 text-purple-700 rounded-lg flex items-center justify-center">
                                <FileText size={20} />
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => handleDelete(resource.id)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Resource">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className="font-bold text-stone-900 mb-1">{resource.title}</h3>
                        <p className="text-xs text-stone-500 mb-6">{resource.type} • {resource.downloads} Downloads</p>

                        <div className="space-y-3 pt-4 border-t border-stone-100">
                            {/* Permissions Toggle */}
                            <div className="flex items-center justify-between group/tip relative">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-stone-600">Permissions</span>
                                    <HelpCircle size={12} className="text-stone-300 cursor-help" />
                                </div>
                                {/* Microtip */}
                                <div className="absolute left-0 bottom-6 w-48 bg-stone-800 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                                    'Download' allows mentees to save a copy. 'View Only' restricts them to viewing it in the browser.
                                </div>

                                <div className="flex items-center bg-stone-100 rounded-lg p-0.5">
                                    <button className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${resource.permissions === 'view' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}>View</button>
                                    <button className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${resource.permissions === 'download' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}>Download</button>
                                </div>
                            </div>

                            {/* Visibility Toggle */}
                            <div className="flex items-center justify-between group/tip2 relative">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-stone-600">Visibility</span>
                                    <HelpCircle size={12} className="text-stone-300 cursor-help" />
                                </div>
                                {/* Microtip */}
                                <div className="absolute left-0 bottom-6 w-48 bg-stone-800 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover/tip2:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                                    'Shared' is visible to all your mentees. 'Private' is only visible to you (good for drafts).
                                </div>

                                <button
                                    onClick={() => toggleShared(resource.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${resource.shared ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-500'}`}
                                >
                                    {resource.shared ? <Globe size={12} /> : <Lock size={12} />}
                                    {resource.shared ? "Shared" : "Private"}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mock Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg">Upload Resource</h3>
                            <button onClick={() => setIsUploadModalOpen(false)} className="p-1 hover:bg-stone-100 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="border-2 border-dashed border-purple-200 bg-purple-50 rounded-xl h-32 flex flex-col items-center justify-center text-purple-800 mb-4 cursor-pointer hover:bg-purple-100 transition-colors">
                            <Upload size={24} className="mb-2" />
                            <span className="text-sm font-semibold">Click to browse or drag file</span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-stone-500 uppercase">Title</label>
                                <input type="text" className="w-full border-b border-stone-200 py-2 focus:border-purple-600 outline-none font-medium" placeholder="e.g., Q4 Career Roadmap" />
                            </div>
                            <div className="flex justify-end pt-4">
                                <button onClick={() => setIsUploadModalOpen(false)} className="bg-purple-900 text-white px-6 py-2 rounded-xl font-bold">Upload</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// --- Member View (Original) ---

function MemberResourcesView() {
    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
            <div>
                <h1 className="text-3xl font-bold text-stone-900">Resource Library</h1>
                <p className="text-stone-500 mt-1">Curated tools, templates, and guides for your journey.</p>
            </div>

            {/* Assigned for Week 3 */}
            <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-900/10">
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1">
                        <span className="bg-indigo-800 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full border border-indigo-700 mb-4 inline-block">
                            Week 3 Curriculum
                        </span>
                        <h2 className="text-2xl font-bold mb-2">User Research Methods</h2>
                        <p className="text-indigo-200 max-w-xl">
                            Essential reading and templates to complete your "User Research & Synthesis" module this week.
                        </p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2">
                        <div className="bg-white text-stone-900 p-4 rounded-xl w-64 flex-shrink-0 cursor-pointer hover:bg-indigo-50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <FileText className="text-indigo-600" size={24} />
                                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">REQUIRED</span>
                            </div>
                            <h4 className="font-bold text-sm mb-1">Interview Script Template</h4>
                            <p className="text-xs text-stone-500">PDF • 5 mins read</p>
                        </div>
                        <div className="bg-indigo-800/50 text-white p-4 rounded-xl w-64 flex-shrink-0 cursor-pointer border border-indigo-700 hover:bg-indigo-700 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <Video className="text-indigo-300" size={24} />
                                <span className="text-[10px] font-bold bg-indigo-900 text-indigo-300 px-2 py-1 rounded">OPTIONAL</span>
                            </div>
                            <h4 className="font-bold text-sm mb-1">Synthesis Walkthrough</h4>
                            <p className="text-xs text-indigo-300">Video • 12 mins</p>
                        </div>
                    </div>
                </div>
                {/* Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 opacity-20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-stone-900">Explore Library</h2>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                        <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ResourceCard
                    title="Product Requirement Document Integration"
                    category="Template"
                    type="PDF"
                    icon={FileText}
                    color="bg-red-50 text-red-600"
                />
                <ResourceCard
                    title="Figma Auto-Layout Masterclass"
                    category="Design"
                    type="Video"
                    icon={Video}
                    color="bg-blue-50 text-blue-600"
                />
                <ResourceCard
                    title="System Design Interview Guide"
                    category="Engineering"
                    type="Link"
                    icon={LinkIcon}
                    color="bg-green-50 text-green-600"
                />
                <ResourceCard
                    title="Resume Template - Senior PM"
                    category="Career"
                    type="PDF"
                    icon={FileText}
                    color="bg-red-50 text-red-600"
                />
            </div>
        </div>
    );
}

function ResourceCard({ title, category, type, icon: Icon, color }: any) {
    return (
        <div className="group bg-white p-6 rounded-2xl border border-stone-200 hover:border-purple-300 transition-all cursor-pointer flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={24} />
                </div>
                <span className="px-2 py-1 bg-stone-50 text-stone-500 text-xs font-semibold rounded uppercase">{type}</span>
            </div>
            <h3 className="font-bold text-stone-900 flex-1 group-hover:text-purple-700 transition-colors">{title}</h3>
            <p className="text-sm text-stone-500 mt-2 mb-4">{category}</p>
            <div className="pt-4 border-t border-stone-100 flex items-center gap-2 text-sm font-semibold text-stone-900 group-hover:text-purple-700">
                <Download size={16} /> Download
            </div>
        </div>
    )
}
