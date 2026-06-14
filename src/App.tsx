import React, { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ConfirmProvider } from "./components/ConfirmProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastHost from "./components/ToastHost";
import AuthLayout from "./components/layouts/authLayout";

const Login = lazy(() => import("./pages/auth/login"));
const Register = lazy(() => import("./pages/auth/register"));
const ForgotPassword = lazy(() => import("./pages/auth/forgotpassword"));
const ResetPassword = lazy(() => import("./pages/auth/resetpassword"));
const VerifyEmail = lazy(() => import("./pages/auth/verifyEmail"));
const Welcome = lazy(() => import("./pages/welcome"));
const AddLink = lazy(() => import("./pages/addlink"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const DashboardOverview = lazy(() => import("./pages/dashboardOverview"));
const LinksPage = lazy(() => import("./pages/linksPage"));
const Insights = lazy(() => import("./pages/insights"));
const Preview = lazy(() => import("./pages/preview"));
const ProfileSettings = lazy(() => import("./pages/profileSettings"));
const AccountSettings = lazy(() => import("./pages/accountSettings"));
const PublishingSettings = lazy(() => import("./pages/publishingSettings"));
const InfoPage = lazy(() => import("./pages/infoPage"));
const Billing = lazy(() => import("./pages/billing"));
const Admin = lazy(() => import("./pages/admin"));

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center" role="status">
    Loading...
  </div>
);

const App: React.FC = () => {
  const isCustomHost =
    !["localhost", "127.0.0.1"].includes(window.location.hostname) &&
    !window.location.hostname.endsWith("netlify.app");

  return (
    <ErrorBoundary>
      <ConfirmProvider>
        <BrowserRouter>
          <ToastHost />
          <Suspense fallback={<RouteFallback />}>
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
                  <Route path="/billing" element={<Billing />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/addlink" element={<AddLink />} />
                  <Route path="/add-link" element={<AddLink />} />
                  <Route path="/preview" element={<Preview />} />
                  <Route path="/preview-links" element={<Preview />} />
                  <Route path="/old-dashboard" element={<Dashboard />} />
                </Route>
                <Route path="/:username" element={<Preview />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ConfirmProvider>
    </ErrorBoundary>
  );
};

export default App;
