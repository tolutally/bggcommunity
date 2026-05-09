export interface OnboardingDraft {
  currentStep: number;
  profile: {
    employmentStatus: string;
    occupation: string;
    industry: string;
    location: string;
    company: string;
    bio: string;
    website: string;
    linkedin: string;
    twitter: string;
  };
  avatarSrc: string;
  privacy: {
    profileVisible: boolean;
    socialsVisible: boolean;
    openToWork: boolean;
    reviewConfirmed: boolean;
  };
  devPlan: {
    goal: string;
    milestones: string[];
  };
  completed: boolean;
  completedAt: string | null;
}

export interface PendingOnboardingSync {
  draft: OnboardingDraft;
  updatedAt: string;
  lastError: string | null;
}

export interface LocalOnboardingStatus {
  completed: boolean;
  source: "api" | "fallback";
  completedAt: string | null;
  pendingSync: boolean;
  lastSyncError: string | null;
}

export const ONBOARDING_LOCAL_STATE_EVENT = "bgg:onboarding-local-state-changed";

interface StoredOnboardingState {
  draft: OnboardingDraft;
}

interface StoredDevGoal {
  id: number;
  text: string;
  done: boolean;
  details: string;
  status: "not-started" | "in-progress" | "completed";
  evidence: Array<{
    id: number;
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
  }>;
  createdAt: string;
}

const ONBOARDING_KEY_PREFIX = "bgg-onboarding";
const ONBOARDING_STATUS_KEY_PREFIX = "bgg-onboarding-status";
const ONBOARDING_PENDING_SYNC_KEY_PREFIX = "bgg-onboarding-pending-sync";

function onboardingStatusKey(userId: string) {
  return `${ONBOARDING_STATUS_KEY_PREFIX}:${userId}`;
}

function onboardingPendingSyncKey(userId: string) {
  return `${ONBOARDING_PENDING_SYNC_KEY_PREFIX}:${userId}`;
}

function emitOnboardingLocalStateChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(ONBOARDING_LOCAL_STATE_EVENT));
}

export function defaultOnboardingDraft(): OnboardingDraft {
  return {
    currentStep: 0,
    profile: {
      employmentStatus: "",
      occupation: "",
      industry: "",
      location: "",
      company: "",
      bio: "",
      website: "",
      linkedin: "",
      twitter: "",
    },
    avatarSrc: "",
    privacy: {
      profileVisible: true,
      socialsVisible: true,
      openToWork: false,
      reviewConfirmed: false,
    },
    devPlan: {
      goal: "",
      milestones: ["", ""],
    },
    completed: false,
    completedAt: null,
  };
}

function onboardingStorageKey(userId: string) {
  return `${ONBOARDING_KEY_PREFIX}:${userId}`;
}

export function loadOnboardingDraft(userId: string): OnboardingDraft {
  const fallback = defaultOnboardingDraft();

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(onboardingStorageKey(userId));
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as StoredOnboardingState;
    return {
      ...fallback,
      ...parsed.draft,
      profile: {
        ...fallback.profile,
        ...parsed.draft.profile,
      },
      privacy: {
        ...fallback.privacy,
        ...parsed.draft.privacy,
      },
      devPlan: {
        ...fallback.devPlan,
        ...parsed.draft.devPlan,
        milestones: parsed.draft.devPlan?.milestones?.length
          ? parsed.draft.devPlan.milestones
          : fallback.devPlan.milestones,
      },
    };
  } catch {
    return fallback;
  }
}

export function saveOnboardingDraft(userId: string, draft: OnboardingDraft) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredOnboardingState = { draft };
  localStorage.setItem(onboardingStorageKey(userId), JSON.stringify(payload));
  emitOnboardingLocalStateChange();
}

export function loadLocalOnboardingStatus(userId: string): LocalOnboardingStatus {
  const fallback: LocalOnboardingStatus = {
    completed: false,
    source: "fallback",
    completedAt: null,
    pendingSync: false,
    lastSyncError: null,
  };

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(onboardingStatusKey(userId));
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as Partial<LocalOnboardingStatus>;
    return {
      ...fallback,
      ...parsed,
      source: parsed.source === "api" ? "api" : "fallback",
    };
  } catch {
    return fallback;
  }
}

