export type OverseasArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  country: string;
  image: string;
  imageAlt: string;
  body: string[];
};

export const OVERSEAS_HERO_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80";

export const OVERSEAS_ARTICLES: OverseasArticle[] = [
  {
    id: "1",
    slug: "how-to-get-a-mortgage-in-portugal",
    title: "How to get a mortgage in Portugal",
    excerpt:
      "Thinking of buying in Portugal? Here’s what UK buyers need to know about deposits, lenders, residency rules, and how to secure a mortgage abroad [...]",
    date: "June 18, 2026",
    country: "Portugal",
    image:
      "https://images.unsplash.com/photo-1555881403-746d3e8d4b5a?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Yellow tram on a narrow Lisbon street",
    body: [
      "Portugal remains one of the most popular destinations for UK buyers looking for sunshine, lifestyle, and long-term value. If you’re planning to finance a purchase, understanding the local mortgage process is essential.",
      "Most Portuguese lenders look for a deposit of 20–40% for non-residents, and they will assess your income, existing debts, and credit history carefully. Rates and products differ from the UK, so working with a specialist overseas mortgage broker can save time.",
      "You’ll also need a Portuguese tax number (NIF), a local bank account, and often a solicitor who understands cross-border purchases. Start early — paperwork and valuations can take longer than a UK purchase.",
      "MYKEYS is not authorised to provide financial advice. Always seek guidance from a regulated adviser before making decisions about overseas mortgages.",
    ],
  },
  {
    id: "2",
    slug: "buying-property-in-cyprus",
    title: "Buying property in Cyprus: what UK buyers need to know",
    excerpt:
      "From coastal apartments to inland villas, Cyprus attracts UK buyers with its climate and lifestyle. Here’s a practical guide to buying there [...]",
    date: "June 12, 2026",
    country: "Cyprus",
    image:
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49c?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Coastal city skyline with modern buildings and palm trees",
    body: [
      "Cyprus offers a familiar legal framework for many UK buyers, English is widely spoken, and the island’s coastal towns remain popular for both holiday homes and permanent moves.",
      "Before you buy, check title deeds carefully, understand any communal fees for apartment blocks, and factor in transfer taxes and legal costs. New-build schemes can look attractive, but always verify completion timelines and developer credentials.",
      "Residency rules and tax treatment depend on how long you plan to stay and whether the property will be rented out. A local solicitor and accountant are worth involving early.",
      "Browse country guides on MYKEYS for more destination comparisons, and speak to a specialist if you’re financing the purchase with an overseas mortgage.",
    ],
  },
  {
    id: "3",
    slug: "getting-a-mortgage-in-france-as-a-uk-buyer",
    title: "Getting a mortgage in France as a UK buyer",
    excerpt:
      "French lenders take a cautious approach to overseas buyers. Learn about deposits, affordability checks, and how the process differs from the UK [...]",
    date: "June 5, 2026",
    country: "France",
    image:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Stone house beside lavender fields in the French countryside",
    body: [
      "Buying in France — whether a city apartment or a rural retreat — often means dealing with French banks that prefer strong documentation and lower loan-to-value ratios for non-residents.",
      "Expect detailed affordability checks, proof of income, and a deposit that can be higher than you might put down in the UK. The notaire plays a central role in French conveyancing, and timelines can feel more formal than British processes.",
      "Currency risk is another consideration if your income is in sterling. Some buyers use currency specialists to lock in exchange rates around completion.",
      "If you’re comparing France with other European markets, our overseas blog and country guides can help you weigh lifestyle, costs, and financing options.",
    ],
  },
  {
    id: "4",
    slug: "spain-holiday-home-buying-checklist",
    title: "Spain holiday home buying checklist",
    excerpt:
      "Coastal Spain remains a favourite for UK holiday homes. Use this checklist to avoid common pitfalls before you commit [...]",
    date: "May 28, 2026",
    country: "Spain",
    image:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Spanish coastal town overlooking the Mediterranean",
    body: [
      "Spain’s costas and islands continue to draw UK buyers looking for sunshine breaks and potential rental income. A clear checklist helps you move with confidence.",
      "Confirm the property has proper planning permission, check community charges for apartments, and understand plusvalía and other local taxes. Always use an independent lawyer — not one recommended solely by the seller or agent.",
      "If you plan to rent the property out, local licensing rules vary by region. Factor in management costs if you won’t be there year-round.",
      "MYKEYS can help you explore overseas inspiration — for financing or legal advice, speak to regulated specialists in the country you’re buying in.",
    ],
  },
  {
    id: "5",
    slug: "italy-property-for-uk-buyers",
    title: "Buying property in Italy: a starter guide for UK buyers",
    excerpt:
      "From Tuscan farmhouses to lakeside apartments, Italy offers character in abundance. Here’s what to expect when buying as a UK resident [...]",
    date: "May 20, 2026",
    country: "Italy",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Italian canal city with historic buildings",
    body: [
      "Italy’s regional markets vary widely — prices, bureaucracy, and renovation realities differ between the north, centre, and south. Research your chosen area carefully before making an offer.",
      "The purchase process typically involves a preliminary contract (compromesso) and a notary-led completion. Translations, surveys, and checks on rural titles can add time, especially for older stone properties.",
      "Budget for restoration if you’re drawn to character homes, and clarify whether utilities and access are already in place.",
      "Compare Italy with other destinations in our overseas blog, and keep currency and mortgage options in mind before you fall in love with a view.",
    ],
  },
  {
    id: "6",
    slug: "greece-island-homes-what-to-know",
    title: "Greek island homes: what UK buyers should know",
    excerpt:
      "Island living sounds idyllic — and it can be. Here’s a practical look at buying on the Greek islands as a UK buyer [...]",
    date: "May 14, 2026",
    country: "Greece",
    image:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Whitewashed buildings overlooking the Aegean Sea",
    body: [
      "Greek islands remain high on many UK wish lists, from well-known Cycladic spots to quieter mainland-adjacent coasts. Access, ferry schedules, and year-round services matter as much as the view.",
      "Legal due diligence is essential — ensure boundaries, access rights, and planning status are clear. Some islands have restrictions that affect building or renovation plans.",
      "Think about winter practicality if you plan to spend more than summer months there, and whether you’ll manage the property yourself or use a local agent for rentals.",
      "Explore more destination ideas on MYKEYS Inspire, and always take local legal and tax advice before exchanging contracts.",
    ],
  },
];

export function getOverseasArticle(slug: string) {
  return OVERSEAS_ARTICLES.find((a) => a.slug === slug);
}
