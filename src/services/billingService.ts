import { apiRequest } from "../api/client";

export type BillingStatus = {
  plan: "FREE" | "PRO";
  status: string;
  usage: { links: number; limit: number | null };
  checkoutConfigured: boolean;
};

export const billingService = {
  async getStatus(): Promise<BillingStatus> {
    const response = await apiRequest("/api/billing/status");
    return response.data;
  },
  async checkout(): Promise<string> {
    const response = await apiRequest("/api/billing/checkout", { method: "POST" });
    return response.data.url;
  },
};
