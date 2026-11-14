/** Receiving account shown in manual-payment dialogs and sent on confirm. */
export const ECHARIS_BANK_ACCOUNT = {
  number: import.meta.env.VITE_ECHARIS_BANK_ACCOUNT_NUMBER?.trim() || "1072094765",
  name:
    import.meta.env.VITE_ECHARIS_BANK_ACCOUNT_NAME?.trim() || "Echaris Trading Limited",
  bank: import.meta.env.VITE_ECHARIS_BANK_NAME?.trim() || "Moniepoint",
} as const;

export function echarisBankPaymentFields() {
  return {
    bankName: ECHARIS_BANK_ACCOUNT.bank,
    accountName: ECHARIS_BANK_ACCOUNT.name,
    accountNumber: ECHARIS_BANK_ACCOUNT.number,
  };
}
