"use client";

import { useUser } from "@/context/UserContext";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
    Target, Plus, Check, Edit2, Trash2, Save, X, ChevronDown, ChevronUp,
    Upload, FileText, Image as ImageIcon, File, ArrowLeft, CheckCircle,
    Clock, Circle, Paperclip, Eye, Download, AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorBoundary } from "@/components/ui/error-boundary";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Evidence {
    id: number;
    name: string;
    url: string;          // dataURL or blob url
    type: string;         // mime type
    uploadedAt: string;
}

interface DevGoal {
    id: number;
    text: string;
    done: boolean;
    details: string;
    status: "not-started" | "in-progress" | "completed";
    evidence: Evidence[];
    createdAt: string;
}

type FilterTab = "all" | "not-started" | "in-progress" | "completed";

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_GOALS: DevGoal[] = [
    {
        id: 1, text: "Build Portfolio", done: true, status: "completed",
        details: "Create a personal portfolio website showcasing my top 5 projects, case studies, and testimonials from colleagues.",
        evidence: [], createdAt: "2025-11-01",
    },
    {
        id: 2, text: "10 Coffee Chats", done: true, status: "completed",
        details: "Schedule and complete 10 informational interviews with professionals in my target industry.",
        evidence: [], createdAt: "2025-11-15",
    },
    {
        id: 3, text: "Update Resume", done: true, status: "completed",
        details: "Revise resume with latest experience, quantified achievements, and tailor for target roles.",
        evidence: [], createdAt: "2025-12-01",
    },
    {
        id: 4, text: "Apply to 5 Jobs", done: false, status: "in-progress",
        details: "Research and apply to 5 roles that match my skills and career goals. Customise each application.",
        evidence: [], createdAt: "2026-01-10",
    },
    {
        id: 5, text: "Mock Interview", done: false, status: "not-started",
        details: "Complete at least 2 mock interviews with a mentor or peer. Record and review for improvement.",
        evidence: [], createdAt: "2026-02-01",
    },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function loadJSON<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        // migrate old simple goals format → new format with details/status/evidence
        if (Array.isArray(parsed) && parsed.length > 0 && !("status" in parsed[0])) {
            return parsed.map((g: any, i: number) => ({
                ...g,
                details: g.details || "",
                status: g.done ? "completed" : "not-started",
                evidence: g.evidence || [],
                createdAt: g.createdAt || new Date().toISOString().split("T")[0],
            })) as T;
        }
        return parsed;
    } catch {
        return fallback;
    }
}

function devPlanStorageKey(email?: string) {
    const normalized = email?.trim().toLowerCase();
    return normalized ? `bgg-goals:${normalized}` : "bgg-goals";
}

const STATUS_CONFIG = {
    "not-started": { label: "To Do", color: "stone", icon: Circle, bg: "bg-stone-100", text: "text-stone-600", badge: "bg-stone-100 text-stone-600 border-stone-200" },
    "in-progress": { label: "In Progress", color: "amber", icon: Clock, bg: "bg-amber-100", text: "text-amber-700", badge: "bg-amber-50 text-amber-700 border-amber-200" },
    "completed": { label: "Completed", color: "green", icon: CheckCircle, bg: "bg-green-100", text: "text-green-700", badge: "bg-green-50 text-green-700 border-green-200" },
};

