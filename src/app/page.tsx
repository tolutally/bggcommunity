"use client";

import { useUser } from "@/context/UserContext";
import { Calendar, Users, Clock, ArrowRight, TrendingUp, BookOpen, Star, X, Check, MoreHorizontal, MessageSquare, AlertTriangle, Activity } from "lucide-react";
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

export default function Dashboard() {
  const { role, user } = useUser();

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
          {role === 'member' && "Here's what's happening in your cohort today."}
          {role === 'mentor' && "You have upcoming sessions to prepare for."}
          {role === 'admin' && "Here's the high-level overview of community health."}
        </p>
      </motion.div>

      {/* Role specific content */}
      <motion.div variants={item}>
        {role === 'member' && <MemberDashboard />}
        {role === 'mentor' && <MentorDashboard />}
        {role === 'admin' && <AdminDashboard />}
      </motion.div>
    </motion.div>
  );
}

// --- Sub-Dashboards ---

function MemberDashboard() {
  const { user } = useUser();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">

      {/* 1. Hero: Learning Path Progress (Command Center) */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="md:col-span-2 bg-gradient-to-br from-indigo-900 via-purple-900 to-stone-900 rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-purple-900/10 text-white min-h-[240px] flex flex-col justify-between"
      >
        <div className="relative z-10 w-full">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10 flex items-center gap-2 w-fit mb-3">
                <Activity size={14} /> Week 3 of 12
              </span>
              <h3 className="text-3xl font-bold leading-tight">User Research & Synthesis</h3>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-3xl font-bold">75%</div>
              <div className="text-xs text-purple-200 font-medium uppercase tracking-wide">Module Completion</div>
            </div>
          </div>

          <div className="flex gap-2 mb-8">
            {/* Micro-milestones */}
            <div className="h-1.5 flex-1 bg-white/30 rounded-full overflow-hidden"><div className="h-full bg-white w-full"></div></div>
            <div className="h-1.5 flex-1 bg-white/30 rounded-full overflow-hidden"><div className="h-full bg-white w-full"></div></div>
            <div className="h-1.5 flex-1 bg-white/30 rounded-full overflow-hidden"><div className="h-full bg-white w-3/4 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div></div>
            <div className="h-1.5 flex-1 bg-white/10 rounded-full"></div>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-white text-purple-950 px-6 py-3 rounded-xl font-bold text-sm hover:bg-purple-50 transition-colors flex items-center gap-2 shadow-lg shadow-white/5">
              Continue Module <ArrowRight size={16} />
            </button>
            <span className="text-sm font-medium text-purple-200">Next: Synthesis Matrix</span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-pink-500 opacity-10 rounded-full blur-2xl"></div>
      </motion.div>

      {/* 2. Action Center (Due Soon) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
            <AlertTriangle size={18} />
          </div>
          <h3 className="font-bold text-stone-900">Action Center</h3>
        </div>

        <div className="space-y-3 flex-1">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-start gap-3 hover:bg-stone-100 transition-colors cursor-pointer group">
            <div className="mt-0.5 w-4 h-4 rounded border-2 border-stone-300 group-hover:border-purple-400 transition-colors bg-white"></div>
            <div>
              <p className="text-sm font-bold text-stone-800 leading-tight group-hover:text-purple-900">Submit Research Findings</p>
              <p className="text-xs text-rose-500 font-bold mt-1">Due Today, 5:00 PM</p>
            </div>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-start gap-3 hover:bg-stone-100 transition-colors cursor-pointer group">
            <div className="mt-0.5 w-4 h-4 rounded border-2 border-stone-300 group-hover:border-purple-400 transition-colors bg-white"></div>
            <div>
              <p className="text-sm font-bold text-stone-800 leading-tight group-hover:text-purple-900">RSVP for Fireside Chat</p>
              <p className="text-xs text-stone-400 font-medium mt-1">Tomorrow</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Daily Ritual (Standup) - New */}
      <div className="md:col-span-1 bg-stone-900 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Daily Standup</h3>
          </div>
          <p className="text-xl font-bold leading-tight mb-6">What is your main focus for today, {user?.name?.split(' ')[0]}?</p>

          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/5 rounded-xl text-sm font-medium transition-all group flex items-center justify-between">
              Completing Assignment <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </button>
            <button className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/5 rounded-xl text-sm font-medium transition-all group flex items-center justify-between">
              Booking Mentor Session <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 opacity-20 blur-3xl"></div>
      </div>

      {/* 4. Upcoming Sessions (Compact) */}
      <div className="md:col-span-2 bg-white rounded-3xl border border-stone-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-stone-900">Your Schedule</h2>
          <Link href="/sessions" className="text-sm font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 group">
            View Calendar <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SessionCard
            day="TODAY"
            date="24"
            title="Product Strategy Workshop"
            time="2:00 PM EST"
            mentor="Sarah Jenkins"
            type="Required"
          />
          <SessionCard
            day="TOMORROW"
            date="25"
            title="Weekly Office Hours"
            time="4:00 PM EST"
            mentor="Dr. Alisha Reid"
            type="Optional"
          />
        </div>
      </div>

    </div>
  );
}

import { useState } from "react";

