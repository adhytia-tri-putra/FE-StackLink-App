import { apiRequest } from "../api/client";

export interface LinkData {
  id: string;
  title: string;
  url: string;
  active: boolean;
  isActive?: boolean;
  icon?: string | null;
  position: number;
  blockType?: string;
  description?: string | null;
}

export interface ProfileData {
  username: string;
  email?: string;
  name?: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string | null;
  theme?: string;
  bgColor?: string;
  bgGradientStart?: string;
  bgGradientEnd?: string;
  textColor?: string;
  customColor?: string;
  seoTitle?: string;
  seoDescription?: string;
  socialImage?: string;
  customDomain?: string;
  googleAnalyticsId?: string;
  metaPixelId?: string;
  tiktokPixelId?: string;
  plan?: string;
  planStatus?: string;
  role?: string;
  suspendedAt?: string | null;
  links?: LinkData[];
}

export interface ProfileUpdatePayload {
  name?: string;
  headline?: string;
  bio?: string;
  avatar?: string | null;
}

export interface ThemeUpdatePayload {
  bgType?: "solid" | "gradient";
  bgColor?: string;
  bgGradientStart?: string;
  bgGradientEnd?: string;
  textColor?: string;
  buttonColor?: string;
}

const mapUserToProfile = (user: any): ProfileData => ({
  username: user.username,
  email: user.email,
  name: user.name,
  headline: user.profile?.headline ?? user.headline ?? "",
  bio: user.profile?.bio ?? user.bio ?? "",
  avatarUrl: user.profile?.avatar ?? user.avatar ?? null,
  theme: user.bgType,
  bgColor: user.bgColor ?? "#eef6ff",
  bgGradientStart: user.bgGradientStart ?? "#eef6ff",
  bgGradientEnd: user.bgGradientEnd ?? "#ffffff",
  textColor: user.textColor ?? "#1a1c1a",
  customColor: user.buttonColor ?? "#2388ff",
  seoTitle: user.seoTitle ?? "",
  seoDescription: user.seoDescription ?? "",
  socialImage: user.socialImage ?? "",
  customDomain: user.customDomain ?? "",
  googleAnalyticsId: user.googleAnalyticsId ?? "",
  metaPixelId: user.metaPixelId ?? "",
  tiktokPixelId: user.tiktokPixelId ?? "",
  plan: user.plan ?? "FREE",
  planStatus: user.planStatus ?? "ACTIVE",
  role: user.role ?? "USER",
  suspendedAt: user.suspendedAt ?? null,
  links: user.links?.map((link: any) => ({
    id: link.id,
    title: link.title,
    url: link.url,
    icon: link.icon ?? null,
    active: link.active ?? link.isActive ?? true,
    isActive: link.isActive ?? link.active ?? true,
    position: link.position,
    blockType: link.blockType ?? "LINK",
    description: link.description ?? null,
  })),
});

export const profileService = {
  reportPublicProfile: async (username: string, reason: string, details: string) => {
    const response = await apiRequest(`/u/${encodeURIComponent(username)}/report`, { method: "POST", body: JSON.stringify({ reason, details }) });
    return response.message as string;
  },
  getMyProfile: async (): Promise<ProfileData> => {
    const response = await apiRequest("/api/profiles/me", { method: "GET" });
    if (!response.success) {
      throw new Error(response.message || "Gagal memuat profil");
    }

    return mapUserToProfile(response.data);
  },

  updateProfile: async (payload: ProfileUpdatePayload): Promise<ProfileData> => {
    const response = await apiRequest("/api/profiles/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    if (!response.success) throw new Error(response.message || "Gagal memperbarui profil");
    return mapUserToProfile(response.data);
  },

  updateTheme: async (payload: ThemeUpdatePayload) => {
    const response = await apiRequest("/api/profiles/theme", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (!response.success) throw new Error(response.message || "Gagal memperbarui tema");
    return response.data;
  },

  updatePublishing: async (payload: Partial<ProfileData>): Promise<ProfileData> => {
    const response = await apiRequest("/api/profiles/publishing", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return mapUserToProfile(response.data);
  },

  getPublishingDiagnostics: async () => {
    const response = await apiRequest("/api/profiles/publishing/diagnostics", { method: "GET" });
    return response.data;
  },

  getPreviewProfile: async (): Promise<ProfileData> => {
    const response = await apiRequest("/api/profiles/preview", { method: "GET" });
    if (!response.success) {
      throw new Error(response.message || "Gagal memuat preview profil");
    }

    return mapUserToProfile(response.data);
  },

  getPublicProfile: async (username: string): Promise<ProfileData> => {
    const response = await apiRequest(`/u/${username}`, { method: "GET" });
    if (!response || !response.success) {
      throw new Error(response?.message || "Gagal memuat profil publik");
    }

    const data = response.data;
    return {
      username: data.username,
      name: data.name,
      headline: data.headline,
      bio: data.bio,
      avatarUrl: data.avatar,
      theme: data.bgType,
      bgColor: data.bgColor,
      bgGradientStart: data.bgGradientStart,
      bgGradientEnd: data.bgGradientEnd,
      textColor: data.textColor,
      customColor: data.buttonColor,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      socialImage: data.socialImage,
      customDomain: data.customDomain,
      googleAnalyticsId: data.googleAnalyticsId,
      metaPixelId: data.metaPixelId,
      tiktokPixelId: data.tiktokPixelId,
      links: data.links?.map((link: any) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        icon: link.icon ?? null,
        active: true,
        isActive: true,
        position: link.position,
      })),
    };
  },

  getPublicProfileByDomain: async (domain: string): Promise<ProfileData> => {
    const response = await apiRequest(`/u/domain/${encodeURIComponent(domain)}`, { method: "GET" });
    const data = response.data;
    return {
      username: data.username, name: data.name, headline: data.headline, bio: data.bio,
      avatarUrl: data.avatar, theme: data.bgType, bgColor: data.bgColor,
      bgGradientStart: data.bgGradientStart, bgGradientEnd: data.bgGradientEnd,
      textColor: data.textColor, customColor: data.buttonColor, seoTitle: data.seoTitle,
      seoDescription: data.seoDescription, socialImage: data.socialImage, customDomain: data.customDomain,
      googleAnalyticsId: data.googleAnalyticsId, metaPixelId: data.metaPixelId, tiktokPixelId: data.tiktokPixelId,
      links: data.links?.map((link: any) => ({ ...link, active: true, isActive: true })),
    };
  },

  saveProfile: async (data: ProfileData): Promise<{ success: boolean }> => {
    const response = await apiRequest("/api/profiles/me", {
      method: "PATCH",
      body: JSON.stringify({
        headline: data.headline,
        bio: data.bio,
        name: data.name,
        avatar: data.avatarUrl,
      }),
    });

    if (!response.success) {
      throw new Error(response.message || "Gagal menyimpan profil");
    }

    return response;
  },
};
