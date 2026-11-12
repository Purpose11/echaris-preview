import { getCustomerKyc } from "@/api/customer/customer";
import type { CustomerKycData } from "@/api/customer/types";
import { normalizeError } from "@/utils/normalizeError";

export function needsKyc(data: CustomerKycData | null | undefined): boolean {
  return !data?.doneKyc;
}

export function canResubmitKyc(data: CustomerKycData | null | undefined): boolean {
  if (!data?.doneKyc) return true;
  const latest = data.kycDocuments?.[0];
  return latest?.reviewStatus === "REJECTED";
}

/** After login/register: dashboard if KYC submitted, otherwise /verify. */
export async function resolvePostAuthPath(): Promise<"/dashboard" | "/verify"> {
  try {
    const res = await getCustomerKyc();
    if (res.success && res.data && !needsKyc(res.data)) {
      return "/dashboard";
    }
  } catch (error) {
    // Missing KYC record often 404s — treat as incomplete.
    const message = normalizeError(error).toLowerCase();
    if (!message.includes("404") && !message.includes("not found")) {
      console.warn("KYC status check failed:", message);
    }
  }
  return "/verify";
}
