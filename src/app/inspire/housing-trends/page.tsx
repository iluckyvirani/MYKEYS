"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDown,
  Calculator,
  ChevronDown,
  ChevronRight,
  Download,
  Home,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  FIVE_YEAR_TREND,
  HPI_CONTENTS,
  HPI_PAST_REPORTS,
  HPI_PUBLISHED,
  HPI_SUMMARY_BULLETS,
  MONTHLY_PCT_CHANGES,
  MONTHLY_PRICE_TREND,
  SECTOR_PRICES,
} from "@/lib/housingTrends";

function formatPrice(n: number) {
  return `£${Math.round(n).toLocaleString()}`;
}

function LineChart({
  data,
  color = "#3db2ad",
  yMin,
  yMax,
}: {
  data: { label: string; value: number }[];
  color?: string;
  yMin: number;
  yMax: number;
}) {
  const w = 640;
  const h = 280;
  const pad = { t: 20, r: 20, b: 36, l: 56 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  const points = data.map((d, i) => {
    const x = pad.l + (i / Math.max(1, data.length - 1)) * innerW;
    const y =
      pad.t + ((yMax - d.value) / Math.max(1, yMax - yMin)) * innerH;
    return { x, y, ...d };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const yTicks = 5;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = yMax - ((yMax - yMin) * i) / yTicks;
    const y = pad.t + (i / yTicks) * innerH;
    return { v, y };
  });

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[520px] h-auto">
        {ticks.map((t) => (
          <g key={t.v}>
            <line
              x1={pad.l}
              x2={w - pad.r}
              y1={t.y}
              y2={t.y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x={pad.l - 8}
              y={t.y + 4}
              textAnchor="end"
              className="fill-slate-500"
              fontSize="10"
            >
              {formatPrice(t.v)}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke={color} strokeWidth="3" />
        {points.map((p) => (
          <circle key={p.label} cx={p.x} cy={p.y} r="3.5" fill={color} />
        ))}
        {points.map((p, i) =>
          i % 2 === 0 || i === points.length - 1 ? (
            <text
              key={`l-${p.label}`}
              x={p.x}
              y={h - 10}
              textAnchor="middle"
              className="fill-slate-500"
              fontSize="10"
            >
              {p.label}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
}

function BarChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const w = 640;
  const h = 280;
  const pad = { t: 24, r: 16, b: 36, l: 40 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.value)), 1);
  const zeroY = pad.t + innerH / 2;
  const barW = (innerW / data.length) * 0.65;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[520px] h-auto">
        <line
          x1={pad.l}
          x2={w - pad.r}
          y1={zeroY}
          y2={zeroY}
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        {data.map((d, i) => {
          const cx = pad.l + ((i + 0.5) / data.length) * innerW;
          const barH = (Math.abs(d.value) / maxAbs) * (innerH / 2 - 8);
          const y = d.value >= 0 ? zeroY - barH : zeroY;
          const fill = d.value >= 0 ? "#3db2ad" : "#0f3d36";
          return (
            <g key={d.label}>
              <rect
                x={cx - barW / 2}
                y={y}
                width={barW}
                height={Math.max(barH, d.value === 0 ? 0 : 2)}
                fill={fill}
                rx="2"
              />
              <text
                x={cx}
                y={d.value >= 0 ? y - 6 : y + barH + 12}
                textAnchor="middle"
                fontSize="9"
                className="fill-slate-600"
              >
                {d.value === 0 ? "0%" : `${d.value}%`}
              </text>
              <text
                x={cx}
                y={h - 10}
                textAnchor="middle"
                fontSize="9"
                className="fill-slate-500"
              >
                {d.label.replace(" ", "\n")}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ChangeBadge({ value }: { value: number }) {
  const neg = value < 0;
  const flat = value === 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-sm font-bold ${
        flat ? "text-slate-500" : neg ? "text-red-600" : "text-green-700"
      }`}
    >
      {!flat && neg ? <ArrowDown className="w-3.5 h-3.5" /> : null}
      {flat ? "0.0%" : `${value.toFixed(1)}%`}
    </span>
  );
}

export default function HousingTrendsPage() {
  const [contentsOpen, setContentsOpen] = useState(true);
  const [pastReport, setPastReport] = useState(HPI_PAST_REPORTS[0]);

  const monthlyMin = useMemo(
    () => Math.min(...MONTHLY_PRICE_TREND.map((d) => d.value)) - 5000,
    []
  );
  const monthlyMax = useMemo(
    () => Math.max(...MONTHLY_PRICE_TREND.map((d) => d.value)) + 5000,
    []
  );
  const fiveMin = useMemo(
    () => Math.min(...FIVE_YEAR_TREND.map((d) => d.value)) - 5000,
    []
  );
  const fiveMax = useMemo(
    () => Math.max(...FIVE_YEAR_TREND.map((d) => d.value)) + 5000,
    []
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-[72px] md:pt-[80px]">
        {/* Hero */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 pt-6 md:pt-8">
          <div className="relative rounded-2xl overflow-hidden min-h-[260px] sm:min-h-[320px] md:min-h-[360px]">
            <img
              src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=80"
              alt="UK terraced houses"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/15" />
            <div className="relative z-10 max-w-[420px] m-4 sm:m-6 md:m-8 bg-[#0f3d36] text-white rounded-2xl p-6 sm:p-8 shadow-xl">
              <p className="text-sm font-semibold text-green-300 mb-3">
                Date published: {HPI_PUBLISHED}
              </p>
              <h1 className="text-[2rem] sm:text-[2.4rem] font-bold tracking-tight leading-tight">
                House Price Index
              </h1>
              <button
                type="button"
                className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-green-500 hover:bg-green-600 text-slate-900 font-bold text-sm cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                Download full report
              </button>
            </div>
          </div>
        </section>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 lg:gap-12 items-start">
            <article>
              {/* Contents */}
              <div className="border-b border-gray-200 pb-5 mb-8">
                <button
                  type="button"
                  onClick={() => setContentsOpen((v) => !v)}
                  className="w-full flex items-center justify-between gap-3 cursor-pointer text-left"
                >
                  <h2 className="text-lg font-bold text-[#1a1a2e]">Contents</h2>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-600 transition-transform ${
                      contentsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {contentsOpen && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                    {HPI_CONTENTS.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="text-[15px] font-semibold text-green-700 hover:text-green-800 py-0.5 cursor-pointer"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <h2
                id="summary"
                className="scroll-mt-28 text-[26px] sm:text-[32px] font-bold text-[#1a1a2e] leading-tight"
              >
                Summer buyers distracted by sunshine, football and political
                change
              </h2>

              <div className="mt-5 rounded-xl bg-[#f6f6f6] border border-gray-200 p-5 sm:p-6">
                <ul className="space-y-3 text-[15px] text-slate-700 leading-relaxed list-disc pl-5">
                  {HPI_SUMMARY_BULLETS.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 space-y-4 text-[15px] sm:text-base text-slate-700 leading-relaxed">
                <p>
                  The average asking price of a newly-listed home coming onto
                  the market for sale falls by 1.0% (-£3,832) this month to
                  £372,359. While a price drop in July is normal, this month’s
                  fall is much larger than the ten-year average drop we’d see in
                  July (0.2%).
                </p>
                <p>
                  Sellers are having to compete harder to attract summer buyers.
                  The supply of available homes is close to a 12-year high for
                  the time of year, giving buyers plenty of choice. Home-movers
                  are always distracted by the summer holiday season, but the
                  World Cup and hot weather have also added to distractions.
                </p>
                <p>
                  MYKEYS analysis shows that the first heatwave in May caused a
                  temporary 8% drop in demand from buyers before rebounding.
                  June’s heatwave caused a similar temporary dip in demand of
                  6%, followed by a 4% drop during the current July heatwave.
                </p>
                <p>
                  A new Prime Minister adds to the distractions that buyers are
                  facing, but also offers a chance to reset political
                  priorities. MYKEYS is urging that housing should be high on
                  the agenda, with a focus on changing how stamp duty works and
                  helping house builders to get closer to the target of 1.5
                  million new homes.
                </p>
              </div>

              <h3
                id="conditions-for-buyers"
                className="scroll-mt-28 mt-12 text-[24px] sm:text-[28px] font-bold text-[#1a1a2e]"
              >
                Conditions for buyers remain positive
              </h3>
              <div className="mt-4 space-y-4 text-[15px] sm:text-base text-slate-700 leading-relaxed">
                <p>
                  It’s fair to say that the first half of 2026 has brought some
                  challenges for home-movers and the housing market. The war in
                  Iran pushed mortgage rates higher and the number of sales
                  agreed from January to June was 6% lower than the same period
                  in 2025.
                </p>
                <p>
                  However, sales agreed for the first half of 2026 stayed level
                  with those for this period in 2024. This shows that buyers are
                  still being tempted when they find the right property at the
                  right price.
                </p>
                <p>
                  New MYKEYS analysis shows how important it is to set a
                  property’s asking price right from the start of the sales
                  process. Nearly three-quarters (74%) of homes that have
                  successfully sold and completed this year did so without
                  having prices reduced.
                </p>
                <p>
                  Overall, conditions for buyers remain positive. Lenders are
                  competing strongly on rates, wages continue to rise faster
                  than house prices, and unemployment is staying low. This
                  leaves room for optimism for the second half of 2026,
                  particularly if mortgage rates drop and wages continue to grow
                  faster than house prices.
                </p>
              </div>

              <h3
                id="mortgage-rates"
                className="scroll-mt-28 mt-12 text-[24px] sm:text-[28px] font-bold text-[#1a1a2e]"
              >
                What are mortgage rates doing?
              </h3>
              <div className="mt-4 space-y-4 text-[15px] sm:text-base text-slate-700 leading-relaxed">
                <p>
                  MYKEYS’ daily mortgage tracker shows that the average two-year
                  fixed mortgage rate is now 4.92%. This is up from 4.25% in
                  February (before the war in Iran), but down from 5.08% last
                  month.
                </p>
                <blockquote className="rounded-xl border-l-4 border-green-500 bg-green-50/50 pl-4 py-3 space-y-3 not-italic">
                  <p>
                    “Mortgage rates are higher than many buyers would have hoped
                    for at the start of the year, and the increases due to the
                    war in Iran have understandably dented confidence for some,”
                    explains Matt Smith, MYKEYS’ mortgages expert.
                  </p>
                  <p>
                    “However, lenders remain keen to lend, and the mortgage
                    market is still competitive. There is still uncertainty in
                    the market, and recent mortgage cuts could stop in the near
                    future, however we’re not seeing the kind of difficult
                    lending conditions that have caused more challenging markets
                    in the past.
                  </p>
                  <p>
                    “If the outlook shifted and we saw reductions in mortgage
                    rates, it would be a welcome boost to confidence and
                    affordability.”
                  </p>
                </blockquote>
              </div>

              <h3 className="mt-10 text-[22px] sm:text-[24px] font-bold text-[#1a1a2e]">
                How do mortgage rates affect supply and demand for houses in the
                UK?
              </h3>
              <div className="mt-4 space-y-4 text-[15px] sm:text-base text-slate-700 leading-relaxed">
                <p>
                  Mortgage rates affect supply and demand in the UK housing
                  market by influencing buyer sentiment and appetite around
                  borrowing.
                </p>
                <p>
                  Higher mortgage rates increase monthly payments for buyers. In
                  response to those higher rates, buyers might increase the term
                  of their mortgage or look at cheaper properties.
                  Alternatively, they might delay their purchases or shift to
                  renting, reducing demand and slowing transaction levels.
                </p>
                <p>
                  Interestingly, any period of uncertainty around rates is
                  likely to cause buyers to pause. Even if rates go up, once
                  they stabilise again, consumers tend to return to the market
                  having adjusted their plans in line with the higher rates.
                </p>
                <p>
                  Similarly, if there is potential for a drop in mortgage rates,
                  transaction levels will slow as consumers wait for a more
                  certain outcome. Consistent lower mortgage rates will then
                  lower monthly payments, increasing buyer demand and supporting
                  higher prices.
                </p>
                <p>
                  It is important to note, however, that a large number of UK
                  property sales take place out of necessity. These do not get
                  delayed as a result of changing rates. Similarly, around a
                  third of all UK property transactions are made by cash buyers,
                  so are not affected by mortgage rates.
                </p>
                <p>
                  Housing supply responds more slowly to changing rates. Higher
                  mortgage rates can reduce the supply of new houses by making
                  it more expensive to develop them, although existing stock may
                  stay on the market longer.
                </p>
              </div>

              {/* Numbers at a glance */}
              <section
                id="numbers-at-a-glance"
                className="scroll-mt-28 mt-12 rounded-2xl bg-[#f3f4f6] p-5 sm:p-7"
              >
                <h3 className="text-[22px] sm:text-[26px] font-bold text-[#1a1a2e] mb-5">
                  The numbers at a glance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                  <div className="rounded-xl bg-emerald-600 text-white p-4 text-sm font-semibold leading-snug">
                    Larger than usual monthly price drop (-1%) as new sellers
                    compete harder for buyers
                  </div>
                  <div className="rounded-xl bg-[#0f3d36] text-white p-4 text-sm font-semibold leading-snug">
                    Number of homes for sale is slightly below last year (-1%)
                    but still very close to 12-year high
                  </div>
                  <div className="rounded-xl bg-green-600 text-white p-4 text-sm font-semibold leading-snug">
                    Average two-year fixed mortgage rate is 4.92%, down from
                    5.08% last month
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-4">
                  <div className="bg-white rounded-xl p-5 border border-gray-100">
                    <p className="text-sm font-semibold text-slate-500 mb-2">
                      National average asking price
                    </p>
                    <p className="text-2xl font-bold text-[#1a1a2e]">
                      Jul 2026: £372,359
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Jun 2026: £376,191
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm">
                      <span>
                        MoM: <ChangeBadge value={-1.0} />
                      </span>
                      <span>
                        YoY: <ChangeBadge value={-0.4} />
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-100">
                    <p className="text-sm font-semibold text-slate-500 mb-3">
                      By market sector (excl. inner London)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {SECTOR_PRICES.map((s) => (
                        <div key={s.name}>
                          <p className="text-xs font-semibold text-slate-500 mb-1">
                            {s.name}
                          </p>
                          <p className="text-lg font-bold text-[#1a1a2e]">
                            {s.price}
                          </p>
                          <p className="mt-1 text-xs">
                            MoM <ChangeBadge value={s.mom} />
                          </p>
                          <p className="text-xs">
                            YoY <ChangeBadge value={s.yoy} />
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Expert comment */}
              <section id="expert-comment" className="scroll-mt-28 mt-12">
                <h3 className="text-[24px] sm:text-[28px] font-bold text-[#1a1a2e] mb-4">
                  Expert comment
                </h3>
                <div className="rounded-2xl border-2 border-green-500 bg-green-50/60 p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
                      alt="MYKEYS property expert"
                      className="w-20 h-20 rounded-lg object-cover shrink-0"
                    />
                    <div>
                      <p className="font-bold text-green-700 mb-2">
                        Property expert at MYKEYS:
                      </p>
                      <div className="space-y-3 text-[15px] text-slate-700 leading-relaxed">
                        <p>
                          “A larger-than-normal July price fall shows sellers
                          are competing harder for summer buyers distracted by
                          holidays, heatwaves and football.
                        </p>
                        <p>
                          Mortgage rates are higher than many hoped at the start
                          of the year, which has dented confidence for some —
                          but lenders remain keen to lend and the market is
                          still competitive.
                        </p>
                        <p>
                          If rates ease and wages keep growing faster than house
                          prices, there is room for optimism in the second half
                          of 2026.”
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-[#0f3d36] px-5 py-5">
                <p className="text-white font-bold text-lg">
                  Check how much homes near you sold for
                </p>
                <Link
                  href="/buy"
                  className="inline-flex h-11 items-center justify-center px-5 rounded-lg bg-green-500 hover:bg-green-600 text-slate-900 font-bold text-sm cursor-pointer shrink-0"
                >
                  Browse sold &amp; for sale
                </Link>
              </div>

              {/* Charts */}
              <section
                id="average-asking-price-trends"
                className="scroll-mt-28 mt-12"
              >
                <h3 className="text-[24px] sm:text-[28px] font-bold text-[#1a1a2e]">
                  Average asking price trends
                </h3>
                <h4 className="mt-4 text-lg font-bold text-[#1a1a2e]">
                  Monthly average asking price trend
                </h4>
                <p className="mt-2 text-[15px] text-slate-600 leading-relaxed max-w-3xl">
                  This graph shows the 1.0% price drop seen in July to £372,359.
                  This is more of a drop than we’d usually see in July, with an
                  average drop of -0.2% over the past ten years.
                </p>
                <div className="mt-4 rounded-xl border border-gray-200 p-4 bg-white">
                  <LineChart
                    data={MONTHLY_PRICE_TREND}
                    color="#e5b041"
                    yMin={monthlyMin}
                    yMax={monthlyMax}
                  />
                </div>
              </section>

              <section id="five-year-trend" className="scroll-mt-28 mt-12">
                <h3 className="text-[22px] sm:text-[24px] font-bold text-[#1a1a2e]">
                  5 year asking price trend
                </h3>
                <p className="mt-2 text-[15px] text-slate-600 leading-relaxed max-w-3xl">
                  This data shows average asking prices in the UK over the past
                  five years. Here you can see the usual seasonal pattern for
                  prices, including the usual dip as we head into summer.
                </p>
                <div className="mt-4 rounded-xl border border-gray-200 p-4 bg-white">
                  <LineChart
                    data={FIVE_YEAR_TREND}
                    color="#3db2ad"
                    yMin={fiveMin}
                    yMax={fiveMax}
                  />
                </div>
              </section>

              <section id="monthly-changes" className="scroll-mt-28 mt-12 mb-4">
                <h3 className="text-[22px] sm:text-[24px] font-bold text-[#1a1a2e]">
                  Monthly changes in average asking prices
                </h3>
                <p className="mt-2 text-[15px] text-slate-600 leading-relaxed max-w-3xl">
                  Here we see how much house prices have increased or decreased
                  each month over the past year. The 1% drop for July 2026
                  reflects more of a dip than the 10-year July average (-0.2%).
                </p>
                <div className="mt-4 rounded-xl border border-gray-200 p-4 bg-white">
                  <BarChart data={MONTHLY_PCT_CHANGES} />
                </div>
              </section>

              <p className="mt-10 text-xs text-slate-500 leading-relaxed">
                MYKEYS is not authorised to provide financial advice. The
                information and opinions in this article are for general
                information purposes only and should not be relied upon when
                making financial decisions. You should seek advice from a
                regulated mortgage adviser. Your home may be repossessed if you
                do not keep up repayments on your mortgage.
              </p>
            </article>

            {/* Sidebar */}
            <aside className="space-y-4 lg:sticky lg:top-[96px]">
              <div className="relative">
                <label className="sr-only" htmlFor="past-reports">
                  Past reports
                </label>
                <select
                  id="past-reports"
                  value={pastReport}
                  onChange={(e) => setPastReport(e.target.value)}
                  className="w-full h-12 appearance-none rounded-xl bg-[#f0f0f0] px-4 pr-10 text-sm font-semibold text-[#1a1a2e] outline-none cursor-pointer"
                >
                  {HPI_PAST_REPORTS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>

              <div className="rounded-2xl bg-[#0f3d36] text-white p-5">
                <h3 className="text-lg font-bold leading-snug">
                  How much is your house worth?
                </h3>
                <Link
                  href="/buy"
                  className="mt-4 inline-flex h-10 items-center px-4 rounded-lg bg-green-500 hover:bg-green-600 text-slate-900 text-sm font-bold cursor-pointer"
                >
                  Instant online valuation
                </Link>
              </div>

              <div className="rounded-2xl bg-[#0f3d36] text-white p-5 flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold leading-snug">
                  See what homes near you sold for
                </h3>
                <Link
                  href="/buy"
                  className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-slate-900 flex items-center justify-center shrink-0 cursor-pointer"
                  aria-label="Browse homes"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>

              <Link
                href="/inspire/mortgage-guides"
                className="block rounded-2xl border border-gray-200 bg-white p-5 hover:border-green-400 cursor-pointer"
              >
                <div className="flex items-center gap-3 text-green-700 mb-3">
                  <Home className="w-6 h-6" />
                  <Calculator className="w-6 h-6" />
                </div>
                <p className="font-bold text-[#1a1a2e]">
                  Try our Mortgage Calculator
                </p>
              </Link>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
