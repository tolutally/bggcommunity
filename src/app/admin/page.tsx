"use client";

import { useUser } from "@/context/UserContext";
import { Users, Activity, AlertTriangle, Calendar } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function AdminDashboard() {
    const { user } = useUser();

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto"
        >
            {/* Welcome Section */}
            <motion.div variants={item}>
                <h1 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">
                    Welcome back, {user.name.split(' ')[0]}
                </h1>
                <p className="text-lg text-stone-500 mt-2">
                    Here's the high-level overview of community health.
                </p>
            </motion.div>

            {/* Dashboard Content */}
            <motion.div variants={item}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">
                    {/* 1. Top Stats Row */}
                    <AdminStatCard title="Total Members" value="1,248" change="+12%" icon={Users} />
                    <AdminStatCard title="Active Learners" value="856" change="+5%" icon={Activity} />
                    <AdminStatCard title="Platform Health" value="99.9%" change="Stable" icon={Activity} isHealth />

                    {/* 2. Main Growth Chart - Spans 2 cols */}
                    <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-stone-100 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-stone-900">Member Growth</h3>
                                <p className="text-sm text-stone-500">New vs Returning Users</p>
                            </div>
                            <select className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-1 text-xs font-medium text-stone-600 outline-none">
                                <option>This Year</option>
                            </select>
                        </div>
                        {/* Simple CSS Bar Chart */}
                        <div className="flex-1 flex items-end justify-between gap-2 h-48 px-2">
                            {[35, 42, 38, 55, 62, 58, 75, 82, 90, 85, 94, 100].map((h, i) => (
                                <div key={i} className="w-full bg-stone-100 rounded-t-md relative group">
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-brand-600 rounded-t-md transition-all hover:bg-brand-700"
                                        style={{ height: `${h}%` }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-3 text-[10px] text-stone-400 font-bold uppercase tracking-wider px-2">
                            <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
                        </div>
                    </div>

                    {/* 3. Quick Actions & Reports - Spans 1 col */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
                            <h3 className="font-bold text-stone-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors">
                                    <Users size={20} />
                                    <span className="text-xs font-semibold">Add User</span>
                                </button>
                                <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-stone-50 text-stone-700 hover:bg-stone-100 transition-colors">
                                    <Calendar size={20} />
                                    <span className="text-xs font-semibold">New Event</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-stone-900">Recent Reports</h3>
                                <span className="bg-rose-100 text-rose-600 text-xs px-2 py-0.5 rounded-full font-bold">2 New</span>
                            </div>
                            <div className="space-y-3">
                                <ReportItem user="Sarah J." reason="Inappropriate comment" time="2h ago" />
                                <ReportItem user="Davon L." reason="Spam profile" time="5h ago" />
                            </div>
                        </div>
                    </div>

                    {/* 4. Active Cohorts - Spans 3 cols (Full Width) */}
                    <div className="md:col-span-3 bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-stone-900">Active Cohorts</h3>
                            <Link href="/admin/cohorts" className="text-sm font-medium text-brand-700 hover:text-brand-800">Manage All</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CohortStatusCard name="Cohort Alpha" phase="Week 3: Research" health="High" stats="42 Members • 95% Active" />
                            <CohortStatusCard name="Cohort Beta" phase="Week 1: Onboarding" health="Medium" stats="28 Members • 82% Active" />
                        </div>
                    </div>

                </div>
            </motion.div>
        </motion.div>
    );
}

function AdminStatCard({ title, value, change, negative, icon: Icon, isHealth }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="flex justify-between items-start z-10">
                <div className={`p-2 rounded-xl ${isHealth ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-50 text-stone-600'} group-hover:scale-110 transition-transform`}>
                    {Icon && <Icon size={20} />}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${negative ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {change}
                </span>
            </div>
            <div className="z-10">
                <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-stone-900 tracking-tight">{value}</h3>
            </div>
            {/* Background decoration */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-stone-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
        </div>
    )
}

function CohortStatusCard({ name, phase, health, stats }: any) {
    return (
        <div className="p-4 border border-stone-100 rounded-2xl bg-stone-50/50 hover:bg-white hover:shadow-md transition-all flex items-center justify-between group cursor-pointer">
            <div>
                <h4 className="font-bold text-stone-900 group-hover:text-brand-700 transition-colors">{name}</h4>
                <p className="text-xs text-stone-500 font-medium mb-1">{phase}</p>
                {stats && <p className="text-[10px] text-stone-400 font-medium">{stats}</p>}
            </div>
            <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${health === 'High' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {health} Health
                </span>
            </div>
        </div>
    )
}

function ReportItem({ user, reason, time }: any) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                    <AlertTriangle size={16} />
                </div>
                <div>
                    <p className="text-sm font-bold text-stone-900">{user}</p>
                    <p className="text-xs text-stone-500">{reason}</p>
                </div>
            </div>
            <span className="text-[10px] font-medium text-stone-400">{time}</span>
        </div>
    )
}
