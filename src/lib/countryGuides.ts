export type CountryGuide = {
  id: string;
  slug: string;
  name: string;
  title: string;
  image: string;
  imageAlt: string;
  /** ISO 3166-1 alpha-2 for flagcdn */
  flagCode: string;
  blogHref: string;
  propertiesHref: string;
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
};

export const COUNTRY_GUIDES: CountryGuide[] = [
  {
    id: "spain",
    slug: "spain",
    name: "Spain",
    title: "Buying in Spain",
    image:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Barcelona street with historic architecture in Spain",
    flagCode: "es",
    blogHref: "/inspire/overseas-blog/spain-holiday-home-buying-checklist",
    propertiesHref: "/buy",
    intro:
      "Spain remains one of the most popular overseas destinations for UK buyers — from Costa del Sol apartments to inland villas and island escapes.",
    sections: [
      {
        heading: "Why buy in Spain?",
        paragraphs: [
          "Sunshine, established expat communities, and a wide range of property types make Spain a perennial favourite. Coastal resorts, historic cities, and quieter inland towns each offer a different lifestyle.",
          "Many UK buyers look for holiday homes with rental potential, while others plan longer stays or permanent moves. Clarify your goal early — it shapes location, budget, and legal considerations.",
        ],
      },
      {
        heading: "The buying process",
        paragraphs: [
          "Always use an independent Spanish lawyer (abogado) who works for you, not the seller. Check title deeds (nota simple), planning status, community fees, and any debts attached to the property.",
          "Expect fees for notary, land registry, and taxes such as transfer tax or VAT on new builds. Budgets typically allow 10–15% on top of the purchase price for costs.",
        ],
      },
      {
        heading: "Practical tips",
        paragraphs: [
          "If you plan to rent the property out, check regional tourist-licence rules. Factor in community charges for apartments and ongoing maintenance if you’ll be away for long periods.",
          "Currency movements can affect your budget — some buyers use specialists to manage sterling-to-euro transfers around exchange.",
        ],
      },
    ],
  },
  {
    id: "france",
    slug: "france",
    name: "France",
    title: "Buying in France",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Historic bridge and buildings along the Seine in France",
    flagCode: "fr",
    blogHref:
      "/inspire/overseas-blog/getting-a-mortgage-in-france-as-a-uk-buyer",
    propertiesHref: "/buy",
    intro:
      "From Provençal farmhouses to Alpine chalets and city apartments, France offers huge variety — with a formal, notaire-led purchase process.",
    sections: [
      {
        heading: "Why buy in France?",
        paragraphs: [
          "France appeals for lifestyle, food, culture, and relatively accessible entry prices outside the big cities. Rural character properties and coastal second homes remain popular with UK buyers.",
          "Decide whether you want a renovation project or a move-in-ready home — older stone properties can be charming but need realistic budgets for works and heating.",
        ],
      },
      {
        heading: "The buying process",
        paragraphs: [
          "French conveyancing centres on the notaire. You’ll usually sign a compromesso (preliminary contract) then complete at the notaire’s office. Cooling-off periods and diagnostics surveys are part of the standard process.",
          "Non-resident mortgages are available but often require larger deposits. Gather income evidence early if you plan to finance the purchase.",
        ],
      },
      {
        heading: "Practical tips",
        paragraphs: [
          "Budget for notaire fees, which are higher than typical UK conveyancing costs. Check inheritance rules if the property may stay in the family long term.",
          "Local taxes (taxe foncière and taxe d’habitation where applicable) and running costs should sit in your annual ownership budget.",
        ],
      },
    ],
  },
  {
    id: "portugal",
    slug: "portugal",
    name: "Portugal",
    title: "Buying in Portugal",
    image:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Portuguese coastal town with white walls and red roofs",
    flagCode: "pt",
    blogHref: "/inspire/overseas-blog/how-to-get-a-mortgage-in-portugal",
    propertiesHref: "/buy",
    intro:
      "Portugal combines Atlantic coast living, historic cities, and a welcoming climate — and remains a top pick for UK buyers seeking value and lifestyle.",
    sections: [
      {
        heading: "Why buy in Portugal?",
        paragraphs: [
          "The Algarve, Lisbon, Porto, and Madeira each attract different buyers — from golf and beach holidays to city living and digital-nomad lifestyles.",
          "English is widely spoken in popular areas, and the property market is well used to overseas purchasers.",
        ],
      },
      {
        heading: "The buying process",
        paragraphs: [
          "You’ll need a Portuguese tax number (NIF) and typically a local bank account. A promissory contract (CPCV) often comes before the final deed at the notary.",
          "Always instruct an independent lawyer to check title, licences, and any condominium rules for apartments.",
        ],
      },
      {
        heading: "Practical tips",
        paragraphs: [
          "Non-resident mortgage deposits can be 20–40%. Factor in IMT (transfer tax), stamp duty, and notary/registry fees on top of the price.",
          "If buying off-plan, verify the developer, payment schedule, and completion guarantees carefully.",
        ],
      },
    ],
  },
  {
    id: "italy",
    slug: "italy",
    name: "Italy",
    title: "Buying in Italy",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Hillside Mediterranean town in Italy",
    flagCode: "it",
    blogHref: "/inspire/overseas-blog/italy-property-for-uk-buyers",
    propertiesHref: "/buy",
    intro:
      "Italy’s regional markets vary widely — lakes, coasts, countryside, and cities all offer character, but due diligence is essential.",
    sections: [
      {
        heading: "Why buy in Italy?",
        paragraphs: [
          "Buyers are drawn by landscape, culture, and lifestyle — from lakeside apartments to Tuscan farmhouses and southern coastal towns.",
          "Prices and bureaucracy differ by region. Research your chosen area thoroughly before making an offer.",
        ],
      },
      {
        heading: "The buying process",
        paragraphs: [
          "Purchases typically involve a preliminary contract (compromesso) and completion before a notary (notaio). Surveys and title checks matter especially for rural or older properties.",
          "Confirm access rights, boundaries, and that utilities are connected — particularly for countryside homes.",
        ],
      },
      {
        heading: "Practical tips",
        paragraphs: [
          "Renovation projects need realistic timelines and budgets, plus checks on planning permissions. Some regions have additional restrictions.",
          "Work with an English-speaking local lawyer and consider currency planning if your funds are in sterling.",
        ],
      },
    ],
  },
  {
    id: "greece",
    slug: "greece",
    name: "Greece",
    title: "Buying in Greece",
    image:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Whitewashed buildings with blue domes overlooking the sea",
    flagCode: "gr",
    blogHref: "/inspire/overseas-blog/greece-island-homes-what-to-know",
    propertiesHref: "/buy",
    intro:
      "Greek islands and mainland coasts offer iconic scenery — but island logistics, titles, and seasonal living need careful thought.",
    sections: [
      {
        heading: "Why buy in Greece?",
        paragraphs: [
          "Crystal seas, distinctive architecture, and a strong holiday-home market make Greece a dream destination for many UK buyers.",
          "Popular islands can be busy in summer and quiet in winter — consider access, healthcare, and year-round services if you plan longer stays.",
        ],
      },
      {
        heading: "The buying process",
        paragraphs: [
          "Legal due diligence is critical. Confirm boundaries, planning status, and that the seller has clear title. A local lawyer and notary are standard.",
          "Some locations have building or renovation restrictions that affect what you can change after purchase.",
        ],
      },
      {
        heading: "Practical tips",
        paragraphs: [
          "Ferry schedules and flight links matter for island homes. Factor in property management if you’ll rent to holiday guests.",
          "Budget for taxes, notary fees, and ongoing community or maintenance costs where apartments are involved.",
        ],
      },
    ],
  },
  {
    id: "cyprus",
    slug: "cyprus",
    name: "Cyprus",
    title: "Buying in Cyprus",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Sandy beach and turquoise water in Cyprus",
    flagCode: "cy",
    blogHref: "/inspire/overseas-blog/buying-property-in-cyprus",
    propertiesHref: "/buy",
    intro:
      "Cyprus offers a warm climate, English widely spoken, and a property market familiar to many UK buyers — from coastal apartments to inland villas.",
    sections: [
      {
        heading: "Why buy in Cyprus?",
        paragraphs: [
          "Lifestyle, sunshine, and relatively straightforward communication make Cyprus attractive for holiday homes and longer stays.",
          "Coastal towns and resort areas dominate overseas demand, while quieter inland villages appeal to buyers seeking space and value.",
        ],
      },
      {
        heading: "The buying process",
        paragraphs: [
          "Check title deeds carefully and use an independent solicitor. New-build schemes need scrutiny of completion timelines and developer credentials.",
          "Understand transfer fees, VAT where relevant, and any communal charges for apartment complexes.",
        ],
      },
      {
        heading: "Practical tips",
        paragraphs: [
          "Residency and tax treatment depend on how long you stay and whether you rent the property out. Take local advice early.",
          "If financing, compare local and specialist overseas mortgage options before you commit to an asking price.",
        ],
      },
    ],
  },
];

export function getCountryGuide(slug: string) {
  return COUNTRY_GUIDES.find((c) => c.slug === slug);
}
