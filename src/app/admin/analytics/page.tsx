"use client";

import { ArrowDown, ArrowUp, Users, Calendar, TrendingUp, Activity, Download, Check, ChevronDown, X, Eye } from "lucide-react";
import { useState } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";

// Demo data for platform growth
const GROWTH_DATA = {
    "7days": {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        members: [1180, 1195, 1210, 1218, 1230, 1242, 1248],
        active: [780, 810, 825, 840, 830, 850, 856],
    },
    "30days": {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        members: [1050, 1120, 1185, 1248],
        active: [720, 780, 820, 856],
    },
    "quarter": {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        members: [540, 624, 735, 820, 890, 965, 1020, 1095, 1140, 1180, 1215, 1248],
        active: [380, 420, 510, 580, 640, 700, 750, 800, 820, 840, 850, 856],
    },
    "custom": {
        labels: [] as string[],
        members: [] as number[],
        active: [] as number[],
    },
};

// Drill-down data per cohort
const COHORT_DRILL_DOWN: Record<string, { labels: string[]; members: number[]; active: number[]; retention: number; avgSession: string; topActivity: string }> = {
    "Cohort Alpha": {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        members: [42, 42, 42, 42],
        active: [40, 39, 41, 40],
        retention: 95,
        avgSession: "2h 15m",
        topActivity: "Code Reviews",
    },
    "Cohort Beta": {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        members: [28, 28, 28, 28],
        active: [25, 23, 24, 23],
        retention: 82,
        avgSession: "1h 45m",
        topActivity: "Design Critiques",
    },
    "Cohort Pioneer": {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        members: [35, 35, 35, 35],
        active: [32, 30, 28, 25],
        retention: 71,
        avgSession: "1h 30m",
        topActivity: "Product Roadmaps",
    },
};

type TimeRange = "7days" | "30days" | "quarter" | "custom";

