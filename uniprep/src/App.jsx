import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import BranchPage from "./pages/BranchPage";
import SubjectListPage from "./pages/SubjectListPage";
import SubjectPage from "./pages/SubjectPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/branches" element={<BranchPage />} />
      <Route path="/branch/:branchId/subjects" element={<SubjectListPage />} />
      <Route path="/subject/:subjectId" element={<SubjectPage />} />
    </Routes>
  );
}
