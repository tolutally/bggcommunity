"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import type { ReportInput, ReportReason, ReportSeverity } from "@/lib/types";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "HARASSMENT", label: "Harassment or bullying" },
  { value: "SPAM", label: "Spam or self-promotion" },
  { value: "INAPPROPRIATE_CONTENT", label: "Inappropriate content" },
  { value: "MISINFORMATION", label: "Misinformation" },
  { value: "HATE_SPEECH", label: "Hate speech or discrimination" },
];

const SEVERITIES: { value: ReportSeverity; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

export interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: ReportInput) => Promise<void>;
  isLoading: boolean;
  contentType: "post" | "comment";
}

export function ReportModal({ open, onClose, onSubmit, isLoading, contentType }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<ReportSeverity>("MEDIUM");

  if (!open) return null;

  const handleSubmit = async () => {
    if (!reason || isLoading) return;
    await onSubmit({
      reason,
      description: description.trim() || undefined,
      severity,
    });
    setReason("");
    setDescription("");
    setSeverity("MEDIUM");
  };

  const handleClose = () => {
    if (isLoading) return;
    setReason("");
    setDescription("");
    setSeverity("MEDIUM");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <Flag size={18} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">Report {contentType}</h3>
            <p className="text-xs text-stone-500">Help us keep the community safe.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-300"
            >
              <option value="" disabled>Select a reason…</option>
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              Severity
            </label>
            <div className="flex gap-2">
              {SEVERITIES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSeverity(s.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    severity === s.value
                      ? s.value === "HIGH"
                        ? "bg-red-600 text-white border-red-600"
                        : s.value === "MEDIUM"
                        ? "bg-yellow-500 text-white border-yellow-500"
                        : "bg-stone-400 text-white border-stone-400"
                      : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              Additional details <span className="text-stone-400">(optional)</span>
            </label>
            <textarea
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in more detail…"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm resize-none focus:outline-none focus:border-brand-300"
            />
            <p className="text-right text-xs text-stone-400 mt-1">{description.length}/500</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={!reason || isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Submitting…" : "Submit report"}
          </button>
        </div>
      </div>
    </div>
  );
}
