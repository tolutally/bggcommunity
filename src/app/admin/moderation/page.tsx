"use client";

import { useAuth } from "@clerk/nextjs";
import { useMemo, useRef, useState, useEffect } from "react";
import {
  AlertTriangle, CheckCircle, XCircle, ShieldAlert, BadgeInfo,
  Search, Clock, RotateCcw, Loader2, ChevronDown, MessageSquare,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useToast } from "@/components/ui/toast";
import {
  useReportQueue,
  useReportDetail,
  useDismissReport,
  useWarnUser,
  useDeleteContent,
} from "@/hooks/use-admin-moderation";
import { apiRequest } from "@/lib/api";
import type { ModerationReport, PaginatedResponse } from "@/lib/types";

// ── Local UI types ──────────────────────────────────────────────────────────

type UISeverity = "High" | "Medium" | "Low";
type ActionType = "Dismiss" | "Warn" | "Delete";

interface UIReport {
  id: string;
  contentType: "Post" | "Comment" | "Profile";
  reason: string;
  description: string | null;
  reporter: string;
  reportedUser: { name: string; avatar?: string; id: string };
  content: string;
  severity: UISeverity;
  timestamp: string;
  createdAt: string;
}

interface UIResolvedReport extends UIReport {
  action: ActionType;
  resolvedAt: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmtRelative(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const m = Math.floor(diffMs / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(value).toLocaleDateString();
}

function fullName(
  profile: { firstName: string; lastName: string } | null | undefined,
  fallback: string,
) {
  return profile ? `${profile.firstName} ${profile.lastName}` : fallback;
}

function apiSeverityToUI(s: "LOW" | "MEDIUM" | "HIGH"): UISeverity {
  return s === "HIGH" ? "High" : s === "LOW" ? "Low" : "Medium";
}

function mapToUI(item: ModerationReport): UIReport {
  return {
    id: item.id,
    contentType: item.contentType,
    reason: item.reason,
    description: item.description,
    reporter: fullName(item.reporter?.profile, "Anonymous"),
    reportedUser: {
      name: fullName(item.reportedUser.profile, item.reportedUser.email),
      avatar: item.reportedUser.profile?.avatarUrl ?? undefined,
      id: item.reportedUser.id,
    },
    content: item.content ?? "",
    severity: apiSeverityToUI(item.severity),
    timestamp: fmtRelative(item.createdAt),
    createdAt: item.createdAt,
  };
}

function mapToUIResolved(item: ModerationReport): UIResolvedReport {
  const action: ActionType =
    item.resolution === "DISMISSED" ? "Dismiss"
    : item.resolution === "WARNED" ? "Warn"
    : "Delete";
  return {
    ...mapToUI(item),
    action,
    resolvedAt: item.resolvedAt ? fmtRelative(item.resolvedAt) : "previously",
  };
}

// ── Detail panel (keyed by report.id so hooks reset on report change) ────────

function ReportDetailPanel({
  report,
  tab,
  onResolved,
  onReopen,
}: {
  report: UIReport | UIResolvedReport;
  tab: "pending" | "history";
  onResolved: (r: UIResolvedReport) => void;
  onReopen: (id: string) => void;
}) {
  const { toast } = useToast();
  const { report: detail, isLoading: loadingDetail } = useReportDetail(report.id);
  const { trigger: dismiss, isLoading: dismissing } = useDismissReport(report.id);
  const { trigger: warn, isLoading: warning } = useWarnUser(report.id);
  const { trigger: deleteContent, isLoading: deleting } = useDeleteContent(report.id);

  const isActing = dismissing || warning || deleting;

  // Content: detail endpoint populates it; fallback to whatever came with the list
  const postContent = detail?.content ?? report.content;
  const contentReady = !loadingDetail || !!postContent;

  // User history comes from the detail endpoint
  const flagCount = detail?.reportedUser.profile?.flagCount;
  const accountAge = detail?.reportedUser.accountAge;
  const trustScore = detail?.reportedUser.trustScore;

  const handleAction = async (action: ActionType) => {
    if (isActing) return;
    try {
      if (action === "Dismiss") await dismiss();
      else if (action === "Warn") await warn();
      else await deleteContent();

      onResolved({
        ...report,
        content: action === "Delete" ? "[deleted]" : report.content,
        action,
        resolvedAt: "just now",
      } as UIResolvedReport);
      toast(
        action === "Delete" ? "Content removed"
        : action === "Warn" ? "Warning sent to user"
        : "Report dismissed",
      );
    } catch {
      toast("Action failed — please try again.", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h2 className="text-2xl font-bold text-stone-900">Report Details</h2>
            <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded-md text-xs font-mono">{report.id}</span>
            {tab === "history" && (
              <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                (report as UIResolvedReport).action === "Delete" ? "bg-red-100 text-red-700"
                : (report as UIResolvedReport).action === "Warn" ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
              }`}>
                {(report as UIResolvedReport).action === "Dismiss" ? "Dismissed"
                : (report as UIResolvedReport).action === "Warn" ? "Warned"
                : "Deleted"}
              </span>
            )}
          </div>
          <p className="text-stone-500 flex items-center gap-2 flex-wrap">
            Reported by{" "}
            <span className="font-bold text-stone-700">{report.reporter}</span>
            {" "}for{" "}
            <span className="font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
              {report.reason}
            </span>
          </p>
          {tab === "history" && (
            <p className="text-xs text-stone-400 mt-2 flex items-center gap-1">
              <Clock size={12} /> Resolved {(report as UIResolvedReport).resolvedAt}
            </p>
          )}
        </div>
      </div>

      {/* Reported Content card */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-4 right-4 text-red-200"><ShieldAlert size={48} /></div>
        <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <AlertTriangle size={14} /> Reported Content
        </h3>
        <div className="flex gap-4">
          <AvatarInitials
            name={report.reportedUser.name}
            src={report.reportedUser.avatar}
            size="lg"
            className="border-2 border-white shadow-sm flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-stone-900">{report.reportedUser.name}</p>
            <p className="text-stone-500 text-xs mb-3">
              User ID: {report.reportedUser.id} · Type: {report.contentType}
            </p>

            {/* Post / comment body */}
            {!contentReady ? (
              <div className="bg-white/50 p-4 rounded-xl border border-red-100/50 space-y-2">
                <div className="h-4 bg-red-100 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-red-100 rounded animate-pulse w-1/2" />
              </div>
            ) : postContent === "[deleted]" || !postContent ? (
              <p className="text-stone-400 italic bg-white/50 p-4 rounded-xl border border-red-100/50">
                {postContent === "[deleted]" ? "[deleted]" : "Content not available"}
              </p>
            ) : (
              <div className="bg-white/50 p-4 rounded-xl border border-red-100/50 backdrop-blur-sm">
                <p className="text-stone-800 text-[15px] leading-relaxed">
                  &ldquo;{postContent}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reporter notes */}
        {report.description && (
          <div className="mt-4 pt-4 border-t border-red-200/50">
            <p className="text-xs text-red-700/70 font-semibold mb-1 flex items-center gap-1">
              <MessageSquare size={11} /> Reporter notes
            </p>
            <p className="text-sm text-red-800 italic">{report.description}</p>
          </div>
        )}
      </div>

      {/* User History */}
      <div className="bg-stone-50 rounded-xl p-4 mb-8 border border-stone-100">
        <div className="flex items-center gap-2 text-stone-600 font-semibold mb-3">
          <BadgeInfo size={16} /> User History
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {[
            { label: "Account Age", value: accountAge },
            { label: "Previous Flags", value: flagCount !== undefined ? String(flagCount) : undefined },
            { label: "Trust Score", value: trustScore },
          ].map(({ label, value }) => (
            <div key={label}>
              <span className="text-stone-400 block text-xs mb-1">{label}</span>
              {loadingDetail && value === undefined ? (
                <span className="inline-block w-14 h-4 bg-stone-200 rounded animate-pulse" />
              ) : (
                <span className="font-mono text-stone-700">{value ?? "—"}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {tab === "pending" ? (
        <div className="border-t border-stone-100 pt-6">
          <h3 className="font-bold text-stone-900 mb-4">Take Action</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => void handleAction("Dismiss")}
              disabled={isActing}
              className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <CheckCircle size={18} /> Dismiss Report
            </button>
            <button
              onClick={() => void handleAction("Warn")}
              disabled={isActing}
              className="flex-1 py-3 px-4 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <AlertTriangle size={18} /> Send Warning
            </button>
            <button
              onClick={() => void handleAction("Delete")}
              disabled={isActing || report.contentType === "Profile"}
              title={report.contentType === "Profile" ? "Profile deletion not supported via this endpoint" : undefined}
              className="flex-1 py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isActing ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
              Delete Content
            </button>
          </div>
          {report.contentType === "Profile" && (
            <p className="text-xs text-stone-400 mt-2">
              Content deletion is not available for profile reports.
            </p>
          )}
        </div>
      ) : (
        <div className="border-t border-stone-100 pt-6">
          <h3 className="font-bold text-stone-900 mb-4">Resolution</h3>
          <div className="flex items-center justify-between bg-stone-50 rounded-xl p-4 border border-stone-100">
            <div>
              <p className="text-sm text-stone-600">
                Action taken:{" "}
                <span className="font-bold text-stone-900">
                  {(report as UIResolvedReport).action === "Dismiss" ? "Report Dismissed"
                  : (report as UIResolvedReport).action === "Warn" ? "Warning Sent"
                  : "Content Deleted"}
                </span>
              </p>
              <p className="text-xs text-stone-400 mt-1">
                Resolved {(report as UIResolvedReport).resolvedAt}
              </p>
            </div>
            <button
              onClick={() => onReopen(report.id)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors"
            >
              <RotateCcw size={14} /> Reopen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function AdminModerationPage() {
  const { getToken } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Optimistic local state
  const [localResolved, setLocalResolved] = useState<UIResolvedReport[]>([]);
  const [localRemovals, setLocalRemovals] = useState<Set<string>>(new Set());

  // Filters
  const [severityFilter, setSeverityFilter] = useState<"All" | UISeverity>("All");
  const [typeFilter, setTypeFilter] = useState<"All" | "Post" | "Comment" | "Profile">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination for pending tab
  const [moreReports, setMoreReports] = useState<ModerationReport[]>([]);
  const [loadMoreCursor, setLoadMoreCursor] = useState<string | null | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const cursorInitRef = useRef(false);

  // Two separate fetches — OPEN for pending, RESOLVED for history
  const {
    reports: openReports,
    nextCursor: firstPageCursor,
    isLoading: loadingOpen,
    error: openError,
    mutate: mutateOpen,
  } = useReportQueue("OPEN");

  const {
    reports: resolvedApiReports,
    isLoading: loadingResolved,
    mutate: mutateResolved,
  } = useReportQueue("RESOLVED");

  // Init load-more cursor once OPEN data arrives
  useEffect(() => {
    if (!loadingOpen && !cursorInitRef.current) {
      cursorInitRef.current = true;
      setLoadMoreCursor(firstPageCursor);
    }
  }, [loadingOpen, firstPageCursor]);

  const allOpenApiReports = [...openReports, ...moreReports];

  const handleLoadMore = async () => {
    if (!loadMoreCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await apiRequest<PaginatedResponse<ModerationReport>>(
        `/admin/moderation/reports?status=OPEN&cursor=${encodeURIComponent(loadMoreCursor)}`,
        { getToken },
      );
      setMoreReports((prev) => [...prev, ...res.data]);
      setLoadMoreCursor(res.nextCursor);
    } catch {
      toast("Could not load more reports", "error");
    } finally {
      setLoadingMore(false);
    }
  };

  // Derive UI lists
  const pendingReports = useMemo(
    () =>
      allOpenApiReports
        .filter((r) => r.status === "OPEN" && !localRemovals.has(r.id))
        .map(mapToUI),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openReports, moreReports, localRemovals],
  );

  const resolvedReports = useMemo(
    () => [
      ...resolvedApiReports.map(mapToUIResolved),
      ...localResolved.filter((lr) => !resolvedApiReports.some((r) => r.id === lr.id)),
    ],
    [resolvedApiReports, localResolved],
  );

  // Filter helpers
  const applyFilters = <T extends UIReport>(list: T[]): T[] =>
    list.filter((r) => {
      if (severityFilter !== "All" && r.severity !== severityFilter) return false;
      if (typeFilter !== "All" && r.contentType !== typeFilter) return false;
      const q = searchQuery.trim().toLowerCase();
      if (q && !r.reason.toLowerCase().includes(q) && !r.reportedUser.name.toLowerCase().includes(q) && !r.content.toLowerCase().includes(q)) return false;
      return true;
    });

  const filteredPending = applyFilters(pendingReports);
  const filteredResolved = applyFilters(resolvedReports);

  const currentList = tab === "pending" ? filteredPending : filteredResolved;

  const selectedReport = currentList.find((r) => r.id === selectedId) ?? currentList[0] ?? null;

  const handleResolved = (resolved: UIResolvedReport) => {
    setLocalRemovals((prev) => new Set([...prev, resolved.id]));
    setLocalResolved((prev) => [resolved, ...prev]);
    setSelectedId(null);
    cursorInitRef.current = false;
    setMoreReports([]);
    setLoadMoreCursor(undefined);
    void mutateOpen();
    void mutateResolved();
  };

  const handleReopen = (id: string) => {
    const r = localResolved.find((lr) => lr.id === id);
    if (!r) { toast("Only reports resolved in this session can be reopened.", "error"); return; }
    if (r.action === "Delete") { toast("Deleted content cannot be reopened.", "error"); return; }
    setLocalResolved((prev) => prev.filter((lr) => lr.id !== id));
    setLocalRemovals((prev) => { const next = new Set(prev); next.delete(id); return next; });
    setTab("pending");
  };

  const isLoading = loadingOpen || loadingResolved;
  const hasMore = !!loadMoreCursor && tab === "pending";

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
                <p className="text-lg font-bold text-stone-900">{pendingReports.length}</p>
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
            <button
              onClick={() => { setTab("pending"); setSelectedId(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === "pending" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
            >
              Pending ({filteredPending.length})
            </button>
            <button
              onClick={() => { setTab("history"); setSelectedId(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === "history" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
            >
              History ({filteredResolved.length})
            </button>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 outline-none"
            />
          </div>
          <select
            title="Filter by severity"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as "All" | UISeverity)}
            className="bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-600 outline-none"
          >
            <option value="All">All Severity</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            title="Filter by content type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "All" | "Post" | "Comment" | "Profile")}
            className="bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-600 outline-none"
          >
            <option value="All">All Types</option>
            <option value="Post">Post</option>
            <option value="Comment">Comment</option>
            <option value="Profile">Profile</option>
          </select>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-stone-500 gap-2">
            <Loader2 size={18} className="animate-spin" /> Loading moderation queue…
          </div>
        ) : openError ? (
          <EmptyState
            icon={AlertTriangle}
            heading="Moderation queue unavailable"
            description={openError instanceof Error ? openError.message : "Could not load reports."}
            variant="plain"
          />
        ) : currentList.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
            {/* Sidebar list */}
            <div className="w-full lg:w-1/3 bg-white rounded-2xl border border-stone-200 flex flex-col h-full shadow-lg shadow-stone-200/50">
              <div className="p-4 border-b border-stone-100 bg-stone-50/50 rounded-t-2xl">
                <h2 className="font-bold text-stone-700">
                  {tab === "pending" ? "Queue" : "History"} ({currentList.length})
                </h2>
              </div>
              <div className="overflow-y-auto flex-1 p-2 space-y-2">
                {currentList.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => setSelectedId(report.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                      selectedReport?.id === report.id
                        ? "bg-brand-50 border-brand-200 shadow-sm"
                        : "bg-white border-stone-100 hover:border-brand-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <StatusBadge label={report.severity} preset={report.severity} variant="tag" icon={AlertTriangle} />
                      <span className="text-xs text-stone-400">{report.timestamp}</span>
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm mb-1 truncate">{report.reason}</h3>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <AvatarInitials name={report.reportedUser.name} src={report.reportedUser.avatar} size="xs" />
                        <span className="text-xs text-stone-600 truncate">{report.reportedUser.name}</span>
                      </div>
                      {tab === "history" && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                          (report as UIResolvedReport).action === "Delete" ? "bg-red-100 text-red-600"
                          : (report as UIResolvedReport).action === "Warn" ? "bg-yellow-100 text-yellow-700"
                          : "bg-stone-100 text-stone-500"
                        }`}>
                          {(report as UIResolvedReport).action}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Load more button (pending tab only) */}
                {hasMore && (
                  <button
                    onClick={() => void handleLoadMore()}
                    disabled={loadingMore}
                    className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-700 hover:bg-stone-50 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {loadingMore ? <Loader2 size={13} className="animate-spin" /> : <ChevronDown size={13} />}
                    {loadingMore ? "Loading…" : "Load more"}
                  </button>
                )}
              </div>
            </div>

            {/* Detail panel */}
            <div className="flex-1 bg-stone-50 rounded-3xl border border-stone-200 p-1 overflow-hidden flex flex-col shadow-inner">
              <div className="bg-white rounded-[1.25rem] border border-stone-100 h-full flex flex-col p-6 lg:p-10 overflow-y-auto">
                {selectedReport && (
                  <ReportDetailPanel
                    key={selectedReport.id}
                    report={selectedReport}
                    tab={tab}
                    onResolved={handleResolved}
                    onReopen={handleReopen}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={CheckCircle}
            heading={tab === "pending" ? "All Caught Up!" : "No Matching History"}
            description={
              tab === "pending"
                ? "The moderation queue is empty."
                : "Try adjusting your filters to find resolved reports."
            }
            action={
              severityFilter !== "All" || typeFilter !== "All" || searchQuery
                ? {
                    label: "Clear Filters",
                    onClick: () => { setSeverityFilter("All"); setTypeFilter("All"); setSearchQuery(""); },
                  }
                : undefined
            }
            variant="plain"
            className="h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-500"
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
