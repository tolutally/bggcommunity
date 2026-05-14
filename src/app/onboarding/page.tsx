"use client";

/* eslint-disable @next/next/no-img-element */

import { Suspense, useEffect, useState } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useSWRConfig } from "swr";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Camera,
  Check,
  CirclePlus,
  Globe,
  Lock,
  MapPin,
  MinusCircle,
  Sparkles,
  Target,
  Upload,
  UserRound,
} from "lucide-react";
import {
  loadOnboardingDraft,
  markOnboardingFallbackComplete,
  markOnboardingSynced,
  saveOnboardingDraft,
  type OnboardingDraft,
} from "@/lib/onboarding";
import { useAuth as useResolvedAuth } from "@/context/AuthContext";
import {
  completeCurrentUserOnboarding,
  getUsersErrorMessage,
  updateCurrentUserProfile,
  updateProfileVisibility,
  uploadCurrentUserAvatar,
} from "@/lib/users";
import { syncDraftDevPlanToCurrentUserPlan } from "@/lib/developer-plan";

const STEPS = [
  { title: "Basic info", description: "Tell us what you do and where you are headed.", icon: UserRound, required: true },
  { title: "Profile photo", description: "Add a photo so people recognize you across the community.", icon: Camera, required: false },
  { title: "Social links", description: "Make it easy for mentors and peers to connect with you.", icon: Globe, required: false },
  { title: "Privacy", description: "Choose what the community can see and confirm those defaults intentionally.", icon: Lock, required: true },
  { title: "Dev plan", description: "Set an initial goal so your dashboard has a clear next step.", icon: Target, required: false },
] as const;

function hasRequiredBasicInfo(draft: OnboardingDraft) {
  return Boolean(
    draft.profile.employmentStatus.trim() &&
      draft.profile.occupation.trim() &&
      draft.profile.location.trim() &&
      draft.profile.bio.trim(),
  );
}

function getRequiredBasicInfoErrors(draft: OnboardingDraft) {
  return {
    employmentStatus: !draft.profile.employmentStatus.trim(),
    occupation: !draft.profile.occupation.trim(),
    location: !draft.profile.location.trim(),
    bio: !draft.profile.bio.trim(),
  };
}

function hasReviewedPrivacy(draft: OnboardingDraft) {
  return draft.privacy.reviewConfirmed;
}

function hasCompletedRequiredOnboarding(draft: OnboardingDraft) {
  return hasRequiredBasicInfo(draft) && hasReviewedPrivacy(draft);
}

function inputClassName(invalid = false) {
  return `w-full rounded-2xl border bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:ring-4 ${invalid ? "border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500/10" : "border-stone-200 focus:border-brand-500 focus:ring-brand-500/10"}`;
}

function ToggleCard({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-stone-300">
      <div>
        <p className="text-sm font-semibold text-stone-900">{title}</p>
        <p className="mt-1 text-sm text-stone-500">{description}</p>
      </div>
      <span
        className={`mt-1 inline-flex h-6 w-11 items-center rounded-full p-1 transition ${checked ? "bg-brand-700" : "bg-stone-200"}`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function OnboardingPageInner() {
  const router = useRouter();
  const { userId, isLoaded } = useClerkAuth();
  const { onboardingComplete, user: authUser } = useResolvedAuth();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const devPlanMode = searchParams.get("devplan") === "1";

  useEffect(() => {
    if (!isLoaded || !userId || devPlanMode) {
      return;
    }

    if (authUser?.role === "admin") {
      router.replace("/admin");
    }
  }, [authUser?.role, devPlanMode, isLoaded, router, userId]);

  useEffect(() => {
    if (isLoaded && userId && onboardingComplete && !devPlanMode && authUser?.role !== "admin") {
      router.replace("/member");
    }
  }, [authUser?.role, isLoaded, router, userId, devPlanMode, onboardingComplete]);

  if (!isLoaded || !userId || authUser?.role === "admin" || (onboardingComplete && !devPlanMode)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="flex items-center gap-3 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm text-stone-500 shadow-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-brand-700" />
          Preparing your onboarding flow...
        </div>
      </div>
    );
  }

  return <OnboardingFlow key={userId} userId={userId} router={router} devPlanMode={devPlanMode} userLabel={user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "New member"} />;
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-stone-50">
          <div className="flex items-center gap-3 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm text-stone-500 shadow-sm">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-brand-700" />
            Loading...
          </div>
        </div>
      }
    >
      <OnboardingPageInner />
    </Suspense>
  );
}

