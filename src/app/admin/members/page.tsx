"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Search, LayoutGrid, List as ListIcon, MoreHorizontal, Mail,
  Eye, Send, Ban, Plus, Upload, X, FileText, Check,
  AlertTriangle, Users,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { useMembers } from "@/hooks/use-members";
import type { MemberCard } from "@/lib/types";

export default function AdminMembersPage() {
  const { members, isLoading, error } = useMembers();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBulkAdd, setShowBulkAdd] = useState(false);

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    const q = searchQuery.toLowerCase();
    return members.filter((m) => {
      const name = m.profile
        ? `${m.profile.firstName} ${m.profile.lastName}`.toLowerCase()
        : "";
      return name.includes(q) || m.email.toLowerCase().includes(q);
    });
  }, [members, searchQuery]);

  return (
    <ErrorBoundary>
      <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Community Members</h1>
            <p className="text-stone-500 mt-1">
              Manage access, track progress, and view member profiles.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-lg text-sm font-bold">
              {filteredMembers.length} Members
            </span>
            <button className="bg-stone-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors">
              Export CSV
            </button>
            <button
              onClick={() => setShowBulkAdd(true)}
              className="bg-brand-800 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors flex items-center gap-2 shadow-lg shadow-brand-800/10"
            >
              <Plus size={16} /> Add Members
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col xl:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-stone-200">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex bg-stone-100 p-1 rounded-xl w-fit self-end xl:self-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-stone-900" : "text-stone-400 hover:text-stone-600"}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-stone-900" : "text-stone-400 hover:text-stone-600"}`}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <EmptyState
            icon={AlertTriangle}
            heading="Failed to load members"
            description="Something went wrong fetching the member list."
          />
        )}

        {/* Content */}
        {!isLoading && !error && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {filteredMembers.map((member) => (
                  <MemberGridCard key={member.id} member={member} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-stone-500">
                    <thead className="text-xs text-stone-400 uppercase bg-stone-50 border-b border-stone-100">
                      <tr>
                        <th className="px-6 py-4 font-bold">Member</th>
                        <th className="px-6 py-4 font-bold">Job Title</th>
                        <th className="px-6 py-4 font-bold">Location</th>
                        <th className="px-6 py-4 font-bold">Joined</th>
                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((member) => (
                        <MemberListRow key={member.id} member={member} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {filteredMembers.length === 0 && (
              <EmptyState
                icon={Search}
                heading="No members found"
                description="Try adjusting your search or filters."
              />
            )}
          </>
        )}

        {/* Bulk Add Modal */}
        {showBulkAdd && <BulkAddMembersModal onClose={() => setShowBulkAdd(false)} />}
      </div>
    </ErrorBoundary>
  );
}

/* ── helpers ── */

function memberName(m: MemberCard) {
  if (!m.profile) return m.email;
  return `${m.profile.firstName} ${m.profile.lastName}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ── Grid Card ── */

function MemberGridCard({ member }: { member: MemberCard }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const name = memberName(member);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col items-center text-center group hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5 transition-all cursor-pointer relative overflow-visible">
      {/* Action Dropdown */}
      <div ref={ref} className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setOpen(!open)}
          className="text-stone-300 hover:text-stone-600 transition-colors p-1 rounded-lg hover:bg-stone-100"
        >
          <MoreHorizontal size={20} />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-stone-200 shadow-xl py-1 z-50">
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <Eye size={15} /> View Profile
            </button>
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <Send size={15} /> Send Email
            </button>
            <div className="border-t border-stone-100 my-1" />
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Ban size={15} /> Deactivate
            </button>
          </div>
        )}
      </div>

      <div className="relative mb-4">
        <AvatarInitials
          name={name}
          src={member.profile?.avatarUrl ?? undefined}
          size="xl"
          className="border-4 border-stone-50 shadow-sm group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <h3 className="text-lg font-bold text-stone-900 mb-1">{name}</h3>
      <p className="text-sm text-stone-500 mb-1">
        {member.profile?.jobTitle ?? "—"}
      </p>
      <p className="text-sm text-stone-400 mb-3 flex items-center gap-1">
        <Mail size={12} /> {member.email}
      </p>

      <div className="flex flex-wrap justify-center gap-2 mb-4 w-full">
        {member.profile?.location && (
          <span className="px-2 py-1 bg-stone-50 border border-stone-100 rounded-md text-xs font-semibold text-stone-600">
            {member.profile.location}
          </span>
        )}
        {member.profile?.industry && (
          <span className="px-2 py-1 bg-brand-50 border border-brand-100 rounded-md text-xs font-semibold text-brand-700">
            {member.profile.industry}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── List Row ── */

function MemberListRow({ member }: { member: MemberCard }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const name = memberName(member);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <tr className="bg-white border-b border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer group">
      <td className="px-6 py-4 flex items-center gap-3">
        <AvatarInitials
          name={name}
          src={member.profile?.avatarUrl ?? undefined}
          size="md"
        />
        <div>
          <div className="font-bold text-stone-900">{name}</div>
          <div className="text-xs text-stone-500">{member.email}</div>
        </div>
      </td>
      <td className="px-6 py-4 text-stone-600 font-medium">
        {member.profile?.jobTitle ?? "—"}
      </td>
      <td className="px-6 py-4 text-stone-500 font-medium">
        {member.profile?.location ?? "—"}
      </td>
      <td className="px-6 py-4 text-stone-500 font-medium">—</td>
      <td className="px-6 py-4 text-right">
        <div ref={ref} className="relative inline-block">
          <button
            onClick={() => setOpen(!open)}
            className="text-stone-400 hover:text-brand-700 transition-colors p-2 hover:bg-brand-50 rounded-full"
          >
            <MoreHorizontal size={18} />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-stone-200 shadow-xl py-1 z-50">
              <button
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <Eye size={15} /> View Profile
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <Send size={15} /> Send Email
              </button>
              <div className="border-t border-stone-100 my-1" />
              <button
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Ban size={15} /> Deactivate
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ── Bulk Add Members Modal ── */

interface ParsedMember {
  email: string;
  name?: string;
  valid: boolean;
  error?: string;
}

function BulkAddMembersModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"csv" | "paste">("paste");
  const [emailText, setEmailText] = useState("");
  const [csvFileName, setCsvFileName] = useState("");
  const [parsedMembers, setParsedMembers] = useState<ParsedMember[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const parseEmails = useCallback(
    (text: string): ParsedMember[] => {
      const lines = text
        .split(/[\n,;]+/)
        .map((l) => l.trim())
        .filter(Boolean);
      return lines.map((line) => {
        const angleMatch = line.match(/^(.+?)\s*<(.+?)>$/);
        if (angleMatch) {
          const n = angleMatch[1].trim();
          const email = angleMatch[2].trim().toLowerCase();
          return { email, name: n, valid: emailRegex.test(email), error: emailRegex.test(email) ? undefined : "Invalid email" };
        }
        const email = line.toLowerCase();
        return { email, valid: emailRegex.test(email), error: emailRegex.test(email) ? undefined : "Invalid email" };
      });
    },
    [],
  );

  const handleFileUpload = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".csv")) {
        setCsvFileName("");
        return;
      }
      setCsvFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) setParsedMembers(parseEmails(text));
      };
      reader.readAsText(file);
    },
    [parseEmails],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload],
  );

  const handlePasteProcess = () => {
    const m = parseEmails(emailText);
    setParsedMembers(m);
  };

  const handleSubmit = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
    }, 1500);
  };

  const validCount = parsedMembers.filter((m) => m.valid).length;
  const invalidCount = parsedMembers.filter((m) => !m.valid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-50 rounded-xl text-brand-700"><Users size={20} /></div>
            <h2 className="text-lg font-bold text-stone-900">Add Members</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">Members Added!</h3>
            <p className="text-stone-500 mb-1">
              {validCount} member{validCount !== 1 ? "s" : ""} added.
            </p>
            {invalidCount > 0 && (
              <p className="text-sm text-amber-600">
                {invalidCount} invalid email{invalidCount !== 1 ? "s" : ""} skipped.
              </p>
            )}
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Tab Toggle */}
              <div className="flex bg-stone-100 rounded-xl p-1">
                <button
                  onClick={() => { setTab("paste"); setParsedMembers([]); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === "paste" ? "bg-white shadow text-stone-900" : "text-stone-500"}`}
                >
                  <Mail size={16} /> Paste Emails
                </button>
                <button
                  onClick={() => { setTab("csv"); setParsedMembers([]); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === "csv" ? "bg-white shadow text-stone-900" : "text-stone-500"}`}
                >
                  <Upload size={16} /> CSV Upload
                </button>
              </div>

              {/* Paste Emails */}
              {tab === "paste" && parsedMembers.length === 0 && (
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">
                    Email Addresses
                    <span className="text-stone-400 font-normal ml-1">(one per line, or comma/semicolon separated)</span>
                  </label>
                  <textarea
                    value={emailText}
                    onChange={(e) => setEmailText(e.target.value)}
                    placeholder={"amara@example.com\nbrianna@example.com\nChiamaka Nnadi <chiamaka@example.com>"}
                    rows={6}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 resize-none font-mono"
                  />
                  <button
                    onClick={handlePasteProcess}
                    disabled={!emailText.trim()}
                    className="mt-3 w-full px-4 py-2.5 bg-brand-800 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Process Emails
                  </button>
                </div>
              )}

              {/* CSV Upload */}
              {tab === "csv" && parsedMembers.length === 0 && (
                <div>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragOver ? "border-brand-400 bg-brand-50/50" : "border-stone-200 hover:border-brand-300 hover:bg-stone-50"}`}
                  >
                    <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <FileText size={24} className="text-stone-400" />
                    </div>
                    <p className="text-sm font-semibold text-stone-700 mb-1">
                      {csvFileName || "Drop your CSV here or click to browse"}
                    </p>
                    <p className="text-xs text-stone-400">CSV with email column (name column optional)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Parsed Results */}
              {parsedMembers.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-bold text-stone-700">Preview</span>
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200">
                      {validCount} valid
                    </span>
                    {invalidCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-200">
                        {invalidCount} invalid
                      </span>
                    )}
                    <button
                      onClick={() => { setParsedMembers([]); setEmailText(""); setCsvFileName(""); }}
                      className="ml-auto text-xs font-semibold text-stone-500 hover:text-stone-700"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1 border border-stone-200 rounded-xl p-3">
                    {parsedMembers.map((m, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${m.valid ? "bg-green-50/50" : "bg-red-50/50"}`}
                      >
                        {m.valid ? (
                          <Check size={14} className="text-green-600 flex-shrink-0" />
                        ) : (
                          <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                        )}
                        <span className={`font-mono text-xs flex-1 truncate ${m.valid ? "text-stone-700" : "text-red-600"}`}>
                          {m.name ? `${m.name} — ` : ""}{m.email}
                        </span>
                        {m.error && <span className="text-[10px] text-red-500 font-semibold">{m.error}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {parsedMembers.length > 0 && (
              <div className="flex gap-3 p-6 border-t border-stone-100 bg-stone-50">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={validCount === 0 || processing}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-800 hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Add {validCount} Member{validCount !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
