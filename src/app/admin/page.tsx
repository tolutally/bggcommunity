"use client";

import { useUser } from "@/context/UserContext";
import { Users, Activity, AlertTriangle, Calendar, X, UserPlus, Loader2, TrendingUp, TrendingDown, Info } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useMembers } from "@/hooks/use-members";
import { useEvents } from "@/hooks/use-events";
import { useCohorts, cohortStatusLabel } from "@/hooks/use-cohorts";
import { useCommunityGroups } from "@/hooks/use-community";
import { useReportQueue } from "@/hooks/use-admin-moderation";
import { useAnalyticsOverview } from "@/hooks/use-analytics";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };



export default function AdminDashboard() {
    const { user } = useUser();
    const [showAddUser, setShowAddUser] = useState(false);
    const [recentUsers, setRecentUsers] = useState<{ name: string; email: string; role: string }[]>([]);

    const { members, isLoading: membersLoading } = useMembers();
    const { events } = useEvents();
    const { cohorts } = useCohorts();
    const { groups } = useCommunityGroups();
    const { reports: openReports, isLoading: reportsLoading } = useReportQueue();
    const { overview, isLoading: overviewLoading } = useAnalyticsOverview();

    const totalMembers = members.length;
    const upcomingEvents = events.filter(e => new Date(e.scheduledAt) > new Date()).length;
    const activeCohorts = cohorts.filter(c => cohortStatusLabel(c.status) === "Active");
    const totalGroups = groups.length;

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
                    <AdminStatCard title="Total Members" value={membersLoading ? "—" : totalMembers.toLocaleString()} change={`${activeCohorts.length} cohorts`} icon={Users} trend="up" tooltip="Total registered members across all cohorts" />
                    <AdminStatCard title="Upcoming Events" value={upcomingEvents.toString()} change={`${events.length} total`} icon={Calendar} trend="neutral" tooltip="Events scheduled in the future" />
                    <AdminStatCard title="Community Groups" value={totalGroups.toString()} change="Active" icon={Activity} isHealth trend="up" tooltip="Number of active community groups" />

                    {/* Member Snapshot */}
                    <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-stone-100 shadow-sm flex flex-col">
                        <div className="mb-6">
                            <h3 className="font-bold text-stone-900">Member Snapshot</h3>
                            <p className="text-sm text-stone-500">Current engagement at a glance</p>
                        </div>
                        {overviewLoading ? (
                            <div className="flex items-center gap-2 text-stone-400 text-sm flex-1"><Loader2 size={16} className="animate-spin" /> Loading...</div>
                        ) : overview ? (
                            <div className="flex-1 space-y-5">
                                <SnapshotBar label="Total Members" count={overview.totalMembers} max={overview.totalMembers} color="bg-brand-600" />
                                <SnapshotBar label="Active This Month" count={overview.activeThisMonth} max={overview.totalMembers} color="bg-accent-500" />
                                <SnapshotBar label="New This Month" count={overview.newThisMonth} max={overview.totalMembers} color="bg-emerald-500" />
                            </div>
                        ) : (
                            <p className="text-sm text-stone-400 flex-1">No data available.</p>
                        )}
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
                                <Link href="/admin/events?create=true" className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-stone-50 text-stone-700 hover:bg-stone-100 transition-colors">
                                    <Calendar size={20} />
                                    <span className="text-xs font-semibold">New Event</span>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-stone-900">Recent Reports</h3>
                                {!reportsLoading && openReports.length > 0 && (
                                    <Link href="/admin/moderation" className="bg-rose-100 text-rose-600 text-xs px-2 py-0.5 rounded-full font-bold hover:bg-rose-200 transition-colors">{openReports.length} Open</Link>
                                )}
                            </div>
                            {reportsLoading ? (
                                <div className="flex items-center gap-2 text-stone-400 text-sm"><Loader2 size={14} className="animate-spin" /> Loading...</div>
                            ) : openReports.length > 0 ? (
                                <div className="space-y-3">
                                    {openReports.slice(0, 2).map(r => {
                                        const profile = r.reportedUser?.profile;
                                        const name = profile ? `${profile.firstName} ${profile.lastName}`.trim() : r.reportedUser?.email ?? "Unknown";
                                        return <ReportItem key={r.id} user={name} reason={r.reason} time={new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />;
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-stone-400">No open reports.</p>
                            )}
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

function AdminStatCard({ title, value, change, negative, icon: Icon, isHealth, trend, tooltip }: { title: string; value: string; change: string; negative?: boolean; icon: React.ElementType; isHealth?: boolean; trend?: "up" | "down" | "neutral"; tooltip?: string }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;
    return (
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="flex justify-between items-start z-10">
                <div className={`p-2 rounded-xl ${isHealth ? "bg-emerald-50 text-emerald-600" : "bg-stone-50 text-stone-600"} group-hover:scale-110 transition-transform`}>{Icon && <Icon size={20} />}</div>
                <div className="flex items-center gap-1.5">
                    {TrendIcon && <TrendIcon size={14} className={negative ? "text-red-500" : "text-green-500"} />}
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${negative ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>{change}</span>
                </div>
            </div>
            <div className="z-10 flex items-end justify-between">
                <div>
                    <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-stone-900 tracking-tight">{value}</h3>
                </div>
                {tooltip && (
                    <div className="relative">
                        <button onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)} className="p-1 text-stone-300 hover:text-stone-500 transition-colors"><Info size={14} /></button>
                        {showTooltip && (
                            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-stone-900 text-white text-xs rounded-lg shadow-lg z-20 pointer-events-none">
                                {tooltip}
                                <div className="absolute top-full right-3 w-2 h-2 bg-stone-900 rotate-45 -mt-1" />
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-stone-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
        </div>
    );
}

function CohortStatusCard({ name, phase, health, stats }: { name: string; phase: string; health: string; stats?: string }) {
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

function SnapshotBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
    const pct = max > 0 ? Math.round((count / max) * 100) : 0;
    return (
        <div>
            <div className="flex justify-between text-sm font-semibold text-stone-700 mb-2">
                <span>{label}</span>
                <span className="text-stone-900">{count.toLocaleString()}</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2.5">
                <div className={`${color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function ReportItem({ user, reason, time }: { user: string; reason: string; time: string }) {
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
