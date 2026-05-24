import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  analyticsService,
  AnalyticsSummary,
  applyRealtimeAnalyticsUpdate,
  AnalyticsUpdatePayload,
} from "../services/analyticsService";
import { linkService, LinkItem } from "../services/linkService";
import { authService } from "../services/authService";
import { profileService, ProfileData } from "../services/profileService";
import { getDisplayName } from "../lib/profile";
import { PreviewSidebar } from "./livePreview";
import AddLinkModal from "../components/AddLinkModal";

type IconProps = React.SVGProps<SVGSVGElement>;
type DashboardLink = LinkItem & { clicks?: number };

const IconPlus = ({ className = "h-7 w-7", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m7-7H5" />
  </svg>
);

const IconBag = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 8V7a4 4 0 018 0v1m-9 0h10l1 11H6L7 8z" />
  </svg>
);

const IconPlay = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5v14l11-7-11-7z" />
  </svg>
);

const IconMail = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7l8 5 8-5M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const iconThemes = [
  { bg: "bg-primary-container", text: "text-primary", icon: IconMail },
  { bg: "bg-secondary-container", text: "text-secondary", icon: IconPlay },
  { bg: "bg-tertiary-container", text: "text-tertiary", icon: IconBag },
];

const formatCompact = (value: number) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);

const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [links, setLinks] = useState<DashboardLink[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      if (!authService.getToken()) {
        navigate("/login");
        return;
      }

      try {
        const [summary, fetchedLinks, fetchedProfile] = await Promise.all([
          analyticsService.getSummary(),
          linkService.getLinks(),
          profileService.getMyProfile().catch(() => null),
        ]);

        const clicksById = new Map(summary.links.map((link) => [link.id, link.totalClicks]));
        const enrichedLinks = fetchedLinks.map((link) => ({
          ...link,
          clicks: clicksById.get(link.id) ?? 0,
        }));

        setAnalytics(summary);
        setLinks(enrichedLinks);
        setProfile(fetchedProfile);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        if (error instanceof Error && error.message.includes("401")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [navigate]);

  useEffect(() => {
    const socket = analyticsService.subscribe((event) => {
      if (event.type !== "analytics-update") return;
      const payload = event.payload as AnalyticsUpdatePayload | undefined;
      if (!payload?.linkId) return;

      setAnalytics((current) =>
        current ? applyRealtimeAnalyticsUpdate(current, payload) : current
      );
      setLinks((currentLinks) =>
        currentLinks.map((link) =>
          link.id === payload.linkId
            ? { ...link, clicks: (link.clicks ?? 0) + 1 }
            : link
        )
      );
    });

    return () => {
      socket.close();
    };
  }, []);

  const totalClicks = analytics?.totalClicks ?? 0;
  const topLink = useMemo(
    () => [...(analytics?.links ?? [])].sort((a, b) => b.totalClicks - a.totalClicks)[0],
    [analytics]
  );
  const displayName = getDisplayName(profile);

  const handleCreatedLink = (created: LinkItem) => {
    setLinks((prev) => [
      ...prev,
      {
        ...created,
        clicks: 0,
        isActive: created.isActive ?? true,
        position: created.position ?? prev.length,
      },
    ]);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="mt-4 text-on-surface-variant">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-surface px-4 py-5 sm:px-5 lg:px-6 xl:px-7">
      <div className="w-full max-w-none">
        <div className="grid gap-6 min-[1280px]:grid-cols-[minmax(0,1fr)_430px] min-[1280px]:items-start">
          <div className="min-w-0">
            <header className="mb-5">
              <h1 className="text-[30px] font-semibold leading-tight text-on-surface sm:text-[36px] xl:text-[40px]">
                Dashboard
              </h1>
            </header>

            <div className="grid gap-4 2xl:grid-cols-[1fr_288px]">
              <article className="rounded-[20px] border border-white bg-surface-container-lowest p-4 shadow-soft sm:p-5">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-[22px] font-medium leading-tight text-on-surface">
                  Performance Overview
                </h2>
                <div className="mt-8">
                  <p className="text-[15px] font-medium text-on-surface">Total Clicks</p>
                  <div className="mt-2 flex flex-wrap items-end gap-3">
                    <p className="text-[38px] font-semibold leading-none tracking-normal text-on-surface">
                      {totalClicks.toLocaleString()}
                    </p>
                    <p className="pb-1.5 text-sm font-semibold text-primary">up 14%</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-surface-container-low p-4 sm:mt-12 sm:w-[280px]">
                <p className="text-sm font-semibold text-on-surface">Top Performing Link</p>
                {topLink ? (
                  <div className="mt-3 flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-secondary">
                      <IconBag />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-medium text-on-surface">{topLink.title}</p>
                      <p className="text-sm text-on-surface-variant">
                        {topLink.totalClicks.toLocaleString()} clicks
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-on-surface-variant">No traffic yet.</p>
                )}
              </div>
            </div>
              </article>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex min-h-[158px] flex-col items-center justify-center rounded-[20px] bg-tertiary-container p-5 text-center text-tertiary transition-all hover:-translate-y-0.5 hover:shadow-soft-lg active:translate-y-0"
              >
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-lowest text-tertiary shadow-soft">
                  <IconPlus className="h-7 w-7" />
                </span>
                <span className="text-[22px] font-medium leading-tight">Create New Link</span>
                <span className="mt-2 max-w-[220px] text-sm leading-relaxed text-tertiary/80">
                  Add a new destination to your space
                </span>
              </button>
            </div>

            <section className="mt-5 rounded-[20px] border border-white bg-surface-container-lowest p-4 shadow-soft sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-[22px] font-medium leading-tight text-on-surface">
              Recently Active Links
            </h2>
            <button
              onClick={() => navigate("/links")}
              className="rounded-full px-3 py-2 text-[15px] font-medium text-primary transition-colors hover:bg-primary-fixed/50"
            >
              View All
            </button>
          </div>

          {links.length > 0 ? (
            <div className="space-y-3">
              {links.slice(0, 3).map((link, index) => {
                const theme = iconThemes[index % iconThemes.length];
                const Icon = theme.icon;

                return (
                  <div
                    key={link.id}
                    className="grid gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-surface-container-low sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${theme.bg} ${theme.text}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-on-surface">{link.title}</h3>
                        <p className="mt-1 truncate text-sm text-on-surface-variant">{link.url}</p>
                      </div>
                    </div>
                    <div className="pl-[60px] text-left sm:pl-0 sm:text-right">
                      <p className="text-base font-semibold text-on-surface">
                        {formatCompact(link.clicks ?? 0)}
                      </p>
                      <p className="text-sm text-on-surface-variant">clicks</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-surface-container-low p-6 text-center">
              <p className="text-on-surface-variant">No links yet. Create your first link to start tracking activity.</p>
            </div>
          )}
            </section>
          </div>

          <div className="hidden lg:block">
            <PreviewSidebar profile={profile} links={links} />
          </div>
        </div>
      </div>

      <AddLinkModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={handleCreatedLink}
      />
    </section>
  );
};

export default DashboardOverview;
