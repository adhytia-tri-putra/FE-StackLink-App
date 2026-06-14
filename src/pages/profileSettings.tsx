import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { linkService, LinkItem } from "../services/linkService";
import { profileService, ProfileData } from "../services/profileService";
import ProfileAvatar from "../components/ProfileAvatar";
import { emitProfileUpdated, getDisplayName } from "../lib/profile";
import { PreviewSidebar } from "./livePreview";

type IconProps = React.SVGProps<SVGSVGElement>;

const IconArrowRight = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-6-6l6 6-6 6" />
  </svg>
);

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

const IconCheck = ({ className = "h-4 w-4", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
  </svg>
);

const buttonPresets = [
  { name: "Sky", color: "#2388ff", tint: "bg-primary-container" },
  { name: "Aqua", color: "#1ebfc9", tint: "bg-secondary-container" },
  { name: "Indigo", color: "#5d6bff", tint: "bg-tertiary-container" },
  { name: "Midnight", color: "#1a1c1a", tint: "bg-on-surface" },
];

const templates = [
  { id: "solid", name: "Soft Cards" },
  { id: "gradient", name: "Bold Gradient" },
] as const;

const gallery = [
  { id: "SOFT", name: "Soft Sky", bgType: "solid", start: "#eef6ff", end: "#ffffff", text: "#1a1c1a", button: "#2388ff" },
  { id: "BOLD", name: "Electric", bgType: "gradient", start: "#5d6bff", end: "#1ebfc9", text: "#ffffff", button: "#18213d" },
  { id: "MINIMAL", name: "Paper", bgType: "solid", start: "#f7f3eb", end: "#ffffff", text: "#29251f", button: "#725b3a" },
  { id: "MIDNIGHT", name: "Midnight", bgType: "gradient", start: "#101827", end: "#29364d", text: "#f8fafc", button: "#7dd3fc" },
] as const;

type TemplateId = (typeof templates)[number]["id"];

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });

