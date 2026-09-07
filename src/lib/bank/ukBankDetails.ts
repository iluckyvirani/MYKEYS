export type UkBankDetails = {
  bankAccountHolder: string;
  bankSortCode: string;
  bankAccountNumber: string;
  bankName: string;
};

export const EMPTY_UK_BANK_DETAILS: UkBankDetails = {
  bankAccountHolder: "",
  bankSortCode: "",
  bankAccountNumber: "",
  bankName: "",
};

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

/** Format as XX-XX-XX while the user types. */
export function formatUkSortCode(value: string) {
  const digits = digitsOnly(value).slice(0, 6);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

export function formatUkAccountNumber(value: string) {
  return digitsOnly(value).slice(0, 8);
}

export function normalizeUkBankDetails(input: {
  bankAccountHolder?: string | null;
  bankSortCode?: string | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
}): UkBankDetails {
  return {
    bankAccountHolder: (input.bankAccountHolder || "").trim(),
    bankSortCode: formatUkSortCode(input.bankSortCode || ""),
    bankAccountNumber: formatUkAccountNumber(input.bankAccountNumber || ""),
    bankName: (input.bankName || "").trim(),
  };
}

export function validateUkBankDetails(details: UkBankDetails): string | null {
  if (!details.bankAccountHolder || details.bankAccountHolder.length < 2) {
    return "Enter the account holder name as it appears on the UK bank account.";
  }
  if (details.bankAccountHolder.length > 70) {
    return "Account holder name must be 70 characters or fewer.";
  }
  if (digitsOnly(details.bankSortCode).length !== 6) {
    return "Enter a UK sort code in the format 00-00-00.";
  }
  if (details.bankAccountNumber.length !== 8) {
    return "Enter an 8-digit UK account number.";
  }
  if (details.bankName && details.bankName.length > 80) {
    return "Bank name must be 80 characters or fewer.";
  }
  return null;
}
