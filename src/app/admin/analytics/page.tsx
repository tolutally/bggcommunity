"use client";

import { ArrowDown, ArrowUp, Users, Calendar, TrendingUp, Activity, Download, Check, X, Eye, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { exportCSV, exportXLSX, exportPDF } from "@/lib/export";
import { useAnalyticsOverview, useAnalyticsCohorts } from "@/hooks/use-analytics";


export default function AdminAnalyticsPage() {
    const [exportSuccess, setExportSuccess] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [drillDownCohortId, setDrillDownCohortId] = useState<string | null>(null);

    const { overview, isLoading: loadingOverview } = useAnalyticsOverview();
    const { cohorts: apiCohorts, isLoading: loadingCohorts } = useAnalyticsCohorts();

    const drillCohort = apiCohorts.find(c => c.id === drillDownCohortId) ?? null;

    const getExportData = () => {
        const headers = ["Cohort", "Members", "Active Rate (%)", "Sessions Done"];
        const rows = apiCohorts.map(c => [c.name, c.memberCount, Math.round(c.activeRate * 100), c.sessionsDone] as (string | number)[]);
        return { headers, rows };
    };

    const handleExport = (format: "csv" | "xlsx" | "pdf" = "csv") => {
        const { headers, rows } = getExportData();
        const basename = `analytics-report-${new Date().toISOString().split("T")[0]}`;
        if (format === "csv") exportCSV(headers, rows, basename);
        else if (format === "xlsx") exportXLSX(headers, rows, basename);
        else exportPDF(headers, rows, basename, { title: "Platform Analytics Report" });
        setExportSuccess(true);
        setShowExportMenu(false);
        setTimeout(() => setExportSuccess(false), 3000);
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
                        <button
                            onClick={() => setShowExportMenu(m => !m)}
                            className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors flex items-center gap-2"
                        >
                            {exportSuccess ? <><Check size={16} /> Exported!</> : <><Download size={16} /> Export Report <ChevronDown size={14} /></>}
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-stone-200 shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button onClick={() => handleExport("csv")} className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-3 transition-colors">
                                    <Download size={15} className="text-stone-400" /> Export as CSV
                                </button>
                                <button onClick={() => handleExport("xlsx")} className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-3 transition-colors">
                                    <FileSpreadsheet size={15} className="text-green-600" /> Export as Excel
                                </button>
                                <button onClick={() => handleExport("pdf")} className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-3 transition-colors">
                                    <FileText size={15} className="text-red-500" /> Export as PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>



            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {loadingOverview ? (
                    <div className="col-span-4 flex items-center justify-center py-8 text-stone-400 gap-2"><Loader2 size={18} className="animate-spin" /> Loading metrics...</div>
                ) : (
                    <>
                        <MetricCard title="Total Members" value={overview ? overview.totalMembers.toLocaleString() : "—"} change={overview ? `+${overview.newThisMonth} this month` : ""} trend="up" icon={Users} />
                        <MetricCard title="Active This Month" value={overview ? overview.activeThisMonth.toLocaleString() : "—"} change="" trend="up" icon={Activity} />
                        <MetricCard title="Total Events" value={overview ? overview.totalEvents.toLocaleString() : "—"} change={overview ? `${overview.totalRsvpsThisMonth} RSVPs this month` : ""} trend="up" icon={Calendar} />
                        <MetricCard title="Open Reports" value={overview ? overview.openReports.toString() : "—"} change={overview && overview.openReports === 0 ? "All clear" : ""} trend={overview && overview.openReports === 0 ? "up" : "down"} icon={TrendingUp} inverse={overview ? overview.openReports > 0 : false} />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                    <div className="mb-6">
                        <h3 className="font-bold text-stone-900">Platform Growth</h3>
                        <p className="text-sm text-stone-500 mt-1">Member acquisition and active users over time</p>
                    </div>
                    <div className="flex flex-col items-center justify-center h-48 rounded-xl bg-stone-50 border border-dashed border-stone-200 gap-2">
                        <TrendingUp size={24} className="text-stone-300" />
                        <p className="text-sm font-semibold text-stone-400">Historical trend data unavailable</p>
                        <p className="text-xs text-stone-400">A time-series API endpoint is needed to display growth charts.</p>
                    </div>
                </div>

                {/* Side Stats */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                        <h3 className="font-bold text-stone-900 mb-4">Engagement by Cohort</h3>
                        {loadingCohorts ? (
                            <div className="flex items-center gap-2 text-stone-400 text-sm"><Loader2 size={14} className="animate-spin" /> Loading...</div>
                        ) : apiCohorts.length > 0 ? (
                            <div className="space-y-4">
                                {apiCohorts.map((cohort, i) => (
                                    <div key={cohort.id} className="group">
                                        <ProgramBar
                                            label={cohort.name}
                                            value={`${Math.round(cohort.activeRate * 100)}%`}
                                            color={i === 0 ? "bg-brand-600" : i === 1 ? "bg-accent-500" : "bg-stone-500"}
                                        />
                                        <button onClick={() => setDrillDownCohortId(cohort.id)} className="text-[10px] text-brand-600 font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:underline">
                                            <Eye size={10} /> View Details
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-stone-400">No cohort data available.</p>
                        )}
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
            {drillCohort && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDrillDownCohortId(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-stone-100">
                            <div>
                                <h2 className="text-xl font-bold text-stone-900">{drillCohort.name}</h2>
                                <p className="text-sm text-stone-500">Cohort engagement breakdown</p>
                            </div>
                            <button onClick={() => setDrillDownCohortId(null)} aria-label="Close" className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-stone-50 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-stone-900">{drillCohort.memberCount}</p>
                                    <p className="text-xs text-stone-500 font-medium">Members</p>
                                </div>
                                <div className="bg-stone-50 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-stone-900">{Math.round(drillCohort.activeRate * 100)}%</p>
                                    <p className="text-xs text-stone-500 font-medium">Active Rate</p>
                                </div>
                                <div className="bg-stone-50 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-stone-900">{drillCohort.sessionsDone}</p>
                                    <p className="text-xs text-stone-500 font-medium">Sessions Done</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end">
                            <button onClick={() => { setDrillDownCohortId(null); handleExport("xlsx"); }} className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors">
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

function MetricCard({ title, value, change, trend, icon: Icon, inverse }: { title: string; value: string; change: string; trend: string; icon: React.ElementType; inverse?: boolean }) {
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

function ProgramBar({ label, value, color }: { label: string; value: string; color: string }) {
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
