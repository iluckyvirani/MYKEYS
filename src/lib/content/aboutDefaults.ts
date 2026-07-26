export type AboutHeroCard = {
  title: string;
  description: string;
  href: string;
};

export type AboutFeatureItem = {
  title: string;
  description: string;
  model: string;
};

export type AboutRevenueItem = {
  type: string;
  percentage: string;
  description: string;
};

export type AboutWinStat = {
  value: string;
  label: string;
};

export type AboutStepItem = {
  title: string;
  description: string;
  types: string[];
};

export type AboutTransactionItem = {
  type: string;
  description: string;
  steps: string;
  href: string;
};

export type AboutStatItem = {
  value: number;
  suffix: string;
  label: string;
  description: string;
};

export type AboutAchievementItem = {
  title: string;
  value: string;
  description: string;
  icon: string;
};

export type AboutMetricItem = {
  value: string;
  label: string;
};

export type AboutMilestoneItem = {
  year: string;
  event: string;
  properties: string;
};

export type AboutPageContent = {
  hero: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    cards: AboutHeroCard[];
  };
  businessModel: {
    badge: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    features: AboutFeatureItem[];
    revenueTitle: string;
    revenueSubtitle: string;
    revenue: AboutRevenueItem[];
    winTitle: string;
    winSubtitle: string;
    winStats: AboutWinStat[];
  };
  howItWorks: {
    badge: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    steps: AboutStepItem[];
    chooseTitle: string;
    chooseSubtitle: string;
    transactions: AboutTransactionItem[];
    ctaTitle: string;
    ctaSubtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  stats: {
    items: AboutStatItem[];
    achievementsTitle: string;
    achievementsSubtitle: string;
    achievements: AboutAchievementItem[];
    metrics: AboutMetricItem[];
    growthTitle: string;
    growthSubtitle: string;
    milestones: AboutMilestoneItem[];
  };
};

export const ABOUT_SECTIONS = [
  "hero",
  "businessModel",
  "howItWorks",
  "stats",
] as const;

export type AboutSectionKey = (typeof ABOUT_SECTIONS)[number];

