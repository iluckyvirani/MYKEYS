"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  Bell,
  Calculator,
  ChevronRight,
  LineChart,
  Mail,
  Search,
  Smartphone,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useInspirePageContent } from "@/hooks/useInspirePageContent";

type AgentType = "both" | "sales" | "lettings";

const WORTH_LINKS = [
  { label: "Agent Property Valuation", href: "/inspire/find-agent" },
  { label: "Market Trends", href: "/inspire/housing-trends" },
  { label: "Instant Online Valuation", href: "/buy" },
  { label: "Sold House Prices", href: "/buy" },
  { label: "Selling guide", href: "/inspire/property-guides" },
  { label: "Buying guide", href: "/inspire/property-guides" },
  { label: "House Price Index", href: "/inspire/housing-trends" },
];

const RADIUS_OPTIONS = [
  "This area only",
  "Within ¼ mile",
  "Within ½ mile",
  "Within 1 mile",
  "Within 3 miles",
  "Within 5 miles",
  "Within 10 miles",
  "Within 15 miles",
  "Within 20 miles",
  "Within 30 miles",
  "Within 40 miles",
];

export default function FindAgentPage() {
  const content = useInspirePageContent("find-agent");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState(RADIUS_OPTIONS[0]);
  const [agentName, setAgentName] = useState("");
  const [agentType, setAgentType] = useState<AgentType>("both");
  const [searched, setSearched] = useState(false);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setSearched(true);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-[72px] md:pt-[80px]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 md:py-10">
          {/* Search */}
          <h1 className="text-xl sm:text-2xl font-bold text-green-600 mb-4">
            {content.hero.title}
          </h1>

          <form
            onSubmit={onSearch}
            className="rounded-xl bg-[#0f3d36] p-5 sm:p-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={
                    content.hero.searchPlaceholder ||
                    "e.g. 'York', 'NW3', 'NW3 5TY' or 'Waterloo station'"
                  }
                  className="w-full h-11 pl-10 pr-3 rounded-lg bg-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="h-11 px-3 rounded-lg bg-white text-slate-900 text-sm font-medium outline-none cursor-pointer sm:w-[180px] shrink-0"
              >
                {RADIUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label
                htmlFor="agent-name"
                className="text-sm font-semibold text-white shrink-0"
              >
                Agent name:
              </label>
              <input
                id="agent-name"
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="h-10 px-3 rounded-lg bg-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-green-400 sm:max-w-[280px] w-full"
              />
            </div>

            <fieldset>
              <legend className="text-sm font-semibold text-white mb-2">
                Agent type:
              </legend>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {(
                  [
                    { value: "both", label: "Sales and Lettings" },
                    { value: "sales", label: "Sales" },
                    { value: "lettings", label: "Lettings" },
                  ] as const
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className="inline-flex items-center gap-2 text-sm text-white cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="agentType"
                      value={opt.value}
                      checked={agentType === opt.value}
                      onChange={() => setAgentType(opt.value)}
                      className="accent-green-500 cursor-pointer"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="submit"
              className="w-full h-12 rounded-lg bg-green-500 hover:bg-green-400 text-[#0f3d36] font-bold text-base cursor-pointer transition-colors"
            >
              {content.hero.searchButton || "Start Search"}
            </button>
          </form>

          {searched ? (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-slate-700">
              Showing agents
              {location.trim() ? (
                <>
                  {" "}
                  near <strong>{location.trim()}</strong>
                </>
              ) : null}
              {agentName.trim() ? (
                <>
                  {" "}
                  matching <strong>{agentName.trim()}</strong>
                </>
              ) : null}{" "}
              ({radius},{" "}
              {agentType === "both"
                ? "Sales and Lettings"
                : agentType === "sales"
                  ? "Sales"
                  : "Lettings"}
              ). Browse{" "}
              <Link
                href="/services"
                className="font-semibold text-green-700 hover:text-green-800 cursor-pointer"
              >
                services on MYKEYS
              </Link>{" "}
              or{" "}
              <Link
                href="/how-listing-works"
                className="font-semibold text-green-700 hover:text-green-800 cursor-pointer"
              >
                list your property
              </Link>
              .
            </div>
          ) : null}

          {/* Main + sidebar */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 lg:gap-12 items-start">
            <article className="space-y-8 text-[15px] sm:text-base text-slate-700 leading-relaxed">
              <p>
                If you&apos;re thinking of selling or renting out your property,
                make sure you choose an agent that can advertise your property
                on MYKEYS.
              </p>
              <p>
                Property agents and letting agents that choose to advertise with
                MYKEYS are able to unlock these key benefits:
              </p>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-3">
                  Your property in front of the UK&apos;s biggest home-moving
                  audience
                </h2>
                <p>
                  More people use MYKEYS to find their next home than any other
                  property site. Over 80% of all time spent on property portals
                  is on leading platforms like MYKEYS*
                </p>
                <p className="mt-3">
                  Being in front of the biggest audience of home-movers gives
                  you the very best chance of finding the right buyer for you.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-3">
                  Access to the UK&apos;s most serious home-hunters
                </h2>
                <p>
                  Agents that advertise with MYKEYS receive more emails and
                  phone calls from potential buyers than anywhere else they
                  advertise. Enquiries are the key to viewings, offers, and a
                  successful sale.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-3">
                  3 in 4 people find their rental home on MYKEYS*
                </h2>
                <p>
                  MYKEYS delivers the best results for agents and landlords and
                  has a growing choice of properties across the UK.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-3">
                  Your property online within minutes!
                </h2>
                <p>
                  In the race to find a buyer, speed matters. A MYKEYS agent can
                  have your property live and searchable on the website within
                  minutes of you approving your property advertisement.
                </p>
                <p className="mt-3">
                  <strong>Don&apos;t forget:</strong> The only way to get your
                  property listed for sale or to rent on MYKEYS, and in front of
                  the UK&apos;s biggest home-moving audience, is by instructing
                  one of the thousands of estate agents that advertises with us.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-3">
                  Why instruct a property agent to sell your property?
                </h2>
                <p>
                  Ask anyone who has sold a property before and they will tell
                  you that selling a property is both complicated and
                  time-consuming. By instructing an agent to sell your home you
                  gain their knowledge of the local property market, as well as
                  their expertise in selling property just like your own.
                </p>
                <p className="mt-3 font-semibold text-[#1a1a2e]">
                  A good estate agent will be able to:
                </p>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>
                    Recommend an asking price for your property based on their
                    knowledge of local market conditions.
                  </li>
                  <li>
                    Demonstrate a knowledge and understanding of the best
                    marketing tactics required to ensure your property gets seen
                    by the biggest audience of buyers, such as ensuring
                    it&apos;s featured on MYKEYS.
                  </li>
                  <li>
                    Ensure your property gets the attention it deserves by
                    knowing the best ways to present it online.
                  </li>
                  <li>
                    Provide you with personalised reports on your property&apos;s
                    MYKEYS performance and advice on how to increase its
                    performance further.
                  </li>
                  <li>
                    Reduce the stress involved with selling your property by
                    negotiating on your behalf and helping you through the
                    tricky exchange and completion stages of the deal.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-3">
                  Benefits of using a letting agent to advertise your rental
                  property
                </h2>
                <p>
                  Choosing an agent to advertise your rental property means that
                  they will take care of all the marketing of your property. The
                  agent will also ensure your property has been advertised
                  correctly, ensuring all details are correct and nothing
                  important has been omitted.
                </p>
                <p className="mt-3">
                  Find out more about{" "}
                  <Link
                    href="/how-listing-works"
                    className="font-semibold text-green-700 hover:text-green-800 cursor-pointer"
                  >
                    advertising your rental property
                  </Link>
                  , and the benefits of using a letting agent for renting
                  property.
                </p>
                <p className="mt-3">
                  Letting agents are especially great if you&apos;re new to
                  being a landlord and want:
                </p>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>To reduce stress, hassle and to save time.</li>
                  <li>Guidance and advice.</li>
                  <li>
                    Help because the property is far away from where you live.
                  </li>
                </ul>
                <p className="mt-3">
                  A professional letting agent will begin the process by giving
                  you a substantiated view on the market and a realistic idea of
                  the average monthly rent that you can expect to achieve on
                  your property. They will also be able to offer advice on the
                  type of tenant that your property will appeal to.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-3">
                  How to choose an estate agent
                </h2>
                <p>
                  Ultimately, you should choose an estate agent that you feel
                  comfortable dealing with and who you feel will look after your
                  best interests as a seller or a landlord. To help you make a
                  decision, we would recommend asking prospective agents the
                  following:
                </p>
                <ul className="mt-3 list-disc pl-5 space-y-2">
                  <li>
                    How and where your property will be advertised — now&apos;s
                    the time to make sure that your property will be advertised
                    on MYKEYS.
                  </li>
                  <li>
                    How your property compares with similar properties already
                    on the market in terms of price and presentation.
                  </li>
                  <li>
                    Ask to see examples of their success in selling properties
                    like yours. You can then see how they have priced, promoted
                    and presented other similar properties.
                  </li>
                  <li>
                    You&apos;ll obviously be interested in the agent&apos;s fees
                    for selling or renting out your property, but if you&apos;re
                    selling also ask about the length of any exclusivity period
                    (i.e. a period of time during which you cannot market your
                    property with another estate agent) and ensure you are clear
                    on how to serve notice should you wish to.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-3">
                  Talk to your agent about standing out on MYKEYS
                </h2>
                <p>
                  Having chosen a MYKEYS agent, ask your agent about making your
                  property stand out from others on the market. A Premium
                  Listing or Featured Property on MYKEYS are great ways of
                  creating more interest from potential buyers.
                </p>
                <p className="mt-3">
                  For further guidance, check out our{" "}
                  <Link
                    href="/inspire/property-guides"
                    className="font-semibold text-green-700 hover:text-green-800 cursor-pointer"
                  >
                    selling guides
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/inspire/property-guides"
                    className="font-semibold text-green-700 hover:text-green-800 cursor-pointer"
                  >
                    landlord guides
                  </Link>
                  .
                </p>
                <p className="mt-6 text-xs text-slate-500">
                  * Sources: industry portal audience research and MYKEYS
                  platform insights. Figures are illustrative of leading UK
                  property portal performance.
                </p>
              </section>
            </article>

            {/* Sidebar */}
            <aside className="space-y-8 lg:sticky lg:top-[96px]">
              <div className="rounded-2xl bg-[#0f3d36] text-white p-6 relative overflow-hidden">
                <p className="text-lg font-bold leading-snug relative z-10">
                  Request an{" "}
                  <span className="text-green-400">agent valuation</span> for
                  your <span className="text-emerald-400">home</span>
                </p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white/10 border border-white/20 px-3 py-2">
                  <Calculator className="w-5 h-5 text-emerald-400" />
                  <span className="font-mono font-bold tracking-wider text-emerald-300">
                    £??????
                  </span>
                </div>
                <Link
                  href="/how-listing-works"
                  className="mt-5 inline-flex h-10 items-center px-4 rounded-lg bg-green-500 hover:bg-green-400 text-[#0f3d36] text-sm font-bold cursor-pointer"
                >
                  Request valuation
                </Link>
              </div>

              <div className="border-t border-dotted border-gray-300 pt-6">
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-3">
                  What is your property worth?
                </h3>
                <ul className="space-y-2.5">
                  {WORTH_LINKS.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[15px] font-semibold text-green-700 hover:text-green-800 cursor-pointer"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-3">
                  Overseas property
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  If you&apos;re dreaming of a place in the sun, ensure you
                  start your search with MYKEYS Overseas. With thousands of{" "}
                  <Link
                    href="/inspire/overseas-blog"
                    className="font-semibold text-green-700 hover:text-green-800 cursor-pointer"
                  >
                    overseas properties for sale
                  </Link>{" "}
                  from across the globe, we can ensure your dream becomes a
                  reality.
                </p>
                <Link
                  href="/inspire/country-guides"
                  className="mt-3 inline-flex items-center gap-0.5 text-sm font-bold text-green-700 hover:text-green-800 cursor-pointer"
                >
                  View details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </aside>
          </div>

          {/* Tools */}
          <section className="mt-14 pt-10 border-t border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-6">
              Tools to help you prepare for sale
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden flex flex-col">
                <div className="bg-[#e8f7f6] h-36 flex items-center justify-center relative">
                  <Mail className="w-14 h-14 text-green-700" />
                  <Bell className="w-8 h-8 text-green-600 absolute right-[38%] top-10" />
                  <span className="absolute right-[36%] top-8 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    10
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-[#1a1a2e]">
                    Get Property Alerts
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 flex-1">
                    Get email notifications when similar local properties come
                    to market.
                  </p>
                  <div className="mt-4 pt-3 border-t border-dotted border-gray-300">
                    <Link
                      href="/signup"
                      className="text-sm font-bold text-green-700 hover:text-green-800 cursor-pointer"
                    >
                      Sign up »
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden flex flex-col">
                <div className="bg-[#fbf7ee] h-36 flex items-center justify-center">
                  <LineChart className="w-16 h-16 text-emerald-600" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-[#1a1a2e]">
                    Sold prices
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 flex-1">
                    Discover how much property sold for with our comprehensive
                    house price data.
                  </p>
                  <div className="mt-4 pt-3 border-t border-dotted border-gray-300">
                    <Link
                      href="/inspire/housing-trends"
                      className="text-sm font-bold text-green-700 hover:text-green-800 cursor-pointer"
                    >
                      Check sold prices »
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden flex flex-col">
                <div className="bg-slate-100 h-36 flex items-center justify-center">
                  <Smartphone className="w-16 h-16 text-[#0f3d36]" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-[#1a1a2e]">
                    Get Property Valuation
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 flex-1">
                    Ready to take the next step? Contact local estate agents for
                    a valuation of your property.
                  </p>
                  <div className="mt-4 pt-3 border-t border-dotted border-gray-300">
                    <Link
                      href="/how-listing-works"
                      className="text-sm font-bold text-green-700 hover:text-green-800 cursor-pointer"
                    >
                      Request a valuation »
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
