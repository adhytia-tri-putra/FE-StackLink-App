import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { profileService, ProfileData } from "../services/profileService";
import ProfileAvatar from "./ProfileAvatar";
import { getDisplayName, PROFILE_UPDATED_EVENT } from "../lib/profile";

type IconProps = React.SVGProps<SVGSVGElement>;

const iconClass = "h-5 w-5";

const IconDashboard = ({ className = iconClass, ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm12 0h6v6h-6v-6z" />
  </svg>
);

const IconLink = ({ className = iconClass, ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const IconInsights = ({ className = iconClass, ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const IconSettings = ({ className = iconClass, ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconEye = ({ className = iconClass, ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const IconHelp = ({ className = iconClass, ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconUser = ({ className = iconClass, ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm-8 8a8 8 0 0116 0h-16z" />
  </svg>
);

const IconLogout = ({ className = iconClass, ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

type SidebarProps = {
  onOpenPreview?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ onOpenPreview }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const navItems = [
    { icon: IconDashboard, label: "Dashboard", path: "/dashboard", match: ["/dashboard"] },
    { icon: IconLink, label: "Links", path: "/links", match: ["/links", "/addlink", "/add-link"] },
    { icon: IconInsights, label: "Insights", path: "/insights", match: ["/insights"] },
    { icon: IconSettings, label: "Profile Settings", path: "/profile-settings", match: ["/profile-settings"] },
    { icon: IconUser, label: "Account Settings", path: "/account-settings", match: ["/account-settings"] },
    { icon: IconEye, label: "Publishing", path: "/publishing", match: ["/publishing"] },
    { icon: IconInsights, label: "Plans & Billing", path: "/billing", match: ["/billing"] },
  ];

  const isActive = (matches: string[]) => matches.some((path) => location.pathname === path);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (!authService.getToken()) return;

      try {
        const fetchedProfile = await profileService.getMyProfile();
        if (active) setProfile(fetchedProfile);
      } catch (error) {
        console.warn("Failed to load sidebar profile:", error);
      }
    };

    const handleProfileUpdated = (event: Event) => {
      const updatedProfile = (event as CustomEvent<ProfileData>).detail;
      setProfile(updatedProfile);
    };

    loadProfile();
    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);

    return () => {
      active = false;
      window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const displayName = getDisplayName(profile);

  return (
    <>
      <aside className="fixed bottom-0 left-0 top-0 z-50 hidden w-[248px] flex-col rounded-r-[24px] border-r border-outline-variant/70 bg-surface-container-lowest shadow-soft xl:w-[256px] lg:flex">
        <div className="px-5 pb-5 pt-6">
          <div className="flex items-center gap-3">
            <ProfileAvatar
              avatarUrl={profile?.avatarUrl}
              name={profile?.name}
              username={profile?.username}
              className="h-12 w-12"
              textClassName="text-base"
            />
            <div className="min-w-0">
              <p className="text-[24px] font-semibold leading-tight text-primary">StackLink</p>
              <p className="mt-1 text-sm font-medium text-on-surface">{displayName}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-5 py-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.match);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-[15px] font-medium transition-all ${
                  active
                    ? "bg-secondary-container text-secondary shadow-[inset_0_0_0_1px_rgba(30,191,201,0.08)]"
                    : "text-on-surface hover:bg-surface-container-low hover:text-primary"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto px-5 pb-5">
          <button
            onClick={() => navigate("/preview")}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-[15px] font-semibold text-primary-on shadow-[0_10px_20px_rgba(35,136,255,0.20)] transition-all hover:bg-primary/95 active:translate-y-0.5"
          >
            <IconEye className="h-5 w-5" />
            Preview Link
          </button>

          <div className="mt-6 border-t border-outline-variant/70 pt-5">
            <button onClick={() => navigate("/help")} className="flex w-full items-center gap-4 rounded-full px-4 py-2.5 text-[15px] font-medium text-on-surface transition-colors hover:bg-surface-container-low">
              <IconHelp className="h-5 w-5" />
              Help
            </button>
            <button
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-4 rounded-full px-4 py-2.5 text-[15px] font-medium text-on-surface transition-colors hover:bg-error/10 hover:text-error"
            >
              <IconLogout className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <nav className="fixed bottom-2 left-2 right-2 z-50 grid grid-cols-5 gap-1 rounded-[20px] border border-outline-variant/70 bg-surface-container-lowest/95 p-1.5 shadow-soft backdrop-blur lg:hidden">
        {navItems
          .filter((item) => !["Profile Settings", "Account Settings", "Publishing", "Plans & Billing"].includes(item.label))
          .map((item) => {
            const Icon = item.icon;
            const active = isActive(item.match);

            return (
              <button
                key={item.path}
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  navigate(item.path);
                }}
                className={`flex min-h-12 flex-col items-center justify-center rounded-2xl text-[10px] font-semibold transition-colors ${
                  active ? "bg-secondary-container text-secondary" : "text-on-surface-variant"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="mt-1 max-w-full truncate">{item.label.replace("Profile ", "")}</span>
              </button>
            );
          })}

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsAccountMenuOpen((current) => !current)}
            className="flex min-h-12 w-full flex-col items-center justify-center rounded-2xl text-[10px] font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <IconUser className="h-5 w-5" />
            <span className="mt-1 max-w-full truncate">Account</span>
          </button>

          {isAccountMenuOpen && (
            <div className="absolute bottom-full left-1/2 z-50 w-[200px] -translate-x-1/2 rounded-[20px] border border-outline-variant/70 bg-surface-container-lowest p-2 shadow-soft">
              <button
                type="button"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  navigate("/profile-settings");
                }}
                className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
              >
                <IconSettings className="h-4 w-4" />
                Design
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  navigate("/account-settings");
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
              >
                <IconUser className="h-4 w-4" />
                Account Settings
              </button>
              <button type="button" onClick={() => { setIsAccountMenuOpen(false); navigate("/publishing"); }} className="mt-1 flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"><IconEye className="h-4 w-4" />Publishing</button>
              <button
                type="button"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  handleLogout();
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-semibold text-error transition-colors hover:bg-error/10"
              >
                <IconLogout className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpenPreview?.()}
          className="flex min-h-12 flex-col items-center justify-center rounded-2xl bg-primary text-[10px] font-semibold text-primary-on transition-colors hover:bg-primary/95"
        >
          <IconEye className="h-5 w-5" />
          <span className="mt-1 max-w-full truncate">Preview</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
