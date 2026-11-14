import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { getStoredDoneKyc, isAuthenticated } from "@/utils/authHelper";

interface KycProtectedRouteProps {
  children: ReactNode;
}

/** Blocks the client dashboard until KYC has been submitted (`doneKyc` in session). */
export function KycProtectedRoute({ children }: KycProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!getStoredDoneKyc()) {
    return <Navigate to="/verify" replace />;
  }

  return <>{children}</>;
}
