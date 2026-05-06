"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, MapPin, Briefcase, Linkedin, X, MessageSquare, BadgeCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { useCursorPagination } from "@/hooks/useCursorPagination";
import { fetchMembers, getMembersErrorMessage, type MemberRecord } from "@/lib/members";

export default function MembersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);
    const paginationQuery = useMemo(() => ({ limit: 24 }), []);
    const { items, isLoading, isLoadingMore, error, hasMore, loadMore } = useCursorPagination({
        query: paginationQuery,
        loadPage: fetchMembers,
        getErrorMessage: getMembersErrorMessage,
    });

    const filteredMembers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            return items;
        }

        return items.filter((member) =>
            member.name.toLowerCase().includes(query) ||
            (member.occupation ?? "").toLowerCase().includes(query) ||
            (member.location ?? "").toLowerCase().includes(query) ||
            (member.industry ?? "").toLowerCase().includes(query),
        );
    }, [items, searchTerm]);

    return (
        <ErrorBoundary>
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-900">Member Directory</h1>
                        <p className="text-stone-500 mt-1">Discover and connect with talented members of the community.</p>
                    </div>
                </div>

                <div className="relative max-w-lg">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, role, or location..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none transition-all shadow-sm"
                    />
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <SkeletonCard lines={4} />
                        <SkeletonCard lines={4} />
                        <SkeletonCard lines={4} />
                        <SkeletonCard lines={4} />
                    </div>
                ) : error ? (
                    <EmptyState icon={Search} heading="Members unavailable" description={error} />
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredMembers.map((member) => (
                                <motion.div
                                    key={member.id}
                                    layoutId={`card-${member.id}`}
                                    onClick={() => setSelectedMember(member)}
                                    className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm hover:shadow-lg hover:border-brand-100 transition-all cursor-pointer group flex flex-col items-center text-center relative"
                                >
                                    <div className="relative mb-4">
                                        {member.avatarUrl ? (
                                            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-brand-100 to-orange-100 group-hover:from-brand-300 group-hover:to-orange-300 transition-colors">
                                                <Image src={member.avatarUrl} alt={member.name} width={96} height={96} className="w-full h-full rounded-full object-cover border-2 border-white" unoptimized />
                                            </div>
                                        ) : (
                                            <AvatarInitials name={member.name} size="xl" className="border-4 border-stone-50 shadow-sm group-hover:scale-105 transition-transform duration-300" />
                                        )}
                                        {member.isOpenToWork ? (
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1.5 rounded-full border-2 border-white" title="Open to Opportunities">
                                                <Briefcase size={12} strokeWidth={3} />
                                            </div>
                                        ) : null}
                                    </div>

                                    <h3 className="font-bold text-stone-900 text-lg mb-1 group-hover:text-brand-700 transition-colors">{member.name}</h3>
                                    {member.occupation ? <p className="text-sm font-medium text-stone-600 mb-0.5">{member.occupation}</p> : null}
                                    {member.location ? (
                                        <p className="text-xs text-stone-400 flex items-center justify-center gap-1 mb-3">
                                            <MapPin size={10} /> {member.location}
                                        </p>
                                    ) : null}

                                    <div className="mt-auto pt-3 border-t border-stone-50 w-full flex flex-wrap items-center justify-center gap-2">
                                        {member.industry ? <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">{member.industry}</span> : null}
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">Since {member.joinedLabel}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {filteredMembers.length === 0 ? (
                            <EmptyState icon={Search} heading="No members found" description="Try adjusting your search." />
                        ) : null}

                        {hasMore ? (
                            <div className="flex justify-center">
                                <button
                                    onClick={() => void loadMore()}
                                    disabled={isLoadingMore}
                                    className="px-5 py-2.5 rounded-xl border border-stone-200 bg-white text-sm font-bold text-stone-700 hover:border-brand-300 hover:text-brand-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isLoadingMore ? <Loader2 size={16} className="animate-spin" /> : null}
                                    Load more members
                                </button>
                            </div>
                        ) : null}
                    </>
                )}

                <AnimatePresence>
                    {selectedMember ? <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} /> : null}
                </AnimatePresence>
            </div>
        </ErrorBoundary>
    );
}

function MemberDetailModal({ member, onClose }: { member: MemberRecord; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
            <motion.div layoutId={`card-${member.id}`} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-brand-600 to-indigo-700 relative">
                    <button onClick={onClose} aria-label="Close member detail" title="Close member detail" className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors">
                        <X size={20} />
                    </button>
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none" />
                </div>

                <div className="px-8 pb-8 -mt-16 flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        {member.avatarUrl ? (
                            <div className="w-32 h-32 rounded-full p-1.5 bg-white shadow-xl">
                                <Image src={member.avatarUrl} alt={member.name} width={128} height={128} className="w-full h-full rounded-full object-cover bg-stone-100" unoptimized />
                            </div>
                        ) : (
                            <AvatarInitials name={member.name} size="xl" className="w-32 h-32 rounded-full border-[6px] border-white shadow-xl" />
                        )}
                        {member.isOpenToWork ? (
                            <div className="absolute bottom-2 right-2 bg-green-500 text-white p-2 rounded-full border-4 border-white shadow-sm flex items-center justify-center" title="Open to Opportunities">
                                <Briefcase size={16} strokeWidth={3} />
                            </div>
                        ) : null}
                    </div>

                    <h2 className="text-2xl font-bold text-stone-900 mb-1 flex items-center gap-2 justify-center">
                        {member.name}
                        <BadgeCheck size={20} className="text-blue-500" fill="currentColor" />
                    </h2>
                    {member.occupation ? <p className="text-lg font-medium text-brand-700 mb-1">{member.occupation}</p> : null}
                    {member.location ? <p className="text-stone-500 text-sm flex items-center gap-1.5 mb-6"><MapPin size={14} /> {member.location}</p> : null}

                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {member.isOpenToWork ? <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">Open to Opportunities</span> : null}
                        {member.industry ? <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-bold border border-brand-100">{member.industry}</span> : null}
                        <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-bold border border-stone-200">Since {member.joinedLabel}</span>
                    </div>

                    <div className="w-full bg-stone-50 rounded-2xl p-6 mb-8 text-left border border-stone-100">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">About</h4>
                        <p className="text-stone-700 leading-relaxed font-medium">{member.bio ? `"${member.bio}"` : "This member has not added a bio yet."}</p>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4">
                        <button disabled title="Coming soon" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-stone-900 text-white rounded-xl font-bold opacity-40 cursor-not-allowed">
                            <MessageSquare size={18} /> Message
                        </button>
                        {member.linkedinUrl ? (
                            <a
                                href={member.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-stone-200 text-stone-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 rounded-xl font-bold transition-all"
                            >
                                <Linkedin size={18} /> LinkedIn
                            </a>
                        ) : (
                            <div className="flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-stone-100 text-stone-300 rounded-xl font-bold opacity-40 blur-[1px] cursor-not-allowed select-none">
                                <Linkedin size={18} /> LinkedIn
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}