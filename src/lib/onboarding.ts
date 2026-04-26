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
  };
  devPlan: {
    goal: string;
    milestones: string[];
  };
  completed: boolean;
  completedAt: string | null;
}

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
}

export function isOnboardingComplete(userId: string) {
  return loadOnboardingDraft(userId).completed;
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

export function completeOnboarding(userId: string, draft: OnboardingDraft) {
  const completedDraft: OnboardingDraft = {
    ...draft,
    currentStep: 4,
    completed: true,
    completedAt: new Date().toISOString(),
  };

  saveOnboardingDraft(userId, completedDraft);

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