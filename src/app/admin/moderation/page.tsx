"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle, XCircle, ShieldAlert, BadgeInfo, Search, Clock, RotateCcw, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useToast } from "@/components/ui/toast";
import {
    deleteCommunityComment,
    deleteCommunityPost,
    fetchModerationContent,
    getCommunityErrorMessage,
    type ModerationContentRecord,
} from "@/lib/community";

// Types
type ReportSeverity = "High" | "Medium" | "Low";
type ReportStatus = "Pending" | "Resolved" | "Dismissed";
type ActionType = "Dismiss" | "Warn" | "Delete";

interface Report {
    id: string;
    type: "Post" | "Comment" | "Profile";
    reason: string;
    reporter: string;
    reportedUser: {
        name: string;
        avatar?: string;
        id: string;
    };
    content: string;
    context?: string;
    severity: ReportSeverity;
    status: ReportStatus;
    timestamp: string;
    createdAt: string;
    sourceId?: string;
}

interface ResolvedReport extends Report {
    action: ActionType;
    resolvedAt: string;
}

function formatRelativeTime(value: string) {
    const date = new Date(value);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} mins ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
}

function detectSeverity(content: string): ReportSeverity {
    const normalized = content.toLowerCase();
    const highSignals = ["hate", "kill", "threat", "harass", "slur"];
    const mediumSignals = ["spam", "scam", "fake", "misleading", "offensive"];

    if (highSignals.some((signal) => normalized.includes(signal))) return "High";
    if (mediumSignals.some((signal) => normalized.includes(signal))) return "Medium";
    return "Low";
}

function detectReason(content: string): string {
    const normalized = content.toLowerCase();
    if (normalized.includes("spam") || normalized.includes("http")) return "Possible Spam";
    if (normalized.includes("hate") || normalized.includes("slur") || normalized.includes("harass")) return "Potential Harassment";
    if (normalized.includes("fake") || normalized.includes("misleading")) return "Potential Misinformation";
    return "Manual Review";
}

function mapModerationContent(item: ModerationContentRecord): Report {
    return {
        id: `R-${item.sourceType}-${item.id}`,
        sourceId: item.id,
        type: item.sourceType,
        reason: detectReason(item.content),
        reporter: "Automated moderation",
        reportedUser: {
            name: item.authorName,
            id: item.authorName.toLowerCase().replace(/\s+/g, "-"),
        },
        content: item.content,
        context: `${item.groupName} / ${item.channelName}${item.postTitle ? ` / ${item.postTitle}` : ""}`,
        severity: detectSeverity(item.content),
        status: "Pending",
        timestamp: formatRelativeTime(item.createdAt),
        createdAt: item.createdAt,
    };
}

