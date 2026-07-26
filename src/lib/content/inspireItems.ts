import {
  PROPERTY_NEWS,
  PROPERTY_NEWS_SIDEBAR_STORY,
  type PropertyNewsArticle,
} from "@/lib/propertyNews";
import {
  OVERSEAS_ARTICLES,
  OVERSEAS_HERO_IMAGE,
  type OverseasArticle,
} from "@/lib/overseasBlog";
import { COUNTRY_GUIDES, type CountryGuide } from "@/lib/countryGuides";
import {
  ENERGY_SECTIONS,
  type EnergyGuideSection,
} from "@/lib/energyEfficiency";
import {
  MORTGAGE_SECTIONS,
  MORTGAGE_SPOTLIGHT,
  type MortgageGuideSection,
} from "@/lib/mortgageGuides";
import {
  GUIDE_CATEGORIES,
  GUIDE_SIDEBAR_ACCORDIONS,
  PROPERTY_GUIDES_HERO_IMAGE,
  type PropertyGuidesItemsContent,
} from "@/lib/propertyGuides";
import {
  HPI_DOWNLOAD_URL,
  HPI_PAST_REPORTS,
  HPI_PUBLISHED,
  HPI_SUMMARY_BULLETS,
  HPI_SUMMARY_HEADLINE,
  HOUSING_TRENDS_HERO_IMAGE,
  type HousingTrendsItemsContent,
} from "@/lib/housingTrends";
import { slugifyStoryTitle } from "@/lib/movingStories";

export const INSPIRE_ITEMS_PAGES = [
  "property-news",
  "overseas-blog",
  "country-guides",
  "energy-efficiency",
  "mortgage-guides",
  "property-guides",
  "housing-trends",
] as const;

export type InspireItemsPageKey = (typeof INSPIRE_ITEMS_PAGES)[number];

export function hasInspireItems(page: string): page is InspireItemsPageKey {
  return (INSPIRE_ITEMS_PAGES as readonly string[]).includes(page);
}

export type { PropertyGuidesItemsContent, HousingTrendsItemsContent };

export type PropertyNewsItemsContent = {
  items: PropertyNewsArticle[];
  featured: typeof PROPERTY_NEWS_SIDEBAR_STORY;
};

export type OverseasBlogItemsContent = {
  items: OverseasArticle[];
  heroImage: string;
};

export type CountryGuidesItemsContent = {
  items: CountryGuide[];
};

export type EnergyItemsContent = {
  sections: EnergyGuideSection[];
};

export type MortgageSpotlightItem = {
  slug: string;
  title: string;
  category: string;
  image: string;
  imageAlt: string;
};

export type MortgageItemsContent = {
  sections: MortgageGuideSection[];
  spotlight: MortgageSpotlightItem[];
};

export type InspireItemsContent =
  | PropertyNewsItemsContent
  | OverseasBlogItemsContent
  | CountryGuidesItemsContent
  | EnergyItemsContent
  | MortgageItemsContent
  | PropertyGuidesItemsContent
  | HousingTrendsItemsContent;

export function getDefaultInspireItems(
  page: InspireItemsPageKey
): InspireItemsContent {
  switch (page) {
    case "property-news":
      return {
        items: PROPERTY_NEWS,
        featured: PROPERTY_NEWS_SIDEBAR_STORY,
      };
    case "overseas-blog":
      return {
        items: OVERSEAS_ARTICLES,
        heroImage: OVERSEAS_HERO_IMAGE,
      };
    case "country-guides":
      return { items: COUNTRY_GUIDES };
    case "energy-efficiency":
      return { sections: ENERGY_SECTIONS };
    case "mortgage-guides":
      return {
        sections: MORTGAGE_SECTIONS,
        spotlight: MORTGAGE_SPOTLIGHT,
      };
    case "property-guides":
      return {
        heroImage: PROPERTY_GUIDES_HERO_IMAGE,
        categories: GUIDE_CATEGORIES,
        sidebar: GUIDE_SIDEBAR_ACCORDIONS,
      };
    case "housing-trends":
      return {
        heroImage: HOUSING_TRENDS_HERO_IMAGE,
        publishedDate: HPI_PUBLISHED,
        downloadUrl: HPI_DOWNLOAD_URL,
        downloadLabel: "Download full report",
        summaryHeadline: HPI_SUMMARY_HEADLINE,
        summaryBullets: [...HPI_SUMMARY_BULLETS],
        pastReports: HPI_PAST_REPORTS.map((r) => ({ ...r })),
      };
  }
}

function mergeById<T extends { id: string }>(
  defaults: T[],
  stored: unknown
): T[] {
  if (!Array.isArray(stored) || stored.length === 0) return defaults;
  return stored.map((raw, i) => {
    const item = (raw || {}) as Partial<T> & { id?: string };
    const base = defaults[Math.min(i, defaults.length - 1)] || defaults[0];
    return {
      ...base,
      ...item,
      id: item.id || base?.id || `item-${i + 1}`,
    } as T;
  });
}

function mergeBySlug<T extends { slug: string }>(
  defaults: T[],
  stored: unknown
): T[] {
  if (!Array.isArray(stored) || stored.length === 0) return defaults;
  return stored.map((raw, i) => {
    const item = (raw || {}) as Partial<T> & { slug?: string };
    const base = defaults[Math.min(i, defaults.length - 1)] || defaults[0];
    return {
      ...base,
      ...item,
      slug: item.slug || base?.slug || `item-${i + 1}`,
    } as T;
  });
}