function fileIcon(type: string) {
    if (type.startsWith("image/")) return ImageIcon;
    if (type.includes("pdf")) return FileText;
    return File;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MemberDevPlanPage() {
    const { user } = useUser();
    const storageKey = devPlanStorageKey(user.email);

    /* State */
    const [goals, setGoals] = useState<DevGoal[]>(() => loadJSON(storageKey, loadJSON("bgg-goals", DEFAULT_GOALS)));
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ text: "", details: "", status: "not-started" as DevGoal["status"] });
    const [filter, setFilter] = useState<FilterTab>("all");
    const [showAdd, setShowAdd] = useState(false);
    const [newGoal, setNewGoal] = useState({ text: "", details: "" });
    const { toast } = useToast();
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [previewEvidence, setPreviewEvidence] = useState<Evidence | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadTargetId = useRef<number | null>(null);

    /* Persist */
    useEffect(() => {
        setGoals(loadJSON(storageKey, loadJSON("bgg-goals", DEFAULT_GOALS)));
    }, [storageKey]);

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(goals));
        if (storageKey !== "bgg-goals") {
            localStorage.removeItem("bgg-goals");
        }
    }, [goals, storageKey]);

    /* Derived */
    const counts = useMemo(() => ({
        all: goals.length,
        "not-started": goals.filter(g => g.status === "not-started").length,
        "in-progress": goals.filter(g => g.status === "in-progress").length,
        completed: goals.filter(g => g.status === "completed").length,
    }), [goals]);

    const doneCount = counts.completed;
    const progress = goals.length ? Math.round((doneCount / goals.length) * 100) : 0;
    const allDone = goals.length > 0 && doneCount === goals.length;

    const filtered = useMemo(() =>
        filter === "all" ? goals : goals.filter(g => g.status === filter)
    , [goals, filter]);

    /* Handlers */
    const flash = () => { toast("Changes saved"); };

    const startNewPlan = () => {
        setGoals([]);
        setShowAdd(true);
        setFilter("all");
        toast("Previous plan cleared. Set your new goals!", "success");
    };

    const addGoal = () => {
        if (!newGoal.text.trim()) return;
        setGoals(prev => [...prev, {
            id: Date.now(),
            text: newGoal.text.trim(),
            details: newGoal.details.trim(),
            done: false,
            status: "not-started",
            evidence: [],
            createdAt: new Date().toISOString().split("T")[0],
        }]);
        setNewGoal({ text: "", details: "" });
        setShowAdd(false);
        flash();
    };

    const startEdit = (g: DevGoal) => {
        setEditingId(g.id);
        setEditForm({ text: g.text, details: g.details, status: g.status });
        setExpandedId(g.id);
    };

    const saveEdit = () => {
        if (!editForm.text.trim()) return;
        setGoals(prev => prev.map(g => g.id === editingId ? {
            ...g,
            text: editForm.text.trim(),
            details: editForm.details.trim(),
            status: editForm.status,
            done: editForm.status === "completed",
        } : g));
        setEditingId(null);
        flash();
    };

    const cycleStatus = (id: number) => {
        const order: DevGoal["status"][] = ["not-started", "in-progress", "completed"];
        setGoals(prev => prev.map(g => {
            if (g.id !== id) return g;
            const next = order[(order.indexOf(g.status) + 1) % 3];
            return { ...g, status: next, done: next === "completed" };
        }));
    };

    const deleteGoal = (id: number) => {
        setGoals(prev => prev.filter(g => g.id !== id));
        setDeleteConfirmId(null);
        if (expandedId === id) setExpandedId(null);
        if (editingId === id) setEditingId(null);
    };

    const triggerUpload = (goalId: number) => {
        uploadTargetId.current = goalId;
        fileInputRef.current?.click();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        const goalId = uploadTargetId.current;
        if (!files || !goalId) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result !== "string") return;
                const ev: Evidence = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    url: reader.result,
                    type: file.type,
                    uploadedAt: new Date().toISOString().split("T")[0],
                };
                setGoals(prev => prev.map(g =>
                    g.id === goalId ? { ...g, evidence: [...g.evidence, ev] } : g
                ));
            };
            reader.readAsDataURL(file);
        });

        e.target.value = "";
        flash();
    };

    const removeEvidence = (goalId: number, evId: number) => {
        setGoals(prev => prev.map(g =>
            g.id === goalId ? { ...g, evidence: g.evidence.filter(e => e.id !== evId) } : g
        ));
    };

    const tabs: { key: FilterTab; label: string }[] = [
        { key: "all", label: "All" },
        { key: "not-started", label: "To Do" },
        { key: "in-progress", label: "In Progress" },
        { key: "completed", label: "Completed" },
    ];

    return (
        <ErrorBoundary>
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileUpload} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/member/profile" className="p-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-400 hover:text-stone-600">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-accent-100 text-accent-600 rounded-2xl"><Target size={24} /></div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Development Plan</h1>
                            <p className="text-sm text-stone-500">{user.name}&apos;s career goals &amp; milestones</p>
                        </div>
                    </div>
                </div>
                <button onClick={() => { setShowAdd(true); setEditingId(null); }} className="px-5 py-2.5 bg-brand-800 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors flex items-center gap-2 self-start md:self-auto">
                    <Plus size={16} /> Add Goal
                </button>
            </div>

            {/* Progress Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                        <p className="text-sm font-bold text-stone-400 uppercase tracking-wider">Overall Progress</p>
                        <p className="text-3xl font-bold text-stone-900 mt-1">{progress}%</p>
                    </div>
                    <div className="flex gap-3">
                        {(["not-started", "in-progress", "completed"] as const).map(s => {
                            const cfg = STATUS_CONFIG[s];
                            return (
                                <div key={s} className={`px-4 py-2 rounded-xl border ${cfg.badge} text-center`}>
                                    <p className="text-lg font-bold">{counts[s]}</p>
                                    <p className="text-xs font-medium">{cfg.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="w-full h-4 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent-500 to-brand-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* All Goals Complete Banner */}
            {allDone && (
                <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border border-green-200 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={28} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-stone-900">All goals completed! 🎉</h3>
                        <p className="text-sm text-stone-500 mt-1">Amazing work — you&apos;ve crushed every goal in your plan. Ready to level up with new ones?</p>
                    </div>
                    <button
                        onClick={startNewPlan}
                        className="px-6 py-3 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm flex items-center gap-2 flex-shrink-0"
                    >
                        <Target size={16} /> Set New Plan
                    </button>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setFilter(t.key)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === t.key ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-brand-200 hover:text-brand-700"}`}>
                        {t.label} <span className="ml-1 opacity-70">({counts[t.key]})</span>
                    </button>
                ))}
            </div>

            {/* Add Goal Form */}
            {showAdd && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-dashed border-brand-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-stone-900">New Goal</h3>
                        <button onClick={() => { setShowAdd(false); setNewGoal({ text: "", details: "" }); }} className="p-1 text-stone-400 hover:text-stone-600"><X size={18} /></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Goal Title *</label>
                            <input type="text" value={newGoal.text} onChange={e => setNewGoal(p => ({ ...p, text: e.target.value }))} onKeyDown={e => e.key === "Enter" && addGoal()} placeholder="e.g. Complete AWS Certification" className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 outline-none text-sm" autoFocus />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Details / Description</label>
                            <textarea value={newGoal.details} onChange={e => setNewGoal(p => ({ ...p, details: e.target.value }))} rows={3} placeholder="Add more context, milestones, or notes about this goal..." className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 outline-none text-sm resize-none" />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => { setShowAdd(false); setNewGoal({ text: "", details: "" }); }} className="px-5 py-2.5 border border-stone-200 rounded-xl font-bold text-sm text-stone-600 hover:bg-stone-50">Cancel</button>
                            <button onClick={addGoal} disabled={!newGoal.text.trim()} className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors ${newGoal.text.trim() ? "bg-brand-800 text-white hover:bg-brand-700" : "bg-stone-100 text-stone-400 cursor-not-allowed"}`}>
                                <Plus size={16} /> Add Goal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Goals List */}
            <div className="space-y-4">
                {filtered.length === 0 && (
                    <EmptyState
                        icon={Target}
                        heading="No goals in this category"
                        action={{ label: "+ Add your first goal", onClick: () => { setShowAdd(true); setFilter("all"); } }}
                        variant="plain"
                        className="bg-white rounded-3xl p-12 border border-stone-100 shadow-sm"
                    />
                )}

                {filtered.map(goal => {
                    const cfg = STATUS_CONFIG[goal.status];
                    const StatusIcon = cfg.icon;
                    const isExpanded = expandedId === goal.id;
                    const isEditing = editingId === goal.id;

                    return (
                        <div key={goal.id} className={`bg-white rounded-3xl border shadow-sm transition-all ${isEditing ? "border-brand-200 ring-2 ring-brand-100" : "border-stone-100 hover:border-stone-200"}`}>
                            {/* Goal header */}
                            <div className="p-6 flex items-start gap-4">
                                {/* Status button */}
                                <button onClick={() => cycleStatus(goal.id)} title={`Status: ${cfg.label} (click to cycle)`} className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${cfg.bg} ${cfg.text} hover:opacity-80`}>
                                    <StatusIcon size={16} />
                                </button>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {isEditing ? (
                                        <input type="text" value={editForm.text} onChange={e => setEditForm(p => ({ ...p, text: e.target.value }))} className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-brand-500/20 outline-none" autoFocus />
                                    ) : (
                                        <h3 className={`font-bold text-stone-900 ${goal.done ? "line-through text-stone-400" : ""}`}>{goal.text}</h3>
                                    )}
                                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                        <StatusBadge label={cfg.label} preset={cfg.label as any} variant="pill" />
                                        <span className="text-xs text-stone-400">Created {goal.createdAt}</span>
                                        {goal.evidence.length > 0 && (
                                            <span className="text-xs text-stone-400 flex items-center gap-1"><Paperclip size={12} /> {goal.evidence.length} file{goal.evidence.length > 1 ? "s" : ""}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    {!isEditing && (
                                        <button onClick={() => startEdit(goal)} className="p-2 text-stone-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all" title="Edit">
                                            <Edit2 size={16} />
                                        </button>
                                    )}
                                    <button onClick={() => setDeleteConfirmId(goal.id)} className="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                    <button onClick={() => setExpandedId(isExpanded ? null : goal.id)} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-xl transition-all">
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Expanded detail */}
                            {isExpanded && (
                                <div className="px-6 pb-6 border-t border-stone-100 pt-5 space-y-5">
                                    {/* Details */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Details & Notes</label>
                                        {isEditing ? (
                                            <textarea value={editForm.details} onChange={e => setEditForm(p => ({ ...p, details: e.target.value }))} rows={4} className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 outline-none text-sm resize-none" placeholder="Add details, milestones, or notes..." />
                                        ) : (
                                            <p className="text-sm text-stone-600 leading-relaxed bg-stone-50 rounded-xl p-4 whitespace-pre-wrap">
                                                {goal.details || <span className="text-stone-400 italic">No details added yet. Click Edit to add more context.</span>}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status selector (edit mode) */}
                                    {isEditing && (
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Status</label>
                                            <div className="flex gap-2">
                                                {(["not-started", "in-progress", "completed"] as const).map(s => {
                                                    const sc = STATUS_CONFIG[s];
                                                    return (
                                                        <button key={s} onClick={() => setEditForm(p => ({ ...p, status: s }))} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${editForm.status === s ? `${sc.badge} ring-2 ring-offset-1 ring-current` : "border-stone-200 text-stone-500 hover:border-stone-300"}`}>
                                                            {sc.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Evidence / Uploads */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Evidence &amp; Attachments</label>
                                            <button onClick={() => triggerUpload(goal.id)} className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors">
                                                <Upload size={13} /> Upload
                                            </button>
                                        </div>

                                        {goal.evidence.length === 0 ? (
                                            <button onClick={() => triggerUpload(goal.id)} className="w-full border-2 border-dashed border-stone-200 rounded-xl p-6 text-center hover:border-brand-300 hover:bg-brand-50/30 transition-all group">
                                                <Upload size={24} className="mx-auto text-stone-300 group-hover:text-brand-400 mb-2" />
                                                <p className="text-sm text-stone-400 group-hover:text-brand-600 font-medium">Drop files or click to upload evidence</p>
                                                <p className="text-xs text-stone-300 mt-1">Images, PDFs, documents</p>
                                            </button>
                                        ) : (
                                            <div className="space-y-2">
                                                {goal.evidence.map(ev => {
                                                    const Icon = fileIcon(ev.type);
                                                    const isImage = ev.type.startsWith("image/");
                                                    return (
                                                        <div key={ev.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100 group hover:border-stone-200 transition-all">
                                                            {isImage ? (
                                                                <img src={ev.url} alt={ev.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-stone-200" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                                                                    <Icon size={18} className="text-stone-500" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-stone-700 truncate">{ev.name}</p>
                                                                <p className="text-xs text-stone-400">Uploaded {ev.uploadedAt}</p>
                                                            </div>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                                {isImage && (
                                                                    <button onClick={() => setPreviewEvidence(ev)} className="p-1.5 text-stone-400 hover:text-brand-600 rounded-lg hover:bg-brand-50" title="Preview">
                                                                        <Eye size={14} />
                                                                    </button>
                                                                )}
                                                                <a href={ev.url} download={ev.name} className="p-1.5 text-stone-400 hover:text-brand-600 rounded-lg hover:bg-brand-50" title="Download">
                                                                    <Download size={14} />
                                                                </a>
                                                                <button onClick={() => removeEvidence(goal.id, ev.id)} className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50" title="Remove">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <button onClick={() => triggerUpload(goal.id)} className="w-full border border-dashed border-stone-200 rounded-xl p-3 text-center hover:border-brand-300 transition-all text-xs font-medium text-stone-400 hover:text-brand-600 flex items-center justify-center gap-1.5">
                                                    <Plus size={14} /> Add more files
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Edit save/cancel */}
                                    {isEditing && (
                                        <div className="flex gap-2 pt-2 justify-end border-t border-stone-100">
                                            <button onClick={() => setEditingId(null)} className="px-5 py-2.5 border border-stone-200 rounded-xl font-bold text-sm text-stone-600 hover:bg-stone-50 transition-colors">Cancel</button>
                                            <button onClick={saveEdit} disabled={!editForm.text.trim()} className="px-5 py-2.5 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors flex items-center gap-2">
                                                <Save size={16} /> Save Changes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Delete Goal Confirmation */}
            <ConfirmModal
                open={deleteConfirmId !== null}
                onClose={() => setDeleteConfirmId(null)}
                onConfirm={() => deleteGoal(deleteConfirmId!)}
                title="Delete Goal?"
                description="This goal and its evidence will be permanently removed."
                icon={Trash2}
            />

            {/* Image Preview Modal */}
            {previewEvidence && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewEvidence(null)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-stone-100">
                            <p className="font-bold text-stone-900 truncate">{previewEvidence.name}</p>
                            <button onClick={() => setPreviewEvidence(null)} className="p-1 text-stone-400 hover:text-stone-600"><X size={20} /></button>
                        </div>
                        <div className="p-4 max-h-[70vh] overflow-auto flex items-center justify-center bg-stone-50">
                            <img src={previewEvidence.url} alt={previewEvidence.name} className="max-w-full max-h-[60vh] rounded-xl object-contain" />
                        </div>
                    </div>
                </div>
            )}
        </div>
        </ErrorBoundary>
    );
}
