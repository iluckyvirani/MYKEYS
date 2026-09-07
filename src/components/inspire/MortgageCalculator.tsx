"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, Home, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  calculateRepayment,
  clamp,
  formatGbpExact,
} from "@/lib/mortgageCalc";

export type MortgageCalcMode = "purchase" | "remortgage";

type Props = {
  initialMode?: MortgageCalcMode;
};

function FieldLabel({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <span className="text-sm font-bold text-[#0f3d36]">{value}</span>
    </div>
  );
}

function Slider({
  min,
  max,
  step,
  value,
  onChange,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 rounded-full appearance-none cursor-pointer bg-green-100 accent-[#0f3d36]"
    />
  );
}

function NumberBox({
  value,
  prefix,
  suffix,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center h-11 rounded-lg border border-gray-300 bg-white overflow-hidden focus-within:border-green-600">
      {prefix ? (
        <span className="pl-3 text-sm font-semibold text-slate-500">{prefix}</span>
      ) : null}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(clamp(Number(e.target.value) || 0, min, max))}
        className="w-full h-full px-2 text-sm font-semibold text-[#1a1a2e] outline-none bg-transparent"
      />
      {suffix ? (
        <span className="pr-3 text-sm font-semibold text-slate-500">{suffix}</span>
      ) : null}
    </div>
  );
}

