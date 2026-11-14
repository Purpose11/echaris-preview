import type { CustomerKycData } from "@/api/customer/types";
import { getStoredDoneKyc } from "@/utils/authHelper";

export function needsKyc(data: CustomerKycData | null | undefined): boolean {
  return !data?.doneKyc;
}

export function canResubmitKyc(data: CustomerKycData | null | undefined): boolean {
  if (!data?.doneKyc) return true;
  const latest = data.kycDocuments?.[0];
  return latest?.reviewStatus === "REJECTED";
}

/**
 * After login: use `doneKyc` saved on the session (from login response).
 * Avoids calling the KYC endpoint just to choose dashboard vs verify.
 */
export function resolvePostAuthPath(): "/dashboard" | "/verify" {
  return getStoredDoneKyc() ? "/dashboard" : "/verify";
}
