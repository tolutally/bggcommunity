import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";

const signOutMock = vi.fn().mockResolvedValue(undefined);
const mutateCurrentUserMock = vi.fn();
const routerReplaceMock = vi.fn();

let pathnameMock = "/member";

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock,
  useRouter: () => ({ replace: routerReplaceMock }),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    isSignedIn: true,
    isLoaded: true,
    signOut: signOutMock,
    getToken: vi.fn().mockResolvedValue("token"),
    userId: "user_123",
  }),
  useUser: () => ({
    user: {
      id: "user_123",
      fullName: "Test User",
      primaryEmailAddress: { emailAddress: "test@example.com" },
      imageUrl: "",
    },
  }),
}));

vi.mock("swr", () => ({
  useSWRConfig: () => ({ mutate: vi.fn() }),
}));

vi.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: () => ({
    user: null,
    error: new ApiError("Unauthorized", 401),
    isLoading: false,
    mutate: mutateCurrentUserMock,
  }),
}));

vi.mock("@/lib/onboarding", () => ({
  ONBOARDING_LOCAL_STATE_EVENT: "bgg:onboarding-local-state",
  loadLocalOnboardingStatus: () => ({
    completed: false,
    source: "fallback",
    completedAt: null,
    pendingSync: false,
    lastSyncError: null,
  }),
  loadPendingOnboardingSync: () => null,
  clearLocalOnboardingFallback: vi.fn(),
  markOnboardingFallbackComplete: vi.fn(),
  markOnboardingSynced: vi.fn(),
  savePendingOnboardingSync: vi.fn(),
}));

vi.mock("@/lib/users", () => ({
  completeCurrentUserOnboarding: vi.fn(),
  getUsersErrorMessage: () => "error",
  updateCurrentUserProfile: vi.fn(),
  updateProfileVisibility: vi.fn(),
  uploadCurrentUserAvatar: vi.fn(),
}));

vi.mock("@/lib/developer-plan", () => ({
  syncDraftDevPlanToCurrentUserPlan: vi.fn(),
}));

import { AuthProvider } from "@/context/AuthContext";

function mountProvider() {
  return render(
    <AuthProvider>
      <div>child</div>
    </AuthProvider>,
  );
}

describe("AuthContext memberRequired guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    pathnameMock = "/member";
  });

  it("does not sign out on callback route", async () => {
    pathnameMock = "/sso-callback";
    sessionStorage.setItem("bgg_auth_intent", "sign-in");
    sessionStorage.setItem("bgg_auth_intent_started_at", String(Date.now() - 60_000));

    mountProvider();

    await waitFor(() => {
      expect(signOutMock).not.toHaveBeenCalled();
    });
  });

  it("does not sign out on sign-in route", async () => {
    pathnameMock = "/sign-in";
    sessionStorage.setItem("bgg_auth_intent", "sign-in");
    sessionStorage.setItem("bgg_auth_intent_started_at", String(Date.now() - 60_000));

    mountProvider();

    await waitFor(() => {
      expect(signOutMock).not.toHaveBeenCalled();
    });
  });

  it("does not sign out on sign-up route", async () => {
    pathnameMock = "/sign-up";
    sessionStorage.setItem("bgg_auth_intent", "sign-in");
    sessionStorage.setItem("bgg_auth_intent_started_at", String(Date.now() - 60_000));

    mountProvider();

    await waitFor(() => {
      expect(signOutMock).not.toHaveBeenCalled();
    });
  });

  it("does not sign out on forgot-password route", async () => {
    pathnameMock = "/forgot-password";
    sessionStorage.setItem("bgg_auth_intent", "sign-in");
    sessionStorage.setItem("bgg_auth_intent_started_at", String(Date.now() - 60_000));

    mountProvider();

    await waitFor(() => {
      expect(signOutMock).not.toHaveBeenCalled();
    });
  });

  it("does not sign out during grace window", async () => {
    pathnameMock = "/member";
    sessionStorage.setItem("bgg_auth_intent", "sign-in");
    sessionStorage.setItem("bgg_auth_intent_started_at", String(Date.now() - 1_000));

    mountProvider();

    await waitFor(() => {
      expect(signOutMock).not.toHaveBeenCalled();
    });
  });

  it("redirects to memberRequired after grace window", async () => {
    pathnameMock = "/member";
    sessionStorage.setItem("bgg_auth_intent", "sign-in");
    sessionStorage.setItem("bgg_auth_intent_started_at", String(Date.now() - 20_000));

    mountProvider();

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalledWith({ redirectUrl: "/sign-in?memberRequired=1" });
    });
  });
});
