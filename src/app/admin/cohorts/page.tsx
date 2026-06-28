"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    GraduationCap, Users, Calendar, Plus, Search, ArrowRight, X,
    CheckCircle2, Pencil, Trash2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api";
import { useCohorts, cohortStatusLabel, fmtCohortDate } from "@/hooks/use-cohorts";
import { useCreateCohort, useUpdateCohort } from "@/hooks/use-admin-cohorts";
import type { Cohort, CohortStatus } from "@/lib/types";

const ITEMS_PER_PAGE = 4;

const STATUS_FILTERS = ["All", "ACTIVE", "UPCOMING", "COMPLETED"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function AdminCohortsPage() {
    const { cohorts, isLoading, error, mutate } = useCohorts();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Cohort | null>(null);
    const [page, setPage] = useState(1);
    const { toast } = useToast();
    const { getToken } = useAuth();

    const filtered = useMemo(() => {
        return cohorts.filter((c) => {
            const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "All" || c.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [cohorts, searchQuery, statusFilter]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleFilterChange = (s: StatusFilter) => { setStatusFilter(s); setPage(1); };
    const handleSearchChange = (q: string) => { setSearchQuery(q); setPage(1); };

    const stats = useMemo(() => ({
        total: cohorts.length,
        active: cohorts.filter((c) => c.status === "ACTIVE").length,
        totalMembers: cohorts.reduce((sum, c) => sum + (c._count?.members ?? 0), 0),
    }), [cohorts]);

    const handleDeleteCohort = async () => {
        if (!deleteConfirm) return;
        try {
            const token = await getToken();
            await apiClient(`/admin/cohorts/${deleteConfirm.id}`, { method: "DELETE", token });
            toast("Cohort deleted", "success");
            mutate();
        } catch {
            toast("Failed to delete cohort", "error");
        }
        setDeleteConfirm(null);
    };

    if (isLoading) {
        return (
            <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
                </div>
            </div>
        );
    }

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
                    <input type="text" placeholder="Search cohorts..." value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
                </div>
                <div className="flex gap-2">
                    {STATUS_FILTERS.map((s) => (
                        <button key={s} onClick={() => handleFilterChange(s)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${statusFilter === s ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
                            {s === "All" ? "All" : cohortStatusLabel(s)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cohort Cards */}
            {filtered.length === 0 ? (
                <EmptyState
                    icon={GraduationCap}
                    heading={error ? "Could not load cohorts" : "No cohorts match your search."}
                    description={error ? "Check your connection and try again." : undefined}
                    action={{ label: "Clear filters", onClick: () => { setSearchQuery(""); setStatusFilter("All"); setPage(1); } }}
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {paginated.map((cohort) => (
                            <div key={cohort.id} className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-brand-300 hover:shadow-lg transition-all group relative">
                                {/* Action buttons */}
                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button onClick={() => setEditingCohort(cohort)} title="Edit" className="p-2 rounded-xl bg-white border border-stone-200 text-stone-400 hover:text-brand-600 hover:border-brand-300 shadow-sm transition-colors">
                                        <Pencil size={14} />
                                    </button>
                                    <button onClick={() => setDeleteConfirm(cohort)} title="Delete" className="p-2 rounded-xl bg-white border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-300 shadow-sm transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <Link href={`/admin/cohorts/${cohort.slug || cohort.id}`} className="block">
                                    <div className="flex items-start justify-between mb-4 pr-20">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-brand-50 text-brand-700 rounded-xl group-hover:bg-brand-100 transition-colors"><GraduationCap size={22} /></div>
                                            <div>
                                                <h3 className="text-lg font-bold text-stone-900 group-hover:text-brand-700 transition-colors">{cohort.name}</h3>
                                            </div>
                                        </div>
                                        <StatusBadge label={cohortStatusLabel(cohort.status)} preset={cohortStatusLabel(cohort.status) as "Active" | "Upcoming" | "Completed"} />
                                    </div>

                                    {cohort.description && (
                                        <p className="text-sm text-stone-500 mb-4 line-clamp-2">{cohort.description}</p>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                                        <div className="flex items-center gap-4 text-sm text-stone-600">
                                            <span className="flex items-center gap-1.5"><Users size={15} /><span className="font-medium">{cohort._count?.members ?? 0}</span></span>
                                            {cohort.startDate && (
                                                <span className="flex items-center gap-1.5"><Calendar size={15} /><span className="font-medium">{fmtCohortDate(cohort.startDate)}</span></span>
                                            )}
                                        </div>
                                        <ArrowRight size={18} className="text-stone-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            </div>
                        ))}

                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-sm text-stone-500">
                                Showing {(page - 1) * ITEMS_PER_PAGE + 1}&ndash;{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    <ChevronLeft size={18} />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${page === p ? "bg-brand-800 text-white" : "border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
                                        {p}
                                    </button>
                                ))}
                                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <CohortFormModal
                    mode="create"
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => { setShowCreateModal(false); mutate(); }}
                />
            )}

            {/* Edit Modal */}
            {editingCohort && (
                <CohortFormModal
                    mode="edit"
                    cohort={editingCohort}
                    onClose={() => setEditingCohort(null)}
                    onSuccess={() => { setEditingCohort(null); mutate(); }}
                />
            )}

            {/* Delete Confirmation */}
            <ConfirmModal
                open={deleteConfirm !== null}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDeleteCohort}
                title="Delete Cohort?"
                description="This will permanently remove this cohort. This action cannot be undone."
            />
        </div>
        </ErrorBoundary>
    );
}

/* ── Cohort Form Modal (Create & Edit) ── */

function CohortFormModal({ mode, cohort, onClose, onSuccess }: {
    mode: "create" | "edit";
    cohort?: Cohort;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [name, setName] = useState(cohort?.name ?? "");
    const [track, setTrack] = useState("");
    const [description, setDescription] = useState(cohort?.description ?? "");
    const [startDate, setStartDate] = useState(cohort?.startDate?.split("T")[0] ?? "");
    const [endDate, setEndDate] = useState(cohort?.endDate?.split("T")[0] ?? "");
    const [status, setStatus] = useState<CohortStatus>(cohort?.status ?? "UPCOMING");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    const createMut = useCreateCohort();
    const updateMut = useUpdateCohort(cohort?.id ?? "");

    const validate = () => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = "Name is required";
        if (mode === "create" && !track.trim()) e.track = "Track is required";
        if (!description.trim()) e.description = "Description is required";
        if (!startDate) e.startDate = "Start date is required";
        if (!endDate) e.endDate = "End date is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        const trimmedName = name.trim();
        const autoSlug = trimmedName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
        const baseFields = {
            name: trimmedName,
            description: description.trim(),
            status,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
        };
        try {
            if (mode === "create") {
                await createMut.trigger({ ...baseFields, slug: autoSlug, track: track.trim() });
                toast("Cohort created", "success");
            } else {
                await updateMut.trigger({ ...baseFields, ...(track.trim() ? { track: track.trim() } : {}) });
                toast("Cohort updated", "success");
            }
            onSuccess();
        } catch {
            toast(`Failed to ${mode} cohort`, "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
                        <input type="text" placeholder="e.g. Cohort Delta" value={name} onChange={(e) => setName(e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none ${errors.name ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                            Track {mode === "create" && <span className="text-red-500">*</span>}
                        </label>
                        <input type="text" placeholder="e.g. Software Engineering, Product, Design" value={track} onChange={(e) => setTrack(e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none ${errors.track ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                        {errors.track && <p className="text-red-500 text-xs mt-1">{errors.track}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Description</label>
                        <textarea placeholder="Brief description of this cohort..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none resize-none ${errors.description ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Status</label>
                        <div className="flex gap-2">
                            {(["UPCOMING", "ACTIVE", "COMPLETED"] as CohortStatus[]).map((s) => (
                                <button key={s} type="button" onClick={() => setStatus(s)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${status === s ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
                                    {cohortStatusLabel(s)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Start Date</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none ${errors.startDate ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                            {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">End Date</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none ${errors.endDate ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                            {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                        </div>
                    </div>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-3 border border-stone-200 text-stone-600 rounded-xl font-semibold hover:bg-stone-50 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={submitting} className="flex-1 px-4 py-3 bg-brand-800 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors disabled:opacity-50">
                        {submitting ? "Saving..." : mode === "create" ? "Create Cohort" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
