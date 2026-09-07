import type { MovingStoriesSectionContent } from "@/lib/movingStories";
import { DEFAULT_MOVING_STORIES_LIST } from "@/lib/movingStories";
import {
  getDefaultInspireItems,
  type InspireItemsContent,
} from "@/lib/content/inspireItems";

export type { MovingStoriesSectionContent, InspireItemsContent };

export type InspireHeroContent = {
  title: string;
  titleHighlight?: string;
  subtitle: string;
  eyebrow?: string;
  ctaLabel?: string;
  sectionTitle?: string;
  searchLabel?: string;
  searchPlaceholder?: string;
  searchButton?: string;
};

export type InspireSidebarContent = {
  title: string;
  body: string;
  buttonLabel: string;
};

export type InspirePageContent = {
  hero: InspireHeroContent;
  sidebar?: InspireSidebarContent;
  /** Moving Stories list + featured sidebar card */
  stories?: MovingStoriesSectionContent;
  /** List/card content for other inspire pages */
  items?: InspireItemsContent;
};

export const INSPIRE_PAGES = [
  "moving-stories",
  "property-news",
  "energy-efficiency",
  "property-guides",
  "housing-trends",
  "mortgage-guides",
  "overseas-blog",
  "country-guides",
  "find-agent",
] as const;

export type InspirePageKey = (typeof INSPIRE_PAGES)[number];

export function isInspirePage(page: string): page is InspirePageKey {
  return (INSPIRE_PAGES as readonly string[]).includes(page);
}

export const INSPIRE_PAGE_LABELS: Record<InspirePageKey, string> = {
  "moving-stories": "Moving stories",
  "property-news": "Property news",
  "energy-efficiency": "Energy efficiency",
  "property-guides": "Property guides",
  "housing-trends": "Housing trends",
  "mortgage-guides": "Mortgage guides",
  "overseas-blog": "Overseas blog",
  "country-guides": "Country guides",
  "find-agent": "Find agent",
};

export const DEFAULT_MOVING_STORIES_CONTENT: InspirePageContent = {
  hero: {
    title: "Moving Stories",
    subtitle:
      "Homemovers share the stories behind their move, including why it ended up being the right move.",
  },
  sidebar: {
    title: "We'd love to hear your moving story",
    body: "Everyone has a moving story. Share yours with us for the chance to be featured on MYKEYS.",
    buttonLabel: "Share your story",
  },
  stories: DEFAULT_MOVING_STORIES_LIST,
};

export const DEFAULT_PROPERTY_NEWS_CONTENT: InspirePageContent = {
  hero: {
    title: "Property news",
    subtitle:
      "The latest on the housing market, property inspiration and home-moving news.",
  },
};

export const DEFAULT_ENERGY_EFFICIENCY_CONTENT: InspirePageContent = {
  hero: {
    title: "Homes",
    titleHighlight: "Greener",
    subtitle:
      "Learn about going greener at home, tips for reducing your energy bill, and the latest energy news.",
    eyebrow: "Guides",
    ctaLabel: "← Back to Guides",
    sectionTitle: "Explore energy efficiency guides",
  },
};

export const DEFAULT_PROPERTY_GUIDES_CONTENT: InspirePageContent = {
  hero: {
    title: "Property guides",
    subtitle: "For every step of your moving journey.",
    searchLabel: "What are you looking for?",
    searchPlaceholder: "e.g. first-time buyers",
    searchButton: "Search guides",
  },
};

export const DEFAULT_HOUSING_TRENDS_CONTENT: InspirePageContent = {
  hero: {
    title: "House Price Index",
    subtitle: "Track UK asking prices, market momentum and housing trends.",
    ctaLabel: "Download full report",
  },
};

export const DEFAULT_MORTGAGE_GUIDES_CONTENT: InspirePageContent = {
  hero: {
    title: "guides",
    titleHighlight: "Mortgage",
    subtitle:
      "Take one step closer to buying a home — from working out how much you could borrow, to finding and choosing a mortgage.",
    ctaLabel: "← Back to Mortgages",
    sectionTitle: "Explore mortgage guides",
  },
};

export const DEFAULT_OVERSEAS_BLOG_CONTENT: InspirePageContent = {
  hero: {
    title: "Overseas Property Blog",
    subtitle: "Ideas and advice for buying and owning property abroad.",
    sectionTitle: "Latest Articles",
  },
};

export const DEFAULT_COUNTRY_GUIDES_CONTENT: InspirePageContent = {
  hero: {
    title: "Country Guides - Guides to Top Destinations",
    subtitle:
      "Explore buying guides, local insights and overseas property tips by country.",
  },
};

export const DEFAULT_FIND_AGENT_CONTENT: InspirePageContent = {
  hero: {
    title: "Search for estate agents and letting agents on MYKEYS",
    subtitle: "Find trusted local agents to sell, let or manage your property.",
    searchPlaceholder:
      "e.g. 'York', 'NW3', 'NW3 5TY' or 'Waterloo station'",
    searchButton: "Start Search",
  },
};

export function getDefaultInspireContent(
  page: InspirePageKey
): InspirePageContent {
  switch (page) {
    case "moving-stories":
      return DEFAULT_MOVING_STORIES_CONTENT;
    case "property-news":
      return {
        ...DEFAULT_PROPERTY_NEWS_CONTENT,
        items: getDefaultInspireItems("property-news"),
      };
    case "energy-efficiency":
      return {
        ...DEFAULT_ENERGY_EFFICIENCY_CONTENT,
        items: getDefaultInspireItems("energy-efficiency"),
      };
    case "property-guides":
      return {
        ...DEFAULT_PROPERTY_GUIDES_CONTENT,
        items: getDefaultInspireItems("property-guides"),
      };
    case "housing-trends":
      return {
        ...DEFAULT_HOUSING_TRENDS_CONTENT,
        items: getDefaultInspireItems("housing-trends"),
      };
    case "mortgage-guides":
      return {
        ...DEFAULT_MORTGAGE_GUIDES_CONTENT,
        items: getDefaultInspireItems("mortgage-guides"),
      };
    case "overseas-blog":
      return {
        ...DEFAULT_OVERSEAS_BLOG_CONTENT,
        items: getDefaultInspireItems("overseas-blog"),
      };
    case "country-guides":
      return {
        ...DEFAULT_COUNTRY_GUIDES_CONTENT,
        items: getDefaultInspireItems("country-guides"),
      };
    case "find-agent":
      return DEFAULT_FIND_AGENT_CONTENT;
  }
}

export function getInspireSections(page: InspirePageKey): string[] {
  if (page === "moving-stories") return ["hero", "sidebar", "stories"];
  if (
    page === "property-news" ||
    page === "overseas-blog" ||
    page === "country-guides" ||
    page === "energy-efficiency" ||
    page === "mortgage-guides" ||
    page === "property-guides" ||
    page === "housing-trends"
  ) {
    return ["hero", "items"];
  }
  return ["hero"];
}
