export type DocumentDateValidationOptions = {
  requireIssueDate?: boolean;
  requireExpiryDate?: boolean;
};

/**
 * Validates issue/expiry dates for property documents.
 * Returns an error message or empty string if valid.
 */
export function getDocumentDateValidationError(
  issuedDate: string,
  expiryDate: string,
  options: DocumentDateValidationOptions = {}
): string {
  const { requireIssueDate = false, requireExpiryDate = false } = options;

  if (requireIssueDate && !issuedDate.trim()) {
    return "Issue date is required.";
  }
  if (requireExpiryDate && !expiryDate.trim()) {
    return "Expiry date is required.";
  }

  if (issuedDate.trim() && expiryDate.trim()) {
    const issued = parseDateOnly(issuedDate);
    const expiry = parseDateOnly(expiryDate);
    if (!issued || !expiry) {
      return "Please enter valid dates.";
    }
    if (expiry.getTime() <= issued.getTime()) {
      return "Expiry date must be after the issue date.";
    }
  }

  return "";
}

function parseDateOnly(value: string): Date | null {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}
