import {
  BookOpen,
  Building2,
  Home,
  Scale,
  Search,
  type LucideIcon,
} from "lucide-react";
import type { SitePageKey } from "@/lib/content/siteDefaults";
import { INSPIRE_PAGE_LABELS } from "@/lib/content/inspireDefaults";

export type ContentNavKey = "home" | SitePageKey;

export type ContentNavItem = {
  key: ContentNavKey;
  label: string;
  href: string;
  liveHref: string;
  description: string;
};

export type ContentNavGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: ContentNavItem[];
};

const PAGE_META: Record<
  SitePageKey,
  { label: string; liveHref: string; description: string }
> = {
  about: {
    label: "About Us",
    liveHref: "/about",
    description: "Hero, business model, how it works, and stats",
  },
  contact: {
    label: "Contact Us",
    liveHref: "/contact",
    description: "Hero, phone, email, and emergency contact",
  },
  privacy: {
    label: "Privacy Policy",
    liveHref: "/privacy",
    description: "Legal policy text and sections",
  },
  terms: {
    label: "Terms of Service",
    liveHref: "/terms",
    description: "Terms copy and sections",
  },
  cookies: {
    label: "Cookie Policy",
    liveHref: "/cookies",
    description: "Cookie policy copy and sections",
  },
  buy: {
    label: "Buy",
    liveHref: "/buy",
    description: "Buy search hero, how it works, FAQ titles",
  },
  rent: {
    label: "Whole Property",
    liveHref: "/rent/whole-property",
    description: "Whole property rent search, how it works, FAQ titles",
  },
  "room-to-rent": {
    label: "Room to Rent",
    liveHref: "/rent/room-to-rent",
    description: "Room to rent search, how it works, FAQ titles",
  },
  "short-stay": {
    label: "Short Stay",
    liveHref: "/rent/short-rent",
    description: "Short stay search hero, how it works, FAQ titles",
  },
  "moving-stories": {
    label: INSPIRE_PAGE_LABELS["moving-stories"],
    liveHref: "/inspire/moving-stories",
    description: "Hero, sidebar CTA, and story cards with image upload",
  },
  "property-news": {
    label: INSPIRE_PAGE_LABELS["property-news"],
    liveHref: "/inspire/property-news",
    description: "Hero and news cards with image upload",
  },
  "energy-efficiency": {
    label: INSPIRE_PAGE_LABELS["energy-efficiency"],
    liveHref: "/inspire/energy-efficiency",
    description: "Hero and energy guides with image upload",
  },
  "property-guides": {
    label: INSPIRE_PAGE_LABELS["property-guides"],
    liveHref: "/inspire/property-guides",
    description: "Hero, guide categories, and sidebar links",
  },
  "housing-trends": {
    label: INSPIRE_PAGE_LABELS["housing-trends"],
    liveHref: "/inspire/housing-trends",
    description: "Hero, report summary, and download links",
  },
  "mortgage-guides": {
    label: INSPIRE_PAGE_LABELS["mortgage-guides"],
    liveHref: "/inspire/mortgage-guides",
    description: "Hero, spotlight, and guides with image upload",
  },
  "overseas-blog": {
    label: INSPIRE_PAGE_LABELS["overseas-blog"],
    liveHref: "/inspire/overseas-blog",
    description: "Hero and overseas articles with image upload",
  },
  "country-guides": {
    label: INSPIRE_PAGE_LABELS["country-guides"],
    liveHref: "/inspire/country-guides",
    description: "Country guide cards with image upload",
  },
  "find-agent": {
    label: INSPIRE_PAGE_LABELS["find-agent"],
    liveHref: "/inspire/find-agent",
    description: "Find agent search headline",
  },
};

function item(key: SitePageKey): ContentNavItem {
  const meta = PAGE_META[key];
  return {
    key,
    label: meta.label,
    href: `/admin/dashboard/content/${key}`,
    liveHref: meta.liveHref,
    description: meta.description,
  };
}

export const CONTENT_NAV_GROUPS: ContentNavGroup[] = [
  {
    id: "home",
    label: "Homepage",
    icon: Home,
    items: [
      {
        key: "home",
        label: "Home",
        href: "/admin/dashboard/content/home",
        liveHref: "/",
        description: "Hero, categories, featured, testimonials, stats, FAQ",
      },
    ],
  },
  {
    id: "search",
    label: "Buy · Rent · Stay",
    icon: Search,
    items: [
      item("buy"),
      item("rent"),
      item("room-to-rent"),
      item("short-stay"),
    ],
  },
  {
    id: "company",
    label: "Company",
    icon: Building2,
    items: [item("about"), item("contact")],
  },
  {
    id: "legal",
    label: "Legal",
    icon: Scale,
    items: [item("privacy"), item("terms"), item("cookies")],
  },
  {
    id: "inspire",
    label: "Inspire",
    icon: BookOpen,
    items: [
      item("moving-stories"),
      item("property-news"),
      item("energy-efficiency"),
      item("property-guides"),
      item("housing-trends"),
      item("mortgage-guides"),
      item("overseas-blog"),
      item("country-guides"),
      item("find-agent"),
    ],
  },
];

export function getContentNavItem(key: ContentNavKey): ContentNavItem {
  for (const group of CONTENT_NAV_GROUPS) {
    const found = group.items.find((i) => i.key === key);
    if (found) return found;
  }
  return CONTENT_NAV_GROUPS[0].items[0];
}

export function getAllContentNavItems(): ContentNavItem[] {
  return CONTENT_NAV_GROUPS.flatMap((g) => g.items);
}
