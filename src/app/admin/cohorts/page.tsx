"use client";

import { useState } from "react";
import Link from "next/link";
import {
    GraduationCap,
    Users,
    Calendar,
    Plus,
    Search,
    ArrowRight,
    X,
    CheckCircle2,
    Pencil,
    Trash2,
    Check,
    ChevronDown,
} from "lucide-react";

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

const MOCK_COHORTS: Cohort[] = [
    {
        id: 1,
        slug: "alpha",
        name: "Cohort Alpha",
        description: "Full-stack engineering intensive — building production-ready applications with modern tools.",
        status: "Active",
        members: 42,
        maxMembers: 50,
        phase: "Week 3: Research & Planning",
        startDate: "Jan 6, 2026",
        endDate: "Apr 3, 2026",
        health: "High",
        activeRate: 95,
        track: "Engineering",
    },
    {
        id: 2,
        slug: "beta",
        name: "Cohort Beta",
        description: "Product design bootcamp — from user research to high-fidelity prototyping.",
        status: "Active",
        members: 28,
        maxMembers: 35,
        phase: "Week 1: Onboarding",
        startDate: "Feb 3, 2026",
        endDate: "May 1, 2026",
        health: "Medium",
        activeRate: 82,
        track: "Product Design",
    },
    {
        id: 3,
        slug: "gamma",
        name: "Cohort Gamma",
        description: "Data science foundations — statistics, Python, and machine learning fundamentals.",
        status: "Upcoming",
        members: 18,
        maxMembers: 40,
        phase: "Enrollment Open",
        startDate: "Mar 10, 2026",
        endDate: "Jun 5, 2026",
        health: "High",
        activeRate: 0,
        track: "Data Science",
    },
    {
        id: 4,
        slug: "pioneer",
        name: "Cohort Pioneer",
        description: "Product management accelerator — strategy, roadmapping, and stakeholder management.",
        status: "Completed",
        members: 35,
        maxMembers: 35,
        phase: "Completed",
        startDate: "Sep 1, 2025",
        endDate: "Dec 15, 2025",
        health: "High",
        activeRate: 100,
        track: "Product Management",
    },
];

const statusConfig: Record<CohortStatus, { bg: string; text: string; dot: string }> = {
    Active: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
    Upcoming: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    Completed: { bg: "bg-stone-100", text: "text-stone-600", dot: "bg-stone-400" },
};

