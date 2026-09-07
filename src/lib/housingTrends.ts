export const HPI_PUBLISHED = "20 July, 2026";

export const HPI_CONTENTS = [
  { id: "summary", label: "Summary" },
  { id: "conditions-for-buyers", label: "Conditions for buyers" },
  { id: "mortgage-rates", label: "What are mortgage rates doing?" },
  { id: "numbers-at-a-glance", label: "The numbers at a glance" },
  { id: "expert-comment", label: "Expert comment" },
  { id: "average-asking-price-trends", label: "Average asking price trends" },
  { id: "five-year-trend", label: "5 year asking price trend" },
  { id: "monthly-changes", label: "Monthly changes" },
] as const;

export const HPI_SUMMARY_BULLETS = [
  "The average asking price of newly-listed homes for sale drops by 1.0% (-£3,832) this month to £372,359.",
  "While a July drop is normal, this month’s fall is larger than the ten-year average July drop of 0.2%.",
  "Supply of available homes is close to a 12-year high for the time of year, giving buyers plenty of choice.",
];

export const HPI_PAST_REPORTS = [
  {
    label: "July 2026 House Price Index",
    href: "/inspire/housing-trends#summary",
  },
  {
    label: "June 2026 House Price Index",
    href: "/inspire/housing-trends#summary",
  },
  {
    label: "May 2026 House Price Index",
    href: "/inspire/housing-trends#summary",
  },
  {
    label: "April 2026 House Price Index",
    href: "/inspire/housing-trends#summary",
  },
] as const;

export const HOUSING_TRENDS_HERO_IMAGE =
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=80";

export const HPI_DOWNLOAD_URL = "/inspire/housing-trends#summary";

export const HPI_SUMMARY_HEADLINE =
  "Summer buyers distracted by sunshine, football and political change";

export type HousingTrendsItemsContent = {
  heroImage: string;
  publishedDate: string;
  downloadUrl: string;
  downloadLabel: string;
  summaryHeadline: string;
  summaryBullets: string[];
  pastReports: { label: string; href: string }[];
};

/** Approximate monthly avg asking prices Aug 2025 – Jul 2026 for chart */
export const MONTHLY_PRICE_TREND = [
  { label: "Aug '25", value: 369000 },
  { label: "Sep '25", value: 370500 },
  { label: "Oct '25", value: 371500 },
  { label: "Nov '25", value: 365000 },
  { label: "Dec '25", value: 358000 },
  { label: "Jan '26", value: 368000 },
  { label: "Feb '26", value: 368000 },
  { label: "Mar '26", value: 371000 },
  { label: "Apr '26", value: 374000 },
  { label: "May '26", value: 378000 },
  { label: "Jun '26", value: 376191 },
  { label: "Jul '26", value: 372359 },
];

/** MoM % change Aug 2025 – Jul 2026 */
export const MONTHLY_PCT_CHANGES = [
  { label: "Aug '25", value: -1.3 },
  { label: "Sep '25", value: 0.4 },
  { label: "Oct '25", value: 0.3 },
  { label: "Nov '25", value: -1.8 },
  { label: "Dec '25", value: -1.8 },
  { label: "Jan '26", value: 2.8 },
  { label: "Feb '26", value: 0 },
  { label: "Mar '26", value: 0.8 },
  { label: "Apr '26", value: 0.8 },
  { label: "May '26", value: 1.2 },
  { label: "Jun '26", value: -0.6 },
  { label: "Jul '26", value: -1.0 },
];

/** Simplified 5-year trend points (indexed for display) */
export const FIVE_YEAR_TREND = [
  { label: "Jul '21", value: 338000 },
  { label: "Jan '22", value: 355000 },
  { label: "Jul '22", value: 370000 },
  { label: "Jan '23", value: 360000 },
  { label: "Jul '23", value: 368000 },
  { label: "Jan '24", value: 362000 },
  { label: "Jul '24", value: 372000 },
  { label: "Jan '25", value: 365000 },
  { label: "Jul '25", value: 375000 },
  { label: "Jan '26", value: 368000 },
  { label: "Jul '26", value: 372359 },
];

export const SECTOR_PRICES = [
  {
    name: "First-time buyers",
    price: "£226,120",
    mom: -0.6,
    yoy: -0.6,
  },
  {
    name: "Second-steppers",
    price: "£346,303",
    mom: -0.9,
    yoy: 0.0,
  },
  {
    name: "Top of the ladder",
    price: "£686,537",
    mom: -0.5,
    yoy: -0.1,
  },
];
