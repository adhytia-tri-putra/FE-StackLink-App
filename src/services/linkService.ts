import { apiRequest } from "../api/client";

export interface EditLinkPayload {
  title?: string;
  url?: string;
  icon?: string | null;
  isActive?: boolean;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string | null;
  isActive: boolean;
  position: number;
  clicks?: number;
}

export const linkService = {
  getLinks: async (): Promise<LinkItem[]> => {
    const response = await apiRequest("/api/links", { method: "GET" });
    if (!response.success) throw new Error(response.message || "Gagal memuat links");
    return response.data;
  },

  createLink: async (title: string, url: string, icon?: string | null) => {
    const response = await apiRequest("/api/links", {
      method: "POST",
      body: JSON.stringify({ title, url, icon }),
    });

    if (!response.success) throw new Error(response.message || "Gagal membuat link");
    return response.data;
  },

  updateLink: async (id: string, payload: EditLinkPayload) => {
    const response = await apiRequest(`/api/links/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (!response.success) throw new Error(response.message || "Gagal memperbarui link");
    return response.data;
  },

  deleteLink: async (id: string) => {
    const response = await apiRequest(`/api/links/${id}`, { method: "DELETE" });
    if (!response.success) throw new Error(response.message || "Gagal menghapus link");
    return response;
  },

  reorderLinks: async (links: Array<{ id: string; position: number }>) => {
    const response = await apiRequest("/api/links/reorder", {
      method: "PATCH",
      body: JSON.stringify({ links }),
    });
    if (!response.success) throw new Error(response.message || "Gagal mengurutkan link");
    return response;
  },

  trackClick: async (username: string, linkId: string) => {
    const payload = {
      referrer: typeof document !== "undefined" ? document.referrer : "",
      deviceType: /ipad|tablet|kindle|silk|playbook/i.test(navigator.userAgent)
        ? "Tablet"
        : /mobile|iphone|android|ipod|blackberry|phone/i.test(navigator.userAgent)
        ? "Mobile"
        : "Desktop",
    };

    return apiRequest(`/u/${username}/links/${linkId}/click`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
