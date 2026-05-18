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

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/profile-settings" element={<ProfileSettings />} />
          <Route path="/addlink" element={<AddLink />} />
          <Route path="/add-link" element={<AddLink />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/preview-links" element={<Preview />} />
          <Route path="/old-dashboard" element={<Dashboard />} />
          <Route path="/:username" element={<Preview />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
