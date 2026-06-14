import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import ProfileAvatar from "../components/ProfileAvatar";
import { getDisplayName } from "../lib/profile";
import { linkService, LinkItem } from "../services/linkService";
import { profileService, LinkData, ProfileData } from "../services/profileService";
import { authService } from "../services/authService";
import TrackingConsentBanner from "../components/TrackingConsentBanner";
import { getTrackingConsent, TRACKING_CONSENT_EVENT } from "../lib/trackingConsent";

type IconProps = React.SVGProps<SVGSVGElement>;

type PreviewLink = Partial<LinkData> &
  Partial<LinkItem> & {
    id: string;
    title: string;
    url: string;
  };

type LivePreviewPanelProps = {
  profile?: ProfileData | null;
  links?: PreviewLink[];
  sticky?: boolean;
  className?: string;
  showTitle?: boolean;
  interactive?: boolean;
  framed?: boolean;
  onLinkClick?: (link: PreviewLink) => void;
};

type PreviewSidebarProps = LivePreviewPanelProps & {
  shareCard?: boolean;
};

type ProfileShareCardProps = {
  profile?: ProfileData | null;
  className?: string;
};

const IconCalendar = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V4m8 3V4M5 11h14M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z" />
  </svg>
);

const IconBook = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5.5A2.5 2.5 0 016.5 3H20v16H6.5A2.5 2.5 0 004 21.5v-16zm0 0A2.5 2.5 0 016.5 8H20" />
  </svg>
);

const IconGlobe = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
  </svg>
);