export default function AdminAnalyticsPage() {
    const [timeRange, setTimeRange] = useState<TimeRange>("quarter");
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);
    const [drillDownCohort, setDrillDownCohort] = useState<string | null>(null);

    // Generate custom range data
    const getCustomData = () => {
        if (!customStart || !customEnd) return GROWTH_DATA["30days"];
        const start = new Date(customStart);
        const end = new Date(customEnd);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const points = Math.min(Math.max(days, 2), 12);
        const labels: string[] = [];
        const members: number[] = [];
        const active: number[] = [];
        for (let i = 0; i < points; i++) {
            const d = new Date(start.getTime() + (i / (points - 1)) * (end.getTime() - start.getTime()));
            labels.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
            members.push(Math.round(1000 + Math.random() * 250 + i * 20));
            active.push(Math.round(700 + Math.random() * 150 + i * 12));
        }
        return { labels, members, active };
    };

    const data = timeRange === "custom" ? getCustomData() : GROWTH_DATA[timeRange];

    const handleExport = () => {
        const csvRows = ["Period,Total Members,Active Users"];
        data.labels.forEach((label, i) => {
            csvRows.push(`${label},${data.members[i]},${data.active[i]}`);
        });
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics-report-${timeRange}-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
    };

    const handleTimeRangeChange = (value: string) => {
        if (value === "custom") {
            setShowCustomPicker(true);
        } else {
            setTimeRange(value as TimeRange);
            setShowCustomPicker(false);
        }
    };

    const applyCustomRange = () => {
        if (customStart && customEnd) {
            setTimeRange("custom");
            setShowCustomPicker(false);
        }
    };

    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Platform Analytics</h1>
                    <p className="text-stone-500 mt-2">Overview of community growth and engagement.</p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                    <div className="relative">
                        <select
                            value={timeRange === "custom" ? "custom" : timeRange}
                            onChange={(e) => handleTimeRangeChange(e.target.value)}
                            className="bg-white border border-stone-200 rounded-lg px-4 py-2 text-sm font-medium text-stone-600 focus:outline-none focus:ring-2 focus:ring-brand-100 appearance-none pr-8"
                        >
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="quarter">This Year</option>
                            <option value="custom">Custom Range</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    </div>

                    {timeRange === "custom" && (
                        <div className="flex items-center gap-1 text-xs text-stone-500 bg-brand-50 px-2 py-1 rounded-lg">
                            {customStart} &mdash; {customEnd}
                            <button onClick={() => setShowCustomPicker(true)} className="text-brand-600 hover:text-brand-800 font-bold ml-1">Edit</button>
                        </div>
                    )}

                    <button
                        onClick={handleExport}
                        className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors flex items-center gap-2"
                    >
                        {exportSuccess ? <><Check size={16} /> Exported!</> : <><Download size={16} /> Export Report</>}
                    </button>
                </div>
            </div>

            {/* Custom Date Picker */}
            {showCustomPicker && (
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Start Date</label>
                        <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-stone-700 mb-1">End Date</label>
                        <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowCustomPicker(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors">Cancel</button>
                        <button onClick={applyCustomRange} disabled={!customStart || !customEnd} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-800 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Apply</button>
                    </div>
                </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard title="Total Members" value="1,248" change="+12%" trend="up" icon={Users} />
                <MetricCard title="Active Learners" value="856" change="+5%" trend="up" icon={Activity} />
                <MetricCard title="Event Attendance" value="92%" change="+2%" trend="up" icon={Calendar} />
                <MetricCard title="Churn Rate" value="1.2%" change="-0.5%" trend="down" icon={TrendingUp} inverse />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-stone-900">Platform Growth</h3>
                            <p className="text-sm text-stone-500 mt-1">Member acquisition and active users over time</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-600"></span><span className="text-xs text-stone-500">Total Members</span></div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-accent-500"></span><span className="text-xs text-stone-500">Active Users</span></div>
                        </div>
                    </div>
                    <GrowthChart data={data} />
                </div>

                {/* Side Stats */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                        <h3 className="font-bold text-stone-900 mb-4">Engagement by Cohort</h3>
                        <div className="space-y-4">
                            {Object.entries(COHORT_DRILL_DOWN).map(([name, data]) => (
                                <div key={name} className="group">
                                    <ProgramBar label={name} value={`${data.retention}%`} color={name.includes("Alpha") ? "bg-brand-600" : name.includes("Beta") ? "bg-accent-500" : "bg-stone-500"} />
                                    <button onClick={() => setDrillDownCohort(name)} className="text-[10px] text-brand-600 font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:underline">
                                        <Eye size={10} /> View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-6 text-white shadow-lg">
                        <h3 className="font-bold mb-2">Platform Health</h3>
                        <p className="text-stone-400 text-sm mb-6">System performance and uptime.</p>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1 text-stone-300"><span>Server Uptime</span><span className="text-emerald-400">99.9%</span></div>
                                <div className="w-full bg-stone-700/50 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full w-[99%]"></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1 text-stone-300"><span>Response Time</span><span className="text-blue-400">120ms</span></div>
                                <div className="w-full bg-stone-700/50 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full w-[85%]"></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Drill-Down Modal */}
            {drillDownCohort && COHORT_DRILL_DOWN[drillDownCohort] && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDrillDownCohort(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-stone-100">
                            <div>
                                <h2 className="text-xl font-bold text-stone-900">{drillDownCohort} Analytics</h2>
                                <p className="text-sm text-stone-500">Detailed engagement breakdown</p>
                            </div>
                            <button onClick={() => setDrillDownCohort(null)} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-stone-50 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-stone-900">{COHORT_DRILL_DOWN[drillDownCohort].retention}%</p>
                                    <p className="text-xs text-stone-500 font-medium">Retention Rate</p>
                                </div>
                                <div className="bg-stone-50 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-stone-900">{COHORT_DRILL_DOWN[drillDownCohort].avgSession}</p>
                                    <p className="text-xs text-stone-500 font-medium">Avg Session</p>
                                </div>
                                <div className="bg-stone-50 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-stone-900">{COHORT_DRILL_DOWN[drillDownCohort].topActivity}</p>
                                    <p className="text-xs text-stone-500 font-medium">Top Activity</p>
                                </div>
                            </div>
                            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                                <h4 className="text-sm font-bold text-stone-700 mb-3">Weekly Active Members</h4>
                                <GrowthChart data={COHORT_DRILL_DOWN[drillDownCohort]} />
                            </div>
                        </div>
                        <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end">
                            <button onClick={() => { setDrillDownCohort(null); handleExport(); }} className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors">
                                <Download size={14} /> Export Cohort Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </ErrorBoundary>
    );
}

function MetricCard({ title, value, change, trend, icon: Icon, inverse }: any) {
    const isPositive = trend === "up";
    const isGood = inverse ? !isPositive : isPositive;
    return (
        <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between h-32 hover:border-brand-200 transition-colors cursor-pointer">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-stone-50 rounded-lg text-stone-600"><Icon size={20} /></div>
                <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isGood ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {isPositive ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}{change}
                </span>
            </div>
            <div>
                <p className="text-stone-500 text-xs font-medium uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold text-stone-900">{value}</h3>
            </div>
        </div>
    );
}

function ProgramBar({ label, value, color }: any) {
    return (
        <div>
            <div className="flex justify-between text-sm font-medium text-stone-700 mb-1.5"><span>{label}</span><span>{value}</span></div>
            <div className="w-full bg-stone-100 rounded-full h-2"><div className={`${color} h-2 rounded-full`} style={{ width: value }}></div></div>
        </div>
    );
}

function GrowthChart({ data }: { data: { labels: string[]; members: number[]; active: number[] } }) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const chartWidth = 600;
    const chartHeight = 280;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;
    const allValues = [...data.members, ...data.active];
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues) * 0.9;
    const xScale = (index: number) => padding.left + (data.labels.length <= 1 ? innerWidth / 2 : (index / (data.labels.length - 1)) * innerWidth);
    const yScale = (value: number) => padding.top + innerHeight - ((value - minValue) / (maxValue - minValue || 1)) * innerHeight;
    const generatePath = (values: number[]) => values.map((val, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(val)}`).join(" ");
    const generateAreaPath = (values: number[]) => { const lp = generatePath(values); return `${lp} L ${xScale(values.length - 1)} ${padding.top + innerHeight} L ${xScale(0)} ${padding.top + innerHeight} Z`; };
    const yTicks = 5;
    const yTickValues = Array.from({ length: yTicks }, (_, i) => Math.round(minValue + (i / (yTicks - 1)) * (maxValue - minValue)));

    if (!data.labels.length) return <div className="h-48 flex items-center justify-center text-stone-400 text-sm">No data for selected range</div>;

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" style={{ maxHeight: "320px" }}>
                {yTickValues.map((tick, i) => (
                    <g key={i}>
                        <line x1={padding.left} y1={yScale(tick)} x2={chartWidth - padding.right} y2={yScale(tick)} stroke="#e7e5e4" strokeDasharray="4 4" />
                        <text x={padding.left - 10} y={yScale(tick)} textAnchor="end" dominantBaseline="middle" className="fill-stone-400 text-[10px]">{tick.toLocaleString()}</text>
                    </g>
                ))}
                <path d={generateAreaPath(data.members)} fill="url(#memberGradient)" opacity="0.3" />
                <path d={generateAreaPath(data.active)} fill="url(#activeGradient)" opacity="0.3" />
                <path d={generatePath(data.members)} fill="none" stroke="#412569" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d={generatePath(data.active)} fill="none" stroke="#db8e29" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {data.members.map((val, i) => (<circle key={`m-${i}`} cx={xScale(i)} cy={yScale(val)} r={hoveredIndex === i ? 6 : 4} fill="#412569" stroke="white" strokeWidth="2" className="transition-all duration-200 cursor-pointer" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} />))}
                {data.active.map((val, i) => (<circle key={`a-${i}`} cx={xScale(i)} cy={yScale(val)} r={hoveredIndex === i ? 6 : 4} fill="#db8e29" stroke="white" strokeWidth="2" className="transition-all duration-200 cursor-pointer" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} />))}
                {data.labels.map((label, i) => (<text key={i} x={xScale(i)} y={chartHeight - 10} textAnchor="middle" className="fill-stone-400 text-[11px] font-medium">{label}</text>))}
                {hoveredIndex !== null && (<line x1={xScale(hoveredIndex)} y1={padding.top} x2={xScale(hoveredIndex)} y2={padding.top + innerHeight} stroke="#a8a29e" strokeWidth="1" strokeDasharray="4 4" />)}
                <defs>
                    <linearGradient id="memberGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#412569" stopOpacity="0.4" /><stop offset="100%" stopColor="#412569" stopOpacity="0" /></linearGradient>
                    <linearGradient id="activeGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#db8e29" stopOpacity="0.4" /><stop offset="100%" stopColor="#db8e29" stopOpacity="0" /></linearGradient>
                </defs>
            </svg>
            {hoveredIndex !== null && (
                <div className="absolute bg-stone-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none z-10" style={{ left: `${(xScale(hoveredIndex) / chartWidth) * 100}%`, top: "20px", transform: "translateX(-50%)" }}>
                    <p className="font-bold text-stone-300 text-xs mb-1">{data.labels[hoveredIndex]}</p>
                    <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-brand-500"></span>Members: <span className="font-bold">{data.members[hoveredIndex].toLocaleString()}</span></p>
                    <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-500"></span>Active: <span className="font-bold">{data.active[hoveredIndex].toLocaleString()}</span></p>
                </div>
            )}
        </div>
    );
}
