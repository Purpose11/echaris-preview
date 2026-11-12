import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useCustomerKyc } from "@/api/customer/hooks";
import { isAuthenticated } from "@/utils/authHelper";
import { needsKyc } from "@/utils/kycGate";

interface KycProtectedRouteProps {
  children: ReactNode;
}

/** Blocks the client dashboard until KYC has been submitted (`doneKyc`). */
export function KycProtectedRoute({ children }: KycProtectedRouteProps) {
  const kycQuery = useCustomerKyc(isAuthenticated());

  if (kycQuery.isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "var(--text-muted)",
          fontSize: 14,
        }}
      >
        Checking identity verification…
      </div>
    );
  }

  if (needsKyc(kycQuery.data?.data)) {
    return <Navigate to="/verify" replace />;
  }

  return <>{children}</>;
}
