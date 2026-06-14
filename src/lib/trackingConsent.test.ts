// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTrackingConsent, setTrackingConsent, TRACKING_CONSENT_EVENT } from "./trackingConsent";

describe("tracking consent", () => {
  beforeEach(() => localStorage.clear());

  it("stores the visitor choice and emits an update", () => {
    const listener = vi.fn();
    window.addEventListener(TRACKING_CONSENT_EVENT, listener);
    setTrackingConsent("accepted");

    expect(getTrackingConsent()).toBe("accepted");
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener(TRACKING_CONSENT_EVENT, listener);
  });
});
