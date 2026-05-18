import type { ProfileData } from "../services/profileService";

export const PROFILE_UPDATED_EVENT = "stacklink:profile-updated";

const toTitleCase = (value: string) =>
  value
    .split(/[_.\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const getDisplayName = (profile?: Pick<ProfileData, "name" | "username"> | null, fallback = "Creator") => {
  const source = profile?.name || profile?.username || fallback;
  return toTitleCase(source);
};

export const getAvatarInitials = (name?: string | null, username?: string | null) => {
  const source = name?.trim() || username?.trim() || "Creator";
  const parts = source.split(/[_.\s-]+/).filter(Boolean);

  if (parts.length === 0) return "C";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export const emitProfileUpdated = (profile: ProfileData) => {
  window.dispatchEvent(new CustomEvent<ProfileData>(PROFILE_UPDATED_EVENT, { detail: profile }));
};
