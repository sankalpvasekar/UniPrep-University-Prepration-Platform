import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export function isAuthenticated() {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return Boolean(token && user);
  } catch (_) {
    return false;
  }
}

export function RequireAuth({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

export function RedirectIfAuth({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
