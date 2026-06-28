"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  Target,
  CheckCircle,
  Circle,
  ArrowLeft,
  Loader2,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  useAddMyMilestone,
  useCreateMyPlan,
  useDeleteMyMilestone,
  useDeveloperPlan,
  useEditMyMilestone,
  useToggleMilestone,
  useUpdateMyPlan,
} from "@/hooks/use-developer-plan";
import { ApiRequestError } from "@/lib/api";
import type { Milestone } from "@/lib/types";

type FilterTab = "all" | "completed" | "incomplete";

const STATUS_CONFIG = {
  completed: {
    label: "Completed",
    icon: CheckCircle,
    badge: "bg-green-50 text-green-700 border-green-200",
    ring: "border-green-300",
  },
  incomplete: {
    label: "To Do",
    icon: Circle,
    badge: "bg-stone-100 text-stone-600 border-stone-200",
    ring: "border-stone-200",
  },
} as const;

function GoalCard({
  goal,
  progress,
  completedCount,
  incompleteCount,
  showProgress,
  onSaved,
}: {
  goal: string | null;
  progress: number;
  completedCount: number;
  incompleteCount: number;
  showProgress: boolean;
  onSaved: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(goal ?? "");
  const { toast } = useToast();
  const updateMutation = useUpdateMyPlan();

  const handleSave = async () => {
    const cleaned = draft.trim();
    try {
      await updateMutation.trigger({ goal: cleaned || null });
      setIsEditing(false);
      onSaved();
      toast(cleaned ? "Goal saved" : "Goal cleared", "success");
    } catch {
      toast("Unable to save goal", "error");
    }
  };

  const handleStartEdit = () => {
    setDraft(goal ?? "");
    setIsEditing(true);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between gap-4 mb-3">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Goal</p>
          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="rounded-lg border border-stone-200 p-1.5 text-stone-400 transition hover:border-brand-200 hover:text-brand-700 flex-shrink-0"
              title="Edit goal"
            >
              <Pencil size={13} />
            </button>
          ) : null}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              maxLength={200}
              className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-900 outline-none resize-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
              placeholder="e.g., Land a senior role at a product company"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => void handleSave()}
                disabled={updateMutation.isLoading}
                className="rounded-lg bg-brand-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {updateMutation.isLoading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : goal ? (
          <p className="text-2xl md:text-3xl font-bold text-stone-900 leading-snug">{goal}</p>
        ) : (
          <button
            onClick={handleStartEdit}
            className="text-sm text-stone-400 hover:text-brand-600 transition-colors"
          >
            + Set a goal to guide your milestones
          </button>
        )}
      </div>

      {showProgress ? (
        <>
          <div className="h-px bg-stone-100 mx-6 md:mx-8" />
          <div className="px-6 md:px-8 py-5 flex items-center gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-stone-400">{progress}% complete</p>
                <div className="flex items-center gap-3 text-xs text-stone-500">
                  <span><span className="font-bold text-stone-700">{incompleteCount}</span> to do</span>
                  <span><span className="font-bold text-green-600">{completedCount}</span> done</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-stone-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${progress === 100 ? "bg-green-500" : "bg-stone-300"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function nextMilestoneOrder(milestones: Milestone[]) {
  const maxOrder = milestones.reduce((max, milestone) => Math.max(max, milestone.order), 0);
  return maxOrder + 10;
}

function MilestoneItem({
  milestone,
  onDone,
}: {
  milestone: Milestone;
  onDone: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(milestone.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  const toggleMutation = useToggleMilestone(milestone.id);
  const editMutation = useEditMyMilestone(milestone.id);
  const deleteMutation = useDeleteMyMilestone(milestone.id);

  const cfg = milestone.completed ? STATUS_CONFIG.completed : STATUS_CONFIG.incomplete;
  const Icon = cfg.icon;

  const handleToggle = async () => {
    try {
      await toggleMutation.trigger();
      onDone();
    } catch {
      toast("Unable to update milestone", "error");
    }
  };

  const handleSaveEdit = async () => {
    const cleaned = titleDraft.trim();
    if (!cleaned) {
      toast("Milestone title cannot be empty", "error");
      return;
    }

    try {
      await editMutation.trigger({ title: cleaned });
      setIsEditing(false);
      onDone();
      toast("Milestone updated", "success");
    } catch {
      toast("Unable to update milestone", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.trigger();
      setShowDeleteConfirm(false);
      onDone();
      toast("Milestone removed", "success");
    } catch {
      toast("Unable to delete milestone", "error");
    }
  };

  const isBusy = toggleMutation.isLoading || editMutation.isLoading || deleteMutation.isLoading;

  return (
    <>
      <div className={`bg-white rounded-2xl border p-5 transition-all ${cfg.ring} hover:shadow-sm`}>
        <div className="flex items-start gap-4">
          <button
            onClick={() => void handleToggle()}
            disabled={isBusy}
            title={milestone.completed ? "Mark incomplete" : "Mark complete"}
            className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${milestone.completed ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-stone-100 text-stone-400 hover:bg-stone-200"} disabled:opacity-50`}
          >
            {toggleMutation.isLoading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={16} />}
          </button>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                  placeholder="Update milestone title"
                  maxLength={120}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => void handleSaveEdit()}
                    disabled={editMutation.isLoading}
                    className="rounded-lg bg-brand-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                  >
                    {editMutation.isLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setTitleDraft(milestone.title);
                    }}
                    className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className={`font-semibold text-sm ${milestone.completed ? "line-through text-stone-400" : "text-stone-900"}`}>
                  {milestone.title}
                </p>
                {milestone.completed && milestone.completedAt ? (
                  <p className="text-xs text-stone-400 mt-1">
                    Completed {new Date(milestone.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                ) : null}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${cfg.badge}`}>
                  {cfg.label}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg border border-stone-200 p-2 text-stone-500 transition hover:border-brand-200 hover:text-brand-700"
                  title="Edit milestone"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-lg border border-stone-200 p-2 text-stone-500 transition hover:border-rose-200 hover:text-rose-600"
                  title="Delete milestone"
                >
                  <Trash2 size={14} />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => void handleDelete()}
        title="Delete this milestone?"
        description="This milestone will be removed from your development plan."
        confirmLabel="Delete"
        loading={deleteMutation.isLoading}
      />
    </>
  );
}

export default function MemberDevPlanPage() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const newMilestoneTitleRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { plan, goal, milestones, progress, isLoading, error, mutate } = useDeveloperPlan();
  const createPlanMutation = useCreateMyPlan();
  const addMilestoneMutation = useAddMyMilestone();

  const hasNoPlanYet = error instanceof ApiRequestError && error.status === 404;
  const hasFatalError = Boolean(error) && !hasNoPlanYet;

  const completedCount = useMemo(() => milestones.filter((m) => m.completed).length, [milestones]);
  const incompleteCount = milestones.length - completedCount;
  const allDone = milestones.length > 0 && completedCount === milestones.length;

  const counts: Record<FilterTab, number> = {
    all: milestones.length,
    completed: completedCount,
    incomplete: incompleteCount,
  };

  const filtered = useMemo(() => {
    if (filter === "completed") return milestones.filter((m) => m.completed);
    if (filter === "incomplete") return milestones.filter((m) => !m.completed);
    return [...milestones].sort((a, b) => a.order - b.order);
  }, [milestones, filter]);

  const tabs: Array<{ key: FilterTab; label: string }> = [
    { key: "all", label: "All" },
    { key: "incomplete", label: "To Do" },
    { key: "completed", label: "Completed" },
  ];

  const ensurePlanExists = async () => {
    if (plan && !hasNoPlanYet) {
      return;
    }

    await createPlanMutation.trigger();
    await mutate();
  };

  const handleCreatePlan = async () => {
    try {
      await ensurePlanExists();
      toast("Developer plan created", "success");
    } catch {
      toast("Unable to create your plan right now", "error");
    }
  };

  const handleAddMilestone = async () => {
    const cleaned = newMilestoneTitle.trim();
    if (!cleaned) {
      toast("Enter a milestone title", "error");
      newMilestoneTitleRef.current?.focus();
      return;
    }

    try {
      await ensurePlanExists();
      const order = nextMilestoneOrder(milestones);
      await addMilestoneMutation.trigger({ milestones: [{ title: cleaned, order }] });
      setNewMilestoneTitle("");
      await mutate();
      toast("Milestone added", "success");
    } catch {
      toast("Unable to add milestone", "error");
    }
  };

  return (
    <ErrorBoundary>
      <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/member" className="p-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-400 hover:text-stone-600">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent-100 text-accent-600 rounded-2xl">
                <Target size={24} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Development Plan</h1>
                <p className="text-sm text-stone-500">Build and track milestones that move your career forward.</p>
              </div>
            </div>
          </div>
        </div>

        {!isLoading && !hasFatalError ? (
          <GoalCard
            goal={goal}
            progress={progress}
            completedCount={completedCount}
            incompleteCount={incompleteCount}
            showProgress={milestones.length > 0}
            onSaved={() => void mutate()}
          />
        ) : null}

        {allDone ? (
          <div className="flex items-center gap-3 px-1 text-sm text-stone-500">
            <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
            All milestones completed — add new ones whenever you&apos;re ready for your next stretch.
          </div>
        ) : null}

        {hasFatalError ? (
          <EmptyState
            icon={Target}
            heading="Plan unavailable"
            description="We could not load your development plan. Please try again."
            action={{ label: "Retry", onClick: () => void mutate() }}
            variant="plain"
            className="bg-white rounded-3xl p-12 border border-stone-100"
          />
        ) : (
          <>
            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Add Milestones</h2>
                  <p className="text-sm text-stone-500">Create actionable milestones you can check off over time.</p>
                </div>
                {hasNoPlanYet ? (
                  <button
                    onClick={() => void handleCreatePlan()}
                    disabled={createPlanMutation.isLoading}
                    className="rounded-xl border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-60"
                  >
                    {createPlanMutation.isLoading ? "Creating..." : "Create Plan"}
                  </button>
                ) : null}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  ref={newMilestoneTitleRef}
                  value={newMilestoneTitle}
                  onChange={(event) => setNewMilestoneTitle(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter") void handleAddMilestone(); }}
                  className="flex-1 rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none transition focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500"
                  placeholder="e.g., Ship my portfolio, complete interview prep, contribute to open source"
                  maxLength={120}
                />
                <button
                  onClick={() => void handleAddMilestone()}
                  disabled={addMilestoneMutation.isLoading || createPlanMutation.isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                >
                  {addMilestoneMutation.isLoading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  Add Milestone
                </button>
              </div>
            </div>

            {milestones.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === tab.key ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-brand-200 hover:text-brand-700"}`}
                  >
                    {tab.label} <span className="ml-1 opacity-70">({counts[tab.key]})</span>
                  </button>
                ))}
              </div>
            ) : null}

            {isLoading ? (
              <div className="flex items-center gap-2 text-stone-500 py-8">
                <Loader2 size={18} className="animate-spin" /> Loading your plan...
              </div>
            ) : milestones.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-stone-100 text-center space-y-4">
                <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto">
                  <Target size={28} className="text-accent-500" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">Your plan is ready</h3>
                <p className="text-sm text-stone-500 max-w-sm mx-auto">
                  Add your first milestone above. Everything you add or complete here is saved to your account.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Target}
                heading="No milestones in this category"
                variant="plain"
                className="bg-white rounded-3xl p-12 border border-stone-100"
              />
            ) : (
              <div className="space-y-3">
                {filtered.map((milestone) => (
                  <MilestoneItem
                    key={milestone.id}
                    milestone={milestone}
                    onDone={() => void mutate()}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
