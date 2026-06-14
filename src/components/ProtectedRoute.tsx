import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authService } from "../services/authService";

const ProtectedRoute: React.FC = () => {
  const location = useLocation();

  if (!authService.getToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
