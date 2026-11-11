import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { isAuthenticated } from "@/utils/authHelper";

interface UserProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function UserProtectedRoute({
  children,
  redirectTo = "/login",
}: UserProtectedRouteProps) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
