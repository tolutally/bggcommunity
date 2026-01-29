"use client";

import { useState } from "react";
import { Flag, AlertTriangle, CheckCircle, XCircle, ShieldAlert, BadgeInfo } from "lucide-react";

// Mock Data
type ReportSeverity = "High" | "Medium" | "Low";
type ReportStatus = "Pending" | "Resolved" | "Dismissed";

interface Report {
    id: string;
    type: "Post" | "Comment" | "Profile";
    reason: string;
    reporter: string;
    reportedUser: {
        name: string;
        avatar: string;
        id: string;
    };
    content: string;
    context?: string;
    severity: ReportSeverity;
    status: ReportStatus;
    timestamp: string;
}

const MOCK_REPORTS: Report[] = [
    {
        id: "R-1023",
        type: "Comment",
        reason: "Harassment",
        reporter: "Amara O.",
        reportedUser: {
            name: "New User 123",
            avatar: "https://i.pravatar.cc/150?u=99",
            id: "u-99"
        },
        content: "You obviously don't know what you're talking about. Quit tech.",
        context: "Thread: 'Struggling with React Hooks'",
        severity: "High",
        status: "Pending",
        timestamp: "10 mins ago"
    },
    {
        id: "R-1022",
        type: "Post",
        reason: "Spam",
        reporter: "System Bot",
        reportedUser: {
            name: "Crypto King",
            avatar: "https://i.pravatar.cc/150?u=88",
            id: "u-88"
        },
        content: "Make $5000/day working from home!! Click link -> bit.ly/scam",
        severity: "Medium",
        status: "Pending",
        timestamp: "1 hour ago"
    },
    {
        id: "R-1021",
        type: "Profile",
        reason: "Inappropriate Content",
        reporter: "Sarah J.",
        reportedUser: {
            name: "Troll Account",
            avatar: "https://i.pravatar.cc/150?u=77",
            id: "u-77"
        },
        content: "Bio contains offensive language.",
        severity: "Low",
        status: "Pending",
        timestamp: "3 hours ago"
    }
];

export default function AdminModerationPage() {
    const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

    const selectedReport = reports.find(r => r.id === selectedReportId) || reports[0];

    const handleAction = (action: string, reportId: string) => {
        console.log(`Taking action: ${action} on report ${reportId}`);
        setReports(prev => prev.filter(r => r.id !== reportId));
        if (selectedReportId === reportId) {
            setSelectedReportId(null);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Community Safety</h1>
                    <p className="text-stone-500 mt-1">Review flagged content and user reports.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-stone-500 font-bold uppercase">Open Reports</p>
                            <p className="text-xl font-bold text-stone-900">{reports.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            {reports.length > 0 ? (
                <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
                    {/* Report Sidebar List */}
                    <div className="w-full lg:w-1/3 bg-white rounded-2xl border border-stone-200 flex flex-col h-full shadow-lg shadow-stone-200/50">
                        <div className="p-4 border-b border-stone-100 bg-stone-50/50 rounded-t-2xl">
                            <h2 className="font-bold text-stone-700">Queue ({reports.length})</h2>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-2">
                            {reports.map(report => (
                                <div
                                    key={report.id}
                                    onClick={() => setSelectedReportId(report.id)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${(selectedReport?.id === report.id)
                                        ? 'bg-purple-50 border-purple-200 shadow-sm'
                                        : 'bg-white border-stone-100 hover:border-purple-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${report.severity === 'High' ? 'bg-red-100 text-red-700' :
                                            report.severity === 'Medium' ? 'bg-orange-100 text-orange-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            <AlertTriangle size={10} /> {report.severity}
                                        </div>
                                        <span className="text-xs text-stone-400">{report.timestamp}</span>
                                    </div>
                                    <h3 className="font-bold text-stone-900 text-sm mb-1">{report.reason}</h3>
                                    <div className="flex items-center gap-2">
                                        <img src={report.reportedUser.avatar} className="w-5 h-5 rounded-full" />
                                        <span className="text-xs text-stone-600 truncate">{report.reportedUser.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detailed Review Panel */}
                    <div className="flex-1 bg-stone-50 rounded-3xl border border-stone-200 p-1 overflow-hidden flex flex-col shadow-inner">
                        <div className="bg-white rounded-[1.25rem] border border-stone-100 h-full flex flex-col p-6 lg:p-10 overflow-y-auto">
                            {selectedReport && (
                                <div className="max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Meta Header */}
                                    <div className="flex items-start justify-between mb-8 pb-6 border-b border-stone-100">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-2xl font-bold text-stone-900">Report Details</h2>
                                                <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded-md text-xs font-mono">{selectedReport.id}</span>
                                            </div>
                                            <p className="text-stone-500 flex items-center gap-2">
                                                Reported by <span className="font-bold text-stone-700">{selectedReport.reporter}</span> for <span className="font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">{selectedReport.reason}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* The Content */}
                                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8 relative">
                                        <div className="absolute top-4 right-4 text-red-200">
                                            <ShieldAlert size={48} />
                                        </div>
                                        <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <AlertTriangle size={14} /> Reported Content
                                        </h3>

                                        <div className="flex gap-4">
                                            <img src={selectedReport.reportedUser.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                                            <div>
                                                <p className="font-bold text-stone-900">{selectedReport.reportedUser.name}</p>
                                                <p className="text-stone-500 text-xs mb-3">User ID: {selectedReport.reportedUser.id}</p>
                                                <p className="text-lg font-medium text-stone-800 leading-relaxed bg-white/50 p-4 rounded-xl border border-red-100/50 backdrop-blur-sm">
                                                    "{selectedReport.content}"
                                                </p>
                                            </div>
                                        </div>

                                        {selectedReport.context && (
                                            <div className="mt-4 pt-4 border-t border-red-200/50">
                                                <p className="text-xs text-red-700/70 font-semibold mb-1">Context</p>
                                                <p className="text-sm text-red-800 italic">{selectedReport.context}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* User History (Mock) */}
                                    <div className="bg-stone-50 rounded-xl p-4 mb-8 border border-stone-100">
                                        <div className="flex items-center gap-2 text-stone-600 font-semibold mb-2">
                                            <BadgeInfo size={16} /> User History
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-stone-400 block text-xs">Account Age</span>
                                                <span className="font-mono text-stone-700">2 months</span>
                                            </div>
                                            <div>
                                                <span className="text-stone-400 block text-xs">Previous Flag</span>
                                                <span className="font-mono text-stone-700">0</span>
                                            </div>
                                            <div>
                                                <span className="text-stone-400 block text-xs">Trust Score</span>
                                                <span className="font-mono text-stone-700">High</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Toolbar */}
                                    <div className="border-t border-stone-100 pt-6">
                                        <h3 className="font-bold text-stone-900 mb-4">Take Action</h3>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => handleAction("Dismiss", selectedReport.id)}
                                                className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={18} /> Dismiss Report
                                            </button>
                                            <button
                                                onClick={() => handleAction("Warn", selectedReport.id)}
                                                className="flex-1 py-3 px-4 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                            >
                                                <AlertTriangle size={18} /> Send Warning
                                            </button>
                                            <button
                                                onClick={() => handleAction("Delete", selectedReport.id)}
                                                className="flex-1 py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={18} /> Delete Content
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-stone-900 mb-2">All Caught Up!</h2>
                    <p className="text-xl text-stone-500 max-w-md mx-auto">
                        Amazing work. The moderation queue is empty and the community is safe.
                    </p>
                </div>
            )}
        </div>
    );
}
