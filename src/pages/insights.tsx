import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  analyticsService,
  AnalyticsDeviceSplit,
  AnalyticsPeriod,
  AnalyticsSummary,
  AnalyticsTrafficPoint,
  applyRealtimeAnalyticsUpdate,
  AnalyticsUpdatePayload,
} from "../services/analyticsService";
import { authService } from "../services/authService";

type IconProps = React.SVGProps<SVGSVGElement>;

const IconEye = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
  </svg>
);

const IconUsers = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 19a4 4 0 00-8 0m8 0h5a3.5 3.5 0 00-5.3-3M8 19H3a3.5 3.5 0 015.3-3M15 8a3 3 0 11-6 0 3 3 0 016 0zm5 3a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM9 11a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const IconTarget = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0-4a5 5 0 100-10 5 5 0 000 10zm0-4a1 1 0 100-2 1 1 0 000 2z" />
  </svg>
);

const IconMore = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M5 12a2 2 0 114 0 2 2 0 01-4 0zm5 0a2 2 0 114 0 2 2 0 01-4 0zm5 0a2 2 0 114 0 2 2 0 01-4 0z" />
  </svg>
);

const IconPlus = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m7-7H5" />
  </svg>
);

const formatCompact = (value: number) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);

const formatChange = (value: number) => {
  if (Math.abs(value) < 0.05) return "No change";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}% vs previous period`;
};

const sourceColors = ["bg-primary", "bg-secondary-container", "bg-tertiary-container", "bg-surface-container-highest"];

const Insights: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [timePeriod, setTimePeriod] = useState<AnalyticsPeriod>("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      if (!authService.getToken()) {
        navigate("/login");
        return;
      }

      setLoading(true);

      try {
        const summary = await analyticsService.getSummary(timePeriod);
        setAnalytics(summary);
      } catch (error) {
        console.error("Failed to load insights:", error);
        if (error instanceof Error && error.message.includes("401")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [navigate, timePeriod]);

  useEffect(() => {
    let closed = false;
    let unsubscribe: (() => void) | null = null;

    void analyticsService.subscribe((event) => {
      if (event.type !== "analytics-update") return;
      const payload = event.payload as AnalyticsUpdatePayload | undefined;
      if (!payload || !payload.linkId) return;

      setAnalytics((current) => (current ? applyRealtimeAnalyticsUpdate(current, payload) : current));
    }).then((source) => {
      if (closed) {
        source.close();
        return;
      }

      unsubscribe = () => source.close();
    });

    return () => {
      closed = true;
      unsubscribe?.();
    };
  }, []);

  const topDevice = useMemo(() => getTopDevice(analytics?.deviceSplit ?? []), [analytics?.deviceSplit]);

  if (loading && !analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="mt-4 text-on-surface-variant">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-surface px-4 py-5 sm:px-5 lg:px-6 xl:px-7">
      <div className="w-full">
        <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[30px] font-serif leading-tight text-on-surface sm:text-[36px]">
              Analytics
            </h1>
          </div>

          <div className="flex w-fit rounded-full border border-outline-variant/60 bg-surface-container-lowest p-1 shadow-soft">
            {(["7d", "30d", "90d"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  timePeriod === period ? "bg-surface-container text-on-surface" : "text-on-surface hover:text-primary"
                }`}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={<IconEye className="h-5 w-5 text-primary" />}
            label="Total Views"
            value={formatCompact(analytics?.totalClicks ?? 0)}
            note={formatChange(analytics?.changes.clicks ?? 0)}
          />
          <MetricCard
            icon={<IconUsers className="h-5 w-5 text-secondary" />}
            label="Unique Visitors"
            value={formatCompact(analytics?.totalUniqueVisitors ?? 0)}
            note={formatChange(analytics?.changes.uniqueVisitors ?? 0)}
          />
          <MetricCard
            icon={<IconTarget className="h-5 w-5 text-tertiary" />}
            label="Avg. CTR"
            value={`${(analytics?.avgCtr ?? 0).toFixed(1)}%`}
            note={formatChange(analytics?.changes.avgCtr ?? 0)}
            neutral={Math.abs(analytics?.changes.avgCtr ?? 0) < 0.05}
          />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_320px]">
          <article className="rounded-[16px] bg-surface-container-lowest p-4 shadow-soft sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-[23px] font-serif leading-tight text-on-surface">Traffic Over Time</h2>
              <button className="rounded-full p-2 text-on-surface transition-colors hover:bg-surface-container">
                <IconMore />
              </button>
            </div>

            <TrafficChart traffic={analytics?.traffic ?? []} />
          </article>

          <aside className="rounded-[16px] bg-surface-container-lowest p-4 shadow-soft sm:p-5">
            <h2 className="text-[23px] font-serif leading-tight text-on-surface">Device Split</h2>
            <div className="flex min-h-[160px] flex-col items-center justify-center text-center">
              <p className="text-[42px] font-serif font-semibold leading-none text-on-surface">
                {topDevice.percentage}%
              </p>
              <p className="mt-2 text-sm font-semibold text-on-surface">{topDevice.device}</p>
            </div>
            <div className="space-y-4">
              {(analytics?.deviceSplit ?? []).map((item, index) => (
                <LegendDot
                  key={item.device}
                  label={item.device}
                  value={`${item.percentage}%`}
                  color={sourceColors[index % sourceColors.length]}
                />
              ))}
            </div>
          </aside>
        </div>

        <section className="mt-4 rounded-[16px] bg-surface-container-lowest p-4 shadow-soft sm:p-5">
          <h2 className="mb-5 text-[23px] font-serif leading-tight text-on-surface">
            Added Links
          </h2>
          <LinkList links={analytics?.links ?? []} />
        </section>
      </div>
    </section>
  );
};

type MetricCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
  neutral?: boolean;
};

const MetricCard = ({ icon, label, value, note, neutral = false }: MetricCardProps) => (
  <article className="rounded-[16px] bg-surface-container-lowest p-5 shadow-soft">
    <div className="flex items-center gap-3 text-[15px] text-on-surface-variant">
      {icon}
      <span>{label}</span>
    </div>
    <p className="mt-5 text-[36px] font-serif font-semibold leading-none tracking-normal text-on-surface">
      {value}
    </p>
    <p className={`mt-3 text-sm font-semibold ${neutral ? "text-on-surface" : "text-primary"}`}>
      {note}
    </p>
  </article>
);

type LegendDotProps = {
  label: string;
  value: string;
  color: string;
};

const LegendDot = ({ label, value, color }: LegendDotProps) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <span className="text-[15px] text-on-surface">{label}</span>
    </div>
    <span className="text-[15px] text-on-surface">{value}</span>
  </div>
);

const getTopDevice = (deviceSplit: AnalyticsDeviceSplit[]) => {
  if (deviceSplit.length === 0) return { device: "Mobile", percentage: 0 };
  return [...deviceSplit].sort((a, b) => b.percentage - a.percentage)[0];
};

const TrafficChart = ({ traffic }: { traffic: AnalyticsTrafficPoint[] }) => {
  const chart = useMemo(() => buildChartPath(traffic), [traffic]);

  return (
    <div className="h-[240px]">
      <svg viewBox="0 0 820 330" className="h-full w-full overflow-visible" role="img" aria-label="Traffic over time">
        <defs>
          <linearGradient id="traffic-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8fd1ff" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#8fd1ff" stopOpacity="0.24" />
          </linearGradient>
        </defs>
        {[52, 120, 188, 256].map((y) => (
          <line key={y} x1="0" x2="820" y1={y} y2={y} stroke="#e3e3df" strokeWidth="1.5" />
        ))}
        {chart.fillPath && <path d={chart.fillPath} fill="url(#traffic-fill)" />}
        {chart.linePath && (
          <path d={chart.linePath} fill="none" stroke="#2388ff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        )}
        {chart.points.map((point) => (
          <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="6" fill="#f4f8ff" stroke="#2388ff" strokeWidth="4" />
        ))}
        {chart.labels.map((item) => (
          <text key={`${item.label}-${item.x}`} x={item.x} y="326" textAnchor="middle" className="fill-on-surface text-[14px] font-semibold">
            {item.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

const buildChartPath = (traffic: AnalyticsTrafficPoint[]) => {
  const width = 820;
  const top = 44;
  const bottom = 288;
  const maxValue = Math.max(...traffic.map((item) => item.clicks), 1);
  const points = traffic.map((item, index) => {
    const x = traffic.length <= 1 ? 0 : (index / (traffic.length - 1)) * width;
    const y = bottom - (item.clicks / maxValue) * (bottom - top);
    return { x, y, label: item.label };
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
  const fillPath = points.length > 0 ? `${linePath} L${width} ${bottom} L0 ${bottom} Z` : "";
  const markerIndexes = getEvenIndexes(points.length, 5);
  const labels = points.filter((_, index) => markerIndexes.has(index));

  return {
    linePath,
    fillPath,
    points: points.filter((_, index) => markerIndexes.has(index)),
    labels,
  };
};

const getEvenIndexes = (length: number, count: number) => {
  if (length <= 0) return new Set<number>();
  if (length <= count) return new Set(Array.from({ length }, (_, index) => index));

  return new Set(
    Array.from({ length: count }, (_, index) => Math.round((index / (count - 1)) * (length - 1)))
  );
};

const LinkList = ({ links }: { links: AnalyticsSummary["links"] }) => {
  const sortedLinks = [...links].sort((a, b) => b.totalClicks - a.totalClicks);

  if (sortedLinks.length === 0) {
    return (
      <div className="rounded-2xl bg-surface-container-low p-8 text-center text-on-surface-variant">
        No links have been added yet. Create your first link to start tracking activity.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedLinks.slice(0, 6).map((link, index) => (
        <div key={link.id} className="rounded-3xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-on-surface">{link.title}</p>
              <p className="mt-1 truncate text-sm text-on-surface-variant">{link.url}</p>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-on-surface-variant">
              <span className="rounded-full bg-surface-container px-3 py-1.5">
                {link.isActive ? "Active" : "Paused"}
              </span>
              <span>{formatCompact(link.totalClicks)} clicks</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Insights;
