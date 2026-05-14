"use client";

import { useAuthSWR } from "./use-auth-swr";
import { useApiMutation } from "./use-api-mutation";
import type { ApiResponse, DeveloperPlan, Milestone } from "@/lib/types";

// ── Member plan ──────────────────────────────────────────────────────────

export function useDeveloperPlan() {
  const { data, error, isLoading, mutate } = useAuthSWR<ApiResponse<DeveloperPlan>>(
    "/users/me/plan",
  );
  return {
    plan: data?.data ?? null,
    milestones: data?.data?.milestones ?? [],
    progress: data?.data?.progress ?? 0,
    isLoading,
    error,
    mutate,
  };
}

export function useToggleMilestone(milestoneId: string) {
  return useApiMutation<ApiResponse<Milestone>>(
    `/users/me/plan/milestones/${milestoneId}/complete`,
    { method: "PATCH", revalidate: ["/users/me/plan"] },
  );
}

export function useCreateMyPlan() {
  return useApiMutation<ApiResponse<DeveloperPlan> | { success: boolean; message?: string }>(
    "/users/me/plan",
    { method: "POST", revalidate: ["/users/me/plan"] },
  );
}

export function useAddMyMilestone() {
  return useApiMutation<ApiResponse<Milestone>, AddMilestoneInput>(
    "/users/me/plan/milestones",
    { method: "POST", revalidate: ["/users/me/plan"] },
  );
}

export function useEditMyMilestone(milestoneId: string) {
  return useApiMutation<ApiResponse<Milestone>, EditMilestoneInput>(
    `/users/me/plan/milestones/${milestoneId}`,
    { method: "PATCH", revalidate: ["/users/me/plan"] },
  );
}

export function useDeleteMyMilestone(milestoneId: string) {
  return useApiMutation(
    `/users/me/plan/milestones/${milestoneId}`,
    { method: "DELETE", revalidate: ["/users/me/plan"] },
  );
}

// ── Admin plan management ────────────────────────────────────────────────

export function useCreateMemberPlan(userId: string) {
  return useApiMutation<ApiResponse<DeveloperPlan>>(
    `/admin/users/${userId}/plan`,
    { method: "POST", revalidate: [] },
  );
}

export interface AddMilestoneInput {
  title: string;
  order?: number;
}

export function useAddMilestone(userId: string) {
  return useApiMutation<ApiResponse<Milestone>, AddMilestoneInput>(
    `/admin/users/${userId}/plan/milestones`,
    { method: "POST", revalidate: [] },
  );
}

export interface EditMilestoneInput {
  title?: string;
  order?: number;
}

export function useEditMilestone(userId: string, milestoneId: string) {
  return useApiMutation<ApiResponse<Milestone>, EditMilestoneInput>(
    `/admin/users/${userId}/plan/milestones/${milestoneId}`,
    { method: "PATCH", revalidate: [] },
  );
}

export function useDeleteMilestone(userId: string, milestoneId: string) {
  return useApiMutation(
    `/admin/users/${userId}/plan/milestones/${milestoneId}`,
    { method: "DELETE", revalidate: [] },
  );
}