function MentorDashboard() {
  const [dmOpen, setDmOpen] = useState(true);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-4">Sessions to Host</h2>
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm border-l-4 border-l-purple-600">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold mb-2">Upcoming - Starts in 2h</span>
                <h3 className="text-lg font-bold text-stone-900">Product Strategy Workshop</h3>
                <p className="text-stone-500">Cohort Alpha • 45 Attending</p>
              </div>
              <button className="bg-purple-900 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-purple-800">
                Launch Session
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-4">Booking Requests</h2>
          <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100">
            <BookingRequestItem name="Maya Angelou" topic="Career Transition" time="Tue, 10:00 AM" />
            <BookingRequestItem name="Zora Neale" topic="Portfolio Review" time="Wed, 2:30 PM" />
          </div>
        </section>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="font-bold text-stone-900 mb-6">Mentor Stats</h3>
          <div className="space-y-6">
            <StatRow label="Mentoring Hours" value="12.5" trend="+2.5" />
            <StatRow label="Sessions Hosted" value="8" trend="0" />
            <StatRow label="Avg. Rating" value="4.9" trend="+0.1" />
          </div>
        </div>

        {/* DM Toggle Banner - Below Stats */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare size={20} className={dmOpen ? 'text-green-600' : 'text-stone-400'} />
            <div>
              <h4 className="font-bold text-stone-900 text-sm">Direct Messages</h4>
              <p className="text-xs text-stone-500">{dmOpen ? 'Members can send you messages.' : 'Your DMs are closed.'}</p>
            </div>
          </div>
          <button
            onClick={() => setDmOpen(!dmOpen)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${dmOpen ? 'bg-green-500' : 'bg-stone-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${dmOpen ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
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
                className="absolute bottom-0 left-0 right-0 bg-purple-600 rounded-t-md transition-all hover:bg-purple-700"
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
            <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
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
          <Link href="/programs" className="text-sm font-medium text-purple-700 hover:text-purple-900">Manage All</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CohortStatusCard name="Cohort Alpha" phase="Week 3: Research" health="High" stats="42 Members • 95% Active" />
          <CohortStatusCard name="Cohort Beta" phase="Week 1: Onboarding" health="Medium" stats="28 Members • 82% Active" />
        </div>
      </div>

    </div>
  );
}

// --- Components ---

// --- Components ---

function SessionCard({ day, date, title, time, mentor, type }: any) {
  return (
    <div className="flex items-center gap-4 p-3 hover:bg-stone-50 rounded-2xl transition-all cursor-pointer group">
      <div className="flex-shrink-0 w-14 h-14 bg-stone-100 rounded-2xl flex flex-col items-center justify-center border border-stone-200 group-hover:border-purple-200 group-hover:bg-purple-50 transition-colors">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider group-hover:text-purple-600">{day}</span>
        <span className="text-lg font-bold text-stone-900 group-hover:text-purple-700">{date}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-stone-900 truncate group-hover:text-purple-700 transition-colors">{title}</h3>
        <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
          <span className="flex items-center gap-1"><Clock size={12} /> {time}</span>
          <span>•</span>
          <span className="truncate">{mentor}</span>
        </div>
      </div>
      <div className="hidden sm:block px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full text-[10px] font-bold uppercase tracking-wide group-hover:bg-purple-100 group-hover:text-purple-700 transition-colors">
        {type}
      </div>
    </div>
  )
}

function ActivityCard({ user, avatar, action, content, time, tag }: any) {
  return (
    <div className="p-4 rounded-2xl bg-stone-50/50 border border-stone-100 hover:border-purple-200 hover:bg-white transition-all group cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img src={avatar} alt={user} className="w-8 h-8 rounded-full border border-white shadow-sm" />
          <div>
            <p className="text-xs text-stone-500">
              <span className="font-bold text-stone-900">{user}</span> {action}
            </p>
            <p className="text-[10px] text-stone-400">{time}</p>
          </div>
        </div>
        {tag && <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-medium rounded-full">{tag}</span>}
      </div>
      <p className="text-sm text-stone-700 leading-relaxed font-medium group-hover:text-purple-900 transition-colors">"{content}"</p>
      <div className="mt-3 flex gap-3">
        <button className="text-stone-400 hover:text-rose-500 transition-colors"><Star size={14} /></button>
        <button className="text-stone-400 hover:text-indigo-500 transition-colors"><MessageSquare size={14} /></button>
        <button className="ml-auto text-stone-300 hover:text-stone-600"><MoreHorizontal size={14} /></button>
      </div>
    </div>
  )
}

function ResourceItem({ title, type }: any) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-stone-100">
      <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
        <BookOpen size={18} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-stone-900 truncate group-hover:text-blue-700 transition-colors">{title}</h4>
        <p className="text-xs text-stone-500 font-medium">{type}</p>
      </div>
      <div className="h-6 w-6 rounded-full flex items-center justify-center text-stone-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
        <ArrowRight size={14} />
      </div>
    </div>
  )
}

function BookingRequestItem({ name, topic, time }: any) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
          {name[0]}
        </div>
        <div>
          <h4 className="font-bold text-stone-900 text-sm">{name}</h4>
          <p className="text-xs text-stone-500">{topic} • {time}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="p-2 text-stone-400 hover:text-red-600 bg-stone-100 hover:bg-red-50 rounded-lg transition-all"><X size={16} /></button>
        <button className="p-2 text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-all"><Star size={16} className="fill-current" /></button>
      </div>
    </div>
  )
}

function StatRow({ label, value, trend }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-stone-600">{label}</span>
      <div className="text-right">
        <div className="font-bold text-stone-900">{value}</div>
        <div className="text-xs text-green-600">{trend} this week</div>
      </div>
    </div>
  )
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
        <h4 className="font-bold text-stone-900 group-hover:text-purple-700 transition-colors">{name}</h4>
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