export default function AdminModerationPage() {
    const { getToken } = useAuth();
    const { toast } = useToast();
    const [reports, setReports] = useState<Report[]>([]);
    const [resolvedReports, setResolvedReports] = useState<ResolvedReport[]>([]);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [tab, setTab] = useState<"pending" | "history">("pending");
    const [isLoading, setIsLoading] = useState(true);
    const [isActingId, setIsActingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [severityFilter, setSeverityFilter] = useState<"All" | ReportSeverity>("All");
    const [typeFilter, setTypeFilter] = useState<"All" | "Post" | "Comment" | "Profile">("All");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadModerationData() {
            setIsLoading(true);
            setError(null);

            try {
                const items = await fetchModerationContent(getToken);
                if (cancelled) return;
                setReports(items.map(mapModerationContent));
            } catch (loadError) {
                if (!cancelled) {
                    setError(getCommunityErrorMessage(loadError));
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadModerationData();

        return () => {
            cancelled = true;
        };
    }, [getToken]);

    const filteredReports = reports.filter((report) => {
        const matchSeverity = severityFilter === "All" || report.severity === severityFilter;
        const matchType = typeFilter === "All" || report.type === typeFilter;
        const query = searchQuery.trim().toLowerCase();
        const matchSearch = query === "" || report.reason.toLowerCase().includes(query) || report.reportedUser.name.toLowerCase().includes(query) || report.content.toLowerCase().includes(query);
        return matchSeverity && matchType && matchSearch;
    });

    const filteredResolved = resolvedReports.filter((report) => {
        const matchSeverity = severityFilter === "All" || report.severity === severityFilter;
        const matchType = typeFilter === "All" || report.type === typeFilter;
        const query = searchQuery.trim().toLowerCase();
        const matchSearch = query === "" || report.reason.toLowerCase().includes(query) || report.reportedUser.name.toLowerCase().includes(query);
        return matchSeverity && matchType && matchSearch;
    });

    const selectedReport = tab === "pending"
        ? (filteredReports.find(r => r.id === selectedReportId) || filteredReports[0])
        : (filteredResolved.find(r => r.id === selectedReportId) || filteredResolved[0]);

    const handleAction = async (action: ActionType, reportId: string) => {
        const report = reports.find(r => r.id === reportId);
        if (!report) return;

        if (action === "Delete") {
            if (!report.sourceId) {
                toast("Unable to resolve source content for delete", "error");
                return;
            }

            setIsActingId(reportId);
            try {
                if (report.type === "Post") {
                    await deleteCommunityPost(report.sourceId, getToken);
                } else if (report.type === "Comment") {
                    await deleteCommunityComment(report.sourceId, getToken);
                }
            } catch (deleteError) {
                toast(getCommunityErrorMessage(deleteError), "error");
                setIsActingId(null);
                return;
            }
            setIsActingId(null);
        }

        const resolved: ResolvedReport = {
            ...report,
            // For "Delete" action, replace content with "[deleted]" placeholder
            content: action === "Delete" ? "[deleted]" : report.content,
            status: action === "Dismiss" ? "Dismissed" : "Resolved",
            action,
            resolvedAt: "just now",
        };
        setResolvedReports(prev => [resolved, ...prev]);
        setReports(prev => prev.filter(r => r.id !== reportId));
        if (selectedReportId === reportId) setSelectedReportId(null);
        toast(action === "Delete" ? "Content removed" : action === "Warn" ? "Warning logged" : "Report dismissed");
    };

    const handleReopen = (reportId: string) => {
        const resolved = resolvedReports.find(r => r.id === reportId);
        if (!resolved) return;
        if (resolved.action === "Delete") {
            toast("Deleted content cannot be reopened from this view.", "error");
            return;
        }
        const { action: _a, resolvedAt: _r, ...report } = resolved;
        setReports(prev => [{ ...report, status: "Pending" as ReportStatus }, ...prev]);
        setResolvedReports(prev => prev.filter(r => r.id !== reportId));
        setTab("pending");
    };

    const currentList = tab === "pending" ? filteredReports : filteredResolved;

    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 flex-shrink-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Community Safety</h1>
                    <p className="text-stone-500 mt-1">Review flagged content and user reports.</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={18} /></div>
                        <div>
                            <p className="text-[10px] text-stone-500 font-bold uppercase">Open</p>
                            <p className="text-lg font-bold text-stone-900">{reports.length}</p>
                        </div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={18} /></div>
                        <div>
                            <p className="text-[10px] text-stone-500 font-bold uppercase">Resolved</p>
                            <p className="text-lg font-bold text-stone-900">{resolvedReports.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs + Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-shrink-0">
                <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
                    <button onClick={() => { setTab("pending"); setSelectedReportId(null); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === "pending" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>
                        Pending ({reports.length})
                    </button>
                    <button onClick={() => { setTab("history"); setSelectedReportId(null); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === "history" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>
                        History ({resolvedReports.length})
                    </button>
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input type="text" placeholder="Search reports..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none" />
                </div>
                <select title="Filter by severity" aria-label="Filter by severity" value={severityFilter} onChange={e => setSeverityFilter(e.target.value as any)} className="bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-600 outline-none">
                    <option value="All">All Severity</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
                <select title="Filter by content type" aria-label="Filter by content type" value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-600 outline-none">
                    <option value="All">All Types</option>
                    <option value="Post">Post</option>
                    <option value="Comment">Comment</option>
                    <option value="Profile">Profile</option>
                </select>
            </div>

            {/* Main Layout */}
            {isLoading ? (
                <div className="h-full flex items-center justify-center text-stone-500 gap-2">
                    <Loader2 size={18} className="animate-spin" /> Loading moderation queue...
                </div>
            ) : error ? (
                <EmptyState icon={AlertTriangle} heading="Moderation queue unavailable" description={error} variant="plain" />
            ) : currentList.length > 0 ? (
                <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
                    {/* Report Sidebar List */}
                    <div className="w-full lg:w-1/3 bg-white rounded-2xl border border-stone-200 flex flex-col h-full shadow-lg shadow-stone-200/50">
                        <div className="p-4 border-b border-stone-100 bg-stone-50/50 rounded-t-2xl">
                            <h2 className="font-bold text-stone-700">{tab === "pending" ? "Queue" : "History"} ({currentList.length})</h2>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-2">
                            {currentList.map(report => (
                                <div
                                    key={report.id}
                                    onClick={() => setSelectedReportId(report.id)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedReport?.id === report.id ? "bg-brand-50 border-brand-200 shadow-sm" : "bg-white border-stone-100 hover:border-brand-200"}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <StatusBadge label={report.severity} preset={report.severity} variant="tag" icon={AlertTriangle} />
                                        <span className="text-xs text-stone-400">{report.timestamp}</span>
                                    </div>
                                    <h3 className="font-bold text-stone-900 text-sm mb-1">{report.reason}</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <AvatarInitials name={report.reportedUser.name} src={report.reportedUser.avatar} size="xs" />
                                            <span className="text-xs text-stone-600 truncate">{report.reportedUser.name}</span>
                                        </div>
                                        {tab === "history" && (
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${(report as ResolvedReport).action === "Delete" ? "bg-red-100 text-red-600" : (report as ResolvedReport).action === "Warn" ? "bg-yellow-100 text-yellow-700" : "bg-stone-100 text-stone-500"}`}>
                                                {(report as ResolvedReport).action}
                                            </span>
                                        )}
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
                                                {tab === "history" && (
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${(selectedReport as ResolvedReport).action === "Delete" ? "bg-red-100 text-red-700" : (selectedReport as ResolvedReport).action === "Warn" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                                                        {(selectedReport as ResolvedReport).action === "Dismiss" ? "Dismissed" : (selectedReport as ResolvedReport).action === "Warn" ? "Warned" : "Deleted"}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-stone-500 flex items-center gap-2 flex-wrap">
                                                Reported by <span className="font-bold text-stone-700">{selectedReport.reporter}</span> for <span className="font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">{selectedReport.reason}</span>
                                            </p>
                                            {tab === "history" && (
                                                <p className="text-xs text-stone-400 mt-2 flex items-center gap-1"><Clock size={12} /> Resolved {(selectedReport as ResolvedReport).resolvedAt}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* The Content */}
                                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8 relative">
                                        <div className="absolute top-4 right-4 text-red-200"><ShieldAlert size={48} /></div>
                                        <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <AlertTriangle size={14} /> Reported Content
                                        </h3>
                                        <div className="flex gap-4">
                                            <AvatarInitials name={selectedReport.reportedUser.name} src={selectedReport.reportedUser.avatar} size="lg" className="border-2 border-white shadow-sm" />
                                            <div>
                                                <p className="font-bold text-stone-900">{selectedReport.reportedUser.name}</p>
                                                <p className="text-stone-500 text-xs mb-3">User ID: {selectedReport.reportedUser.id} &middot; Type: {selectedReport.type}</p>
                                                <p className={`text-lg font-medium leading-relaxed bg-white/50 p-4 rounded-xl border border-red-100/50 backdrop-blur-sm ${selectedReport.content === "[deleted]" ? "text-stone-400 italic" : "text-stone-800"}`}>
                                                    {selectedReport.content === "[deleted]" ? "[deleted]" : <>&ldquo;{selectedReport.content}&rdquo;</>}
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

                                    {/* User History */}
                                    <div className="bg-stone-50 rounded-xl p-4 mb-8 border border-stone-100">
                                        <div className="flex items-center gap-2 text-stone-600 font-semibold mb-2"><BadgeInfo size={16} /> User History</div>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div><span className="text-stone-400 block text-xs">Account Age</span><span className="font-mono text-stone-700">2 months</span></div>
                                            <div><span className="text-stone-400 block text-xs">Previous Flags</span><span className="font-mono text-stone-700">0</span></div>
                                            <div><span className="text-stone-400 block text-xs">Trust Score</span><span className="font-mono text-stone-700">High</span></div>
                                        </div>
                                    </div>

                                    {/* Action Toolbar */}
                                    {tab === "pending" ? (
                                        <div className="border-t border-stone-100 pt-6">
                                            <h3 className="font-bold text-stone-900 mb-4">Take Action</h3>
                                            <div className="flex flex-wrap gap-3">
                                                <button onClick={() => void handleAction("Dismiss", selectedReport.id)} disabled={isActingId === selectedReport.id} className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                                                    <CheckCircle size={18} /> Dismiss Report
                                                </button>
                                                <button onClick={() => void handleAction("Warn", selectedReport.id)} disabled={isActingId === selectedReport.id} className="flex-1 py-3 px-4 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                                                    <AlertTriangle size={18} /> Send Warning
                                                </button>
                                                <button onClick={() => void handleAction("Delete", selectedReport.id)} disabled={isActingId === selectedReport.id || selectedReport.type === "Profile"} className="flex-1 py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                                    {isActingId === selectedReport.id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />} Delete Content
                                                </button>
                                            </div>
                                            {selectedReport.type === "Profile" ? <p className="text-xs text-stone-400 mt-2">Profile moderation delete endpoint is not currently exposed in API docs.</p> : null}
                                        </div>
                                    ) : (
                                        <div className="border-t border-stone-100 pt-6">
                                            <h3 className="font-bold text-stone-900 mb-4">Resolution</h3>
                                            <div className="flex items-center justify-between bg-stone-50 rounded-xl p-4 border border-stone-100">
                                                <div>
                                                    <p className="text-sm text-stone-600">Action taken: <span className="font-bold text-stone-900">{(selectedReport as ResolvedReport).action === "Dismiss" ? "Report Dismissed" : (selectedReport as ResolvedReport).action === "Warn" ? "Warning Sent" : "Content Deleted"}</span></p>
                                                    <p className="text-xs text-stone-400 mt-1">Resolved {(selectedReport as ResolvedReport).resolvedAt}</p>
                                                </div>
                                                <button onClick={() => handleReopen(selectedReport.id)} className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors">
                                                    <RotateCcw size={14} /> Reopen
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <EmptyState
                    icon={CheckCircle}
                    heading={tab === "pending" ? "All Caught Up!" : "No Matching History"}
                    description={tab === "pending"
                        ? "Amazing work. The moderation queue is empty and the community is safe."
                        : "Try adjusting your filters to find resolved reports."}
                    action={(severityFilter !== "All" || typeFilter !== "All" || searchQuery)
                        ? { label: "Clear Filters", onClick: () => { setSeverityFilter("All"); setTypeFilter("All"); setSearchQuery(""); } }
                        : undefined}
                    variant="plain"
                    className="h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-500"
                />
            )}
        </div>
        </ErrorBoundary>
    );
}
