"use client";

import { useState } from "react";
import { MessageSquare, Send, ChevronDown, ChevronUp, MoreHorizontal, Clock, User } from "lucide-react";

// Mock data for posts
const MOCK_POSTS = [
    {
        id: 1,
        author: "Amara Okafor",
        avatar: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=150&h=150&fit=crop&crop=faces",
        timestamp: "2 hours ago",
        title: "Tips for acing the Product Strategy case study?",
        content: "I'm working on my Week 3 assignment and feeling a bit stuck on the market sizing section. Has anyone found a good framework that works for B2B SaaS products specifically?",
        replies: [
            {
                id: 101,
                author: "Jordan Smith",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
                timestamp: "1 hour ago",
                content: "I found the TAM/SAM/SOM framework really helpful! Start with the total addressable market, then narrow down. Happy to share my notes if you want."
            },
            {
                id: 102,
                author: "Keisha Williams",
                avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=faces",
                timestamp: "45 mins ago",
                content: "Also check out the resource from Week 2 - there's a template that breaks it down step by step. It was a game changer for me."
            }
        ]
    },
    {
        id: 2,
        author: "Sarah Jenkins",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
        timestamp: "5 hours ago",
        title: "Weekly check-in: How's everyone doing?",
        content: "Just wanted to create a space for us to share how we're feeling this week. The program can be intense - let's support each other! 💪",
        replies: [
            {
                id: 201,
                author: "Maya Chen",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces",
                timestamp: "4 hours ago",
                content: "Honestly feeling a bit overwhelmed but seeing everyone's progress is motivating. We got this!"
            }
        ]
    },
    {
        id: 3,
        author: "David Park",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces",
        timestamp: "1 day ago",
        title: "Anyone else working on the synthesis matrix?",
        content: "I'm trying to organize my user research findings and the matrix is getting quite large. Would love to see how others are approaching this - maybe we can do a virtual co-working session?",
        replies: []
    }
];

export default function MemberCommunityPage() {
    const [posts, setPosts] = useState(MOCK_POSTS);
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostContent, setNewPostContent] = useState("");
    const [expandedPosts, setExpandedPosts] = useState<number[]>([1]); // First post expanded by default

    const toggleExpanded = (postId: number) => {
        setExpandedPosts(prev =>
            prev.includes(postId)
                ? prev.filter(id => id !== postId)
                : [...prev, postId]
        );
    };

    const handleSubmitPost = () => {
        if (!newPostTitle.trim() || !newPostContent.trim()) return;

        const newPost = {
            id: Date.now(),
            author: "Nia Johnson",
            avatar: "https://i.pravatar.cc/150?u=nia",
            timestamp: "Just now",
            title: newPostTitle,
            content: newPostContent,
            replies: []
        };

        setPosts([newPost, ...posts]);
        setNewPostTitle("");
        setNewPostContent("");
    };

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-stone-900">Community Discussion</h1>
                <p className="text-stone-500 mt-1">Share ideas, ask questions, and connect with your cohort.</p>
            </div>

            {/* New Post Composer */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <h2 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                    <MessageSquare size={20} className="text-brand-600" />
                    Start a Discussion
                </h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Discussion title..."
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none font-medium"
                    />
                    <textarea
                        placeholder="What's on your mind? Share your thoughts, questions, or experiences..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none"
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmitPost}
                            className="bg-brand-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-700 transition-colors flex items-center gap-2 shadow-lg shadow-brand-900/10"
                        >
                            <Send size={16} /> Post Discussion
                        </button>
                    </div>
                </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
                {posts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        isExpanded={expandedPosts.includes(post.id)}
                        onToggle={() => toggleExpanded(post.id)}
                    />
                ))}
            </div>

            {posts.length === 0 && (
                <div className="text-center py-16 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                    <MessageSquare className="mx-auto text-stone-300 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-stone-900">No discussions yet</h3>
                    <p className="text-stone-500">Be the first to start a conversation!</p>
                </div>
            )}
        </div>
    );
}

function PostCard({ post, isExpanded, onToggle }: { post: any, isExpanded: boolean, onToggle: () => void }) {
    const [replyContent, setReplyContent] = useState("");
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replies, setReplies] = useState(post.replies);

    const handleSubmitReply = () => {
        if (!replyContent.trim()) return;

        const newReply = {
            id: Date.now(),
            author: "Nia Johnson",
            avatar: "https://i.pravatar.cc/150?u=nia",
            timestamp: "Just now",
            content: replyContent
        };

        setReplies([...replies, newReply]);
        setReplyContent("");
        setShowReplyInput(false);
    };

    return (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-brand-200 transition-colors">
            {/* Post Header & Content */}
            <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                            <span className="font-bold text-stone-900">{post.author}</span>
                            <span className="text-stone-400 text-sm flex items-center gap-1 mt-0.5">
                                <Clock size={12} /> {post.timestamp}
                            </span>
                        </div>
                    </div>
                    <button className="text-stone-400 hover:text-stone-600 p-1">
                        <MoreHorizontal size={18} />
                    </button>
                </div>

                <h3 className="text-lg font-bold text-stone-900 mb-2">{post.title}</h3>
                <p className="text-stone-600 leading-relaxed">{post.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stone-100">
                    <button
                        onClick={onToggle}
                        className="flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-brand-700 transition-colors"
                    >
                        <MessageSquare size={16} />
                        {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button
                        onClick={() => setShowReplyInput(!showReplyInput)}
                        className="text-sm font-medium text-brand-700 hover:text-brand-800 transition-colors"
                    >
                        Add Reply
                    </button>
                </div>
            </div>

            {/* Replies Section */}
            {isExpanded && replies.length > 0 && (
                <div className="bg-stone-50 border-t border-stone-100 px-6 py-4 space-y-4">
                    {replies.map((reply: any) => (
                        <div key={reply.id} className="flex gap-3">
                            <div className="w-0.5 bg-brand-200 rounded-full flex-shrink-0 ml-4"></div>
                            <div className="flex-1 bg-white rounded-xl p-4 border border-stone-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <img src={reply.avatar} alt={reply.author} className="w-6 h-6 rounded-full" />
                                    <span className="font-semibold text-stone-900 text-sm">{reply.author}</span>
                                    <span className="text-stone-400 text-xs">{reply.timestamp}</span>
                                </div>
                                <p className="text-stone-600 text-sm leading-relaxed">{reply.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reply Input */}
            {showReplyInput && (
                <div className="bg-stone-50 border-t border-stone-100 px-6 py-4">
                    <div className="flex gap-3">
                        <img src="https://i.pravatar.cc/150?u=nia" className="w-8 h-8 rounded-full flex-shrink-0" />
                        <div className="flex-1">
                            <textarea
                                placeholder="Write your reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none text-sm"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    onClick={() => setShowReplyInput(false)}
                                    className="px-4 py-2 text-stone-600 font-medium text-sm hover:bg-stone-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitReply}
                                    className="px-4 py-2 bg-brand-800 text-white font-medium text-sm rounded-lg hover:bg-brand-700 transition-colors"
                                >
                                    Reply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
