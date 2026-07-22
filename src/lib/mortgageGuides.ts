export type MortgageGuide = {
  id: string;
  slug: string;
  title: string;
  minutes?: number;
  image?: string;
  imageAlt?: string;
};

export type MortgageGuideSection = {
  id: string;
  title: string;
  description: string;
  guides: MortgageGuide[];
};

export const MORTGAGE_NAV_LINKS = [
  { href: "#understanding-your-finances", label: "Understanding your finances" },
  { href: "#how-to-get-a-mortgage", label: "How to get a mortgage" },
  { href: "#different-types-of-mortgages", label: "Different types of mortgages" },
  { href: "#mortgage-rates-and-fees", label: "Mortgage rates and fees" },
  { href: "#first-time-buyers", label: "Guides for first-time buyers" },
  { href: "#remortgaging", label: "Remortgaging" },
] as const;

export const MORTGAGE_QUICK_LINKS = [
  { href: "/inspire/mortgages", label: "Mortgages", icon: "home" as const },
  {
    href: "/inspire/mortgages",
    label: "Mortgage Calculator",
    icon: "calculator" as const,
  },
  {
    href: "/inspire/mortgage-guides/getting-a-mortgage-in-principle",
    label: "Mortgage In Principle",
    icon: "bolt" as const,
  },
  {
    href: "/inspire/mortgages",
    label: "Remortgage Calculator",
    icon: "calculator" as const,
  },
];

export const MORTGAGE_SECTIONS: MortgageGuideSection[] = [
  {
    id: "understanding-your-finances",
    title: "Understanding your finances",
    description:
      "From sorting your finances, to finding out how much you could borrow with a mortgage.",
    guides: [
      {
        id: "f1",
        slug: "getting-a-mortgage-in-principle",
        title: "Getting a Mortgage in Principle",
        minutes: 4,
        image:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Woman reviewing finances on a laptop",
      },
      {
        id: "f2",
        slug: "how-much-can-i-borrow",
        title: "How much can I borrow?",
      },
      {
        id: "f3",
        slug: "sorting-out-your-finances",
        title: "Sorting out your finances",
      },
      {
        id: "f4",
        slug: "working-out-what-you-can-afford",
        title: "Working out what you can afford",
      },
      {
        id: "f5",
        slug: "credit-score-guide",
        title: "Everything you need to know about your credit score",
      },
      {
        id: "f6",
        slug: "deposit-saving-tips",
        title: "How to save for a deposit",
      },
    ],
  },
  {
    id: "how-to-get-a-mortgage",
    title: "How to get a mortgage",
    description:
      "A clear path from your first enquiry to exchanging contracts.",
    guides: [
      {
        id: "h1",
        slug: "7-steps-to-getting-a-mortgage",
        title: "7 steps to getting a mortgage",
        minutes: 6,
        image:
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Thatched cottage home",
      },
      {
        id: "h2",
        slug: "documents-you-need",
        title: "Documents you’ll need for a mortgage",
      },
      {
        id: "h3",
        slug: "choosing-a-broker-or-lender",
        title: "Should you use a broker or go direct?",
      },
    ],
  },
  {
    id: "different-types-of-mortgages",
    title: "Different types of mortgages",
    description:
      "Variable, tracker, interest-only or repayment? Your guide to the different mortgage types, and figuring out which one is right for you.",
    guides: [
      {
        id: "t1",
        slug: "understanding-mortgage-types",
        title: "Understanding the different types of mortgages",
        minutes: 5,
        image:
          "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Family looking at a laptop together",
      },
      {
        id: "t2",
        slug: "finding-and-choosing-a-mortgage",
        title: "Finding and choosing a mortgage",
      },
      {
        id: "t3",
        slug: "2-or-5-year-fixed-rate",
        title: "Should I get a 2- or 5-year fixed rate mortgage?",
      },
      {
        id: "t4",
        slug: "mortgage-in-principle-types",
        title: "Getting a Mortgage in Principle",
      },
    ],
  },
  {
    id: "mortgage-rates-and-fees",
    title: "Mortgage rates and fees",
    description:
      "Understand rates, fees and what they mean for your monthly payments.",
    guides: [
      {
        id: "r1",
        slug: "base-rate-cut-explained",
        title: "Bank of England cuts Base Rate to 3.75%",
        minutes: 3,
        image:
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Colourful terraced houses",
      },
      {
        id: "r2",
        slug: "understanding-mortgage-fees",
        title: "Understanding mortgage fees",
      },
      {
        id: "r3",
        slug: "current-mortgage-rates",
        title: "What’s happening with mortgage rates this month?",
      },
    ],
  },
  {
    id: "first-time-buyers",
    title: "Guides for first-time buyers",
    description:
      "Helpful guides if you’re buying your first home with a mortgage.",
    guides: [
      {
        id: "ft1",
        slug: "first-time-buyer-mortgage",
        title: "Mortgages for first-time buyers",
        minutes: 5,
        image:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Modern family home",
      },
      {
        id: "ft2",
        slug: "help-to-buy-schemes",
        title: "Schemes that can help first-time buyers",
      },
      {
        id: "ft3",
        slug: "first-home-checklist",
        title: "First-home buying checklist",
      },
    ],
  },
  {
    id: "remortgaging",
    title: "Remortgaging",
    description:
      "When and why to remortgage, and how to compare your options.",
    guides: [
      {
        id: "rm1",
        slug: "when-to-remortgage",
        title: "When should you remortgage?",
        minutes: 4,
        image:
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Residential street of homes",
      },
      {
        id: "rm2",
        slug: "remortgage-costs",
        title: "What does remortgaging cost?",
      },
      {
        id: "rm3",
        slug: "remortgage-steps",
        title: "How to remortgage step by step",
      },
    ],
  },
];

export const MORTGAGE_SPOTLIGHT = [
  {
    slug: "credit-score-guide",
    title: "Everything you need to know about your credit score",
    category: "Mortgage guides",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Person at a restaurant table",
  },
  {
    slug: "7-steps-to-getting-a-mortgage",
    title: "7 steps to getting a mortgage",
    category: "Mortgage guides",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Cottage with thatched roof",
  },
  {
    slug: "base-rate-cut-explained",
    title: "Bank of England cuts Base Rate to 3.75%",
    category: "Interest rates",
    image:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Colourful terraced houses",
  },
];
