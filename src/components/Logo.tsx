import React from "react";
import logoImage from "../assets/logo-stacklink.png";

type LogoProps = {
  size?: "sm" | "md";
  className?: string;
};

const Logo: React.FC<LogoProps> = ({ size = "sm", className = "" }) => {
  const isMedium = size === "md";

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`rounded-xl bg-white shadow-sm ring-1 ring-[#d8e8ff] ${
          isMedium ? "h-20 w-20 p-3" : "h-16 w-16 p-2.5"
        }`}>
        <img
          src={logoImage}
          alt="StackLink logo"
          className="h-full w-full rounded-lg object-contain"
        />
      </div>
      <span
        className={`mt-1.5 font-semibold text-[#16304f] ${
          isMedium ? "text-xl" : "text-base"
        }`}>
        StackLink
      </span>
    </div>
  );
};

export default Logo;
