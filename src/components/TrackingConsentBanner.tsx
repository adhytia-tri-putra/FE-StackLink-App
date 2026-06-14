import { useEffect, useState } from "react";
import { getTrackingConsent, setTrackingConsent, TRACKING_CONSENT_EVENT, type TrackingConsent } from "../lib/trackingConsent";

type Props = {
  enabled: boolean;
};

export default function TrackingConsentBanner({ enabled }: Props) {
  const [consent, setConsent] = useState<TrackingConsent>(() => getTrackingConsent());

  useEffect(() => {
    const update = (event: Event) => setConsent((event as CustomEvent<TrackingConsent>).detail);
    window.addEventListener(TRACKING_CONSENT_EVENT, update);
    return () => window.removeEventListener(TRACKING_CONSENT_EVENT, update);
  }, []);

  if (!enabled || consent) return null;

  return (
    <aside className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-2xl border border-outline-variant bg-white p-4 shadow-xl" role="dialog" aria-label="Tracking consent">
      <p className="font-semibold text-on-surface">Privacy choices</p>
      <p className="mt-1 text-sm leading-6 text-on-surface-variant">
        This profile uses optional analytics and marketing pixels. They only load after you accept.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setTrackingConsent("accepted")} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-on">
          Accept
        </button>
        <button type="button" onClick={() => setTrackingConsent("declined")} className="rounded-full border border-outline-variant px-5 py-2 text-sm font-semibold text-on-surface">
          Decline
        </button>
      </div>
    </aside>
  );
}
