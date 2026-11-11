import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { getAdminRole, isAuthenticated } from "@/utils/authHelper";
import {
  type AdminRole,
  getDefaultAdminRoute,
  getFeatureForPath,
  getUnauthorizedRedirect,
  ROLE_FEATURES,
} from "@/utils/roleAccess";

interface RoleProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function RoleProtectedRoute({
  children,
  redirectTo = "/admin/login",
}: RoleProtectedRouteProps) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  const role = getAdminRole();
  if (!role || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    return <Navigate to={redirectTo} replace />;
  }

  const adminRole = role as AdminRole;
  const requiredFeature = getFeatureForPath(location.pathname);

  if (requiredFeature) {
    const allowed = ROLE_FEATURES[adminRole];
    if (!allowed.includes(requiredFeature)) {
      const redirect = getUnauthorizedRedirect(adminRole);
      if (redirect === location.pathname) {
        return <Navigate to={getDefaultAdminRoute(adminRole)} replace />;
      }
      return <Navigate to={redirect} replace />;
    }
  }

  return <>{children}</>;
}
