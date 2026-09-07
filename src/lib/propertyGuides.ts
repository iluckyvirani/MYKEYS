export type GuideLink = {
  label: string;
  href: string;
};

export type GuideCategory = {
  id: string;
  title: string;
  links: GuideLink[];
};

export const GUIDE_CATEGORIES: GuideCategory[] = [
  {
    id: "buyer",
    title: "Buyer guides",
    links: [
      { label: "Mortgage guides", href: "/inspire/mortgage-guides" },
      { label: "Buying a property", href: "/buy" },
      { label: "Ways to buy property", href: "/buy/search" },
      {
        label: "Once you’ve had an offer accepted",
        href: "/inspire/mortgage-guides/getting-a-mortgage-in-principle",
      },
    ],
  },
  {
    id: "seller",
    title: "Seller guides",
    links: [
      { label: "Preparing to sell", href: "/how-listing-works" },
      { label: "Once it’s on the market", href: "/how-listing-works" },
      { label: "Other things to consider", href: "/inspire/find-agent" },
    ],
  },
  {
    id: "renter",
    title: "Renter guides",
    links: [
      { label: "Renters’ Rights Act", href: "/inspire/property-news" },
      { label: "Preparing to rent", href: "/rent/whole-property" },
      { label: "Finding property to rent", href: "/rent/whole-property" },
      { label: "When you’ve found a property", href: "/rent/whole-property" },
      {
        label: "Moving in and managing your tenancy",
        href: "/rent/whole-property",
      },
      { label: "Student property", href: "/rent/room-to-rent" },
    ],
  },
  {
    id: "greener",
    title: "Greener homes",
    links: [
      {
        label: "Energy at home",
        href: "/inspire/energy-efficiency#energy-at-home",
      },
      {
        label: "Energy bills",
        href: "/inspire/energy-efficiency#energy-bills",
      },
      {
        label: "Energy Performance Certificates (EPCs)",
        href: "/inspire/energy-efficiency#energy-performance-certificates",
      },
      {
        label: "Energy grants and schemes",
        href: "/inspire/energy-efficiency#energy-grants-and-schemes",
      },
      {
        label: "Energy news",
        href: "/inspire/energy-efficiency#energy-news",
      },
    ],
  },
  {
    id: "area",
    title: "Area guides",
    links: [
      { label: "View all area guides", href: "/inspire/country-guides" },
      { label: "Overseas blog", href: "/inspire/overseas-blog" },
    ],
  },
  {
    id: "landlord",
    title: "Landlord guides",
    links: [
      { label: "Buying property to let", href: "/how-listing-works" },
      { label: "Choosing a letting agent", href: "/inspire/find-agent" },
      { label: "Finding a tenant", href: "/how-listing-works" },
      { label: "Managing your property", href: "/owner/dashboard" },
      { label: "Investor newsletter", href: "/contact" },
    ],
  },
  {
    id: "student",
    title: "Student guides",
    links: [
      {
        label: "Private student halls or shared accommodation?",
        href: "/rent/room-to-rent",
      },
      {
        label: "Student accommodation: working out what you can afford",
        href: "/rent/room-to-rent",
      },
      {
        label: "Choosing who to live with and where as a student",
        href: "/rent/room-to-rent",
      },
      {
        label: "Student accommodation: Viewing and securing properties",
        href: "/rent/room-to-rent",
      },
      {
        label: "Moving in and out of student property",
        href: "/rent/room-to-rent",
      },
      {
        label: "Renting as an international student",
        href: "/rent/room-to-rent",
      },
    ],
  },
  {
    id: "safety",
    title: "Safety and security guides",
    links: [
      {
        label: "Ensure your online experience stays a happy one",
        href: "/inspire/property-news",
      },
      { label: "Contact support", href: "/contact" },
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility",
    links: [
      {
        label: "Finding accessible homes to rent",
        href: "/rent/whole-property",
      },
      {
        label: "Finding accessible homes to buy",
        href: "/buy",
      },
    ],
  },
];

export type SidebarAccordion = {
  id: string;
  title: string;
  links: GuideLink[];
};

export const GUIDE_SIDEBAR_ACCORDIONS: SidebarAccordion[] = [
  {
    id: "calculators",
    title: "Calculators & Tools",
    links: [
      { label: "Mortgage Calculator", href: "/inspire/mortgage-guides#mortgage-calculator" },
      {
        label: "Mortgage in Principle",
        href: "/inspire/mortgage-guides/getting-a-mortgage-in-principle",
      },
      {
        label: "Stamp Duty Calculator",
        href: "/inspire/mortgage-guides",
      },
      { label: "Remortgage Calculator", href: "/inspire/mortgage-guides#remortgage-calculator" },
      { label: "Buyer guides", href: "/inspire/property-guides#buyer" },
    ],
  },
  {
    id: "resources",
    title: "Helpful Resources",
    links: [
      { label: "Property news", href: "/inspire/property-news" },
      { label: "Moving stories", href: "/inspire/moving-stories" },
      { label: "Current UK mortgage rates", href: "/inspire/mortgage-guides" },
      { label: "Energy efficiency", href: "/inspire/energy-efficiency" },
    ],
  },
  {
    id: "market",
    title: "Market Information",
    links: [
      { label: "Sold Prices", href: "/buy" },
      { label: "Market Trends", href: "/inspire/housing-trends" },
      { label: "House Price Index", href: "/inspire/housing-trends" },
      { label: "Rental Price Tracker", href: "/rent/whole-property" },
    ],
  },
];

export const PROPERTY_GUIDES_HERO_IMAGE =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80";

export type PropertyGuidesItemsContent = {
  heroImage: string;
  categories: GuideCategory[];
  sidebar: SidebarAccordion[];
};
