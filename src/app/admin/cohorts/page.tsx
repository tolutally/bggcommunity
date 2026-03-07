"use client";

import { useState } from "react";
import Link from "next/link";
import {
    GraduationCap, Users, Calendar, Plus, Search, ArrowRight, X,
    CheckCircle2, Pencil, Trash2, Check, ChevronDown, ChevronLeft, ChevronRight,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type CohortStatus = "Active" | "Upcoming" | "Completed";

interface Cohort {
    id: number;
    slug: string;
    name: string;
    description: string;
    status: CohortStatus;
    members: number;
    maxMembers: number;
    phase: string;
    startDate: string;
    endDate: string;
    health: "High" | "Medium" | "Low";
    activeRate: number;
    track: string;
}

const INITIAL_COHORTS: Cohort[] = [
    { id: 1, slug: "alpha", name: "Cohort Alpha", description: "Full-stack engineering intensive — building production-ready applications with modern tools.", status: "Active", members: 42, maxMembers: 50, phase: "Week 3: Research & Planning", startDate: "Jan 6, 2026", endDate: "Apr 3, 2026", health: "High", activeRate: 95, track: "Engineering" },
    { id: 2, slug: "beta", name: "Cohort Beta", description: "Product design bootcamp — from user research to high-fidelity prototyping.", status: "Active", members: 28, maxMembers: 35, phase: "Week 1: Onboarding", startDate: "Feb 3, 2026", endDate: "May 1, 2026", health: "Medium", activeRate: 82, track: "Product Design" },
    { id: 3, slug: "gamma", name: "Cohort Gamma", description: "Data science foundations — statistics, Python, and machine learning fundamentals.", status: "Upcoming", members: 18, maxMembers: 40, phase: "Enrollment Open", startDate: "Mar 10, 2026", endDate: "Jun 5, 2026", health: "High", activeRate: 0, track: "Data Science" },
    { id: 4, slug: "pioneer", name: "Cohort Pioneer", description: "Product management accelerator — strategy, roadmapping, and stakeholder management.", status: "Completed", members: 35, maxMembers: 35, phase: "Completed", startDate: "Sep 1, 2025", endDate: "Dec 15, 2025", health: "High", activeRate: 100, track: "Product Management" },
    { id: 5, slug: "delta", name: "Cohort Delta", description: "Backend engineering deep-dive — APIs, databases, and cloud infrastructure.", status: "Upcoming", members: 10, maxMembers: 30, phase: "Enrollment Open", startDate: "Apr 1, 2026", endDate: "Jul 1, 2026", health: "High", activeRate: 0, track: "Engineering" },
    { id: 6, slug: "echo", name: "Cohort Echo", description: "UX research methods — interviews, usability testing, and synthesis.", status: "Active", members: 22, maxMembers: 25, phase: "Week 2: User Interviews", startDate: "Feb 10, 2026", endDate: "May 8, 2026", health: "High", activeRate: 88, track: "Product Design" },
    { id: 7, slug: "foxtrot", name: "Cohort Foxtrot", description: "Mobile development — React Native and cross-platform apps.", status: "Completed", members: 30, maxMembers: 30, phase: "Completed", startDate: "Jul 1, 2025", endDate: "Oct 1, 2025", health: "High", activeRate: 100, track: "Engineering" },
];



const ITEMS_PER_PAGE = 4;

export default function AdminCohortsPage() {
    const [cohorts, setCohorts] = useState<Cohort[]>(INITIAL_COHORTS);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"All" | CohortStatus>("All");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [page, setPage] = useState(1);

    const filtered = cohorts.filter((c) => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.track.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    // Reset page when filters change
    const handleFilterChange = (s: "All" | CohortStatus) => { setStatusFilter(s); setPage(1); };
    const handleSearchChange = (q: string) => { setSearchQuery(q); setPage(1); };

    const stats = {
        total: cohorts.length,
        active: cohorts.filter((c) => c.status === "Active").length,
        totalMembers: cohorts.reduce((sum, c) => sum + c.members, 0),
    };

    const handleCreateCohort = (data: Omit<Cohort, "id" | "members" | "activeRate" | "phase" | "health">) => {
        const newCohort: Cohort = {
            ...data,
            id: Date.now(),
            members: 0,
            activeRate: 0,
            phase: data.status === "Upcoming" ? "Enrollment Open" : "Week 1: Onboarding",
            health: "High",
        };
        setCohorts(prev => [newCohort, ...prev]);
        setShowCreateModal(false);
    };

    const handleEditCohort = (data: Omit<Cohort, "id" | "members" | "activeRate" | "phase" | "health">) => {
        if (!editingCohort) return;
        setCohorts(prev => prev.map(c => c.id === editingCohort.id ? { ...c, name: data.name, slug: data.slug, description: data.description, status: data.status, maxMembers: data.maxMembers, startDate: data.startDate, endDate: data.endDate, track: data.track } : c));
        setEditingCohort(null);
    };

    const handleDeleteCohort = (id: number) => {
        setCohorts(prev => prev.filter(c => c.id !== id));
        setDeleteConfirm(null);
        // Adjust page if needed
        const newFiltered = cohorts.filter(c => c.id !== id).filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.track.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "All" || c.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
        const newTotalPages = Math.ceil(newFiltered.length / ITEMS_PER_PAGE);
        if (page > newTotalPages && newTotalPages > 0) setPage(newTotalPages);
    };

    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Cohorts</h1>
                    <p className="text-stone-500 mt-1">Manage learning cohorts, track progress, and enroll members.</p>
                </div>
                <button onClick={() => setShowCreateModal(true)} className="bg-brand-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-700 flex items-center gap-2 shadow-lg shadow-brand-800/10 transition-colors self-start">
                    <Plus size={18} /> Create Cohort
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center gap-4">
                    <div className="p-3 bg-brand-50 rounded-xl"><GraduationCap size={22} className="text-brand-700" /></div>
                    <div><p className="text-2xl font-bold text-stone-900">{stats.total}</p><p className="text-xs text-stone-500 font-medium">Total Cohorts</p></div>
                </div>
                <div className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-xl"><CheckCircle2 size={22} className="text-green-600" /></div>
                    <div><p className="text-2xl font-bold text-stone-900">{stats.active}</p><p className="text-xs text-stone-500 font-medium">Active Now</p></div>
                </div>
                <div className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center gap-4">
                    <div className="p-3 bg-accent-50 rounded-xl"><Users size={22} className="text-accent-600" /></div>
                    <div><p className="text-2xl font-bold text-stone-900">{stats.totalMembers}</p><p className="text-xs text-stone-500 font-medium">Total Enrolled</p></div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input type="text" placeholder="Search cohorts or tracks..." value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
                </div>
                <div className="flex gap-2">
                    {(["All", "Active", "Upcoming", "Completed"] as const).map((s) => (
                        <button key={s} onClick={() => handleFilterChange(s)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${statusFilter === s ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cohort Cards */}
            {filtered.length === 0 ? (
                <EmptyState
                    icon={GraduationCap}
                    heading="No cohorts match your search."
                    action={{ label: "Clear filters", onClick: () => { setSearchQuery(""); setStatusFilter("All"); setPage(1); } }}
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {paginated.map((cohort) => {
                            return (
                                <div key={cohort.id} className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-brand-300 hover:shadow-lg transition-all group relative">
                                    {/* Action buttons */}
                                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button onClick={() => setEditingCohort(cohort)} title="Edit" className="p-2 rounded-xl bg-white border border-stone-200 text-stone-400 hover:text-brand-600 hover:border-brand-300 shadow-sm transition-colors">
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => setDeleteConfirm(cohort.id)} title="Delete" className="p-2 rounded-xl bg-white border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-300 shadow-sm transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <Link href={`/admin/cohorts/${cohort.slug}`} className="block">
                                        {/* Top Row */}
                                        <div className="flex items-start justify-between mb-4 pr-20">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-brand-50 text-brand-700 rounded-xl group-hover:bg-brand-100 transition-colors"><GraduationCap size={22} /></div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-stone-900 group-hover:text-brand-700 transition-colors">{cohort.name}</h3>
                                                    <p className="text-xs text-stone-500 font-medium">{cohort.track} Track</p>
                                                </div>
                                            </div>
                                            <StatusBadge label={cohort.status} preset={cohort.status} />
                                        </div>

                                        <p className="text-sm text-stone-500 mb-4 line-clamp-2">{cohort.description}</p>

                                        {/* Phase */}
                                        <div className="bg-stone-50 rounded-xl p-3 mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-stone-700">{cohort.phase}</span>
                                                <span className="text-xs font-semibold text-brand-600">{cohort.activeRate}% active</span>
                                            </div>
                                            <div className="w-full bg-stone-200 rounded-full h-1.5">
                                                <div className="bg-brand-600 h-1.5 rounded-full transition-all" style={{ width: `${cohort.activeRate}%` }}></div>
                                            </div>
                                        </div>

                                        {/* Bottom Stats */}
                                        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                                            <div className="flex items-center gap-4 text-sm text-stone-600">
                                                <span className="flex items-center gap-1.5"><Users size={15} /><span className="font-medium">{cohort.members}/{cohort.maxMembers}</span></span>
                                                <span className="flex items-center gap-1.5"><Calendar size={15} /><span className="font-medium">{cohort.startDate}</span></span>
                                            </div>
                                            <ArrowRight size={18} className="text-stone-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}

                        {/* Create New Card */}
                        <button onClick={() => setShowCreateModal(true)} className="border-2 border-dashed border-stone-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-brand-300 hover:bg-stone-50 cursor-pointer transition-colors min-h-[280px]">
                            <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-stone-400"><Plus size={26} /></div>
                            <p className="font-bold text-stone-600">Create New Cohort</p>
                            <p className="text-xs text-stone-400 mt-1">Start a new learning cohort</p>
                        </button>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-sm text-stone-500">
                                Showing {(page - 1) * ITEMS_PER_PAGE + 1}&ndash;{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    <ChevronLeft size={18} />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${page === p ? "bg-brand-800 text-white" : "border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
                                        {p}
                                    </button>
                                ))}
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <CohortFormModal mode="create" onClose={() => setShowCreateModal(false)} onSubmit={handleCreateCohort} />
            )}

            {/* Edit Modal */}
            {editingCohort && (
                <CohortFormModal mode="edit" cohort={editingCohort} onClose={() => setEditingCohort(null)} onSubmit={handleEditCohort} />
            )}

            {/* Delete Confirmation */}
            <ConfirmModal
                open={deleteConfirm !== null}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleDeleteCohort(deleteConfirm!)}
                title="Delete Cohort?"
                description="This will permanently remove this cohort. This action cannot be undone."
            />
        </div>
        </ErrorBoundary>
    );
}

/* ── Track Picker (inline CRUD) ── */
const DEFAULT_TRACKS = ["Engineering", "Product Design", "Product Management", "Data Science"];

function TrackPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [tracks, setTracks] = useState<string[]>(DEFAULT_TRACKS);
    const [open, setOpen] = useState(false);
    const [adding, setAdding] = useState(false);
    const [newTrack, setNewTrack] = useState("");
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");

    const handleAdd = () => { const t = newTrack.trim(); if (!t || tracks.includes(t)) return; setTracks(p => [...p, t]); onChange(t); setNewTrack(""); setAdding(false); };
    const handleEdit = (idx: number) => { const t = editValue.trim(); if (!t || tracks.includes(t)) return; setTracks(p => p.map((x, i) => i === idx ? t : x)); if (value === tracks[idx]) onChange(t); setEditingIdx(null); };
    const handleDelete = (idx: number) => { const removed = tracks[idx]; const next = tracks.filter((_, i) => i !== idx); setTracks(next); if (value === removed) onChange(next[0] ?? ""); };

    return (
        <div className="relative">
            <button type="button" onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none bg-white text-left">
                <span className={value ? "text-stone-800" : "text-stone-400"}>{value || "Select a track"}</span>
                <ChevronDown size={16} className={`text-stone-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="absolute z-20 mt-1.5 w-full bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
                    <ul className="max-h-52 overflow-y-auto py-1">
                        {tracks.map((track, idx) => (
                            <li key={track} className="group flex items-center gap-2 px-3 py-2 hover:bg-stone-50 text-sm">
                                {editingIdx === idx ? (
                                    <form className="flex items-center gap-2 w-full" onSubmit={e => { e.preventDefault(); handleEdit(idx); }}>
                                        <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} className="flex-1 px-2 py-1 border border-brand-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/20" />
                                        <button type="submit" className="p-1 text-green-600 hover:bg-green-50 rounded-md"><Check size={14} /></button>
                                        <button type="button" onClick={() => setEditingIdx(null)} className="p-1 text-stone-400 hover:bg-stone-100 rounded-md"><X size={14} /></button>
                                    </form>
                                ) : (
                                    <>
                                        <button type="button" onClick={() => { onChange(track); setOpen(false); }} className={`flex-1 text-left truncate ${value === track ? "font-semibold text-brand-700" : "text-stone-700"}`}>{track}</button>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button type="button" onClick={() => { setEditingIdx(idx); setEditValue(track); }} className="p-1 text-stone-400 hover:text-brand-600 hover:bg-brand-50 rounded-md"><Pencil size={13} /></button>
                                            <button type="button" onClick={() => handleDelete(idx)} className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={13} /></button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className="border-t border-stone-100 p-2">
                        {adding ? (
                            <form className="flex items-center gap-2" onSubmit={e => { e.preventDefault(); handleAdd(); }}>
                                <input autoFocus value={newTrack} onChange={e => setNewTrack(e.target.value)} placeholder="New track name" className="flex-1 px-3 py-2 border border-brand-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/20" />
                                <button type="submit" className="p-1.5 bg-brand-800 text-white rounded-lg hover:bg-brand-700 transition-colors"><Check size={14} /></button>
                                <button type="button" onClick={() => { setAdding(false); setNewTrack(""); }} className="p-1.5 text-stone-400 hover:bg-stone-100 rounded-lg"><X size={14} /></button>
                            </form>
                        ) : (
                            <button type="button" onClick={() => setAdding(true)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-brand-700 font-medium hover:bg-brand-50 rounded-lg transition-colors"><Plus size={14} /> Add new track</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Cohort Form Modal (Create & Edit) ── */
function CohortFormModal({ mode, cohort, onClose, onSubmit }: {
    mode: "create" | "edit";
    cohort?: Cohort;
    onClose: () => void;
    onSubmit: (data: any) => void;
}) {
    const [name, setName] = useState(cohort?.name ?? "");
    const [description, setDescription] = useState(cohort?.description ?? "");
    const [track, setTrack] = useState(cohort?.track ?? "");
    const [startDate, setStartDate] = useState(cohort?.startDate ?? "");
    const [endDate, setEndDate] = useState(cohort?.endDate ?? "");
    const [maxMembers, setMaxMembers] = useState(cohort?.maxMembers?.toString() ?? "40");
    const [status, setStatus] = useState<CohortStatus>(cohort?.status ?? "Upcoming");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = "Name is required";
        if (!description.trim()) e.description = "Description is required";
        if (!track) e.track = "Track is required";
        if (!startDate) e.startDate = "Start date is required";
        if (!endDate) e.endDate = "End date is required";
        if (!maxMembers || +maxMembers <= 0) e.maxMembers = "Max members must be > 0";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        onSubmit({ slug, name: name.trim(), description: description.trim(), track, startDate, endDate, maxMembers: +maxMembers, status });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="bg-brand-800 text-white p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">{mode === "create" ? "Create New Cohort" : "Edit Cohort"}</h2>
                        <p className="text-brand-200 text-sm mt-1">{mode === "create" ? "Set up a new learning cohort" : `Editing ${cohort?.name}`}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Cohort Name</label>
                        <input type="text" placeholder="e.g. Cohort Delta" value={name} onChange={e => setName(e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none ${errors.name ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Track</label>
                        <TrackPicker value={track} onChange={setTrack} />
                        {errors.track && <p className="text-red-500 text-xs mt-1">{errors.track}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Description</label>
                        <textarea placeholder="Brief description of this cohort..." rows={3} value={description} onChange={e => setDescription(e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none resize-none ${errors.description ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Status</label>
                        <div className="flex gap-2">
                            {(["Upcoming", "Active", "Completed"] as CohortStatus[]).map(s => (
                                <button key={s} type="button" onClick={() => setStatus(s)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${status === s ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Start Date</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none ${errors.startDate ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                            {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">End Date</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none ${errors.endDate ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                            {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Max Members</label>
                        <input type="number" placeholder="40" value={maxMembers} onChange={e => setMaxMembers(e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none ${errors.maxMembers ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                        {errors.maxMembers && <p className="text-red-500 text-xs mt-1">{errors.maxMembers}</p>}
                    </div>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-3 border border-stone-200 text-stone-600 rounded-xl font-semibold hover:bg-stone-50 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} className="flex-1 px-4 py-3 bg-brand-800 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors">{mode === "create" ? "Create Cohort" : "Save Changes"}</button>
                </div>
            </div>
        </div>
    );
}
