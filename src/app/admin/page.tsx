"use client";

import { useUser } from "@/context/UserContext";
import { Users, Activity, AlertTriangle, Calendar, Plus, X, Check, UserPlus, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useMembers } from "@/hooks/use-members";
import { useEvents } from "@/hooks/use-events";
import { useCohorts, cohortStatusLabel } from "@/hooks/use-cohorts";
import { useCommunityGroups } from "@/hooks/use-community";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

type DateRange = "thisYear" | "30days" | "7days";

const CHART_DATA: Record<DateRange, { bars: number[]; labels: string[] }> = {
    thisYear: { bars: [35, 42, 38, 55, 62, 58, 75, 82, 90, 85, 94, 100], labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] },
    "30days": { bars: [65, 72, 68, 80], labels: ["Week 1", "Week 2", "Week 3", "Week 4"] },
    "7days": { bars: [78, 82, 75, 90, 88, 95, 92], labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
};

export default function AdminDashboard() {
    const { user } = useUser();
    const [showAddUser, setShowAddUser] = useState(false);
    const [showNewEvent, setShowNewEvent] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange>("thisYear");
    const [recentUsers, setRecentUsers] = useState<{ name: string; email: string; role: string }[]>([]);
    const [recentEvents, setRecentEvents] = useState<{ title: string; date: string; type: string }[]>([]);

    const { members, isLoading: membersLoading } = useMembers();
    const { events } = useEvents();
    const { cohorts } = useCohorts();
    const { groups } = useCommunityGroups();

    const totalMembers = members.length;
    const upcomingEvents = events.filter(e => new Date(e.scheduledAt) > new Date()).length;
    const activeCohorts = cohorts.filter(c => cohortStatusLabel(c.status) === "Active");
    const totalGroups = groups.length;

    const chartData = CHART_DATA[dateRange];

    return (
        <motion.div initial="hidden" animate="show" variants={container} className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
            {/* Welcome */}
            <motion.div variants={item}>
                <h1 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">Welcome back, {user.name.split(" ")[0]}</h1>
                <p className="text-lg text-stone-500 mt-2">Here&apos;s the high-level overview of community health.</p>
            </motion.div>

            <motion.div variants={item}>
              <ErrorBoundary>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">
                    {/* Stats */}
                    <AdminStatCard title="Total Members" value={membersLoading ? "—" : totalMembers.toLocaleString()} change={`${activeCohorts.length} cohorts`} icon={Users} />
                    <AdminStatCard title="Upcoming Events" value={upcomingEvents.toString()} change={`${events.length} total`} icon={Calendar} />
                    <AdminStatCard title="Community Groups" value={totalGroups.toString()} change="Active" icon={Activity} isHealth />

                    {/* Growth Chart */}
                    <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-stone-100 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-stone-900">Member Growth</h3>
                                <p className="text-sm text-stone-500">New vs Returning Users</p>
                            </div>
                            <div className="relative">
                                <select value={dateRange} onChange={e => setDateRange(e.target.value as DateRange)} className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-1 text-xs font-medium text-stone-600 outline-none appearance-none pr-7">
                                    <option value="thisYear">This Year</option>
                                    <option value="30days">Last 30 Days</option>
                                    <option value="7days">Last 7 Days</option>
                                </select>
                                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="flex-1 flex items-end justify-between gap-2 h-48 px-2">
                            {chartData.bars.map((h, i) => (
                                <div key={i} className="w-full h-full bg-stone-100 rounded-t-md relative group" title={`${chartData.labels[i]}: ${h}%`}>
                                    <div className="absolute bottom-0 left-0 right-0 bg-brand-600 rounded-t-md transition-all duration-500 hover:bg-brand-700" style={{ height: `${h}%` }}></div>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">{h}%</div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-3 text-[10px] text-stone-400 font-bold uppercase tracking-wider px-2">
                            {chartData.labels.map((l, i) => <span key={i}>{l}</span>)}
                        </div>
                    </div>

                    {/* Quick Actions & Reports */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
                            <h3 className="font-bold text-stone-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setShowAddUser(true)} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors">
                                    <UserPlus size={20} />
                                    <span className="text-xs font-semibold">Add User</span>
                                </button>
                                <button onClick={() => setShowNewEvent(true)} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-stone-50 text-stone-700 hover:bg-stone-100 transition-colors">
                                    <Calendar size={20} />
                                    <span className="text-xs font-semibold">New Event</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-stone-900">Recent Reports</h3>
                                <Link href="/admin/moderation" className="bg-rose-100 text-rose-600 text-xs px-2 py-0.5 rounded-full font-bold hover:bg-rose-200 transition-colors">2 New</Link>
                            </div>
                            <div className="space-y-3">
                                <ReportItem user="Sarah J." reason="Inappropriate comment" time="2h ago" />
                                <ReportItem user="Davon L." reason="Spam profile" time="5h ago" />
                            </div>
                        </div>
                    </div>

                    {/* Recently Added Users */}
                    {recentUsers.length > 0 && (
                        <div className="md:col-span-3 bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
                            <h3 className="font-bold text-stone-900 mb-4">Recently Added Users</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {recentUsers.slice(0, 3).map((u, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                                        <AvatarInitials name={u.name} size="sm" />
                                        <div>
                                            <p className="text-sm font-bold text-stone-900">{u.name}</p>
                                            <p className="text-xs text-stone-500">{u.email} &middot; {u.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recently Created Events */}
                    {recentEvents.length > 0 && (
                        <div className="md:col-span-3 bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
                            <h3 className="font-bold text-stone-900 mb-4">Recently Created Events</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {recentEvents.slice(0, 3).map((e, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700"><Calendar size={16} /></div>
                                        <div>
                                            <p className="text-sm font-bold text-stone-900">{e.title}</p>
                                            <p className="text-xs text-stone-500">{e.date} &middot; {e.type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Active Cohorts */}
                    <div className="md:col-span-3 bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-stone-900">Active Cohorts</h3>
                            <Link href="/admin/cohorts" className="text-sm font-medium text-brand-700 hover:text-brand-800">Manage All</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cohorts.slice(0, 4).map(c => (
                                <CohortStatusCard key={c.id} name={c.name} phase={cohortStatusLabel(c.status)} health={c.status === "ACTIVE" ? "High" : "Medium"} stats={`${c._count.members} Members`} />
                            ))}
                            {cohorts.length === 0 && <p className="text-sm text-stone-400 col-span-2">No cohorts yet.</p>}
                        </div>
                    </div>
                </div>
              </ErrorBoundary>
            </motion.div>

            {/* Add User Modal */}
            {showAddUser && <AddUserModal onClose={() => setShowAddUser(false)} onAdd={(u) => { setRecentUsers(prev => [u, ...prev]); setShowAddUser(false); }} />}

            {/* New Event Modal */}
            {showNewEvent && <NewEventModal onClose={() => setShowNewEvent(false)} onCreate={(e) => { setRecentEvents(prev => [e, ...prev]); setShowNewEvent(false); }} />}
        </motion.div>
    );
}

/* ── Add User Modal ── */
function AddUserModal({ onClose, onAdd }: { onClose: () => void; onAdd: (u: { name: string; email: string; role: string }) => void }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("Member");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = () => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = "Name is required";
        if (!email.trim()) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
        setErrors(e);
        if (Object.keys(e).length === 0) onAdd({ name: name.trim(), email: email.trim(), role });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-50 rounded-xl text-brand-700"><UserPlus size={20} /></div>
                        <h2 className="text-lg font-bold text-stone-900">Add New User</h2>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Amara Okafor" className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.name ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="amara@example.com" className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.email ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Role</label>
                        <div className="flex gap-2">
                            {["Member", "Mentor", "Admin"].map(r => (
                                <button key={r} type="button" onClick={() => r !== "Mentor" && setRole(r)} disabled={r === "Mentor"} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${r === "Mentor" ? "bg-stone-100 text-stone-300 cursor-not-allowed line-through" : role === r ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{r}{r === "Mentor" && " (Soon)"}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 p-6 border-t border-stone-100 bg-stone-50">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-white transition-colors">Cancel</button>
                    <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-800 hover:bg-brand-700 transition-colors">Add User</button>
                </div>
            </div>
        </div>
    );
}

/* ── New Event Modal ── */
function NewEventModal({ onClose, onCreate }: { onClose: () => void; onCreate: (e: { title: string; date: string; type: string }) => void }) {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [type, setType] = useState("Workshop");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = () => {
        const e: Record<string, string> = {};
        if (!title.trim()) e.title = "Title is required";
        if (!date) e.date = "Date is required";
        if (!time) e.time = "Time is required";
        setErrors(e);
        if (Object.keys(e).length === 0) onCreate({ title: title.trim(), date, type });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Calendar size={20} /></div>
                        <h2 className="text-lg font-bold text-stone-900">Create Event</h2>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Event Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Portfolio Review Session" className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.title ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1">Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.date ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1">Time</label>
                            <input type="time" value={time} onChange={e => setTime(e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.time ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                            {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Type</label>
                        <div className="flex gap-2 flex-wrap">
                            {["Workshop", "Q&A", "Speaker Series", "Social", "Hackathon"].map(t => (
                                <button key={t} type="button" onClick={() => setType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${type === t ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{t}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 p-6 border-t border-stone-100 bg-stone-50">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-white transition-colors">Cancel</button>
                    <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-800 hover:bg-brand-700 transition-colors">Create Event</button>
                </div>
            </div>
        </div>
    );
}

function AdminStatCard({ title, value, change, negative, icon: Icon, isHealth }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="flex justify-between items-start z-10">
                <div className={`p-2 rounded-xl ${isHealth ? "bg-emerald-50 text-emerald-600" : "bg-stone-50 text-stone-600"} group-hover:scale-110 transition-transform`}>{Icon && <Icon size={20} />}</div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${negative ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>{change}</span>
            </div>
            <div className="z-10">
                <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-stone-900 tracking-tight">{value}</h3>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-stone-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
        </div>
    );
}

function CohortStatusCard({ name, phase, health, stats }: any) {
    return (
        <Link href="/admin/cohorts" className="p-4 border border-stone-100 rounded-2xl bg-stone-50/50 hover:bg-white hover:shadow-md transition-all flex items-center justify-between group cursor-pointer">
            <div>
                <h4 className="font-bold text-stone-900 group-hover:text-brand-700 transition-colors">{name}</h4>
                <p className="text-xs text-stone-500 font-medium mb-1">{phase}</p>
                {stats && <p className="text-[10px] text-stone-400 font-medium">{stats}</p>}
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${health === "High" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{health} Health</span>
        </Link>
    );
}

function ReportItem({ user, reason, time }: any) {
    return (
        <Link href="/admin/moderation" className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 hover:bg-stone-100 transition-colors">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><AlertTriangle size={16} /></div>
                <div>
                    <p className="text-sm font-bold text-stone-900">{user}</p>
                    <p className="text-xs text-stone-500">{reason}</p>
                </div>
            </div>
            <span className="text-[10px] font-medium text-stone-400">{time}</span>
        </Link>
    );
}
