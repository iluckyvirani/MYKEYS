export type EnergyGuide = {
  id: string;
  slug: string;
  title: string;
  image?: string;
  imageAlt?: string;
  illustrated?: boolean;
};

export type EnergyGuideSection = {
  id: string;
  title: string;
  description: string;
  guides: EnergyGuide[];
};

export const ENERGY_NAV_LINKS = [
  { href: "#energy-at-home", label: "Energy at home" },
  { href: "#energy-bills", label: "Energy bills" },
  {
    href: "#energy-performance-certificates",
    label: "Energy Performance Certificates",
  },
  { href: "#energy-news", label: "Energy news" },
  { href: "#energy-grants-and-schemes", label: "Energy grants and schemes" },
  { href: "#greener-homes-reports", label: "Our Greener Homes Reports" },
] as const;

export const ENERGY_SECTIONS: EnergyGuideSection[] = [
  {
    id: "energy-bills",
    title: "Energy bills",
    description:
      "Check average energy bills by property type and EPC rating, plus tips for saving money.",
    guides: [
      {
        id: "b1",
        slug: "average-uk-energy-bill",
        title: "What’s the average UK energy bill?",
        image:
          "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Parent and child on a sofa at home",
      },
      {
        id: "b2",
        slug: "mistakes-adding-to-energy-bill",
        title: "10 mistakes adding to your energy bill",
      },
      {
        id: "b3",
        slug: "latest-energy-price-cap",
        title: "What’s the latest energy price cap?",
      },
    ],
  },
  {
    id: "energy-at-home",
    title: "Energy at home",
    description:
      "Your handy guides to making green improvements, and saving energy around your home.",
    guides: [
      {
        id: "h1",
        slug: "what-is-an-electric-home",
        title: "What is an electric home?",
        illustrated: true,
      },
      {
        id: "h2",
        slug: "myths-about-heat-pumps",
        title: "10 myths about heat pumps",
      },
      {
        id: "h3",
        slug: "myths-about-solar-panels",
        title: "9 myths about solar panels",
      },
      {
        id: "h4",
        slug: "energy-saving-tips",
        title: "Energy-saving tips for your home",
      },
    ],
  },
  {
    id: "energy-performance-certificates",
    title: "Energy Performance Certificates (EPCs)",
    description:
      "Learn more about EPCs and current regulations, as well as tips for improving your property’s energy efficiency rating.",
    guides: [
      {
        id: "e1",
        slug: "what-is-an-epc",
        title: "What is an Energy Performance Certificate?",
        image:
          "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Homeowner in a kitchen with a mug",
      },
      {
        id: "e2",
        slug: "epc-requirements-for-landlords",
        title: "What are the EPC requirements for landlords?",
      },
      {
        id: "e3",
        slug: "homes-exempt-from-epcs",
        title: "Which homes are exempt from EPCs?",
      },
    ],
  },
  {
    id: "energy-grants-and-schemes",
    title: "Energy grants and schemes",
    description:
      "Check whether you could get financial help with making green improvements, as well as guides to switching to different energy tariffs.",
    guides: [
      {
        id: "g1",
        slug: "boiler-upgrade-scheme",
        title: "What is the Boiler Upgrade Scheme?",
        image:
          "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Air source heat pump outside a home",
      },
      {
        id: "g2",
        slug: "warm-home-discount",
        title: "What is the Warm Home Discount?",
      },
      {
        id: "g3",
        slug: "economy-7-tariff",
        title: "What is the Economy 7 tariff and could it save you money?",
      },
      {
        id: "g4",
        slug: "green-home-grants-overview",
        title: "Green home grants: what’s available right now?",
      },
    ],
  },
  {
    id: "energy-news",
    title: "Energy news",
    description:
      "Stay updated with the latest energy news stories, changes to legislation and more.",
    guides: [
      {
        id: "n1",
        slug: "epc-targets-for-rental-homes",
        title: "EPC targets for rental homes: the latest update",
        image:
          "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Aerial view of a residential neighbourhood",
      },
      {
        id: "n2",
        slug: "heat-pump-installation-trends",
        title: "Heat pump installations continue to rise across the UK",
      },
      {
        id: "n3",
        slug: "solar-panel-payback-times",
        title: "How long do solar panels take to pay for themselves?",
      },
    ],
  },
  {
    id: "greener-homes-reports",
    title: "Our Greener Homes Reports",
    description:
      "Research and insights into how homeowners are making greener choices.",
    guides: [
      {
        id: "r1",
        slug: "greener-homes-report-2026",
        title: "Greener Homes Report 2026: key findings",
        image:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Modern energy-efficient home",
      },
      {
        id: "r2",
        slug: "buyer-demand-for-green-homes",
        title: "Buyer demand for greener homes is growing",
      },
    ],
  },
];
