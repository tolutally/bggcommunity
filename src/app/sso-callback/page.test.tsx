import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const callbackSpy = vi.fn(() => null);

vi.mock("@clerk/nextjs", () => ({
  AuthenticateWithRedirectCallback: (props: Record<string, unknown>) => callbackSpy(props),
}));

import SSOCallback from "@/app/sso-callback/page";

describe("sso callback routing config", () => {
  it("passes factor and redirect urls to Clerk callback", () => {
    render(<SSOCallback />);

    expect(callbackSpy).toHaveBeenCalledTimes(1);
    expect(callbackSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        signInUrl: "/sign-in",
        signUpUrl: "/sign-up",
        firstFactorUrl: "/sign-in",
        secondFactorUrl: "/sign-in",
        signInFallbackRedirectUrl: "/member",
        signInForceRedirectUrl: "/member",
        signUpFallbackRedirectUrl: "/onboarding",
        signUpForceRedirectUrl: "/onboarding",
      }),
    );
  });
});
