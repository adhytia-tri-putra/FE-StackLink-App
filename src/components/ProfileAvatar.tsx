import React, { useEffect, useState } from "react";
import { getAvatarInitials } from "../lib/profile";

type ProfileAvatarProps = {
  avatarUrl?: string | null;
  name?: string | null;
  username?: string | null;
  className?: string;
  textClassName?: string;
  alt?: string;
};

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  avatarUrl,
  name,
  username,
  className = "h-12 w-12",
  textClassName = "text-base",
  alt,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const cleanedUrl = avatarUrl?.trim();
  const showImage = Boolean(cleanedUrl) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [cleanedUrl]);

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-fixed text-primary shadow-[inset_0_0_0_1px_rgba(35,136,255,0.10)] ${className}`}
      aria-label={alt || name || username || "Profile avatar"}
    >
      {showImage ? (
        <img
          src={cleanedUrl}
          alt={alt || name || username || "Profile avatar"}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className={`font-semibold leading-none ${textClassName}`}>
          {getAvatarInitials(name, username)}
        </span>
      )}
    </div>
  );
};

export default ProfileAvatar;
