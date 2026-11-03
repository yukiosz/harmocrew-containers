import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const location = useLocation();
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div className="empty-state">Carregando ambiente HarmoCrew...</div>;
  }
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