export const DEFAULT_ABOUT_CONTENT: AboutPageContent = {
  hero: {
    title: "One Platform,",
    titleHighlight: "Three Ways to Property",
    subtitle:
      "We're revolutionizing property transactions with our unified platform. Whether you need a short stay, long-term rental, or want to buy a home - we've got you covered with transparent pricing and direct owner connections.",
    primaryCta: "List Your Property",
    secondaryCta: "Find Properties",
    cards: [
      {
        title: "Short Stays",
        description:
          "Book instantly. Pay per night. Full Airbnb-style experience with verified properties.",
        href: "/rent/short-rent",
      },
      {
        title: "Rentals",
        description:
          "Connect directly with owners. 2+ month stays. No agent fees. Better deals.",
        href: "/rent/whole-property",
      },
      {
        title: "Property Purchase",
        description:
          "Buy directly from owners. Transparent pricing. Complete documentation support.",
        href: "/buy",
      },
    ],
  },
  businessModel: {
    badge: "Our Business Model",
    title: "How We Make Property",
    titleHighlight: "Transactions Better",
    subtitle:
      "We've created a transparent, efficient marketplace that benefits both property owners and seekers.",
    features: [
      {
        title: "Short Rent Payments",
        description:
          "Secure payment processing with release after check-in. Platform holds funds for buyer/seller protection.",
        model: "Short Term",
      },
      {
        title: "Direct Communication",
        description:
          "For long-term rentals and purchases, connect directly with owners. No middlemen, faster decisions.",
        model: "Long Term",
      },
      {
        title: "Commission Model",
        description:
          "Short rents: 10-15%. Long rentals: 5-8%. Property sales: 1.5-3.5%. Transparent pricing always.",
        model: "All Types",
      },
      {
        title: "Verification System",
        description:
          "All properties and owners verified. Document checks, identity verification, and property inspection.",
        model: "All Types",
      },
      {
        title: "Instant Booking",
        description:
          "Short rents available for instant booking. Real-time availability calendar and instant confirmation.",
        model: "Short Term",
      },
      {
        title: "Secure Transactions",
        description:
          "Bank-level encryption. Escrow services for large transactions. Fraud prevention systems.",
        model: "All Types",
      },
    ],
    revenueTitle: "Revenue Streams",
    revenueSubtitle:
      "Sustainable business model with multiple revenue streams ensuring platform growth and user benefits",
    revenue: [
      {
        type: "Short Rents Commission",
        percentage: "10-15%",
        description: "Per booking commission",
      },
      {
        type: "Long Term Lead Fee",
        percentage: "One Month Rent",
        description: "Success fee per rental",
      },
      {
        type: "Property Sale Commission",
        percentage: "1.5-3.5%",
        description: "Per successful sale",
      },
      {
        type: "Premium Packages",
        percentage: "Monthly/Annual",
        description: "For property owners",
      },
    ],
    winTitle: "Win-Win for Everyone",
    winSubtitle:
      "Owners get better prices, users save money, and we ensure secure transactions.",
    winStats: [
      { value: "30%", label: "Cheaper for Users" },
      { value: "15%", label: "Higher for Owners" },
      { value: "100%", label: "Secure Transactions" },
    ],
  },
  howItWorks: {
    badge: "Simple Process",
    title: "How It Works",
    titleHighlight: "For Everyone",
    subtitle:
      "Whether you're looking for a weekend stay, a year-long rental, or your dream home purchase.",
    steps: [
      {
        title: "Browse & Search",
        description:
          "Use filters to find exactly what you need - short rents, long rentals, or properties to buy.",
        types: ["Short", "Long", "Buy"],
      },
      {
        title: "View Details",
        description:
          "Check property details, photos, reviews, and pricing for each transaction type.",
        types: ["Short", "Long", "Buy"],
      },
      {
        title: "Choose Your Path",
        description:
          "Select transaction type - instant book for short rents or send inquiry for long term/buy.",
        types: ["Short", "Long", "Buy"],
      },
      {
        title: "Short Rent: Book & Pay",
        description:
          "Instant booking with secure payment. Platform holds funds until check-in completion.",
        types: ["Short"],
      },
      {
        title: "Long Term/Buy: Connect",
        description:
          "Send inquiry, chat directly with owner, negotiate terms, and finalize offline.",
        types: ["Long", "Buy"],
      },
      {
        title: "Complete & Review",
        description:
          "Finish transaction, move in, and leave review for future users.",
        types: ["Short", "Long", "Buy"],
      },
    ],
    chooseTitle: "Choose Your Transaction Type",
    chooseSubtitle: "Different needs, different processes - all on one platform",
    transactions: [
      {
        type: "Short Rent",
        description: "Airbnb-style booking",
        steps: "Search → Book → Pay → Stay → Review",
        href: "/rent/short-rent",
      },
      {
        type: "Long Term Rent",
        description: "2+ months rental",
        steps: "Search → Inquiry → Chat → View → Rent",
        href: "/rent/whole-property",
      },
      {
        type: "Property Purchase",
        description: "Buy directly from owners",
        steps: "Search → Inquiry → View → Negotiate → Buy",
        href: "/buy",
      },
    ],
    ctaTitle: "Ready to Get Started?",
    ctaSubtitle:
      "Join thousands of satisfied users and property owners on our platform",
    ctaPrimary: "Sign Up Free",
    ctaSecondary: "Schedule Demo",
  },
  stats: {
    items: [
      {
        value: 50000,
        suffix: "+",
        label: "Active Users",
        description: "Property seekers & owners",
      },
      {
        value: 15000,
        suffix: "+",
        label: "Properties Listed",
        description: "Across all transaction types",
      },
      {
        value: 95,
        suffix: "%",
        label: "Satisfaction Rate",
        description: "User satisfaction score",
      },
      {
        value: 3,
        suffix: "B",
        label: "Transaction Value",
        description: "Total property value transacted",
      },
    ],
    achievementsTitle: "Our Achievements",
    achievementsSubtitle:
      "Building the future of property transactions, one satisfied user at a time",
    achievements: [
      {
        title: "Short Rent Bookings",
        value: "45,000+",
        description: "Nights booked through platform",
        icon: "🏨",
      },
      {
        title: "Long Term Rentals",
        value: "8,200+",
        description: "Successful rental matches",
        icon: "🏠",
      },
      {
        title: "Properties Sold",
        value: "1,500+",
        description: "Direct owner-buyer sales",
        icon: "💰",
      },
      {
        title: "Cities Covered",
        value: "120+",
        description: "Across 15 countries",
        icon: "🌍",
      },
    ],
    metrics: [
      { value: "4.8/5", label: "Platform Rating" },
      { value: "24h", label: "Avg. Response Time" },
      { value: "100%", label: "Verified Properties" },
    ],
    growthTitle: "Rapid Growth Journey",
    growthSubtitle: "From startup to market leader in property transactions",
    milestones: [
      { year: "2021", event: "Platform Launch", properties: "500" },
      { year: "2022", event: "Expand to 50 Cities", properties: "5,000" },
      { year: "2023", event: "Add Purchase Feature", properties: "10,000" },
      { year: "2024", event: "International Launch", properties: "15,000+" },
    ],
  },
};