export default function MortgageCalculator({ initialMode = "purchase" }: Props) {
  const [mode, setMode] = useState<MortgageCalcMode>(initialMode);

  const [price, setPrice] = useState(350000);
  const [deposit, setDeposit] = useState(35000);
  const [rate, setRate] = useState(4.5);
  const [term, setTerm] = useState(25);

  const [balance, setBalance] = useState(200000);
  const [remainingTerm, setRemainingTerm] = useState(20);
  const [currentRate, setCurrentRate] = useState(5.5);
  const [newRate, setNewRate] = useState(4.2);

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "remortgage-calculator") setMode("remortgage");
      if (hash === "mortgage-calculator") setMode("purchase");
      if (hash === "mortgage-calculator" || hash === "remortgage-calculator") {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const depositPct = price > 0 ? (deposit / price) * 100 : 0;
  const loan = Math.max(0, price - deposit);
  const ltv = price > 0 ? (loan / price) * 100 : 0;

  const purchase = useMemo(
    () => calculateRepayment(loan, rate, term),
    [loan, rate, term]
  );

  const remortgageCurrent = useMemo(
    () => calculateRepayment(balance, currentRate, remainingTerm),
    [balance, currentRate, remainingTerm]
  );
  const remortgageNew = useMemo(
    () => calculateRepayment(balance, newRate, remainingTerm),
    [balance, newRate, remainingTerm]
  );
  const monthlySaving =
    remortgageCurrent && remortgageNew
      ? remortgageCurrent.monthlyPayment - remortgageNew.monthlyPayment
      : 0;

  const setDepositFromPct = (pct: number) => {
    const next = clamp(pct, 0, 80);
    setDeposit(Math.round((price * next) / 100));
  };

  return (
    <div id="mortgage-calculator" className="scroll-mt-28">
    <div id="remortgage-calculator" className="scroll-mt-28">
    <section className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="bg-[#0f3d36] px-5 sm:px-7 py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">Mortgage calculator</h2>
            <p className="text-sm text-white/70">
              Estimate monthly repayments — for guidance only
            </p>
          </div>
        </div>
        <div className="flex rounded-lg bg-white/10 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("purchase");
              history.replaceState(null, "", "#mortgage-calculator");
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold cursor-pointer transition-colors ${
              mode === "purchase"
                ? "bg-white text-[#0f3d36]"
                : "text-white/80 hover:text-white"
            }`}
          >
            Purchase
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("remortgage");
              history.replaceState(null, "", "#remortgage-calculator");
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold cursor-pointer transition-colors ${
              mode === "remortgage"
                ? "bg-white text-[#0f3d36]"
                : "text-white/80 hover:text-white"
            }`}
          >
            Remortgage
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-5 sm:p-7 space-y-6">
          {mode === "purchase" ? (
            <>
              <div>
                <FieldLabel label="Property price" value={formatCurrency(price)} />
                <Slider
                  min={50000}
                  max={2000000}
                  step={5000}
                  value={price}
                  onChange={(n) => {
                    const pct = price > 0 ? deposit / price : 0.1;
                    setPrice(n);
                    setDeposit(Math.round(n * pct));
                  }}
                />
                <div className="mt-3">
                  <NumberBox
                    prefix="£"
                    min={50000}
                    max={5000000}
                    step={1000}
                    value={price}
                    onChange={(n) => {
                      const pct = price > 0 ? deposit / price : 0.1;
                      setPrice(n);
                      setDeposit(Math.round(n * pct));
                    }}
                  />
                </div>
              </div>

              <div>
                <FieldLabel
                  label="Deposit"
                  value={`${formatCurrency(deposit)} (${depositPct.toFixed(0)}%)`}
                />
                <Slider
                  min={0}
                  max={80}
                  step={1}
                  value={Math.round(depositPct)}
                  onChange={setDepositFromPct}
                />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <NumberBox
                    prefix="£"
                    min={0}
                    max={price}
                    step={1000}
                    value={deposit}
                    onChange={setDeposit}
                  />
                  <NumberBox
                    suffix="%"
                    min={0}
                    max={80}
                    step={1}
                    value={Math.round(depositPct)}
                    onChange={setDepositFromPct}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel label="Interest rate" value={`${rate.toFixed(2)}%`} />
                  <Slider
                    min={0.1}
                    max={12}
                    step={0.05}
                    value={rate}
                    onChange={setRate}
                  />
                  <div className="mt-3">
                    <NumberBox
                      suffix="%"
                      min={0}
                      max={15}
                      step={0.05}
                      value={rate}
                      onChange={setRate}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel label="Mortgage term" value={`${term} years`} />
                  <Slider min={5} max={40} step={1} value={term} onChange={setTerm} />
                  <div className="mt-3">
                    <NumberBox
                      suffix="years"
                      min={5}
                      max={40}
                      step={1}
                      value={term}
                      onChange={setTerm}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <FieldLabel
                  label="Outstanding mortgage"
                  value={formatCurrency(balance)}
                />
                <Slider
                  min={10000}
                  max={1500000}
                  step={1000}
                  value={balance}
                  onChange={setBalance}
                />
                <div className="mt-3">
                  <NumberBox
                    prefix="£"
                    min={1000}
                    max={3000000}
                    step={1000}
                    value={balance}
                    onChange={setBalance}
                  />
                </div>
              </div>

              <div>
                <FieldLabel
                  label="Remaining term"
                  value={`${remainingTerm} years`}
                />
                <Slider
                  min={2}
                  max={40}
                  step={1}
                  value={remainingTerm}
                  onChange={setRemainingTerm}
                />
                <div className="mt-3">
                  <NumberBox
                    suffix="years"
                    min={2}
                    max={40}
                    step={1}
                    value={remainingTerm}
                    onChange={setRemainingTerm}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel
                    label="Current rate"
                    value={`${currentRate.toFixed(2)}%`}
                  />
                  <Slider
                    min={0.1}
                    max={12}
                    step={0.05}
                    value={currentRate}
                    onChange={setCurrentRate}
                  />
                  <div className="mt-3">
                    <NumberBox
                      suffix="%"
                      min={0}
                      max={15}
                      step={0.05}
                      value={currentRate}
                      onChange={setCurrentRate}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel label="New rate" value={`${newRate.toFixed(2)}%`} />
                  <Slider
                    min={0.1}
                    max={12}
                    step={0.05}
                    value={newRate}
                    onChange={setNewRate}
                  />
                  <div className="mt-3">
                    <NumberBox
                      suffix="%"
                      min={0}
                      max={15}
                      step={0.05}
                      value={newRate}
                      onChange={setNewRate}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-[#f4faf8] border-t lg:border-t-0 lg:border-l border-gray-200 p-5 sm:p-7 flex flex-col">
          {mode === "purchase" && purchase ? (
            <>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Estimated monthly payment
              </p>
              <p className="mt-2 text-4xl font-extrabold text-[#0f3d36] tracking-tight">
                {formatGbpExact(purchase.monthlyPayment)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Capital and interest repayment
              </p>

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-600">Amount to borrow</dt>
                  <dd className="font-bold text-[#1a1a2e]">{formatCurrency(loan)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-600">Loan to value</dt>
                  <dd className="font-bold text-[#1a1a2e]">{ltv.toFixed(1)}%</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-600">Total repaid</dt>
                  <dd className="font-bold text-[#1a1a2e]">
                    {formatCurrency(purchase.totalRepaid)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-600">Total interest</dt>
                  <dd className="font-bold text-[#1a1a2e]">
                    {formatCurrency(purchase.totalInterest)}
                  </dd>
                </div>
              </dl>
            </>
          ) : null}

          {mode === "remortgage" && remortgageCurrent && remortgageNew ? (
            <>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                {monthlySaving >= 0 ? "Monthly saving" : "Monthly increase"}
              </p>
              <p
                className={`mt-2 text-4xl font-extrabold tracking-tight ${
                  monthlySaving >= 0 ? "text-green-700" : "text-red-600"
                }`}
              >
                {formatGbpExact(Math.abs(monthlySaving))}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Compared with your current rate
              </p>

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-600">Current monthly</dt>
                  <dd className="font-bold text-[#1a1a2e]">
                    {formatGbpExact(remortgageCurrent.monthlyPayment)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-600">New monthly</dt>
                  <dd className="font-bold text-[#1a1a2e]">
                    {formatGbpExact(remortgageNew.monthlyPayment)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-600">Interest over term (new)</dt>
                  <dd className="font-bold text-[#1a1a2e]">
                    {formatCurrency(remortgageNew.totalInterest)}
                  </dd>
                </div>
              </dl>
            </>
          ) : null}

          <div className="mt-auto pt-6 flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
            {mode === "purchase" ? (
              <Home className="w-4 h-4 shrink-0 mt-0.5 text-green-700" />
            ) : (
              <RefreshCw className="w-4 h-4 shrink-0 mt-0.5 text-green-700" />
            )}
            <p>
              Illustrative only. Actual rates, fees and affordability depend on
              your lender, credit history and circumstances. This is not
              financial advice.
            </p>
          </div>
        </div>
      </div>
    </section>
    </div>
    </div>
  );
}