function buildSeededDraft(userId: string): OnboardingDraft {
  const savedDraft = loadOnboardingDraft(userId);

  return {
    ...savedDraft,
    profile: {
      ...savedDraft.profile,
      website: savedDraft.profile.website,
      occupation: savedDraft.profile.occupation,
    },
  };
}

function OnboardingFlow({
  userId,
  router,
  userLabel,
  devPlanMode = false,
}: {
  userId: string;
  router: ReturnType<typeof useRouter>;
  userLabel: string;
  devPlanMode?: boolean;
}) {
  const { getToken } = useClerkAuth();
  const { mutate } = useSWRConfig();
  const [draft, setDraft] = useState<OnboardingDraft>(() => {
    const base = buildSeededDraft(userId);
    return devPlanMode ? { ...base, currentStep: 4 } : base;
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);

  useEffect(() => {
    saveOnboardingDraft(userId, draft);
  }, [draft, userId]);

  const currentStep = STEPS[draft.currentStep];

  if (!currentStep) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="flex items-center gap-3 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm text-stone-500 shadow-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-brand-700" />
          Preparing your onboarding flow...
        </div>
      </div>
    );
  }

  const StepIcon = currentStep.icon;
  const updateProfile = (field: keyof OnboardingDraft["profile"], value: string) => {
    setDraft((current) => ({
      ...current,
      profile: {
        ...current.profile,
        [field]: value,
      },
    }));
  };

  const updateMilestone = (index: number, value: string) => {
    setDraft((current) => ({
      ...current,
      devPlan: {
        ...current.devPlan,
        milestones: current.devPlan.milestones.map((milestone, milestoneIndex) =>
          milestoneIndex === index ? value : milestone,
        ),
      },
    }));
  };

  const addMilestone = () => {
    setDraft((current) => ({
      ...current,
      devPlan: {
        ...current.devPlan,
        milestones: [...current.devPlan.milestones, ""],
      },
    }));
  };

  const removeMilestone = (index: number) => {
    setDraft((current) => {
      if (current.devPlan.milestones.length <= 1) {
        return current;
      }

      return {
        ...current,
        devPlan: {
          ...current.devPlan,
          milestones: current.devPlan.milestones.filter((_, milestoneIndex) => milestoneIndex !== index),
        },
      };
    });
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        return;
      }

      const imageSrc = reader.result;

      setDraft((current) => ({
        ...current,
        avatarSrc: imageSrc,
      }));
    };
    reader.readAsDataURL(file);
  };

  const canContinue = draft.currentStep === 0
    ? hasRequiredBasicInfo(draft)
    : draft.currentStep === 3
      ? hasReviewedPrivacy(draft)
      : true;
  const canFinishOnboarding = devPlanMode || hasCompletedRequiredOnboarding(draft);
  const basicInfoErrors = getRequiredBasicInfoErrors(draft);

  const goBack = () => {
    setDraft((current) => ({
      ...current,
      currentStep: Math.max(0, current.currentStep - 1),
    }));
  };

  const goNext = () => {
    if (!canContinue) {
      return;
    }

    setDraft((current) => ({
      ...current,
      currentStep: Math.min(STEPS.length - 1, current.currentStep + 1),
    }));
  };

  const submitOnboarding = async (draftToSubmit: OnboardingDraft) => {
    setIsSubmitting(true);
    setSubmissionMessage(null);

    let nextDraft = draftToSubmit;

    try {
      if (avatarFile) {
        const avatarUrl = await uploadCurrentUserAvatar(avatarFile, getToken);
        if (avatarUrl) {
          nextDraft = {
            ...nextDraft,
            avatarSrc: avatarUrl,
          };
          setDraft(nextDraft);
          saveOnboardingDraft(userId, nextDraft);
        }
      }

      await updateCurrentUserProfile({
        occupation: nextDraft.profile.occupation,
        industry: nextDraft.profile.industry,
        location: nextDraft.profile.location,
        bio: nextDraft.profile.bio,
        website: nextDraft.profile.website,
        linkedin: nextDraft.profile.linkedin,
        twitter: nextDraft.profile.twitter,
        company: nextDraft.profile.company,
        isOpenToWork: nextDraft.privacy.openToWork,
      }, getToken);
      await updateProfileVisibility(nextDraft.privacy.profileVisible, getToken);
      await completeCurrentUserOnboarding(getToken);
      await syncDraftDevPlanToCurrentUserPlan(nextDraft, getToken);
      markOnboardingSynced(userId, nextDraft);
      await mutate("/users/me");
      await mutate("/users/me/plan");
    } catch (error) {
      const message = getUsersErrorMessage(error);
      markOnboardingFallbackComplete(userId, nextDraft, message);
      setSubmissionMessage("We saved your onboarding locally and will keep trying to sync it to the server.");
    } finally {
      setIsSubmitting(false);
      router.replace(devPlanMode ? "/member/devplan" : "/member");
    }
  };

  const finishOnboarding = async () => {
    if (!canFinishOnboarding || isSubmitting) {
      return;
    }

    await submitOnboarding(draft);
  };

  const skipDevPlanAndFinish = async () => {
    if (!canFinishOnboarding || isSubmitting) {
      return;
    }

    const draftWithoutPlan: OnboardingDraft = {
      ...draft,
      devPlan: {
        goal: "",
        milestones: [],
      },
    };

    await submitOnboarding(draftWithoutPlan);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(155,80,45,0.15),transparent_32%),linear-gradient(180deg,#f8f5f0_0%,#f4efe7_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="overflow-hidden rounded-[32px] bg-brand-950 p-8 text-white shadow-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            <Sparkles className="h-4 w-4" />
            Member onboarding
          </div>
          <h1 className="mt-6 text-3xl font-semibold leading-tight md:text-4xl">
            Build the profile your community will meet first.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
            Finish a few quick steps now so your dashboard, profile, and dev plan start in the right state.
          </p>

          <div className="mt-8 grid grid-cols-5 gap-2">
            {STEPS.map((step, index) => (
              <div
                key={step.title}
                className={`h-2 rounded-full transition ${index <= draft.currentStep ? "bg-accent-500" : "bg-white/10"}`}
              />
            ))}
          </div>

          <div className="mt-8 space-y-4">
            {STEPS.map((step, index) => {
              const StepListIcon = step.icon;
              const active = index === draft.currentStep;
              const complete = index < draft.currentStep;

              return (
                <div
                  key={step.title}
                  className={`rounded-2xl border px-4 py-4 transition ${
                    active
                      ? "border-white/30 bg-white/10"
                      : complete
                        ? "border-emerald-400/40 bg-emerald-400/10"
                        : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${
                        complete ? "bg-emerald-400 text-emerald-950" : "bg-white/10 text-white"
                      }`}
                    >
                      {complete ? <Check className="h-5 w-5" /> : <StepListIcon className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{step.title}</p>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${step.required ? "bg-white/15 text-white/85" : "bg-white/10 text-white/60"}`}
                        >
                          {step.required ? "Required" : "Optional"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-white/60">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <main className="rounded-[32px] border border-stone-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-500">
                Step {draft.currentStep + 1} of {STEPS.length}
              </div>
              <h2 className="mt-3 flex items-center gap-3 text-2xl font-semibold text-stone-900">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-800">
                  <StepIcon className="h-5 w-5" />
                </span>
                {currentStep.title}
              </h2>
              <p className="mt-2 inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                {currentStep.required ? "Required" : "Optional"}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">{currentStep.description}</p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
                {draft.currentStep === 0
                  ? "Complete these basics now so your profile and dashboard start with the right context."
                  : draft.currentStep === 1
                    ? "A profile photo helps trust, but it is not required to finish onboarding."
                    : draft.currentStep === 2
                      ? "Share whichever links you want people to use. You can leave this blank and update it later."
                      : draft.currentStep === 3
                        ? "Review these visibility settings before you continue. This choice should be explicit, not accidental."
                        : "Set an initial goal now, or skip it and build your dev plan later from the member dashboard."}
              </p>
            </div>
            <div className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-500">
              <p className="font-semibold text-stone-800">{userLabel}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-400">Setting up your space</p>
            </div>
          </div>

          {submissionMessage ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {submissionMessage}
            </div>
          ) : null}

          <div className="mt-8 min-h-[420px]">
            {draft.currentStep === 0 ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4 text-sm leading-6 text-brand-900">
                  Required here: employment status, occupation or role direction, location, and bio. Industry and company can wait.
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">Employment status</label>
                    <select
                      className={inputClassName(basicInfoErrors.employmentStatus)}
                      value={draft.profile.employmentStatus}
                      onChange={(event) => updateProfile("employmentStatus", event.target.value)}
                      title="Employment status"
                    >
                      <option value="">Select your status</option>
                      <option value="employed_full_time">Employed full-time</option>
                      <option value="employed_part_time">Employed part-time</option>
                      <option value="self_employed">Self-employed / Founder</option>
                      <option value="student">Student</option>
                      <option value="seeking_opportunities">Seeking opportunities</option>
                      <option value="career_transition">Career transition</option>
                    </select>
                    {basicInfoErrors.employmentStatus ? (
                      <p className="mt-2 text-sm text-rose-700">Choose the option that best matches your current status.</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">Occupation or future role vision</label>
                    <input
                      className={inputClassName(basicInfoErrors.occupation)}
                      value={draft.profile.occupation}
                      onChange={(event) => updateProfile("occupation", event.target.value)}
                      placeholder="For example: Product designer now, future PM"
                    />
                    {basicInfoErrors.occupation ? (
                      <p className="mt-2 text-sm text-rose-700">Add your current role or the direction you are working toward.</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">Industry</label>
                    <input
                      className={inputClassName()}
                      value={draft.profile.industry}
                      onChange={(event) => updateProfile("industry", event.target.value)}
                      placeholder="Tech, health, education..."
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">Location</label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <input
                        className={`${inputClassName(basicInfoErrors.location)} pl-11`}
                        value={draft.profile.location}
                        onChange={(event) => updateProfile("location", event.target.value)}
                        placeholder="Lagos, Nigeria"
                      />
                    </div>
                    {basicInfoErrors.location ? (
                      <p className="mt-2 text-sm text-rose-700">Add the city or region you want shown on your profile.</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">Company (optional)</label>
                    <div className="relative">
                      <Briefcase className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <input
                        className={`${inputClassName()} pl-11`}
                        value={draft.profile.company}
                        onChange={(event) => updateProfile("company", event.target.value)}
                        placeholder="Where you work or build"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-stone-700">Bio</label>
                    <textarea
                      className={`${inputClassName(basicInfoErrors.bio)} min-h-36 resize-none`}
                      value={draft.profile.bio}
                      onChange={(event) => updateProfile("bio", event.target.value)}
                      placeholder="Share what you're building, learning, or looking for in this community."
                    />
                    {basicInfoErrors.bio ? (
                      <p className="mt-2 text-sm text-rose-700">Write a short bio so members understand what you are building or looking for.</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {draft.currentStep === 1 ? (
              <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
                <div className="flex flex-col items-center rounded-[28px] bg-stone-50 p-6 text-center">
                  <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-brand-100 shadow-sm">
                    {draft.avatarSrc ? (
                      <img src={draft.avatarSrc} alt="Profile preview" className="h-full w-full object-cover" />
                    ) : (
                      <UserRound className="h-12 w-12 text-brand-700" />
                    )}
                  </div>
                  <p className="mt-4 text-sm font-semibold text-stone-800">Photo preview</p>
                  <p className="mt-1 text-sm text-stone-500">A clear headshot helps members trust the space faster.</p>
                </div>

                <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-50 p-6">
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-800 shadow-sm">
                      <Upload className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-stone-900">Upload your profile photo</h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-stone-500">
                      JPG or PNG works best. You can skip this and add it later from your profile settings.
                    </p>
                    <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900">
                      <Camera className="h-4 w-4" />
                      Choose image
                      <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                </div>
              </div>
            ) : null}

            {draft.currentStep === 2 ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-stone-50 px-4 py-4 text-sm leading-6 text-stone-600">
                  This step is optional. Add whichever links you want people to use, or continue without them.
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">Website</label>
                  <input
                    className={inputClassName()}
                    value={draft.profile.website}
                    onChange={(event) => updateProfile("website", event.target.value)}
                    placeholder="https://your-site.com"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">LinkedIn</label>
                    <input
                      className={inputClassName()}
                      value={draft.profile.linkedin}
                      onChange={(event) => updateProfile("linkedin", event.target.value)}
                      placeholder="linkedin username or URL"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">Twitter / X</label>
                    <input
                      className={inputClassName()}
                      value={draft.profile.twitter}
                      onChange={(event) => updateProfile("twitter", event.target.value)}
                      placeholder="handle or full URL"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {draft.currentStep === 3 ? (
              <div className="space-y-4">
                <ToggleCard
                  checked={draft.privacy.profileVisible}
                  onChange={(checked) =>
                    setDraft((current) => ({
                      ...current,
                      privacy: { ...current.privacy, profileVisible: checked },
                    }))
                  }
                  title="Public community profile"
                  description="Allow members to discover your profile in the directory."
                />
                <ToggleCard
                  checked={draft.privacy.socialsVisible}
                  onChange={(checked) =>
                    setDraft((current) => ({
                      ...current,
                      privacy: { ...current.privacy, socialsVisible: checked },
                    }))
                  }
                  title="Show social links"
                  description="Display your website and socials on your profile card."
                />
                <ToggleCard
                  checked={draft.privacy.openToWork}
                  onChange={(checked) =>
                    setDraft((current) => ({
                      ...current,
                      privacy: { ...current.privacy, openToWork: checked },
                    }))
                  }
                  title="Open to work"
                  description="Show recruiters and mentors that you are currently open to roles or opportunities."
                />
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-stone-300 text-brand-700 focus:ring-brand-500"
                    checked={draft.privacy.reviewConfirmed}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        privacy: { ...current.privacy, reviewConfirmed: event.target.checked },
                      }))
                    }
                  />
                  <span>
                    I have reviewed these privacy settings and I am okay with continuing using the current choices.
                  </span>
                </label>
                {!draft.privacy.reviewConfirmed ? (
                  <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Confirm this review to continue. Privacy is a required step.
                  </p>
                ) : null}
              </div>
            ) : null}

            {draft.currentStep === 4 ? (
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">Primary goal</label>
                  <input
                    className={inputClassName()}
                    value={draft.devPlan.goal}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        devPlan: { ...current.devPlan, goal: event.target.value },
                      }))
                    }
                    placeholder="Land a stronger role, launch something, or grow a skill"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {draft.devPlan.milestones.map((milestone, index) => (
                    <div key={index}>
                      <label className="mb-2 block text-sm font-medium text-stone-700">Milestone {index + 1}</label>
                      <div className="flex items-center gap-2">
                        <input
                          className={inputClassName()}
                          value={milestone}
                          onChange={(event) => updateMilestone(index, event.target.value)}
                          placeholder={index === 0 ? "Update portfolio" : "Book two mock interviews"}
                        />
                        <button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          disabled={draft.devPlan.milestones.length <= 1}
                          className="inline-flex items-center justify-center rounded-xl border border-stone-200 p-2 text-stone-500 transition hover:border-rose-300 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Remove milestone ${index + 1}`}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-brand-300 hover:text-brand-700"
                >
                  <CirclePlus className="h-4 w-4" />
                  Add milestone
                </button>
                <div className="rounded-2xl bg-brand-50 px-4 py-4 text-sm leading-6 text-brand-900">
                  This step is optional. If you skip it, you can create your dev plan later from the member dashboard.
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-6">
            {!devPlanMode && (
              <button
                type="button"
                onClick={goBack}
                disabled={draft.currentStep === 0}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:border-stone-300 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
            {devPlanMode && <div />}

            <div className="flex items-center gap-3">
              {!canContinue && draft.currentStep === 0 ? (
                <p className="text-sm text-stone-500">
                  Fill in the required basics to continue.
                </p>
              ) : null}
              {!canContinue && draft.currentStep === 3 ? (
                <p className="text-sm text-stone-500">
                  Review and confirm your privacy settings to continue.
                </p>
              ) : null}
              {draft.currentStep === STEPS.length - 1 ? (
                <>
                  {!canFinishOnboarding ? (
                    <p className="text-sm text-stone-500">
                      Required onboarding steps must be completed before you can finish.
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={skipDevPlanAndFinish}
                    disabled={!canFinishOnboarding || isSubmitting}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Skip for now
                  </button>
                  <button
                    type="button"
                    onClick={finishOnboarding}
                    disabled={!canFinishOnboarding || isSubmitting}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? "Finishing..." : "Finish onboarding"}
                    <Check className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canContinue}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}