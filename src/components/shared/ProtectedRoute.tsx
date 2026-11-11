import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { isAuthenticated } from "@/utils/authHelper";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  redirectTo = "/admin/login",
}: ProtectedRouteProps) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
