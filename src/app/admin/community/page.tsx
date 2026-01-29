"use client";

import { Users, MessageSquare, Hash, Plus, Settings, Megaphone, Heart, Bell } from "lucide-react";

export default function AdminCommunityPage() {
    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-10">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Community Hub</h1>
                    <p className="text-stone-500 mt-1">Manage interest groups and global announcements.</p>
                </div>
                <div className="bg-white border border-stone-200 rounded-xl px-4 py-2 flex items-center gap-4 shadow-sm">
                    <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map(i => (
                            <img key={i} src={`https://i.pravatar.cc/150?u=${i + 20}`} className="w-8 h-8 rounded-full border-2 border-white" />
                        ))}
                    </div>
                    <div className="text-xs font-bold text-stone-600">
                        <span className="text-purple-700 text-lg">24</span>
                        <span className="block">Online Now</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
                {/* Main Content: Groups */}
                <div className="flex-1 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-stone-900">Interest Groups</h2>
                        <button className="text-purple-700 font-bold text-sm hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <Plus size={16} /> New Group
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GroupCard
                            name="Product Design"
                            members={342}
                            posts={12}
                            desc="All things UI/UX, user research, and prototyping."
                            icon={Hash}
                            color="bg-pink-50 text-pink-600"
                        />
                        <GroupCard
                            name="Career Support"
                            members={890}
                            posts={45}
                            desc="Resume reviews, interview prep, and job postings."
                            icon={Users}
                            color="bg-blue-50 text-blue-600"
                        />
                        <GroupCard
                            name="Mental Health & Wellness"
                            members={210}
                            posts={8}
                            desc="A safe space to discuss burnout, balance, and self-care."
                            icon={Heart}
                            color="bg-emerald-50 text-emerald-600"
                        />
                        <GroupCard
                            name="General Chat"
                            members={1205}
                            posts={156}
                            desc="The digital watercooler. Random topics welcome!"
                            icon={MessageSquare}
                            color="bg-purple-50 text-purple-600"
                        />
                    </div>
                </div>

                {/* Sidebar: Announcements */}
                <div className="w-full xl:w-96 space-y-6">
                    <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-xl shadow-stone-900/10">
                        <div className="flex items-center gap-2 mb-4 text-purple-300 font-bold text-sm uppercase tracking-wider">
                            <Megaphone size={16} /> Admin Updates
                        </div>
                        <h3 className="text-xl font-bold mb-2">Make an Announcement</h3>
                        <p className="text-stone-400 text-sm mb-6">This will be pinned to the top of every member's dashboard.</p>

                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Post Title"
                                className="w-full bg-stone-800 border-none rounded-xl px-4 py-3 text-sm text-white placeholder:text-stone-500 focus:ring-1 focus:ring-purple-500"
                            />
                            <textarea
                                placeholder="Message..."
                                rows={3}
                                className="w-full bg-stone-800 border-none rounded-xl px-4 py-3 text-sm text-white placeholder:text-stone-500 focus:ring-1 focus:ring-purple-500 resize-none"
                            ></textarea>
                            <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors">
                                Post to Community
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-stone-200 rounded-3xl p-6">
                        <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                            <Bell size={16} /> Recent Activity
                        </h3>
                        <div className="space-y-4">
                            <ActivityItem
                                user="Amara O."
                                action="joined"
                                target="Product Design"
                                time="2m ago"
                            />
                            <ActivityItem
                                user="Sarah J."
                                action="posted in"
                                target="Career Support"
                                time="15m ago"
                            />
                            <ActivityItem
                                user="Keisha W."
                                action="created event"
                                target="Portfolio Workshop"
                                time="1h ago"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GroupCard({ name, members, posts, desc, icon: Icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 hover:border-purple-300 transition-all cursor-pointer group flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon size={24} />
                </div>
                <button className="text-stone-300 hover:text-stone-600">
                    <Settings size={18} />
                </button>
            </div>

            <h3 className="text-lg font-bold text-stone-900 mb-2">{name}</h3>
            <p className="text-sm text-stone-500 mb-6 flex-1">{desc}</p>

            <div className="flex justify-between items-center pt-4 border-t border-stone-100 text-xs font-semibold text-stone-500">
                <span>{members} Members</span>
                <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md">{posts} New Posts</span>
            </div>
        </div>
    )
}

function ActivityItem({ user, action, target, time }: any) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-1"></div>
            <div>
                <p className="text-stone-700">
                    <span className="font-bold text-stone-900">{user}</span> {action} <span className="font-semibold text-purple-700">{target}</span>
                </p>
                <p className="text-xs text-stone-400">{time}</p>
            </div>
        </div>
    )
}
