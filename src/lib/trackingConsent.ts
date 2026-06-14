export type TrackingConsent = "accepted" | "declined" | null;

const STORAGE_KEY = "stacklink-tracking-consent";
export const TRACKING_CONSENT_EVENT = "stacklink:tracking-consent";

export function getTrackingConsent(): TrackingConsent {
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "accepted" || value === "declined" ? value : null;
}

export function setTrackingConsent(value: Exclude<TrackingConsent, null>) {
  window.localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(new CustomEvent(TRACKING_CONSENT_EVENT, { detail: value }));
}
