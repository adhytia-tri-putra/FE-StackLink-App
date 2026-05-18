import { apiRequest } from "../api/client";

export type AnalyticsPeriod = "7d" | "30d" | "90d";

export interface AnalyticsSummaryLink {
  id: string;
  title: string;
  url: string;
  isActive?: boolean;
  totalClicks: number;
  uniqueVisitors?: number;
  lastClickedAt: string | null;
}

export interface AnalyticsTrafficPoint {
  date: string;
  label: string;
  clicks: number;
  uniqueVisitors: number;
}

export interface AnalyticsDeviceSplit {
  device: "Mobile" | "Desktop" | "Tablet" | string;
  clicks: number;
  percentage: number;
}

export interface AnalyticsReferrer {
  source: string;
  clicks: number;
  percentage: number;
}

export interface AnalyticsSummary {
  period: AnalyticsPeriod;
  range: {
    from: string;
    to: string;
    previousFrom: string;
    previousTo: string;
  };
  totalClicks: number;
  previousTotalClicks: number;
  totalLinks: number;
  activeLinks: number;
  totalUniqueVisitors: number;
  previousUniqueVisitors: number;
  avgCtr: number;
  previousAvgCtr: number;
  changes: {
    clicks: number;
    uniqueVisitors: number;
    avgCtr: number;
  };
  links: AnalyticsSummaryLink[];
  traffic: AnalyticsTrafficPoint[];
  deviceSplit: AnalyticsDeviceSplit[];
  referrers: AnalyticsReferrer[];
}

export interface AnalyticsUpdatePayload {
  linkId: string;
  referrer?: string | null;
  deviceType?: string | null;
  clickedAt?: string;
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function normalizeDeviceType(deviceType?: string | null) {
  if (!deviceType) return undefined;
  const normalized = deviceType.trim();
  if (normalized === "Mobile" || normalized === "Desktop" || normalized === "Tablet") {
    return normalized;
  }
  return normalized;
}

function updateReferrers(referrers: AnalyticsReferrer[], referrer?: string | null) {
  if (!referrer) return referrers;
  const updated = referrers.map((item) => ({ ...item }));
  const existing = updated.find((item) => item.source === referrer);

  if (existing) {
    existing.clicks += 1;
  } else {
    updated.unshift({ source: referrer, clicks: 1, percentage: 0 });
  }

  const total = Math.max(updated.reduce((sum, item) => sum + item.clicks, 0), 1);
  return updated
    .map((item) => ({ ...item, percentage: Math.round((item.clicks / total) * 100) }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);
}

export function applyRealtimeAnalyticsUpdate(
  summary: AnalyticsSummary,
  payload: AnalyticsUpdatePayload
): AnalyticsSummary {
  const clickedAt = payload.clickedAt ? new Date(payload.clickedAt) : new Date();
  const clickedDateKey = clickedAt.toISOString().slice(0, 10);
  const totalClicks = summary.totalClicks + 1;
  const avgCtr = summary.totalUniqueVisitors > 0 ? (totalClicks / summary.totalUniqueVisitors) * 100 : summary.avgCtr;

  const links = summary.links.map((link) =>
    link.id === payload.linkId
      ? {
          ...link,
          totalClicks: link.totalClicks + 1,
          lastClickedAt: payload.clickedAt ?? new Date().toISOString(),
        }
      : link
  );

  const traffic = summary.traffic.map((point) =>
    point.date === clickedDateKey ? { ...point, clicks: point.clicks + 1 } : point
  );

  const deviceSplit = payload.deviceType
    ? summary.deviceSplit.map((device) =>
        device.device === normalizeDeviceType(payload.deviceType)
          ? { ...device, clicks: device.clicks + 1 }
          : device
      )
    : summary.deviceSplit;
  const totalDeviceClicks = Math.max(deviceSplit.reduce((sum, device) => sum + device.clicks, 0), 1);

  const referrers = updateReferrers(summary.referrers, payload.referrer);

  return {
    ...summary,
    totalClicks,
    avgCtr,
    changes: {
      ...summary.changes,
      clicks: percentageChange(totalClicks, summary.previousTotalClicks),
    },
    links,
    traffic,
    deviceSplit: deviceSplit.map((device) => ({
      ...device,
      percentage: Math.round((device.clicks / totalDeviceClicks) * 100),
    })),
    referrers,
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const buildAnalyticsSocketUrl = (token?: string) => {
  const query = token ? `?token=${encodeURIComponent(token)}` : "";

  if (API_BASE_URL) {
    const baseUrl = API_BASE_URL.replace(/\/$/, "");
    return `${baseUrl.replace(/^http/, "ws")}/api/analytics/socket${query}`;
  }

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/api/analytics/socket${query}`;
};

export const analyticsService = {
  getSummary: async (period?: AnalyticsPeriod): Promise<AnalyticsSummary> => {
    const query = period ? `?period=${period}` : "";
    const response = await apiRequest(`/api/analytics/summary${query}`, {
      method: "GET",
    });

    if (!response.success) {
      throw new Error(response.message || "Gagal mengambil insight");
    }

    return response.data;
  },

  subscribe: (onEvent: (event: { type: string; payload: any }) => void): WebSocket => {
    const token = localStorage.getItem("stacklink_token");
    const socketUrl = buildAnalyticsSocketUrl(token ?? undefined);
    const socket = new WebSocket(socketUrl);

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        onEvent({ type: data.type || "message", payload: data.payload });
      } catch {
        onEvent({ type: "message", payload: {} });
      }
    };

    socket.addEventListener("message", handleMessage);
    socket.addEventListener("error", (error) => {
      console.warn("WebSocket analytics subscription error", error);
    });

    return socket;
  },
};