export function mergeAboutContent(
  stored: Partial<AboutPageContent> | Record<string, unknown> | null | undefined
): AboutPageContent {
  const s = (stored || {}) as Partial<AboutPageContent>;
  return {
    hero: {
      ...DEFAULT_ABOUT_CONTENT.hero,
      ...(s.hero || {}),
      cards:
        Array.isArray(s.hero?.cards) && s.hero.cards.length > 0
          ? s.hero.cards
          : DEFAULT_ABOUT_CONTENT.hero.cards,
    },
    businessModel: {
      ...DEFAULT_ABOUT_CONTENT.businessModel,
      ...(s.businessModel || {}),
      features:
        Array.isArray(s.businessModel?.features) &&
        s.businessModel.features.length > 0
          ? s.businessModel.features
          : DEFAULT_ABOUT_CONTENT.businessModel.features,
      revenue:
        Array.isArray(s.businessModel?.revenue) &&
        s.businessModel.revenue.length > 0
          ? s.businessModel.revenue
          : DEFAULT_ABOUT_CONTENT.businessModel.revenue,
      winStats:
        Array.isArray(s.businessModel?.winStats) &&
        s.businessModel.winStats.length > 0
          ? s.businessModel.winStats
          : DEFAULT_ABOUT_CONTENT.businessModel.winStats,
    },
    howItWorks: {
      ...DEFAULT_ABOUT_CONTENT.howItWorks,
      ...(s.howItWorks || {}),
      steps:
        Array.isArray(s.howItWorks?.steps) && s.howItWorks.steps.length > 0
          ? s.howItWorks.steps
          : DEFAULT_ABOUT_CONTENT.howItWorks.steps,
      transactions:
        Array.isArray(s.howItWorks?.transactions) &&
        s.howItWorks.transactions.length > 0
          ? s.howItWorks.transactions
          : DEFAULT_ABOUT_CONTENT.howItWorks.transactions,
    },
    stats: {
      ...DEFAULT_ABOUT_CONTENT.stats,
      ...(s.stats || {}),
      items:
        Array.isArray(s.stats?.items) && s.stats.items.length > 0
          ? s.stats.items
          : DEFAULT_ABOUT_CONTENT.stats.items,
      achievements:
        Array.isArray(s.stats?.achievements) &&
        s.stats.achievements.length > 0
          ? s.stats.achievements
          : DEFAULT_ABOUT_CONTENT.stats.achievements,
      metrics:
        Array.isArray(s.stats?.metrics) && s.stats.metrics.length > 0
          ? s.stats.metrics
          : DEFAULT_ABOUT_CONTENT.stats.metrics,
      milestones:
        Array.isArray(s.stats?.milestones) && s.stats.milestones.length > 0
          ? s.stats.milestones
          : DEFAULT_ABOUT_CONTENT.stats.milestones,
    },
  };
}