function saveLocalOnboardingStatus(userId: string, status: LocalOnboardingStatus) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(onboardingStatusKey(userId), JSON.stringify(status));
  emitOnboardingLocalStateChange();
}

export function loadPendingOnboardingSync(userId: string): PendingOnboardingSync | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(onboardingPendingSyncKey(userId));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PendingOnboardingSync;
    return parsed?.draft ? parsed : null;
  } catch {
    return null;
  }
}

export function savePendingOnboardingSync(userId: string, draft: OnboardingDraft, lastError: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  const pendingSync: PendingOnboardingSync = {
    draft,
    updatedAt: new Date().toISOString(),
    lastError,
  };

  localStorage.setItem(onboardingPendingSyncKey(userId), JSON.stringify(pendingSync));
  emitOnboardingLocalStateChange();
}

export function clearPendingOnboardingSync(userId: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(onboardingPendingSyncKey(userId));
  emitOnboardingLocalStateChange();
}

export function isOnboardingComplete(userId: string) {
  return loadLocalOnboardingStatus(userId).completed;
}

function buildDevGoals(draft: OnboardingDraft): StoredDevGoal[] {
  const today = new Date().toISOString().split("T")[0];
  const goals = draft.devPlan.milestones
    .map((milestone) => milestone.trim())
    .filter(Boolean);

  if (draft.devPlan.goal.trim()) {
    goals.unshift(draft.devPlan.goal.trim());
  }

  return goals.map((goal, index) => ({
    id: Date.now() + index,
    text: goal,
    done: false,
    details: index === 0 && draft.devPlan.goal.trim() ? "Created during onboarding" : "",
    status: "not-started",
    evidence: [],
    createdAt: today,
  }));
}

function persistCompletedOnboardingArtifacts(completedDraft: OnboardingDraft) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("bgg-profile", JSON.stringify(completedDraft.profile));
  localStorage.setItem("bgg-otw", JSON.stringify(completedDraft.privacy.openToWork));
  localStorage.setItem("bgg-privacy", JSON.stringify({
    profileVisible: completedDraft.privacy.profileVisible,
    socialsVisible: completedDraft.privacy.socialsVisible,
  }));
  localStorage.setItem("bgg-goals", JSON.stringify(buildDevGoals(completedDraft)));

  if (completedDraft.avatarSrc) {
    localStorage.setItem("bgg-avatar", JSON.stringify(completedDraft.avatarSrc));
  }
}

export function completeOnboarding(
  userId: string,
  draft: OnboardingDraft,
  options: { source?: "api" | "fallback"; pendingSync?: boolean; lastSyncError?: string | null } = {},
) {
  const completedDraft: OnboardingDraft = {
    ...draft,
    currentStep: 4,
    completed: true,
    completedAt: new Date().toISOString(),
  };

  saveOnboardingDraft(userId, completedDraft);

  const source = options.source ?? "fallback";
  const pendingSync = options.pendingSync ?? source === "fallback";
  saveLocalOnboardingStatus(userId, {
    completed: true,
    source,
    completedAt: completedDraft.completedAt,
    pendingSync,
    lastSyncError: options.lastSyncError ?? null,
  });

  if (pendingSync) {
    savePendingOnboardingSync(userId, completedDraft, options.lastSyncError ?? null);
  } else {
    clearPendingOnboardingSync(userId);
  }

  persistCompletedOnboardingArtifacts(completedDraft);
}

export function markOnboardingSynced(userId: string, draft: OnboardingDraft) {
  completeOnboarding(userId, draft, { source: "api", pendingSync: false, lastSyncError: null });
}

export function markOnboardingFallbackComplete(userId: string, draft: OnboardingDraft, lastSyncError: string | null) {
  completeOnboarding(userId, draft, { source: "fallback", pendingSync: true, lastSyncError });
}

export function clearLocalOnboardingFallback(userId: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(onboardingStatusKey(userId));
  clearPendingOnboardingSync(userId);
  emitOnboardingLocalStateChange();
}