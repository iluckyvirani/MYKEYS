export type PropertyNewsArticle = {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  category: string;
  date: string;
  image: string;
  imageAlt: string;
};

export const PROPERTY_NEWS_CATEGORIES = [
  "Dream properties",
  "Property news",
  "Celebrity homes",
  "Property guides",
] as const;

export const PROPERTY_NEWS: PropertyNewsArticle[] = [
  {
    id: "1",
    slug: "most-popular-uk-commuter-towns-2024",
    title: "Most popular UK commuter towns for buyers 2024",
    category: "Property news",
    date: "June 30, 2026",
    image:
      "https://images.unsplash.com/photo-1513635268270-9b9d3f0e0f1a?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Historic UK town with cathedral and river",
  },
  {
    id: "2",
    slug: "current-mortgage-rates",
    title: "Current mortgage rates",
    summary: "Understand what’s happening with mortgage rates this month.",
    category: "Property news",
    date: "June 28, 2026",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Terraced brick houses on a residential street",
  },
  {
    id: "3",
    slug: "mortgage-rule-changes",
    title: "What could the mortgage rule changes mean for you?",
    category: "Property news",
    date: "June 26, 2026",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "People reviewing mortgage documents",
  },
  {
    id: "4",
    slug: "average-house-price-great-britain",
    title: "What does the average house price buy across Great Britain?",
    category: "Property news",
    date: "June 30, 2026",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "House surrounded by trees from above",
  },
  {
    id: "5",
    slug: "homebuying-reforms",
    title: "What the proposed homebuying reforms could mean for you",
    category: "Property news",
    date: "June 30, 2026",
    image:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Street of terraced brick houses",
  },
  {
    id: "6",
    slug: "garden-homes-buyers-want",
    title: "Why garden space is still top of buyers’ wish lists",
    category: "Dream properties",
    date: "June 22, 2026",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Lush green garden and home exterior",
  },
  {
    id: "7",
    slug: "period-homes-back-in-demand",
    title: "Period homes make a comeback with first-time movers",
    category: "Dream properties",
    date: "June 18, 2026",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d36b48?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "White Georgian-style mansion",
  },
  {
    id: "8",
    slug: "energy-efficient-homes-guide",
    title: "A practical guide to buying an energy-efficient home",
    category: "Property guides",
    date: "June 12, 2026",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Modern energy-efficient house",
  },
  {
    id: "9",
    slug: "celebrity-homes-inspiration",
    title: "Celebrity homes that inspired this year’s interior trends",
    category: "Celebrity homes",
    date: "June 8, 2026",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Stylish celebrity-style living room",
  },
];

export const PROPERTY_NEWS_SIDEBAR_STORY = {
  slug: "wreck-by-the-sea",
  title: "We bought a wreck by the sea & made it home",
  cta: "Read their moving story",
  image:
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=900&q=80",
  imageAlt: "Smiling couple outdoors",
};