const IconExternal = ({ className = "h-4 w-4", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17 17 7M9 7h8v8" />
  </svg>
);

const IconCopy = ({ className = "h-4 w-4", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 8h10a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V10a2 2 0 012-2zm-4 6V6a2 2 0 012-2h8" />
  </svg>
);

const IconDownload = ({ className = "h-4 w-4", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v10m0 0l4-4m-4 4l-4-4M5 20h14" />
  </svg>
);

const IconShare = ({ className = "h-4 w-4", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16V4m0 0l-4 4m4-4l4 4M5 12v6a2 2 0 002 2h10a2 2 0 002-2v-6" />
  </svg>
);

const IconSliders = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7h10m4 0h2M6 17h14M4 17h.01M14 7a2 2 0 104 0 2 2 0 00-4 0zM4 17a2 2 0 104 0 2 2 0 00-4 0z" />
  </svg>
);

const IconClose = ({ className = "h-4 w-4", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const iconSet = [IconCalendar, IconBook, IconGlobe];

const colorWithAlpha = (color: string | undefined, alpha: number) => {
  const fallback = "#2388ff";
  const value = color || fallback;
  const match = value.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);

  if (!match) return value;

  const [, red, green, blue] = match;
  return `rgba(${parseInt(red, 16)}, ${parseInt(green, 16)}, ${parseInt(blue, 16)}, ${alpha})`;
};

const normalizeUrl = (url: string) => (url.startsWith("http") ? url : `https://${url}`);

const isPreviewLinkActive = (link: PreviewLink) => link.isActive ?? link.active ?? true;

const getPublicProfileUrl = (profile?: ProfileData | null) => {
  if (!profile?.username || typeof window === "undefined") return "";
  return `${window.location.origin}/${profile.username}`;
};

const previewSurfaceStyle = (profile?: ProfileData | null): React.CSSProperties => {
  if (profile?.theme === "gradient") {
    return {
      background: `linear-gradient(160deg, ${profile.bgGradientStart || "#eef6ff"} 0%, ${
        profile.bgGradientEnd || "#ffffff"
      } 100%)`,
      color: profile.textColor || "#1a1c1a",
    };
  }

  if (profile?.theme === "dark") {
    return {
      background: "linear-gradient(160deg, #1a1c1a 0%, #2f312e 100%)",
      color: profile.textColor || "#f1f1ed",
    };
  }

  return {
    background: profile?.bgColor || "#eef6ff",
    color: profile?.textColor || "#1a1c1a",
  };
};

export const ProfileShareCard: React.FC<ProfileShareCardProps> = ({ profile, className = "" }) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const publicUrl = getPublicProfileUrl(profile);
  const displayUrl = publicUrl.replace(/^https?:\/\//, "");
  const accentColor = profile?.customColor || "#2388ff";

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const handleCopy = async () => {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setStatus("Copied");
    } catch {
      setStatus("Copy failed");
    }

    window.setTimeout(() => setStatus(""), 1600);
  };

  const handleShare = async () => {
    if (!publicUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: profile?.name || profile?.username || "StackLink",
          url: publicUrl,
        });
        setStatus("Shared");
      } catch {
        setStatus("");
      }
      return;
    }

    await handleCopy();
  };

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg || !publicUrl) return;

    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `stacklink-${profile?.username || "profile"}-qr.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section ref={wrapperRef} className={`relative w-full max-w-[320px] ${className}`}>
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          disabled={!publicUrl}
          className="flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-outline-variant/70 bg-surface-container-lowest px-4 text-sm font-medium text-on-surface shadow-soft transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
          title="Open share options"
        >
          <span className="min-w-0 truncate">{displayUrl || "Public link unavailable"}</span>
          <IconShare className="h-4 w-4 flex-shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          disabled={!publicUrl}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-outline-variant/70 bg-surface-container-lowest text-on-surface shadow-soft transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
          title="Share and QR options"
        >
          <IconSliders className="h-5 w-5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+12px)] z-30 w-[min(360px,calc(100vw-32px))] rounded-[32px] border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-soft-lg">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-on-surface">Share</h2>
              <p className="mt-1 text-xs font-medium text-on-surface-variant">Copy URL or download QR code</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high"
              title="Close"
            >
              <IconClose />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-2">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-surface-container text-primary">
              <IconExternal />
            </span>
            <p className="min-w-0 flex-1 truncate font-mono text-sm font-semibold text-on-surface">
              {displayUrl || "Public link unavailable"}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!publicUrl}
              className="rounded-full bg-on-surface px-4 py-2 text-sm font-semibold text-inverse-on-surface transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Copy
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-[132px_1fr] sm:items-center">
            <div ref={qrRef} className="w-fit rounded-[28px] border border-outline-variant/50 bg-white p-3">
              {publicUrl ? (
                <QRCodeSVG value={publicUrl} size={108} marginSize={2} bgColor="#ffffff" fgColor={accentColor} />
              ) : (
                <div className="flex h-[108px] w-[108px] items-center justify-center rounded-[28px] bg-surface-container-low text-center text-xs text-on-surface-variant">
                  QR unavailable
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleShare}
                disabled={!publicUrl}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-on transition-colors hover:bg-primary/95 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <IconShare />
                Share URL
              </button>
              <a
                href={publicUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-container px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
              >
                <IconExternal />
                Open Page
              </a>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!publicUrl}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-container px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-45"
              >
                <IconDownload />
                Download QR
              </button>
            </div>
          </div>

          {status && (
            <p className="mt-3 rounded-2xl bg-primary-fixed px-3 py-2 text-center text-sm font-semibold text-primary">
              {status}
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export const PreviewSidebar: React.FC<PreviewSidebarProps> = ({
  profile,
  links,
  sticky = true,
  className = "",
  shareCard = true,
  ...previewProps
}) => (
  <aside
    className={`flex w-full flex-col items-center gap-5 justify-self-center ${
      sticky ? "min-[1280px]:sticky min-[1280px]:top-5 min-[1280px]:min-h-[calc(100vh-40px)] min-[1280px]:self-start" : ""
    } ${className}`}
  >
    {shareCard && <ProfileShareCard profile={profile} />}
    <LivePreviewPanel {...previewProps} profile={profile} links={links} sticky={false} className="w-full" />
  </aside>
);

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
  profile,
  links,
  sticky = true,
  className = "",
  showTitle = true,
  interactive = true,
  framed = true,
  onLinkClick,
}) => {
  const previewLinks = useMemo(() => {
    const sourceLinks = links ?? (profile?.links as PreviewLink[] | undefined) ?? [];
    return sourceLinks.filter(isPreviewLinkActive).slice(0, framed ? 6 : 12);
  }, [framed, links, profile?.links]);

  const displayName = getDisplayName(profile, "Creator");
  const description = profile?.bio || profile?.headline || "Share your newest links and favorite destinations.";
  const hasLinks = previewLinks.length > 0;
  const isDark = profile?.theme === "dark";
  const accentColor = profile?.customColor || "#2388ff";
  const textColor = profile?.textColor || (isDark ? "#f1f1ed" : "#1a1c1a");
  const mutedColor = isDark ? "rgba(241, 241, 237, 0.74)" : colorWithAlpha(textColor, 0.74);
  const filledTemplate = profile?.theme === "gradient";
  const frameClass = framed
    ? "mx-auto w-full max-w-[360px] overflow-hidden rounded-[56px] border-2 border-outline/20 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] sm:max-w-[380px]"
    : "mx-auto w-full max-w-[440px]";
  const surfaceClass = framed
    ? "min-h-[640px] px-5 py-9 sm:min-h-[680px] sm:px-6 sm:py-10"
    : "min-h-[calc(100vh-48px)] px-5 py-10 sm:px-7";

  return (
    <aside
      className={`flex w-full flex-col items-center justify-center justify-self-center ${
        sticky ? "min-[1280px]:sticky min-[1280px]:top-5 min-[1280px]:min-h-[calc(100vh-40px)] min-[1280px]:self-start" : ""
      } ${className}`}
    >
      {showTitle && (
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-on-surface">
          Live Preview
        </p>
      )}
      <div className={frameClass}>
        <div className={surfaceClass} style={previewSurfaceStyle(profile)}>
          <div className="mx-auto flex max-w-[310px] flex-col items-center text-center sm:max-w-[326px]">
            <ProfileAvatar
              avatarUrl={profile?.avatarUrl}
              name={profile?.name || displayName}
              username={profile?.username}
              className="h-[92px] w-[92px] border-4 border-white shadow-soft sm:h-24 sm:w-24"
              textClassName="text-2xl"
            />
            <h3 className="mt-6 text-[24px] font-semibold leading-tight sm:text-[26px]" style={{ color: textColor }}>
              {displayName}
            </h3>
            {profile?.username && (
              <p className="mt-1.5 text-sm font-semibold" style={{ color: mutedColor }}>
                @{profile.username}
              </p>
            )}
            <p className="mt-5 max-w-[300px] text-sm leading-relaxed sm:text-[15px]" style={{ color: mutedColor }}>
              {description}
            </p>

            <div className="mt-7 w-full space-y-3.5">
              {hasLinks ? (
                previewLinks.map((link, index) => {
                  const Icon = iconSet[index % iconSet.length];

                  return (
                    <a
                      key={link.id}
                      href={interactive ? normalizeUrl(link.url) : "#"}
                      target={interactive ? "_blank" : undefined}
                      rel={interactive ? "noopener noreferrer" : undefined}
                      onClick={(event) => {
                        if (!interactive) event.preventDefault();
                        onLinkClick?.(link);
                      }}
                      className={`grid min-h-[56px] w-full grid-cols-[34px_1fr_34px] items-center gap-2 rounded-full border px-4 py-3 text-center text-[15px] font-semibold transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/40 sm:min-h-[58px] sm:text-base ${
                        filledTemplate ? "border-transparent text-white" : "bg-white/95 text-on-surface hover:bg-white"
                      }`}
                      style={{
                        backgroundColor: filledTemplate ? accentColor : undefined,
                        borderColor: filledTemplate ? "transparent" : colorWithAlpha(accentColor, 0.28),
                        boxShadow: `0 5px 0 ${colorWithAlpha(accentColor, filledTemplate ? 0.22 : 0.14)}`,
                      }}
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: filledTemplate ? "rgba(255,255,255,0.18)" : colorWithAlpha(accentColor, 0.12),
                          color: filledTemplate ? "#ffffff" : accentColor,
                        }}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0 truncate px-2">{link.title}</span>
                      <IconExternal
                        className={`h-4 w-4 justify-self-end ${filledTemplate ? "text-white/75" : "text-on-surface-variant/70"}`}
                      />
                    </a>
                  );
                })
              ) : (
                <div
                  className="rounded-xl border bg-white/95 px-4 py-5 text-center text-sm font-medium text-on-surface-variant"
                  style={{
                    borderColor: colorWithAlpha(accentColor, 0.22),
                    boxShadow: `0 5px 0 ${colorWithAlpha(accentColor, 0.1)}`,
                  }}
                >
                  Your active links will appear here.
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <span className="text-base font-medium sm:text-lg" style={{ color: isDark ? "rgba(241,241,237,0.45)" : colorWithAlpha(textColor, 0.42) }}>
                StackLink
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const LivePreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [trackingConsent, setConsentState] = useState(() => getTrackingConsent());

  useEffect(() => {
    const resizeHandler = () => setIsMobile(window.innerWidth < 1024);
    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  useEffect(() => {
    const updateConsent = (event: Event) => setConsentState((event as CustomEvent).detail);
    window.addEventListener(TRACKING_CONSENT_EVENT, updateConsent);
    return () => window.removeEventListener(TRACKING_CONSENT_EVENT, updateConsent);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const customHost = !["localhost", "127.0.0.1"].includes(window.location.hostname) && !window.location.hostname.endsWith("netlify.app");
        const data = username
          ? await profileService.getPublicProfile(username)
          : customHost
            ? await profileService.getPublicProfileByDomain(window.location.hostname)
            : await profileService.getPreviewProfile();
        setProfile(data);
      } catch (err) {
        const hasToken = Boolean(authService.getToken());
        setError(
          !username && !hasToken
            ? "Login terlebih dahulu untuk melihat preview link."
            : (err as Error).message || "User tidak ditemukan."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (!profile || (!username && ["localhost", "127.0.0.1"].includes(window.location.hostname))) return;
    const title = profile.seoTitle || profile.name || profile.username || "StackLink";
    const description = profile.seoDescription || profile.bio || profile.headline || "View this StackLink profile";
    document.title = title;
    const setMeta = (selector: string, attribute: string, value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) { element = document.createElement("meta"); element.setAttribute(attribute, selector.includes("property=") ? selector.match(/"(.+)"/)?.[1] || "" : selector.match(/"(.+)"/)?.[1] || ""); document.head.appendChild(element); }
      element.content = value;
    };
    setMeta('meta[name="description"]', "name", description);
    setMeta('meta[property="og:title"]', "property", title);
    setMeta('meta[property="og:description"]', "property", description);
    if (profile.socialImage || profile.avatarUrl) setMeta('meta[property="og:image"]', "property", profile.socialImage || profile.avatarUrl || "");

    if (trackingConsent !== "accepted") return;

    const scripts: HTMLScriptElement[] = [];
    const addScript = (src: string, code?: string) => { const script = document.createElement("script"); if (src) script.src = src; if (code) script.text = code; script.async = true; script.dataset.stacklinkTracker = "true"; document.head.appendChild(script); scripts.push(script); };
    if (profile.googleAnalyticsId) { addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(profile.googleAnalyticsId)}`); addScript("", `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${profile.googleAnalyticsId}');`); }
    if (profile.metaPixelId) addScript("", `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${profile.metaPixelId}');fbq('track','PageView');`);
    if (profile.tiktokPixelId) addScript("", `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.load=function(e){var s=d.createElement('script');s.async=true;s.src='https://analytics.tiktok.com/i18n/pixel/events.js?sdkid='+e;d.head.appendChild(s)};ttq.load('${profile.tiktokPixelId}');ttq.page()}(window,document,'ttq');`);
    return () => { scripts.forEach((script) => script.remove()); };
  }, [profile, trackingConsent, username]);

  const handleLinkClick = (link: PreviewLink) => {
    const publicUsername = username || profile?.username;
    if (!publicUsername) return;
    linkService.trackClick(publicUsername, link.id).catch((err) => console.error("Analitik error", err));
  };

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-surface p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </section>
    );
  }

  if (error || !profile) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-surface p-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface">Preview tidak tersedia</h1>
          <p className="mt-2 text-on-surface-variant">{error || "User tidak ditemukan."}</p>
        </div>
      </section>
    );
  }

  const previewPanel = (
    <LivePreviewPanel
      profile={profile}
      sticky={false}
      showTitle={false}
      framed={isMobile}
      interactive
      onLinkClick={handleLinkClick}
      className={isMobile ? "w-full max-w-[92vw]" : ""}
    />
  );

  return (
    <section className="flex min-h-screen items-center justify-center bg-surface p-4 sm:p-6">
      {previewPanel}
      <TrackingConsentBanner enabled={Boolean(profile.googleAnalyticsId || profile.metaPixelId || profile.tiktokPixelId)} />
    </section>
  );
};

