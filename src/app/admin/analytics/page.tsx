"use client";

import { ArrowDown, ArrowUp, Users, Calendar, TrendingUp, Activity } from "lucide-react";

export default function AdminAnalyticsPage() {
    return (
        <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Platform Analytics</h1>
                    <p className="text-stone-500 mt-2">Overview of community growth and engagement.</p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-white border border-stone-200 rounded-lg px-4 py-2 text-sm font-medium text-stone-600 focus:outline-none focus:ring-2 focus:ring-purple-100">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Quarter</option>
                    </select>
                    <button className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors">
                        Export Report
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Members"
                    value="1,248"
                    change="+12%"
                    trend="up"
                    icon={Users}
                />
                <MetricCard
                    title="Active Learners"
                    value="856"
                    change="+5%"
                    trend="up"
                    icon={Activity}
                />
                <MetricCard
                    title="Event Attendance"
                    value="92%"
                    change="+2%"
                    trend="up"
                    icon={Calendar}
                />
                <MetricCard
                    title="Churn Rate"
                    value="1.2%"
                    change="-0.5%"
                    trend="down"
                    icon={TrendingUp}
                    inverse
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area (Mock) */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-stone-900">Member Growth</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-purple-600"></span>
                                <span className="text-xs text-stone-500">New Members</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-stone-200"></span>
                                <span className="text-xs text-stone-500">Total</span>
                            </div>
                        </div>
                    </div>
                    {/* CSS Bar Chart Mock */}
                    <div className="h-64 flex items-end justify-between gap-2">
                        {[45, 52, 49, 60, 55, 68, 74, 80, 85, 82, 90, 95].map((h, i) => (
                            <div key={i} className="w-full bg-purple-50 rounded-t-lg relative group transition-all hover:bg-purple-100">
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-purple-600 rounded-t-lg transition-all duration-1000"
                                    style={{ height: `${h}%` }}
                                ></div>
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {h * 12} Users
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-stone-400 font-medium uppercase tracking-wide">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                        <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                    </div>
                </div>

                {/* Side Stats */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                        <h3 className="font-bold text-stone-900 mb-4">Engagement by Program</h3>
                        <div className="space-y-4">
                            <ProgramBar label="Employment" value="45%" color="bg-blue-500" />
                            <ProgramBar label="Entrepreneurship" value="32%" color="bg-purple-500" />
                            <ProgramBar label="Community Care" value="23%" color="bg-rose-500" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-6 text-white shadow-lg">
                        <h3 className="font-bold mb-2">Platform Health</h3>
                        <p className="text-stone-400 text-sm mb-6">System performance and uptime.</p>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1 text-stone-300">
                                    <span>Server Uptime</span>
                                    <span className="text-emerald-400">99.9%</span>
                                </div>
                                <div className="w-full bg-stone-700/50 rounded-full h-1.5">
                                    <div className="bg-emerald-500 h-1.5 rounded-full w-[99%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1 text-stone-300">
                                    <span>Response Time</span>
                                    <span className="text-blue-400">120ms</span>
                                </div>
                                <div className="w-full bg-stone-700/50 rounded-full h-1.5">
                                    <div className="bg-blue-500 h-1.5 rounded-full w-[85%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, change, trend, icon: Icon, inverse }: any) {
    const isPositive = trend === 'up';
    const isGood = inverse ? !isPositive : isPositive;

    return (
        <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between h-32 hover:border-purple-200 transition-colors cursor-pointer">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-stone-50 rounded-lg text-stone-600">
                    <Icon size={20} />
                </div>
                <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isGood ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isPositive ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
                    {change}
                </span>
            </div>
            <div>
                <p className="text-stone-500 text-xs font-medium uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold text-stone-900">{value}</h3>
            </div>
        </div>
    )
}

function ProgramBar({ label, value, color }: any) {
    return (
        <div>
            <div className="flex justify-between text-sm font-medium text-stone-700 mb-1.5">
                <span>{label}</span>
                <span>{value}</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2">
                <div className={`${color} h-2 rounded-full`} style={{ width: value }}></div>
            </div>
        </div>
    )
}
