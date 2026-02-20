"use client";

import { ArrowDown, ArrowUp, Users, Calendar, TrendingUp, Activity } from "lucide-react";
import { useState } from "react";

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
};

type TimeRange = "7days" | "30days" | "quarter";

export default function AdminAnalyticsPage() {
    const [timeRange, setTimeRange] = useState<TimeRange>("quarter");
    const data = GROWTH_DATA[timeRange];
    return (
        <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Platform Analytics</h1>
                    <p className="text-stone-500 mt-2">Overview of community growth and engagement.</p>
                </div>
                <div className="flex gap-2">
                    <select 
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                        className="bg-white border border-stone-200 rounded-lg px-4 py-2 text-sm font-medium text-stone-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="quarter">This Year</option>
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
                {/* Main Chart Area */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-stone-900">Platform Growth</h3>
                            <p className="text-sm text-stone-500 mt-1">Member acquisition and active users over time</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-brand-600"></span>
                                <span className="text-xs text-stone-500">Total Members</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-accent-500"></span>
                                <span className="text-xs text-stone-500">Active Users</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* SVG Line Chart */}
                    <GrowthChart data={data} />
                </div>

                {/* Side Stats */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                        <h3 className="font-bold text-stone-900 mb-4">Engagement by Cohort</h3>
                        <div className="space-y-4">
                            <ProgramBar label="Cohort Alpha" value="45%" color="bg-brand-600" />
                            <ProgramBar label="Cohort Beta" value="32%" color="bg-accent-500" />
                            <ProgramBar label="Cohort Pioneer" value="23%" color="bg-stone-500" />
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
        <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between h-32 hover:border-brand-200 transition-colors cursor-pointer">
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

// Interactive Growth Chart Component
function GrowthChart({ data }: { data: { labels: string[]; members: number[]; active: number[] } }) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    
    const chartWidth = 600;
    const chartHeight = 280;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;
    
    // Calculate min/max for scale
    const allValues = [...data.members, ...data.active];
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues) * 0.9;
    
    // Scale functions
    const xScale = (index: number) => padding.left + (index / (data.labels.length - 1)) * innerWidth;
    const yScale = (value: number) => padding.top + innerHeight - ((value - minValue) / (maxValue - minValue)) * innerHeight;
    
    // Generate path for line
    const generatePath = (values: number[]) => {
        return values.map((val, i) => {
            const x = xScale(i);
            const y = yScale(val);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    };
    
    // Generate area path
    const generateAreaPath = (values: number[]) => {
        const linePath = generatePath(values);
        const lastX = xScale(values.length - 1);
        const firstX = xScale(0);
        const bottomY = padding.top + innerHeight;
        return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    };
    
    // Y-axis ticks
    const yTicks = 5;
    const yTickValues = Array.from({ length: yTicks }, (_, i) => {
        return Math.round(minValue + (i / (yTicks - 1)) * (maxValue - minValue));
    });

    return (
        <div className="relative">
            <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-auto"
                style={{ maxHeight: '320px' }}
            >
                {/* Grid lines */}
                {yTickValues.map((tick, i) => (
                    <g key={i}>
                        <line
                            x1={padding.left}
                            y1={yScale(tick)}
                            x2={chartWidth - padding.right}
                            y2={yScale(tick)}
                            stroke="#e7e5e4"
                            strokeDasharray="4 4"
                        />
                        <text
                            x={padding.left - 10}
                            y={yScale(tick)}
                            textAnchor="end"
                            dominantBaseline="middle"
                            className="fill-stone-400 text-[10px]"
                        >
                            {tick.toLocaleString()}
                        </text>
                    </g>
                ))}
                
                {/* Area fills */}
                <path
                    d={generateAreaPath(data.members)}
                    fill="url(#memberGradient)"
                    opacity="0.3"
                />
                <path
                    d={generateAreaPath(data.active)}
                    fill="url(#activeGradient)"
                    opacity="0.3"
                />
                
                {/* Lines */}
                <path
                    d={generatePath(data.members)}
                    fill="none"
                    stroke="#412569"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d={generatePath(data.active)}
                    fill="none"
                    stroke="#db8e29"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                
                {/* Data points - Members */}
                {data.members.map((val, i) => (
                    <circle
                        key={`member-${i}`}
                        cx={xScale(i)}
                        cy={yScale(val)}
                        r={hoveredIndex === i ? 6 : 4}
                        fill="#412569"
                        stroke="white"
                        strokeWidth="2"
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    />
                ))}
                
                {/* Data points - Active */}
                {data.active.map((val, i) => (
                    <circle
                        key={`active-${i}`}
                        cx={xScale(i)}
                        cy={yScale(val)}
                        r={hoveredIndex === i ? 6 : 4}
                        fill="#db8e29"
                        stroke="white"
                        strokeWidth="2"
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    />
                ))}
                
                {/* X-axis labels */}
                {data.labels.map((label, i) => (
                    <text
                        key={i}
                        x={xScale(i)}
                        y={chartHeight - 10}
                        textAnchor="middle"
                        className="fill-stone-400 text-[11px] font-medium"
                    >
                        {label}
                    </text>
                ))}
                
                {/* Hover line */}
                {hoveredIndex !== null && (
                    <line
                        x1={xScale(hoveredIndex)}
                        y1={padding.top}
                        x2={xScale(hoveredIndex)}
                        y2={padding.top + innerHeight}
                        stroke="#a8a29e"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                )}
                
                {/* Gradients */}
                <defs>
                    <linearGradient id="memberGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#412569" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#412569" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="activeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#db8e29" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#db8e29" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
            
            {/* Tooltip */}
            {hoveredIndex !== null && (
                <div 
                    className="absolute bg-stone-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none z-10"
                    style={{
                        left: `${(xScale(hoveredIndex) / chartWidth) * 100}%`,
                        top: '20px',
                        transform: 'translateX(-50%)',
                    }}
                >
                    <p className="font-bold text-stone-300 text-xs mb-1">{data.labels[hoveredIndex]}</p>
                    <p className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                        Members: <span className="font-bold">{data.members[hoveredIndex].toLocaleString()}</span>
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-500"></span>
                        Active: <span className="font-bold">{data.active[hoveredIndex].toLocaleString()}</span>
                    </p>
                </div>
            )}
        </div>
    );
}