export function mergeInspireItems(
  page: InspireItemsPageKey,
  stored?: Partial<InspireItemsContent> | null
): InspireItemsContent {
  const defaults = getDefaultInspireItems(page);

  switch (page) {
    case "property-news": {
      const d = defaults as PropertyNewsItemsContent;
      const s = stored as Partial<PropertyNewsItemsContent> | null | undefined;
      return {
        items: mergeById(d.items, s?.items),
        featured: { ...d.featured, ...(s?.featured || {}) },
      };
    }
    case "overseas-blog": {
      const d = defaults as OverseasBlogItemsContent;
      const s = stored as Partial<OverseasBlogItemsContent> | null | undefined;
      return {
        items: mergeById(d.items, s?.items).map((item) => ({
          ...item,
          body: Array.isArray(item.body) ? item.body : d.items[0]?.body || [],
        })),
        heroImage: s?.heroImage || d.heroImage,
      };
    }
    case "country-guides": {
      const d = defaults as CountryGuidesItemsContent;
      const s = stored as Partial<CountryGuidesItemsContent> | null | undefined;
      return {
        items: mergeById(d.items, s?.items).map((item, i) => ({
          ...item,
          sections:
            Array.isArray(item.sections) && item.sections.length > 0
              ? item.sections
              : d.items[Math.min(i, d.items.length - 1)]?.sections || [],
        })),
      };
    }
    case "energy-efficiency": {
      const d = defaults as EnergyItemsContent;
      const s = stored as Partial<EnergyItemsContent> | null | undefined;
      if (!Array.isArray(s?.sections) || s.sections.length === 0) return d;
      return {
        sections: s.sections.map((sec, si) => {
          const base = d.sections[Math.min(si, d.sections.length - 1)];
          return {
            ...base,
            ...sec,
            id: sec.id || base.id,
            guides: mergeById(base.guides, sec.guides),
          };
        }),
      };
    }
    case "mortgage-guides": {
      const d = defaults as MortgageItemsContent;
      const s = stored as Partial<MortgageItemsContent> | null | undefined;
      return {
        sections:
          Array.isArray(s?.sections) && s.sections.length > 0
            ? s.sections.map((sec, si) => {
                const base = d.sections[Math.min(si, d.sections.length - 1)];
                return {
                  ...base,
                  ...sec,
                  id: sec.id || base.id,
                  guides: mergeById(base.guides, sec.guides),
                };
              })
            : d.sections,
        spotlight: mergeBySlug(d.spotlight, s?.spotlight),
      };
    }
    case "property-guides": {
      const d = defaults as PropertyGuidesItemsContent;
      const s = stored as Partial<PropertyGuidesItemsContent> | null | undefined;
      return {
        heroImage: s?.heroImage || d.heroImage,
        categories:
          Array.isArray(s?.categories) && s.categories.length > 0
            ? s.categories.map((cat, i) => {
                const base = d.categories[Math.min(i, d.categories.length - 1)];
                return {
                  ...base,
                  ...cat,
                  id: cat.id || base.id,
                  links:
                    Array.isArray(cat.links) && cat.links.length > 0
                      ? cat.links
                      : base.links,
                };
              })
            : d.categories,
        sidebar:
          Array.isArray(s?.sidebar) && s.sidebar.length > 0
            ? s.sidebar.map((acc, i) => {
                const base = d.sidebar[Math.min(i, d.sidebar.length - 1)];
                return {
                  ...base,
                  ...acc,
                  id: acc.id || base.id,
                  links:
                    Array.isArray(acc.links) && acc.links.length > 0
                      ? acc.links
                      : base.links,
                };
              })
            : d.sidebar,
      };
    }
    case "housing-trends": {
      const d = defaults as HousingTrendsItemsContent;
      const s = stored as Partial<HousingTrendsItemsContent> | null | undefined;
      return {
        ...d,
        ...s,
        summaryBullets:
          Array.isArray(s?.summaryBullets) && s.summaryBullets.length > 0
            ? s.summaryBullets
            : d.summaryBullets,
        pastReports:
          Array.isArray(s?.pastReports) && s.pastReports.length > 0
            ? s.pastReports
            : d.pastReports,
      };
    }
  }
}

export function emptyPropertyNewsItem(index: number): PropertyNewsArticle {
  const title = `New property news ${index}`;
  return {
    id: `news-${Date.now()}-${index}`,
    slug: slugifyStoryTitle(title),
    title,
    category: "Property news",
    date: new Date().toLocaleDateString("en-GB", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    image: "",
    imageAlt: "",
  };
}

export function emptyOverseasItem(index: number): OverseasArticle {
  const title = `New overseas article ${index}`;
  return {
    id: `overseas-${Date.now()}-${index}`,
    slug: slugifyStoryTitle(title),
    title,
    excerpt: "",
    date: new Date().toLocaleDateString("en-GB", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    country: "",
    image: "",
    imageAlt: "",
    body: [""],
  };
}

export function emptyCountryGuide(index: number): CountryGuide {
  const name = `New country ${index}`;
  return {
    id: `country-${Date.now()}-${index}`,
    slug: slugifyStoryTitle(name),
    name,
    title: `Buying in ${name}`,
    image: "",
    imageAlt: "",
    flagCode: "gb",
    blogHref: "/inspire/overseas-blog",
    propertiesHref: "/buy",
    intro: "",
    sections: [{ heading: "Overview", paragraphs: [""] }],
  };
}
