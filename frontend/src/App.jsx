import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import BranchPage from "./pages/BranchPage";
import YearSelectionPage from "./pages/YearSelectionPage";
import SubjectListPage from "./pages/SubjectListPage";
import SubjectPage from "./pages/SubjectPage";
import { RequireAuth, RedirectIfAuth } from "./routes/AuthRoutes";

export default function App() {
  return (
    <Routes>
      {/* Public routes redirect to dashboard if already authenticated */}
      <Route path="/" element={<RedirectIfAuth><LandingPage /></RedirectIfAuth>} />
      <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
      <Route path="/signup" element={<RedirectIfAuth><SignupPage /></RedirectIfAuth>} />

      {/* Private routes require authentication */}
      <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
      <Route path="/branches" element={<RequireAuth><BranchPage /></RequireAuth>} />
      <Route path="/branch/:branchId/year-selection" element={<RequireAuth><YearSelectionPage /></RequireAuth>} />
      <Route path="/branch/:branchId/year/:yearId/subjects" element={<RequireAuth><SubjectListPage /></RequireAuth>} />
      <Route path="/subject/:subjectId" element={<RequireAuth><SubjectPage /></RequireAuth>} />
    </Routes>
  );
}
