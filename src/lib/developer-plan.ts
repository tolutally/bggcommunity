import { ApiError, apiRequest, type TokenProvider } from "@/lib/api";
import type { OnboardingDraft } from "@/lib/onboarding";
import type { ApiResponse, DeveloperPlan, Milestone } from "@/lib/types";

interface PlanEnvelope {
  data?: DeveloperPlan;
}

function normalizeTitle(value: string) {
  return value.trim().toLowerCase();
}

function buildDraftMilestoneTitles(draft: OnboardingDraft) {
  return draft.devPlan.milestones
    .map((milestone) => milestone.trim())
    .filter(Boolean);
}

function readResponseData<T>(input: unknown): T | null {
  if (typeof input !== "object" || input === null) {
    return null;
  }

  const value = input as T & PlanEnvelope;
  if ("data" in value && value.data) {
    return value.data as T;
  }

  return value as T;
}

export async function createCurrentUserPlan(getToken: TokenProvider) {
  await apiRequest<ApiResponse<DeveloperPlan> | { success: boolean; message?: string }>("/users/me/plan", {
    method: "POST",
    getToken,
  });
}

export async function fetchCurrentUserPlan(getToken: TokenProvider): Promise<DeveloperPlan | null> {
  try {
    const response = await apiRequest<ApiResponse<DeveloperPlan> | DeveloperPlan>("/users/me/plan", {
      method: "GET",
      getToken,
    });
    return readResponseData<DeveloperPlan>(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function updateCurrentUserPlan(goal: string | null, getToken: TokenProvider) {
  return apiRequest<ApiResponse<DeveloperPlan>>("/users/me/plan", {
    method: "PATCH",
    getToken,
    body: { goal },
  });
}

export async function addCurrentUserPlanMilestone(title: string, order: number, getToken: TokenProvider) {
  return apiRequest<ApiResponse<Milestone> | { success: boolean; message?: string }>("/users/me/plan/milestones", {
    method: "POST",
    getToken,
    body: {
      title,
      order,
    },
  });
}

export async function syncDraftDevPlanToCurrentUserPlan(draft: OnboardingDraft, getToken: TokenProvider) {
  await createCurrentUserPlan(getToken);

  const draftGoal = draft.devPlan.goal.trim();
  if (draftGoal) {
    await updateCurrentUserPlan(draftGoal, getToken);
  }

  const desiredTitles = buildDraftMilestoneTitles(draft);
  if (desiredTitles.length === 0) {
    return;
  }

  const currentPlan = await fetchCurrentUserPlan(getToken);
  const existingMilestones = currentPlan?.milestones ?? [];
  const existingCounts = new Map<string, number>();

  existingMilestones.forEach((milestone) => {
    const key = normalizeTitle(milestone.title);
    existingCounts.set(key, (existingCounts.get(key) ?? 0) + 1);
  });

  const desiredSeen = new Map<string, number>();
  let nextOrder = existingMilestones.reduce((maxOrder, milestone) => Math.max(maxOrder, milestone.order), 0) + 10;

  for (const title of desiredTitles) {
    const key = normalizeTitle(title);
    const seen = (desiredSeen.get(key) ?? 0) + 1;
    desiredSeen.set(key, seen);

    const existingCount = existingCounts.get(key) ?? 0;
    if (seen <= existingCount) {
      continue;
    }

    await addCurrentUserPlanMilestone(title, nextOrder, getToken);
    nextOrder += 10;
  }
}