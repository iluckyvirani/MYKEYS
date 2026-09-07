"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function formatCommissionPercent(pct: number): string {
  return Number.isInteger(pct) ? `${pct}` : pct.toFixed(1);
}

export function useShortRentCommission(): number | null {
  const [commission, setCommission] = useState<number | null>(null);

  useEffect(() => {
    api
      .get("/settings/platform")
      .then((res) => {
        const pct = res.data?.data?.shortRentCommissionPercent;
        setCommission(typeof pct === "number" ? pct : 0);
      })
      .catch(() => setCommission(null));
  }, []);

  return commission;
}