const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [displayName, setDisplayName] = useState("Jane Doe");
  const [bio, setBio] = useState("Digital creator & wellness enthusiast sharing calm spaces and curated thoughts.");
  const [headline, setHeadline] = useState("Digital creator & wellness enthusiast");
  const [bgType, setBgType] = useState<TemplateId>("solid");
  const [bgColor, setBgColor] = useState("#eef6ff");
  const [gradientStart, setGradientStart] = useState("#eef6ff");
  const [gradientEnd, setGradientEnd] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#1a1c1a");
  const [selectedColor, setSelectedColor] = useState(buttonPresets[0].color);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [themeTemplate, setThemeTemplate] = useState("SOFT");
  const [fontFamily, setFontFamily] = useState("SYSTEM");
  const [backgroundImage, setBackgroundImage] = useState("");

  useEffect(() => {
    const initialize = async () => {
      if (!authService.getToken()) {
        navigate("/login");
        return;
      }

      try {
        const [fetchedProfile, fetchedLinks] = await Promise.all([
          profileService.getMyProfile(),
          linkService.getLinks(),
        ]);

        setProfile(fetchedProfile);
        setLinks(fetchedLinks);
        setDisplayName(getDisplayName(fetchedProfile, "Jane Doe"));
        setHeadline(fetchedProfile.headline || "Digital creator & wellness enthusiast");
        setBio(fetchedProfile.bio || "Digital creator & wellness enthusiast sharing calm spaces and curated thoughts.");
        setBgType(fetchedProfile.theme === "gradient" ? "gradient" : "solid");
        setBgColor(fetchedProfile.bgColor || "#eef6ff");
        setGradientStart(fetchedProfile.bgGradientStart || "#eef6ff");
        setGradientEnd(fetchedProfile.bgGradientEnd || "#ffffff");
        setTextColor(fetchedProfile.textColor || "#1a1c1a");
        setSelectedColor(fetchedProfile.customColor || buttonPresets[0].color);
        setThemeTemplate(fetchedProfile.themeTemplate || "SOFT");
        setFontFamily(fetchedProfile.fontFamily || "SYSTEM");
        setBackgroundImage(fetchedProfile.backgroundImage || "");
      } catch (error) {
        console.error("Failed to load profile settings:", error);
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
    return () => {
      if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const avatarUrl = avatarPreview || profile?.avatarUrl || null;
  const previewProfile: ProfileData = {
    username: profile?.username || "",
    name: displayName,
    headline,
    bio,
    avatarUrl,
    theme: bgType,
    bgColor,
    bgGradientStart: gradientStart,
    bgGradientEnd: gradientEnd,
    textColor,
    customColor: selectedColor,
    themeTemplate,
    fontFamily,
    backgroundImage,
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      setStatus("Avatar must be a JPG, PNG, or GIF image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus("Avatar max size is 5MB.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAvatarPreview(dataUrl);
      setStatus("Avatar ready. Save changes to sync it.");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus("");

    try {
      const updatedProfile = await profileService.updateProfile({
        name: displayName.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        ...(avatarPreview ? { avatar: avatarPreview } : {}),
      });
      await profileService.updateTheme({
        bgType,
        bgColor,
        bgGradientStart: gradientStart,
        bgGradientEnd: gradientEnd,
        textColor,
        buttonColor: selectedColor,
        themeTemplate,
        fontFamily,
        backgroundImage: backgroundImage || null,
      });
      const syncedProfile = {
        ...updatedProfile,
        theme: bgType,
        bgColor,
        bgGradientStart: gradientStart,
        bgGradientEnd: gradientEnd,
        textColor,
        customColor: selectedColor,
        themeTemplate,
        fontFamily,
        backgroundImage: backgroundImage || null,
        avatarUrl: avatarPreview || updatedProfile.avatarUrl,
      };
      setProfile(syncedProfile);
      setAvatarPreview(null);
      emitProfileUpdated(syncedProfile);
      setStatus("Changes saved.");
    } catch (error) {
      setStatus((error as Error).message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="mt-4 text-on-surface-variant">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-surface px-4 py-5 sm:px-5 lg:px-6 xl:px-7">
      <div className="w-full max-w-none">
        <div className="grid gap-6 min-[1280px]:grid-cols-[minmax(0,1fr)_430px] min-[1280px]:items-start">
          <div className="min-w-0">
            <header className="mb-6 max-w-[720px]">
              <h1 className="text-[30px] font-semibold leading-tight text-on-surface sm:text-[36px] xl:text-[40px]">
                Profile
              </h1>
            </header>

            <div className="space-y-5">
              <article className="rounded-[20px] border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-soft sm:p-5">
                <h2 className="text-[22px] font-medium leading-tight text-on-surface">Identity</h2>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <ProfileAvatar
                    avatarUrl={avatarUrl}
                    name={displayName}
                    username={profile?.username}
                    className="h-20 w-20 border-4 border-surface-container-low"
                    textClassName="text-xl"
                  />
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/gif"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full bg-surface-container px-5 py-2.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high"
                    >
                      Upload new image
                    </button>
                    <p className="mt-2 text-sm text-on-surface-variant">JPG, GIF or PNG. Max size of 5MB.</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <label className="block">
                    <span className="text-[15px] font-medium text-on-surface">Display Name</span>
                    <input
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-base text-on-surface outline-none transition focus:border-primary"
                    />
                  </label>

                  <label className="block">
                    <span className="flex items-center justify-between gap-4 text-[15px] font-medium text-on-surface">
                      Bio
                      <span className="text-sm font-normal text-on-surface-variant">{bio.length} / 150</span>
                    </span>
                    <textarea
                      rows={4}
                      maxLength={150}
                      value={bio}
                      onChange={(event) => setBio(event.target.value)}
                      className="mt-2 w-full resize-none rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-base leading-relaxed text-on-surface outline-none transition focus:border-primary"
                    />
                  </label>
                </div>
              </article>

              <article className="rounded-[20px] border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-soft sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-[22px] font-medium leading-tight text-on-surface">Appearance</h2>
                </div>
                <div className="mt-5 grid gap-4 xl:grid-cols-[280px_1fr]">
                  <div className="xl:col-span-2"><p className="text-[15px] font-medium text-on-surface">Theme gallery</p><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{gallery.map((item) => <button type="button" key={item.id} onClick={() => { setThemeTemplate(item.id); setBgType(item.bgType); setBgColor(item.start); setGradientStart(item.start); setGradientEnd(item.end); setTextColor(item.text); setSelectedColor(item.button); }} className={`rounded-2xl border-2 p-3 text-left ${themeTemplate === item.id ? "border-primary" : "border-outline-variant/50"}`}><span className="block h-16 rounded-xl" style={{ background: item.bgType === "gradient" ? `linear-gradient(145deg, ${item.start}, ${item.end})` : item.start }} /><span className="mt-2 block text-sm font-semibold">{item.name}</span></button>)}</div><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">Font<select value={fontFamily} onChange={(event) => setFontFamily(event.target.value)} className="mt-2 w-full rounded-xl bg-surface-container-low px-4 py-3"><option value="SYSTEM">System</option><option value="SERIF">Serif</option><option value="MONO">Monospace</option><option value="ROUNDED">Rounded</option></select></label><label className="text-sm font-medium">Background image URL<input value={backgroundImage} onChange={(event) => setBackgroundImage(event.target.value)} placeholder="https://..." className="mt-2 w-full rounded-xl bg-surface-container-low px-4 py-3" /></label></div></div>
                  <div>
                    <p className="text-[15px] font-medium text-on-surface">Template</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      {templates.map((template) => {
                        const selected = bgType === template.id;

                        return (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => setBgType(template.id)}
                            className={`relative overflow-hidden rounded-2xl border-2 p-3 text-left transition-all ${
                              selected ? "border-primary" : "border-outline-variant/50 hover:border-primary/50"
                            }`}
                          >
                            {selected && (
                              <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-on">
                                <IconCheck />
                              </span>
                            )}
                            <div
                              className="h-24 rounded-xl border border-outline-variant/40"
                              style={{
                                background:
                                  template.id === "gradient"
                                    ? `linear-gradient(145deg, ${gradientStart}, ${gradientEnd})`
                                    : bgColor,
                              }}
                            >
                              <div className="mx-auto mt-4 h-7 w-7 rounded-full border-2 border-white bg-primary-container" />
                              <div
                                className="mx-auto mt-3 h-6 w-[72%] rounded-full"
                                style={{
                                  backgroundColor: template.id === "gradient" ? selectedColor : "rgba(255,255,255,0.92)",
                                  boxShadow: `0 3px 0 ${template.id === "gradient" ? "rgba(0,0,0,0.12)" : "rgba(35,136,255,0.14)"}`,
                                }}
                              />
                            </div>
                            <span className="mt-2 block text-sm font-semibold text-on-surface">{template.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[15px] font-medium text-on-surface">Custom Colors</p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {bgType === "solid" ? (
                          <ColorField label="Background" value={bgColor} onChange={setBgColor} />
                        ) : (
                          <>
                            <ColorField label="Gradient Start" value={gradientStart} onChange={setGradientStart} />
                            <ColorField label="Gradient End" value={gradientEnd} onChange={setGradientEnd} />
                          </>
                        )}
                        <ColorField label="Text" value={textColor} onChange={setTextColor} />
                        <ColorField label="Button" value={selectedColor} onChange={setSelectedColor} />
                      </div>
                    </div>

                    <div>
                      <p className="text-[15px] font-medium text-on-surface">Button Presets</p>
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {buttonPresets.map((theme) => {
                          const selected = selectedColor === theme.color;

                          return (
                            <button
                              key={theme.name}
                              type="button"
                              onClick={() => setSelectedColor(theme.color)}
                              className={`relative rounded-2xl border-2 p-3 text-center transition-all ${
                                selected ? "border-primary" : "border-transparent hover:border-outline-variant"
                              }`}
                            >
                              {selected && (
                                <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-on">
                                  <IconCheck />
                                </span>
                              )}
                              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant/50 bg-surface-container-low">
                                <span className={`h-6 w-6 rounded-full ${theme.tint}`} />
                              </span>
                              <span className="mt-2 block text-[15px] font-medium text-on-surface">{theme.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <div className="hidden lg:block">
            <PreviewSidebar profile={previewProfile} links={links} />
          </div>
        </div>

        <div className="mt-5 grid gap-6 min-[1280px]:grid-cols-[minmax(0,1fr)_430px]">
          <div className="flex flex-col items-start gap-4 sm:items-end">
            {status && <p className="text-sm font-semibold text-on-surface-variant">{status}</p>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2.5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-on shadow-[0_10px_20px_rgba(35,136,255,0.20)] transition-all hover:bg-primary/95 active:translate-y-0.5 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
              <IconArrowRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

type ColorFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const ColorField = ({ label, value, onChange }: ColorFieldProps) => (
  <label className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest px-3 py-2.5">
    <span className="text-sm font-medium text-on-surface">{label}</span>
    <span className="flex items-center gap-2">
      <span className="font-mono text-xs font-semibold uppercase text-on-surface-variant">{value}</span>
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent p-0"
        aria-label={label}
      />
    </span>
  </label>
);

export default ProfileSettings;
