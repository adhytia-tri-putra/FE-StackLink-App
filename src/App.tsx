import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout & Pages
import AuthLayout from "./components/layouts/authLayout";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import ForgotPassword from "./pages/auth/forgotpassword";
import ResetPassword from "./pages/auth/resetpassword";
import Welcome from "./pages/welcome";
import AddLink from "./pages/addlink";
import Dashboard from "./pages/dashboard";
import DashboardOverview from "./pages/dashboardOverview";
import LinksPage from "./pages/linksPage";
import Insights from "./pages/insights";
import Preview from "./pages/preview";
import ProfileSettings from "./pages/profileSettings";
import ProtectedRoute from "./components/ProtectedRoute";
import AccountSettings from "./pages/accountSettings";
import VerifyEmail from "./pages/auth/verifyEmail";
import PublishingSettings from "./pages/publishingSettings";
import ToastHost from "./components/ToastHost";
import InfoPage from "./pages/infoPage";
import ErrorBoundary from "./components/ErrorBoundary";

const App: React.FC = () => {
  const isCustomHost = !["localhost", "127.0.0.1"].includes(window.location.hostname) && !window.location.hostname.endsWith("netlify.app");
  return (
    <ErrorBoundary><BrowserRouter>
      <ToastHost />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={isCustomHost ? <Preview /> : <Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/privacy" element={<InfoPage />} />
          <Route path="/terms" element={<InfoPage />} />
          <Route path="/help" element={<InfoPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/links" element={<LinksPage />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/publishing" element={<PublishingSettings />} />
            <Route path="/addlink" element={<AddLink />} />
            <Route path="/add-link" element={<AddLink />} />
            <Route path="/preview" element={<Preview />} />
            <Route path="/preview-links" element={<Preview />} />
            <Route path="/old-dashboard" element={<Dashboard />} />
          </Route>
          <Route path="/:username" element={<Preview />} />
        </Route>
      </Routes>
    </BrowserRouter></ErrorBoundary>
  );
};

export default App;
