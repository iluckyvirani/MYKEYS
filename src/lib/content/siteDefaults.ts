export type LegalSection = {
  heading: string;
  body: string;
};

export type LegalPageContent = {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

export type ContactPageContent = {
  hero: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    supportPhone: string;
    supportEmail: string;
    emergencyPhone: string;
    emergencyNote: string;
  };
};

// Re-export About types from dedicated defaults
export type { AboutPageContent } from "@/lib/content/aboutDefaults";
export { DEFAULT_ABOUT_CONTENT } from "@/lib/content/aboutDefaults";

/** Buy / Rent / Short Stay landing pages */
export type ListingStatItem = {
  value: string;
  label: string;
};

export type ListingPageContent = {
  hero: {
    title: string;
    placeholder: string;
    buttonLabel: string;
  };
  howItWorks: {
    title: string;
    subtitle: string;
    /** CTA banner under the steps (used on Buy) */
    ctaTitle?: string;
    ctaSubtitle?: string;
    ctaButtonLabel?: string;
    stats?: ListingStatItem[];
  };
  faq: {
    title: string;
    subtitle: string;
  };
};

export const SITE_PAGES = [
  "about",
  "contact",
  "privacy",
  "terms",
  "cookies",
  "buy",
  "rent",
  "room-to-rent",
  "short-stay",
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

export type SitePageKey = (typeof SITE_PAGES)[number];

export const LISTING_PAGES = ["buy", "rent", "room-to-rent", "short-stay"] as const;
export type ListingPageKey = (typeof LISTING_PAGES)[number];

export function isListingPage(page: string): page is ListingPageKey {
  return (LISTING_PAGES as readonly string[]).includes(page);
}

export const DEFAULT_CONTACT_CONTENT: ContactPageContent = {
  hero: {
    title: "Get In Touch",
    titleHighlight: "We're Here to Help",
    subtitle:
      "Whether you're looking for a property, listing yours, or need support, our team is ready to assist you.",
    supportPhone: "+44 77199 89032",
    supportEmail: "support@mykeysuk.com",
    emergencyPhone: "+44 800 123 456",
    emergencyNote: "Available 24/7 for safety emergencies only",
  },
};

export const DEFAULT_PRIVACY_CONTENT: LegalPageContent = {
  title: "Privacy Policy",
  lastUpdated: "25 July 2026",
  intro:
    "This Privacy Policy explains how MYKEYS collects, uses, and protects your personal information when you use our website and services.",
  sections: [
    {
      heading: "Information we collect",
      body: "We may collect account details (name, email, phone), property and inquiry information you submit, usage data such as pages visited and device type, and payment-related information processed by our payment providers.",
    },
    {
      heading: "How we use your information",
      body: "We use your information to provide and improve MYKEYS services, process listings and bookings, respond to inquiries, send important service updates, and — with your consent — analytics or marketing communications.",
    },
    {
      heading: "Sharing your information",
      body: "We may share data with service providers who help us operate the platform (hosting, payments, email), with other users when needed for a transaction (e.g. inquiry between buyer and owner), or when required by law.",
    },
    {
      heading: "Data security & retention",
      body: "We apply appropriate technical and organisational measures to protect personal data. We retain information only as long as needed for the purposes described or as required by law.",
    },
    {
      heading: "Your rights",
      body: "Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal data. Contact us to exercise these rights.",
    },
    {
      heading: "Contact",
      body: "For privacy questions, contact us via the Contact Us page or the support email listed in Admin settings.",
    },
  ],
};

export const DEFAULT_TERMS_CONTENT: LegalPageContent = {
  title: "Terms of Service",
  lastUpdated: "25 July 2026",
  intro:
    "These Terms of Service govern your use of the MYKEYS website and services. By accessing or using MYKEYS, you agree to these terms.",
  sections: [
    {
      heading: "Using MYKEYS",
      body: "You must provide accurate information, keep your account secure, and use the platform only for lawful purposes. You must not misuse listings, attempt unauthorised access, or interfere with the service.",
    },
    {
      heading: "Listings & transactions",
      body: "Property owners and agents are responsible for the accuracy of their listings. MYKEYS provides a platform to connect parties; unless stated otherwise, we are not a party to sale, rent, or service contracts between users.",
    },
    {
      heading: "Fees",
      body: "Some services may involve platform fees or commissions as described in packages or at the point of listing/booking. Fees will be shown before you confirm a paid action.",
    },
    {
      heading: "Content & intellectual property",
      body: "You retain rights to content you upload but grant MYKEYS a licence to host and display it for operating the service. MYKEYS branding and software remain our property.",
    },
    {
      heading: "Limitation of liability",
      body: "To the fullest extent permitted by law, MYKEYS is not liable for indirect or consequential losses arising from use of the platform or from dealings between users.",
    },
    {
      heading: "Changes",
      body: "We may update these terms from time to time. Continued use after changes means you accept the updated terms. The last updated date is shown at the top of this page.",
    },
  ],
};

export const DEFAULT_COOKIES_CONTENT: LegalPageContent = {
  title: "Cookie Policy",
  lastUpdated: "25 July 2026",
  intro:
    "MYKEYS uses cookies and similar technologies to keep the site secure, remember your preferences, and (with your consent) improve the experience and measure performance.",
  sections: [
    {
      heading: "Necessary cookies",
      body: "Required for core features such as authentication, security, and load balancing. These cannot be turned off while using the site.",
    },
    {
      heading: "Analytics cookies",
      body: "Help us understand how visitors use MYKEYS so we can improve pages and search. Used only if you accept analytics cookies in the consent banner.",
    },
    {
      heading: "Marketing cookies",
      body: "Used to deliver more relevant advertising and measure campaigns. Used only if you accept marketing cookies in the consent banner.",
    },
    {
      heading: "Managing cookies",
      body: "You can accept or reject non-essential cookies via the cookie banner when it appears. You can also clear cookies through your browser settings. For more on how we handle personal data, see our Privacy Policy.",
    },
  ],
};

export const DEFAULT_BUY_CONTENT: ListingPageContent = {
  hero: {
    title: "Search properties to buy",
    placeholder: "e.g. London, Manchester or SW1A 1AA",
    buttonLabel: "Search",
  },
  howItWorks: {
    title: "How Buying Works on MYKEYS",
    subtitle: "A simple, transparent process from search to settlement",
    ctaTitle: "Ready to find your dream home?",
    ctaSubtitle:
      "Start your property search today and connect directly with owners. Save thousands in agent fees and get better deals.",
    ctaButtonLabel: "Start Searching",
    stats: [
      { value: "£15,000", label: "Avg. saving vs agents" },
      { value: "24h", label: "Avg. response time" },
      { value: "98%", label: "Customer satisfaction" },
      { value: "£0", label: "Buyer fees" },
    ],
  },
  faq: {
    title: "Buying Property FAQs",
    subtitle:
      "Clear answers about purchasing through MYKEYS — from offers to completion.",
  },
};

export const DEFAULT_RENT_CONTENT: ListingPageContent = {
  hero: {
    title: "Search properties to rent",
    placeholder: "e.g. London, Manchester or SW1A 1AA",
    buttonLabel: "Search",
  },
  howItWorks: {
    title: "How Long Term Rental Works",
    subtitle: "Direct rental process from search to move-in",
  },
  faq: {
    title: "Whole Property FAQs",
    subtitle:
      "Answers about long-term whole-property rentals, leases, and finding the right home.",
  },
};

export const DEFAULT_ROOM_TO_RENT_CONTENT: ListingPageContent = {
  hero: {
    title: "Search rooms to rent",
    placeholder: "e.g. London, Manchester or SW1A 1AA",
    buttonLabel: "Search",
  },
  howItWorks: {
    title: "How Room Rentals Work",
    subtitle: "Find a room, connect with housemates, and move in with confidence",
  },
  faq: {
    title: "Room to Rent FAQs",
    subtitle:
      "Helpful answers about renting a room and living with housemates.",
  },
};

export const DEFAULT_SHORT_STAY_CONTENT: ListingPageContent = {
  hero: {
    title: "Search short stays",
    placeholder: "e.g. London, Manchester or SW1A 1AA",
    buttonLabel: "Search",
  },
  howItWorks: {
    title: "How Short Stays Work",
    subtitle: "Easy booking process from search to check-out",
  },
  faq: {
    title: "Short Stay FAQs",
    subtitle: "Common questions about booking short stays on MYKEYS.",
  },
};

import {
  getDefaultInspireContent,
  getInspireSections,
  isInspirePage,
} from "@/lib/content/inspireDefaults";
import {
  ABOUT_SECTIONS,
  DEFAULT_ABOUT_CONTENT,
} from "@/lib/content/aboutDefaults";

export function getDefaultListingContent(
  page: ListingPageKey
): ListingPageContent {
  switch (page) {
    case "buy":
      return DEFAULT_BUY_CONTENT;
    case "rent":
      return DEFAULT_RENT_CONTENT;
    case "room-to-rent":
      return DEFAULT_ROOM_TO_RENT_CONTENT;
    case "short-stay":
      return DEFAULT_SHORT_STAY_CONTENT;
  }
}

export function getDefaultContentForPage(page: SitePageKey) {
  if (isInspirePage(page)) {
    return getDefaultInspireContent(page);
  }
  switch (page) {
    case "about":
      return DEFAULT_ABOUT_CONTENT;
    case "contact":
      return { hero: DEFAULT_CONTACT_CONTENT.hero };
    case "privacy":
      return { main: DEFAULT_PRIVACY_CONTENT };
    case "terms":
      return { main: DEFAULT_TERMS_CONTENT };
    case "cookies":
      return { main: DEFAULT_COOKIES_CONTENT };
    case "buy":
      return DEFAULT_BUY_CONTENT;
    case "rent":
      return DEFAULT_RENT_CONTENT;
    case "room-to-rent":
      return DEFAULT_ROOM_TO_RENT_CONTENT;
    case "short-stay":
      return DEFAULT_SHORT_STAY_CONTENT;
  }
}

export function getSectionsForPage(page: SitePageKey): string[] {
  if (isInspirePage(page)) {
    return getInspireSections(page);
  }
  switch (page) {
    case "about":
      return [...ABOUT_SECTIONS];
    case "contact":
      return ["hero"];
    case "privacy":
    case "terms":
    case "cookies":
      return ["main"];
    case "buy":
    case "rent":
    case "room-to-rent":
    case "short-stay":
      return ["hero", "howItWorks", "faq"];
  }
}
