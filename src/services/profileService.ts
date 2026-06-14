import { apiRequest } from "../api/client";

export interface LinkData {
  id: string;
  title: string;
  url: string;
  active: boolean;
  isActive?: boolean;
  icon?: string | null;
  position: number;
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
  links: user.links?.map((link: any) => ({
    id: link.id,
    title: link.title,
    url: link.url,
    icon: link.icon ?? null,
    active: link.active ?? link.isActive ?? true,
    isActive: link.isActive ?? link.active ?? true,
    position: link.position,
  })),
});

export const profileService = {
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
