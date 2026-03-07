"use client";

import { useState, useMemo, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import {
    Search, Users, MessageSquare, Send, ChevronDown, ChevronUp,
    Clock, Heart, ThumbsUp, Flame, PartyPopper, Megaphone,
    Activity, UserPlus, UserMinus, Circle, Hash, BookOpen, Briefcase,
    Star, Award, Calendar, ExternalLink,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { ErrorBoundary } from "@/components/ui/error-boundary";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Group {
    id: number;
    name: string;
    description: string;
    icon: string;
    members: number;
    online: number;
    joined: boolean;
    color: string;
}

interface Reply {
    id: number;
    author: string;
    avatar: string;
    timestamp: string;
    content: string;
}

interface Post {
    id: number;
    author: string;
    avatar: string;
    timestamp: string;
    title: string;
    content: string;
    replies: Reply[];
    reactions: Record<string, number>;
    myReactions: string[];
}

interface Announcement {
    id: number;
    author: string;
    avatar: string;
    timestamp: string;
    title: string;
    content: string;
    reactions: Record<string, number>;
    myReactions: string[];
    comments: { id: number; author: string; avatar: string; text: string; timestamp: string }[];
}

interface ActivityItem {
    id: number;
    type: "join" | "post" | "achievement" | "event";
    user: string;
    avatar: string;
    text: string;
    timestamp: string;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const INITIAL_GROUPS: Group[] = [
    { id: 1, name: "Product Strategy", description: "Discuss PM frameworks, case studies & strategy", icon: "📊", members: 48, online: 12, joined: true, color: "bg-brand-50 border-brand-200" },
    { id: 2, name: "Career Growth", description: "Job hunting, networking tips & career advice", icon: "🚀", members: 62, online: 8, joined: true, color: "bg-amber-50 border-amber-200" },
    { id: 3, name: "Tech & Engineering", description: "Coding projects, tech trends & learning resources", icon: "💻", members: 35, online: 5, joined: false, color: "bg-emerald-50 border-emerald-200" },
    { id: 4, name: "Design Thinking", description: "UX research, design sprints & portfolios", icon: "🎨", members: 29, online: 3, joined: false, color: "bg-purple-50 border-purple-200" },
    { id: 5, name: "Wellness & Balance", description: "Self-care, mental health & work-life balance", icon: "🧘", members: 41, online: 6, joined: false, color: "bg-rose-50 border-rose-200" },
    { id: 6, name: "Side Projects", description: "Show & tell your side hustles and passion projects", icon: "⚡", members: 24, online: 2, joined: true, color: "bg-cyan-50 border-cyan-200" },
];

const INITIAL_POSTS: Post[] = [
    {
        id: 1, author: "Amara Okafor",
        avatar: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=150&h=150&fit=crop&crop=faces",
        timestamp: "2 hours ago",
        title: "Tips for acing the Product Strategy case study?",
        content: "I'm working on my Week 3 assignment and feeling a bit stuck on the market sizing section. Has anyone found a good framework that works for B2B SaaS products specifically?",
        reactions: { "👍": 5, "🔥": 2 }, myReactions: [],
        replies: [
            { id: 101, author: "Jordan Smith", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces", timestamp: "1 hour ago", content: "I found the TAM/SAM/SOM framework really helpful! Start with the total addressable market, then narrow down. Happy to share my notes if you want." },
            { id: 102, author: "Keisha Williams", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=faces", timestamp: "45 mins ago", content: "Also check out the resource from Week 2 — there's a template that breaks it down step by step. It was a game changer for me." },
        ],
    },
    {
        id: 2, author: "Sarah Jenkins",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
        timestamp: "5 hours ago",
        title: "Weekly check-in: How's everyone doing?",
        content: "Just wanted to create a space for us to share how we're feeling this week. The program can be intense — let's support each other! 💪",
        reactions: { "❤️": 12, "🎉": 3, "👍": 7 }, myReactions: ["❤️"],
        replies: [
            { id: 201, author: "Maya Chen", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces", timestamp: "4 hours ago", content: "Honestly feeling a bit overwhelmed but seeing everyone's progress is motivating. We got this!" },
        ],
    },
    {
        id: 3, author: "David Park",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces",
        timestamp: "1 day ago",
        title: "Anyone else working on the synthesis matrix?",
        content: "I'm trying to organize my user research findings and the matrix is getting quite large. Would love to see how others are approaching this — maybe we can do a virtual co-working session?",
        reactions: { "👍": 3 }, myReactions: [],
        replies: [],
    },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
    {
        id: 1, author: "BGG Team", avatar: "https://i.pravatar.cc/150?u=bgg-team", timestamp: "1 day ago",
        title: "🎉 Week 4 Kickoff — Guest Speaker Announcement",
        content: "We're thrilled to announce that Amanda Jones, Senior PM at Uber, will be joining us this Monday at 1 PM EST for a fireside chat on breaking into product management. Don't miss it!",
        reactions: { "🎉": 18, "🔥": 9, "❤️": 6 }, myReactions: ["🎉"],
        comments: [
            { id: 301, author: "Keisha Williams", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=faces", text: "So excited for this! Already have my questions ready.", timestamp: "20 hours ago" },
        ],
    },
    {
        id: 2, author: "BGG Team", avatar: "https://i.pravatar.cc/150?u=bgg-team", timestamp: "3 days ago",
        title: "📋 Reminder: Week 3 Assignments Due Friday",
        content: "Please submit your research findings and synthesis matrix by Friday 5 PM EST. Reach out in #product-strategy if you need help!",
        reactions: { "👍": 11, "❤️": 2 }, myReactions: [],
        comments: [],
    },
];

const INITIAL_ACTIVITY: ActivityItem[] = [
    { id: 1, type: "join", user: "Tanya Brooks", avatar: "https://i.pravatar.cc/150?u=tanya", text: "joined the community", timestamp: "5 min ago" },
    { id: 2, type: "post", user: "Amara Okafor", avatar: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=150&h=150&fit=crop&crop=faces", text: "posted in Product Strategy", timestamp: "2 hr ago" },
    { id: 3, type: "achievement", user: "Maya Chen", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces", text: "earned the \"Helpful Hand\" badge", timestamp: "3 hr ago" },
    { id: 4, type: "event", user: "Jordan Smith", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces", text: "RSVP'd to Guest Speaker event", timestamp: "4 hr ago" },
    { id: 5, type: "join", user: "Priya Sharma", avatar: "https://i.pravatar.cc/150?u=priya", text: "joined Career Growth group", timestamp: "6 hr ago" },
    { id: 6, type: "post", user: "Sarah Jenkins", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces", text: "started a weekly check-in thread", timestamp: "5 hr ago" },
];

const REACTION_OPTIONS = ["👍", "❤️", "🔥", "🎉"] as const;

const ACTIVITY_ICON: Record<ActivityItem["type"], React.ReactNode> = {
    join: <UserPlus size={14} />,
    post: <MessageSquare size={14} />,
    achievement: <Award size={14} />,
    event: <Calendar size={14} />,
};
const ACTIVITY_COLOR: Record<ActivityItem["type"], string> = {
    join: "bg-emerald-100 text-emerald-600",
    post: "bg-brand-100 text-brand-600",
    achievement: "bg-amber-100 text-amber-600",
    event: "bg-blue-100 text-blue-600",
};

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

type Tab = "feed" | "groups" | "announcements";

export default function MemberCommunityPage() {
    const { user } = useUser();
    const [tab, setTab] = useState<Tab>("feed");
    const [searchQuery, setSearchQuery] = useState("");

    /* Groups */
    const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
    const toggleJoin = useCallback((id: number) => {
        setGroups(prev => prev.map(g => g.id === id ? { ...g, joined: !g.joined, members: g.joined ? g.members - 1 : g.members + 1 } : g));
    }, []);
    const filteredGroups = useMemo(() => {
        if (!searchQuery) return groups;
        const q = searchQuery.toLowerCase();
        return groups.filter(g => g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));
    }, [groups, searchQuery]);

    /* Posts */
    const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostContent, setNewPostContent] = useState("");
    const [expandedPosts, setExpandedPosts] = useState<number[]>([1]);
    const toggleExpanded = (id: number) => setExpandedPosts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const handleSubmitPost = () => {
        if (!newPostTitle.trim() || !newPostContent.trim()) return;
        const np: Post = { id: Date.now(), author: user.name, avatar: user.avatar, timestamp: "Just now", title: newPostTitle, content: newPostContent, replies: [], reactions: {}, myReactions: [] };
        setPosts(prev => [np, ...prev]);
        setNewPostTitle("");
        setNewPostContent("");
    };

    const togglePostReaction = (postId: number, emoji: string) => {
        setPosts(prev => prev.map(p => {
            if (p.id !== postId) return p;
            const has = p.myReactions.includes(emoji);
            return {
                ...p,
                myReactions: has ? p.myReactions.filter(e => e !== emoji) : [...p.myReactions, emoji],
                reactions: { ...p.reactions, [emoji]: (p.reactions[emoji] || 0) + (has ? -1 : 1) },
            };
        }));
    };

    const addReply = (postId: number, content: string) => {
        setPosts(prev => prev.map(p => {
            if (p.id !== postId) return p;
            return { ...p, replies: [...p.replies, { id: Date.now(), author: user.name, avatar: user.avatar, timestamp: "Just now", content }] };
        }));
    };

    const filteredPosts = useMemo(() => {
        if (!searchQuery) return posts;
        const q = searchQuery.toLowerCase();
        return posts.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.author.toLowerCase().includes(q));
    }, [posts, searchQuery]);

    /* Announcements */
    const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);

    const toggleAnnouncementReaction = (aId: number, emoji: string) => {
        setAnnouncements(prev => prev.map(a => {
            if (a.id !== aId) return a;
            const has = a.myReactions.includes(emoji);
            return {
                ...a,
                myReactions: has ? a.myReactions.filter(e => e !== emoji) : [...a.myReactions, emoji],
                reactions: { ...a.reactions, [emoji]: (a.reactions[emoji] || 0) + (has ? -1 : 1) },
            };
        }));
    };

    const addAnnouncementComment = (aId: number, text: string) => {
        setAnnouncements(prev => prev.map(a => {
            if (a.id !== aId) return a;
            return { ...a, comments: [...a.comments, { id: Date.now(), author: user.name, avatar: user.avatar, text, timestamp: "Just now" }] };
        }));
    };

    /* Activity */
    const [activity, setActivity] = useState<ActivityItem[]>(INITIAL_ACTIVITY);

    /* Tab config */
    const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: "feed", label: "Discussion", icon: <MessageSquare size={16} /> },
        { key: "groups", label: "Groups", icon: <Users size={16} /> },
        { key: "announcements", label: "Announcements", icon: <Megaphone size={16} /> },
    ];

    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-stone-900">Community</h1>
                <p className="text-stone-500 mt-1">Connect, learn, and grow with your cohort.</p>
            </div>

            {/* Search + Tabs */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                        type="text"
                        placeholder={tab === "groups" ? "Search groups..." : tab === "announcements" ? "Search announcements..." : "Search discussions..."}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none"
                    />
                </div>
                <div className="flex bg-stone-100 p-1 rounded-xl self-start">
                    {TABS.map(t => (
                        <button key={t.key} onClick={() => { setTab(t.key); setSearchQuery(""); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.key ? "bg-white shadow-sm text-stone-900" : "text-stone-500 hover:text-stone-900"}`}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* --- DISCUSSION TAB --- */}
                    {tab === "feed" && (
                        <>
                            {/* Composer */}
                            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                                <h2 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                                    <MessageSquare size={20} className="text-brand-600" /> Start a Discussion
                                </h2>
                                <div className="space-y-4">
                                    <input type="text" placeholder="Discussion title..." value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none font-medium" />
                                    <textarea placeholder="What's on your mind?" value={newPostContent} onChange={e => setNewPostContent(e.target.value)} rows={3} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none" />
                                    <div className="flex justify-end">
                                        <button onClick={handleSubmitPost} className="bg-brand-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-700 transition-colors flex items-center gap-2 shadow-lg shadow-brand-900/10">
                                            <Send size={16} /> Post
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Posts */}
                            <div className="space-y-4">
                                {filteredPosts.map(post => (
                                    <PostCard key={post.id} post={post} isExpanded={expandedPosts.includes(post.id)} onToggle={() => toggleExpanded(post.id)} onReact={togglePostReaction} onReply={addReply} currentUser={user} />
                                ))}
                                {filteredPosts.length === 0 && (
                                    <EmptyState
                                        icon={MessageSquare}
                                        heading="No discussions found"
                                        description="Try a different search or start one yourself."
                                    />
                                )}
                            </div>
                        </>
                    )}

                    {/* --- GROUPS TAB --- */}
                    {tab === "groups" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredGroups.map(g => (
                                <div key={g.id} className={`rounded-2xl border p-5 transition-all hover:shadow-md ${g.color}`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="text-3xl">{g.icon}</span>
                                        <button onClick={() => toggleJoin(g.id)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${g.joined ? "bg-white text-stone-600 border border-stone-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200" : "bg-brand-800 text-white hover:bg-brand-700"}`}>
                                            {g.joined ? <><UserMinus size={12} /> Leave</> : <><UserPlus size={12} /> Join</>}
                                        </button>
                                    </div>
                                    <h3 className="font-bold text-stone-900 mb-1">{g.name}</h3>
                                    <p className="text-sm text-stone-500 mb-3 line-clamp-2">{g.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-stone-500">
                                        <span className="flex items-center gap-1"><Users size={12} /> {g.members} members</span>
                                        <span className="flex items-center gap-1"><Circle size={8} className="fill-emerald-500 text-emerald-500" /> {g.online} online</span>
                                    </div>
                                </div>
                            ))}
                            {filteredGroups.length === 0 && (
                                <div className="col-span-2">
                                    <EmptyState
                                        icon={Hash}
                                        heading="No groups match your search"
                                        description="Try a different keyword."
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- ANNOUNCEMENTS TAB --- */}
                    {tab === "announcements" && (
                        <div className="space-y-4">
                            {announcements.filter(a => {
                                if (!searchQuery) return true;
                                const q = searchQuery.toLowerCase();
                                return a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
                            }).map(a => (
                                <AnnouncementCard key={a.id} announcement={a} onReact={toggleAnnouncementReaction} onComment={addAnnouncementComment} currentUser={user} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Your Groups */}
                    <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
                        <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2"><Hash size={16} className="text-brand-600" /> Your Groups</h3>
                        <div className="space-y-2">
                            {groups.filter(g => g.joined).map(g => (
                                <div key={g.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer">
                                    <span className="text-lg">{g.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-stone-800 truncate">{g.name}</p>
                                        <p className="text-xs text-stone-400">{g.members} members</p>
                                    </div>
                                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold"><Circle size={6} className="fill-emerald-500 text-emerald-500" />{g.online}</span>
                                </div>
                            ))}
                            {groups.filter(g => g.joined).length === 0 && <p className="text-sm text-stone-400">You haven&apos;t joined any groups yet.</p>}
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
                        <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2"><Activity size={16} className="text-brand-600" /> Activity Feed</h3>
                        <div className="space-y-3">
                            {activity.map(a => (
                                <div key={a.id} className="flex items-start gap-3">
                                    <div className={`mt-0.5 p-1.5 rounded-lg ${ACTIVITY_COLOR[a.type]}`}>{ACTIVITY_ICON[a.type]}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-stone-700"><span className="font-semibold">{a.user}</span> {a.text}</p>
                                        <p className="text-xs text-stone-400">{a.timestamp}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Community Stats */}
                    <div className="bg-gradient-to-br from-brand-900 to-stone-900 rounded-2xl p-5 text-white">
                        <h3 className="font-bold mb-3">Community Pulse</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div><p className="text-2xl font-bold text-accent-400">156</p><p className="text-xs text-brand-200">Total Members</p></div>
                            <div><p className="text-2xl font-bold text-accent-400">34</p><p className="text-xs text-brand-200">Online Now</p></div>
                            <div><p className="text-2xl font-bold text-accent-400">89</p><p className="text-xs text-brand-200">Posts This Week</p></div>
                            <div><p className="text-2xl font-bold text-accent-400">6</p><p className="text-xs text-brand-200">Active Groups</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </ErrorBoundary>
    );
}

/* ------------------------------------------------------------------ */
/*  PostCard Component                                                 */
/* ------------------------------------------------------------------ */

function PostCard({ post, isExpanded, onToggle, onReact, onReply, currentUser }: {
    post: Post; isExpanded: boolean; onToggle: () => void;
    onReact: (postId: number, emoji: string) => void;
    onReply: (postId: number, content: string) => void;
    currentUser: { name: string; avatar: string };
}) {
    const [replyContent, setReplyContent] = useState("");
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    const handleSubmitReply = () => {
        if (!replyContent.trim()) return;
        onReply(post.id, replyContent);
        setReplyContent("");
        setShowReplyInput(false);
    };

    return (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-brand-200 transition-colors">
            <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <AvatarInitials name={post.author} src={post.avatar} size="md" />
                        <div>
                            <span className="font-bold text-stone-900">{post.author}</span>
                            <span className="text-stone-400 text-sm flex items-center gap-1 mt-0.5"><Clock size={12} /> {post.timestamp}</span>
                        </div>
                    </div>
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">{post.title}</h3>
                <p className="text-stone-600 leading-relaxed">{post.content}</p>

                {/* Reactions Display */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                    {Object.entries(post.reactions).filter(([, c]) => c > 0).map(([emoji, count]) => (
                        <button key={emoji} onClick={() => onReact(post.id, emoji)} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${post.myReactions.includes(emoji) ? "bg-brand-50 border-brand-200 text-brand-700" : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"}`}>
                            {emoji} {count}
                        </button>
                    ))}
                    <div className="relative">
                        <button onClick={() => setShowReactionPicker(!showReactionPicker)} className="px-2 py-1 rounded-full text-xs font-bold border border-dashed border-stone-200 text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-colors">+</button>
                        {showReactionPicker && (
                            <div className="absolute bottom-full left-0 mb-2 bg-white border border-stone-200 rounded-xl shadow-lg p-2 flex gap-1 z-10">
                                {REACTION_OPTIONS.map(e => (
                                    <button key={e} onClick={() => { onReact(post.id, e); setShowReactionPicker(false); }} className="text-lg hover:scale-125 transition-transform p-1">{e}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-stone-100">
                    <button onClick={onToggle} className="flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-brand-700 transition-colors">
                        <MessageSquare size={16} /> {post.replies.length} {post.replies.length === 1 ? "Reply" : "Replies"} {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button onClick={() => setShowReplyInput(!showReplyInput)} className="text-sm font-medium text-brand-700 hover:text-brand-800 transition-colors">Add Reply</button>
                </div>
            </div>

            {/* Replies */}
            {isExpanded && post.replies.length > 0 && (
                <div className="bg-stone-50 border-t border-stone-100 px-6 py-4 space-y-4">
                    {post.replies.map((reply: Reply) => (
                        <div key={reply.id} className="flex gap-3">
                            <div className="w-0.5 bg-brand-200 rounded-full flex-shrink-0 ml-4" />
                            <div className="flex-1 bg-white rounded-xl p-4 border border-stone-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <AvatarInitials name={reply.author} src={reply.avatar} size="xs" />
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
                        <AvatarInitials name={currentUser.name} src={currentUser.avatar} size="sm" />
                        <div className="flex-1">
                            <textarea placeholder="Write your reply..." value={replyContent} onChange={e => setReplyContent(e.target.value)} rows={2} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none text-sm" />
                            <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => setShowReplyInput(false)} className="px-4 py-2 text-stone-600 font-medium text-sm hover:bg-stone-100 rounded-lg transition-colors">Cancel</button>
                                <button onClick={handleSubmitReply} className="px-4 py-2 bg-brand-800 text-white font-medium text-sm rounded-lg hover:bg-brand-700 transition-colors">Reply</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  AnnouncementCard Component                                          */
/* ------------------------------------------------------------------ */

function AnnouncementCard({ announcement, onReact, onComment, currentUser }: {
    announcement: Announcement;
    onReact: (aId: number, emoji: string) => void;
    onComment: (aId: number, text: string) => void;
    currentUser: { name: string; avatar: string };
}) {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    const handleSubmit = () => {
        if (!commentText.trim()) return;
        onComment(announcement.id, commentText);
        setCommentText("");
    };

    return (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><Megaphone size={18} /></div>
                    <div>
                        <span className="font-bold text-stone-900">{announcement.author}</span>
                        <span className="text-stone-400 text-sm flex items-center gap-1 mt-0.5"><Clock size={12} /> {announcement.timestamp}</span>
                    </div>
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">{announcement.title}</h3>
                <p className="text-stone-600 leading-relaxed">{announcement.content}</p>

                {/* Reactions */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                    {Object.entries(announcement.reactions).filter(([, c]) => c > 0).map(([emoji, count]) => (
                        <button key={emoji} onClick={() => onReact(announcement.id, emoji)} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${announcement.myReactions.includes(emoji) ? "bg-brand-50 border-brand-200 text-brand-700" : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"}`}>
                            {emoji} {count}
                        </button>
                    ))}
                    <div className="relative">
                        <button onClick={() => setShowReactionPicker(!showReactionPicker)} className="px-2 py-1 rounded-full text-xs font-bold border border-dashed border-stone-200 text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-colors">+</button>
                        {showReactionPicker && (
                            <div className="absolute bottom-full left-0 mb-2 bg-white border border-stone-200 rounded-xl shadow-lg p-2 flex gap-1 z-10">
                                {REACTION_OPTIONS.map(e => (
                                    <button key={e} onClick={() => { onReact(announcement.id, e); setShowReactionPicker(false); }} className="text-lg hover:scale-125 transition-transform p-1">{e}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Comment toggle */}
                <div className="mt-3 pt-3 border-t border-stone-100">
                    <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-brand-700 transition-colors">
                        <MessageSquare size={16} /> {announcement.comments.length} {announcement.comments.length === 1 ? "Comment" : "Comments"} {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                </div>
            </div>

            {/* Comments */}
            {showComments && (
                <div className="bg-stone-50 border-t border-stone-100 px-6 py-4 space-y-3">
                    {announcement.comments.map(c => (
                        <div key={c.id} className="flex gap-3">
                            <AvatarInitials name={c.author} src={c.avatar} size="xs" />
                            <div className="flex-1 bg-white rounded-xl p-3 border border-stone-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-stone-900 text-sm">{c.author}</span>
                                    <span className="text-stone-400 text-xs">{c.timestamp}</span>
                                </div>
                                <p className="text-stone-600 text-sm">{c.text}</p>
                            </div>
                        </div>
                    ))}
                    <div className="flex gap-3 pt-2">
                        <AvatarInitials name={currentUser.name} src={currentUser.avatar} size="xs" />
                        <div className="flex-1 flex gap-2">
                            <input type="text" placeholder="Add a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
                            <button onClick={handleSubmit} className="px-3 py-2 bg-brand-800 text-white rounded-lg hover:bg-brand-700 transition-colors"><Send size={14} /></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