export default function AdminCohortsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"All" | CohortStatus>("All");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const filtered = MOCK_COHORTS.filter((c) => {
        const matchesSearch =
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.track.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: MOCK_COHORTS.length,
        active: MOCK_COHORTS.filter((c) => c.status === "Active").length,
        totalMembers: MOCK_COHORTS.reduce((sum, c) => sum + c.members, 0),
    };

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Cohorts</h1>
                    <p className="text-stone-500 mt-1">
                        Manage learning cohorts, track progress, and enroll members.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-brand-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-700 flex items-center gap-2 shadow-lg shadow-brand-800/10 transition-colors self-start"
                >
                    <Plus size={18} /> Create Cohort
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center gap-4">
                    <div className="p-3 bg-brand-50 rounded-xl">
                        <GraduationCap size={22} className="text-brand-700" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-stone-900">{stats.total}</p>
                        <p className="text-xs text-stone-500 font-medium">Total Cohorts</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-xl">
                        <CheckCircle2 size={22} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-stone-900">{stats.active}</p>
                        <p className="text-xs text-stone-500 font-medium">Active Now</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center gap-4">
                    <div className="p-3 bg-accent-50 rounded-xl">
                        <Users size={22} className="text-accent-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-stone-900">{stats.totalMembers}</p>
                        <p className="text-xs text-stone-500 font-medium">Total Enrolled</p>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search cohorts or tracks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    {(["All", "Active", "Upcoming", "Completed"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                                statusFilter === s
                                    ? "bg-brand-800 text-white"
                                    : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cohort Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filtered.map((cohort) => {
                    const sc = statusConfig[cohort.status];
                    return (
                        <Link
                            key={cohort.id}
                            href={`/admin/cohorts/${cohort.slug}`}
                            className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-brand-300 hover:shadow-lg transition-all group block"
                        >
                            {/* Top Row */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-brand-50 text-brand-700 rounded-xl group-hover:bg-brand-100 transition-colors">
                                        <GraduationCap size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-stone-900 group-hover:text-brand-700 transition-colors">
                                            {cohort.name}
                                        </h3>
                                        <p className="text-xs text-stone-500 font-medium">{cohort.track} Track</p>
                                    </div>
                                </div>
                                <span
                                    className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                                    {cohort.status}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-stone-500 mb-4 line-clamp-2">
                                {cohort.description}
                            </p>

                            {/* Phase */}
                            <div className="bg-stone-50 rounded-xl p-3 mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-stone-700">{cohort.phase}</span>
                                    <span className="text-xs font-semibold text-brand-600">
                                        {cohort.activeRate}% active
                                    </span>
                                </div>
                                <div className="w-full bg-stone-200 rounded-full h-1.5">
                                    <div
                                        className="bg-brand-600 h-1.5 rounded-full transition-all"
                                        style={{ width: `${cohort.activeRate}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Bottom Stats */}
                            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                                <div className="flex items-center gap-4 text-sm text-stone-600">
                                    <span className="flex items-center gap-1.5">
                                        <Users size={15} />
                                        <span className="font-medium">
                                            {cohort.members}/{cohort.maxMembers}
                                        </span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={15} />
                                        <span className="font-medium">{cohort.startDate}</span>
                                    </span>
                                </div>
                                <ArrowRight
                                    size={18}
                                    className="text-stone-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all"
                                />
                            </div>
                        </Link>
                    );
                })}

                {/* Create New Card */}
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="border-2 border-dashed border-stone-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-brand-300 hover:bg-stone-50 cursor-pointer transition-colors min-h-[280px]"
                >
                    <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-stone-400">
                        <Plus size={26} />
                    </div>
                    <p className="font-bold text-stone-600">Create New Cohort</p>
                    <p className="text-xs text-stone-400 mt-1">Start a new learning cohort</p>
                </button>
            </div>

            {/* Create Cohort Modal */}
            {showCreateModal && (
                <CreateCohortModal onClose={() => setShowCreateModal(false)} />
            )}
        </div>
    );
}

/* ── Inline CRUD Track Picker ── */
const DEFAULT_TRACKS = ["Engineering", "Product Design", "Product Management", "Data Science"];

function TrackPicker({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const [tracks, setTracks] = useState<string[]>(DEFAULT_TRACKS);
    const [open, setOpen] = useState(false);
    const [adding, setAdding] = useState(false);
    const [newTrack, setNewTrack] = useState("");
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");

    const handleAdd = () => {
        const trimmed = newTrack.trim();
        if (!trimmed || tracks.includes(trimmed)) return;
        setTracks((prev) => [...prev, trimmed]);
        onChange(trimmed);
        setNewTrack("");
        setAdding(false);
    };

    const handleEdit = (idx: number) => {
        const trimmed = editValue.trim();
        if (!trimmed || tracks.includes(trimmed)) return;
        setTracks((prev) => prev.map((t, i) => (i === idx ? trimmed : t)));
        if (value === tracks[idx]) onChange(trimmed);
        setEditingIdx(null);
        setEditValue("");
    };

    const handleDelete = (idx: number) => {
        const removed = tracks[idx];
        const next = tracks.filter((_, i) => i !== idx);
        setTracks(next);
        if (value === removed) onChange(next[0] ?? "");
    };

    return (
        <div className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none bg-white text-left"
            >
                <span className={value ? "text-stone-800" : "text-stone-400"}>
                    {value || "Select a track"}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-stone-400 transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-20 mt-1.5 w-full bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
                    <ul className="max-h-52 overflow-y-auto py-1">
                        {tracks.map((track, idx) => (
                            <li
                                key={track}
                                className="group flex items-center gap-2 px-3 py-2 hover:bg-stone-50 text-sm"
                            >
                                {editingIdx === idx ? (
                                    /* Editing row */
                                    <form
                                        className="flex items-center gap-2 w-full"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleEdit(idx);
                                        }}
                                    >
                                        <input
                                            autoFocus
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="flex-1 px-2 py-1 border border-brand-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                                        />
                                        <button
                                            type="submit"
                                            className="p-1 text-green-600 hover:bg-green-50 rounded-md"
                                        >
                                            <Check size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingIdx(null)}
                                            className="p-1 text-stone-400 hover:bg-stone-100 rounded-md"
                                        >
                                            <X size={14} />
                                        </button>
                                    </form>
                                ) : (
                                    /* Normal row */
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onChange(track);
                                                setOpen(false);
                                            }}
                                            className={`flex-1 text-left truncate ${
                                                value === track
                                                    ? "font-semibold text-brand-700"
                                                    : "text-stone-700"
                                            }`}
                                        >
                                            {track}
                                        </button>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingIdx(idx);
                                                    setEditValue(track);
                                                }}
                                                className="p-1 text-stone-400 hover:text-brand-600 hover:bg-brand-50 rounded-md"
                                                title="Rename track"
                                            >
                                                <Pencil size={13} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(idx)}
                                                className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                                title="Delete track"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Add new track */}
                    <div className="border-t border-stone-100 p-2">
                        {adding ? (
                            <form
                                className="flex items-center gap-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleAdd();
                                }}
                            >
                                <input
                                    autoFocus
                                    value={newTrack}
                                    onChange={(e) => setNewTrack(e.target.value)}
                                    placeholder="New track name"
                                    className="flex-1 px-3 py-2 border border-brand-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                                />
                                <button
                                    type="submit"
                                    className="p-1.5 bg-brand-800 text-white rounded-lg hover:bg-brand-700 transition-colors"
                                >
                                    <Check size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAdding(false);
                                        setNewTrack("");
                                    }}
                                    className="p-1.5 text-stone-400 hover:bg-stone-100 rounded-lg"
                                >
                                    <X size={14} />
                                </button>
                            </form>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setAdding(true)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-brand-700 font-medium hover:bg-brand-50 rounded-lg transition-colors"
                            >
                                <Plus size={14} />
                                Add new track
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function CreateCohortModal({ onClose }: { onClose: () => void }) {
    const [track, setTrack] = useState("");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="bg-brand-800 text-white p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Create New Cohort</h2>
                        <p className="text-brand-200 text-sm mt-1">Set up a new learning cohort</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                            Cohort Name
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Cohort Delta"
                            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                            Track
                        </label>
                        <TrackPicker value={track} onChange={setTrack} />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                            Description
                        </label>
                        <textarea
                            placeholder="Brief description of this cohort..."
                            rows={3}
                            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                                Start Date
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                                End Date
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                            Max Members
                        </label>
                        <input
                            type="number"
                            placeholder="40"
                            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-stone-200 text-stone-600 rounded-xl font-semibold hover:bg-stone-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-brand-800 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors"
                    >
                        Create Cohort
                    </button>
                </div>
            </div>
        </div>
    );
}
