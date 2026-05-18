import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import { LivePreviewModal } from "../../pages/livePreview";

const AuthLayout: React.FC = () => {
  const { pathname } = useLocation();

  const noSidebarRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/welcome"];
  const routesWithSidebar = [
    "/dashboard",
    "/links",
    "/insights",
    "/profile-settings",
    "/addlink",
    "/add-link",
    "/old-dashboard",
  ];

  const showSidebar =
    !noSidebarRoutes.includes(pathname) &&
    routesWithSidebar.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      {showSidebar && <Sidebar onOpenPreview={() => setIsPreviewOpen(true)} />}

      <main className={`min-h-screen ${showSidebar ? "pb-20 lg:pb-0 lg:pl-[248px] xl:pl-[256px]" : ""}`}>
        <Outlet />
      </main>

      <LivePreviewModal open={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />
    </div>
  );
};

export default AuthLayout;
