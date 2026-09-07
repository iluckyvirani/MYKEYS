export type MortgageRepayment = {
  loanAmount: number;
  monthlyPayment: number;
  totalRepaid: number;
  totalInterest: number;
  months: number;
};

/** Standard UK repayment mortgage: monthly payment from loan, annual rate %, term years. */
export function calculateRepayment(
  loanAmount: number,
  annualRatePercent: number,
  termYears: number
): MortgageRepayment | null {
  const loan = Math.max(0, loanAmount);
  const years = Math.max(0, termYears);
  const months = Math.round(years * 12);
  if (loan <= 0 || months <= 0) return null;

  const monthlyRate = annualRatePercent / 100 / 12;
  let monthlyPayment: number;

  if (monthlyRate === 0) {
    monthlyPayment = loan / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    monthlyPayment = (loan * monthlyRate * factor) / (factor - 1);
  }

  const totalRepaid = monthlyPayment * months;
  return {
    loanAmount: loan,
    monthlyPayment,
    totalRepaid,
    totalInterest: Math.max(0, totalRepaid - loan),
    months,
  };
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function formatGbpExact(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}