export const LivePreviewModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shouldRender, setShouldRender] = useState(open);
  const [isExiting, setIsExiting] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setIsExiting(false);
      return;
    }

    if (!open && shouldRender) {
      setIsExiting(true);
      const timeout = window.setTimeout(() => {
        setShouldRender(false);
        setIsExiting(false);
      }, 280);
      return () => window.clearTimeout(timeout);
    }
  }, [open, shouldRender]);

  useEffect(() => {
    if (!open) return;

    const fetchPreview = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await profileService.getPreviewProfile();
        setProfile(data);
      } catch (err) {
        setError((err as Error).message || "Gagal memuat preview.");
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [open]);

  const publicUrl = getPublicProfileUrl(profile);

  const handleShare = async () => {
    if (!publicUrl) {
      setShareStatus("Preview not available");
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({ title: profile?.name || "StackLink Preview", url: publicUrl });
        setShareStatus("Shared successfully");
      } else {
        await navigator.clipboard.writeText(publicUrl);
        setShareStatus("Link copied to clipboard");
      }
    } catch {
      setShareStatus("Share failed, try again");
    }

    window.setTimeout(() => setShareStatus(""), 1800);
  };

  const handleCopy = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setShareStatus("Copied link to clipboard");
    } catch {
      setShareStatus("Copy failed");
    }

    window.setTimeout(() => setShareStatus(""), 1800);
  };

  const requestClose = () => {
    if (!open) return;
    setIsExiting(true);
    window.setTimeout(() => onClose(), 280);
  };

  if (!shouldRender) return null;

  return (
    <section className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity duration-300 ${isExiting ? "opacity-0" : "opacity-100"}`}>
      <div className="absolute inset-0" onClick={requestClose} />
      <div
        onClick={(event) => event.stopPropagation()}
        className={`relative z-10 w-full max-w-[560px] h-[92vh] overflow-hidden rounded-[32px] border border-outline-variant/70 bg-surface-container-lowest shadow-[0_24px_80px_rgba(0,0,0,0.18)] transform transition-all duration-300 ${
          isExiting ? "scale-[0.98] opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-80 pointer-events-none" />
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-outline-variant/70 bg-surface-container-highest px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-on-surface">Live Preview</p>
              <p className="text-xs text-on-surface-variant">Tap outside or close to dismiss</p>
            </div>
            <button
              type="button"
              onClick={requestClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high"
              aria-label="Close preview"
            >
              <IconClose />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="flex min-h-[360px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
              </div>
            ) : error ? (
              <div className="rounded-[24px] border border-outline-variant/70 bg-surface-container px-6 py-10 text-center text-sm font-medium text-on-surface-variant">
                {error}
              </div>
            ) : (
              <>
                <LivePreviewPanel profile={profile} sticky={false} showTitle={false} framed className="w-full" interactive />
                <div className="mt-4 flex flex-col gap-3 rounded-[24px] border border-outline-variant/70 bg-surface-container p-4 shadow-sm">
                  <button
                    type="button"
                    onClick={handleShare}
                    disabled={!publicUrl}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-on transition-colors hover:bg-primary/95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <IconShare className="h-4 w-4" />
                    Share Preview
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!publicUrl}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-outline-variant/70 bg-surface-container px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <IconCopy className="h-4 w-4" />
                    Copy Preview Link
                  </button>
                  {shareStatus && (
                    <p className="text-center text-sm font-medium text-primary">{shareStatus}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LivePreviewPage;
