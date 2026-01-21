"use client";

import { MessageSquare, Heart, Share2, MoreHorizontal } from "lucide-react";

export default function GeneralCommunityPage() {
    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">General Community</h1>
                    <p className="text-stone-500">Connect with everyone across all cohorts.</p>
                </div>
                <button className="bg-purple-900 text-white px-6 py-2 rounded-xl font-bold">New Post</button>
            </div>

            <div className="space-y-6">
                <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl flex gap-4">
                    <span className="text-2xl">🎉</span>
                    <div>
                        <h3 className="font-bold text-purple-900">Admin Announcement</h3>
                        <p className="text-purple-800 text-sm mt-1">Don't forget the Town Hall starting in 1 hour!</p>
                    </div>
                </div>

                <Post
                    author="Jessica Liang"
                    role="Alumni"
                    time="2 hours ago"
                    content="Has anyone interviewed with Stripe recently? I have a loop coming up and would love some insights."
                    likes={24}
                    comments={12}
                />
                <Post
                    author="Marcus Thorne"
                    role="Mentor"
                    time="5 hours ago"
                    content="Sharing a great article on 'Engineering Management for Introverts'. A must read."
                    likes={45}
                    comments={6}
                />
            </div>
        </div>
    );
}

function Post({ author, role, time, content, likes, comments }: any) {
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
                    <MessageSquare size={18} /> {comments}
                </button>
            </div>
        </div>
    )
}
