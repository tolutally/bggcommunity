"use client";

import { useState, useMemo } from "react";
import {
    Search,
    MapPin,
    Briefcase,
    Linkedin,
    X,
    MessageSquare,
    BadgeCheck,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { useMembers, useMember } from "@/hooks/use-members";
import type { MemberCard } from "@/lib/types";

/** Build display name from a MemberCard's profile */
function memberName(m: MemberCard): string {
    if (!m.profile) return m.email;
    if (m.profile.displayName) return m.profile.displayName;
    if (m.profile.firstName || m.profile.lastName)
        return `${m.profile.firstName ?? ""} ${m.profile.lastName ?? ""}`.trim();
    return m.email;
}

export default function MembersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [cursor, setCursor] = useState<string | undefined>();
    const [allMembers, setAllMembers] = useState<MemberCard[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

    const { members, nextCursor, isLoading, error } = useMembers(cursor);

    // Accumulate pages as cursors change
    const displayMembers = useMemo(() => {
        // On first load or reset, use API data directly
        if (!cursor) return members;
        // After "load more", combine previous + new
        const ids = new Set(allMembers.map((m) => m.id));
        const newOnes = members.filter((m) => !ids.has(m.id));
        return [...allMembers, ...newOnes];
    }, [members, cursor, allMembers]);

    const filteredMembers = useMemo(() => {
        // Filter out members with private profiles
        const publicMembers = displayMembers.filter(
            (m) => m.profile?.isPublic !== false,
        );
        if (!searchTerm) return publicMembers;
        const q = searchTerm.toLowerCase();
        return publicMembers.filter((m) => {
            const name = memberName(m).toLowerCase();
            const job = m.profile?.jobTitle?.toLowerCase() ?? "";
            const loc = m.profile?.location?.toLowerCase() ?? "";
            return name.includes(q) || job.includes(q) || loc.includes(q);
        });
    }, [displayMembers, searchTerm]);

    function handleLoadMore() {
        if (!nextCursor) return;
        setAllMembers(displayMembers);
        setCursor(nextCursor);
    }

    return (
        <ErrorBoundary>
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

            {/* Loading state */}
            {isLoading && displayMembers.length === 0 && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-brand-500" size={32} />
                </div>
            )}

            {/* Error state */}
            {error && displayMembers.length === 0 && !isLoading && (
                <div className="text-center py-20">
                    <p className="text-stone-500">Unable to load members. Please try again later.</p>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && displayMembers.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-stone-500">No members found.</p>
                </div>
            )}

            {/* Grid */}
            {displayMembers.length > 0 && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMembers.map((member) => {
                            const name = memberName(member);
                            const avatarUrl = member.profile?.avatarUrl;
                            return (
                                <motion.div
                                    key={member.id}
                                    layoutId={`card-${member.id}`}
                                    onClick={() => setSelectedMemberId(member.id)}
                                    className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm hover:shadow-lg hover:border-brand-100 transition-all cursor-pointer group flex flex-col items-center text-center relative"
                                >
                                    {/* Avatar */}
                                    <div className="relative mb-4">
                                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-brand-100 to-orange-100 group-hover:from-brand-300 group-hover:to-orange-300 transition-colors">
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    alt={name}
                                                    className="w-full h-full rounded-full object-cover border-2 border-white"
                                                />
                                            ) : (
                                                <AvatarInitials name={name} size="xl" className="border-2 border-white w-full h-full" />
                                            )}
                                        </div>
                                        {member.profile?.isOpenToWork && (
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1.5 rounded-full border-2 border-white" title="Open to Opportunities">
                                                <Briefcase size={12} strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <h3 className="font-bold text-stone-900 text-lg mb-1 group-hover:text-brand-700 transition-colors">{name}</h3>

                                    {member.profile?.jobTitle && (
                                        <p className="text-sm font-medium text-stone-600 mb-0.5">{member.profile.jobTitle}</p>
                                    )}

                                    {member.profile?.location && (
                                        <p className="text-xs text-stone-400 flex items-center justify-center gap-1 mb-3">
                                            <MapPin size={10} /> {member.profile.location}
                                        </p>
                                    )}

                                    {/* Tag */}
                                    {member.profile?.industry && (
                                        <div className="mt-auto pt-3 border-t border-stone-50 w-full">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">{member.profile.industry}</span>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Load More */}
                    {nextCursor && (
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoading}
                                className="px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {isLoading && <Loader2 className="animate-spin" size={16} />}
                                Load More
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            <AnimatePresence>
                {selectedMemberId && (
                    <MemberDetailModal
                        memberId={selectedMemberId}
                        onClose={() => setSelectedMemberId(null)}
                    />
                )}
            </AnimatePresence>
        </div>
        </ErrorBoundary>
    );
}

function MemberDetailModal({ memberId, onClose }: { memberId: string; onClose: () => void }) {
    const { member, isLoading } = useMember(memberId);

    const name = member
        ? (member.profile?.displayName ||
          `${member.profile?.firstName ?? ""} ${member.profile?.lastName ?? ""}`.trim() ||
          member.email)
        : "";
    const avatarUrl = member?.profile?.avatarUrl;
    const joinedDate = member ? new Date(member.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";

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
                layoutId={`card-${memberId}`}
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
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-brand-500" size={32} />
                        </div>
                    ) : member ? (
                        <>
                            {/* Avatar */}
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-full p-1.5 bg-white shadow-xl">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt={name}
                                            className="w-full h-full rounded-full object-cover bg-stone-100"
                                        />
                                    ) : (
                                        <AvatarInitials name={name} size="xl" className="w-full h-full" />
                                    )}
                                </div>
                                {member.profile?.isOpenToWork && (
                                    <div className="absolute bottom-2 right-2 bg-green-500 text-white p-2 rounded-full border-4 border-white shadow-sm flex items-center justify-center" title="Open to Opportunities">
                                        <Briefcase size={16} strokeWidth={3} />
                                    </div>
                                )}
                            </div>

                            {/* Name & Title */}
                            <h2 className="text-2xl font-bold text-stone-900 mb-1 flex items-center gap-2 justify-center">
                                {name}
                                <BadgeCheck size={20} className="text-blue-500" fill="currentColor" />
                            </h2>
                            {member.profile?.jobTitle && (
                                <p className="text-lg font-medium text-brand-700 mb-1">{member.profile.jobTitle}</p>
                            )}
                            {member.profile?.location && (
                                <p className="text-stone-500 text-sm flex items-center gap-1.5 mb-6">
                                    <MapPin size={14} /> {member.profile.location}
                                </p>
                            )}

                            {/* Tags */}
                            <div className="flex flex-wrap justify-center gap-2 mb-8">
                                {member.profile?.isOpenToWork && (
                                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                                        Open to Opportunities
                                    </span>
                                )}
                                {member.profile?.industry && (
                                    <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-bold border border-brand-100">
                                        {member.profile.industry}
                                    </span>
                                )}
                                {joinedDate && (
                                    <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-bold border border-stone-200">
                                        Since {joinedDate}
                                    </span>
                                )}
                            </div>

                            {/* Bio */}
                            {member.profile?.bio && (
                                <div className="w-full bg-stone-50 rounded-2xl p-6 mb-8 text-left border border-stone-100">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">About</h4>
                                    <p className="text-stone-700 leading-relaxed font-medium">
                                        &ldquo;{member.profile.bio}&rdquo;
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="w-full grid grid-cols-2 gap-4">
                                <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors">
                                    <MessageSquare size={18} /> Message
                                </button>
                                <a
                                    href={member.profile?.linkedinUrl ?? "#"}
                                    target={member.profile?.linkedinUrl ? "_blank" : undefined}
                                    rel={member.profile?.linkedinUrl ? "noopener noreferrer" : undefined}
                                    className="flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-stone-200 text-stone-700 rounded-xl font-bold hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all"
                                >
                                    <Linkedin size={18} /> LinkedIn
                                </a>
                            </div>
                        </>
                    ) : (
                        <div className="py-20 text-stone-500">Member not found.</div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
